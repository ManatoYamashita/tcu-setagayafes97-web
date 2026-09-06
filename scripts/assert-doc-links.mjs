#!/usr/bin/env node
/**
 * 追跡ファイルの `.md` に含まれる相対リンクが解決できるかを検査する（#211）
 *
 * `Static Checks` から `pnpm check:doc-links` で走る。`git ls-files` 以外に何も要求しない
 * （secrets もビルド成果物もブラウザも不要）ため、同ジョブの「`pnpm install` だけで完結する」
 * 性質と、**fork からの PR でも結果が出る**という性質を壊さない。
 *
 * ## なぜ人間のレビューでは足りないのか
 *
 * `docs/INDEX.md` のリンク切れ（`./requires/contract-individual-v97.md`）は、#207 のレビューで
 * 人の目に留まるまで誰にも検出されなかった。#209 で運用原則「`.gitignore` で除外したドキュメントは
 * 索引でリンクにしない」を足したが、**原則を守っているかを確かめる手段はレビューしかなかった。**
 * `AGENTS.md` の CHECK フェーズも `docs/INDEX.md` の更新手順も「リンク切れを確認する」と
 * 書いてあるだけで、実行されたかどうかは後から判別できない。
 *
 * ## なぜ作業ツリーを歩いてはいけないのか（最重要）
 *
 * 走査対象も存在判定も、**すべて Git の追跡対象集合で行う。** ディレクトリを再帰的に歩いて
 * `existsSync` で判定すると、`.gitignore` 対象のローカルディレクトリが偽陽性を出す。
 *
 *     作業ツリー走査 + existsSync : md 55本 / 相対リンク 152本 / 切れ 9件
 *     git ls-files + 追跡集合     : md 53本 / 相対リンク 143本 / 切れ 0件
 *
 * 差の9件はすべて `.claude/skills/agent-browser/SKILL.md` 由来である（2026-09-06 実測）。
 * このディレクトリは `.gitignore` の `.claude/skills/` で除外されており、`git ls-files` では0件。
 * **CI はクリーンチェックアウトなので CI では再現しないが、手元で走らせた人間が毎回9件の嘘を見る。**
 *
 * 追跡集合で判定することは、#209 が直した形（`.gitignore` 対象へのリンク）を落とすためにも要る。
 * その種のリンク先は手元には存在するので、`existsSync` では原理的に検出できない。
 *
 * ## 対応していないもの（意図的）
 *
 * - **`#anchor` の存在検証**。フラグメントは落として judgement に使わない
 * - **参照式リンクの使用側**（`[text][ref]` の `ref` が定義されているか）。定義側は検査する
 * - 外部URLの到達性。ネットワークを要求した時点でこのジョブに置けなくなる
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const LABEL = "[assert-doc-links]";

/** リポジトリのルート。サブディレクトリから起動されても同じ結果になるようにする */
const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

/**
 * fenced code block の開始・終了行
 *
 * **現時点ではこの除去は1件も救っていない**（除去あり/なしで 143本 / 0件 が変わらず、
 * fence 内の markdown リンク構文は 0 件。2026-09-06 実測）。将来コードブロックの中へ
 * リンクの書き方の例を貼ったときに誤検出しないための保険として置いてある。
 * 「いま誤検出を止めている」と読み違えないこと。
 */
const FENCE = /^ {0,3}(`{3,}|~{3,})/;

/** `[label](target "title")`。`!` 付きの画像は対象外にするため、先頭を捕獲しておく */
const INLINE_LINK = /(!?)\[(?:[^\]\\]|\\.)*\]\(\s*(<[^>]*>|[^()\s]*?)(?:\s+["'][^"']*["'])?\s*\)/g;

/**
 * 参照式リンクの定義（`[label]: target "title"`）
 *
 * 現在 docs 配下に 0 件だが、将来入ったときに黙って素通りするほうが害が大きいので拾う。
 */
const REFERENCE_DEFINITION = /^ {0,3}\[(?:[^\]\\]|\\.)+\]:\s*(<[^>]*>|\S+)/;

/** スキーム付きの絶対URL（`https:` `mailto:` `tel:` 等） */
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/**
 * 追跡ファイルの一覧。`-z` はパスに空白や非ASCIIが入っても壊れないため
 *
 * `docs/` の日本語ファイル名は現在無いが、`core.quotePath` の既定が true なので
 * 改行区切りにすると将来ダブルクオート付きのエスケープ表記を掴まされる。
 */
const trackedFiles = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter(Boolean);

const trackedFileSet = new Set(trackedFiles);

/** 追跡ファイルから導いたディレクトリ集合。ディレクトリへのリンクを切れ扱いにしないため */
const trackedDirSet = new Set();
for (const file of trackedFiles) {
  let dir = path.dirname(file);
  while (dir && dir !== ".") {
    trackedDirSet.add(dir);
    dir = path.dirname(dir);
  }
}

const markdownFiles = trackedFiles.filter((file) => file.toLowerCase().endsWith(".md"));

/**
 * リンク先の文字列を、リポジトリルートからの相対パスへ解決する
 *
 * @returns 検査対象なら正規化済みパス、対象外なら `null`
 */
function resolveTarget(target, sourceFile) {
  let raw = target.trim();
  // `<...>` で囲む記法。中身がパス本体
  if (raw.startsWith("<") && raw.endsWith(">")) raw = raw.slice(1, -1);
  if (!raw) return null;
  if (SCHEME.test(raw) || raw.startsWith("//")) return null;
  // `#anchor` のみのリンク。同一ファイル内の移動なので解決するものが無い
  if (raw.startsWith("#")) return null;

  const withoutFragment = raw.split("#")[0];
  if (!withoutFragment) return null;

  let decoded;
  try {
    decoded = decodeURIComponent(withoutFragment);
  } catch {
    // `%` を素で含むだけのパス。デコードできないならそのまま解決を試みる
    decoded = withoutFragment;
  }

  // `/` 始まりは GitHub のレンダラと同じくリポジトリルート起点として解決する
  const joined = decoded.startsWith("/")
    ? path.normalize(decoded.slice(1))
    : path.normalize(path.join(path.dirname(sourceFile), decoded));

  return joined.replace(/\/+$/, "");
}

/** 追跡集合に居るか。**合否はこの関数だけで決める**（`existsSync` は使わない） */
function isTracked(resolved) {
  return trackedFileSet.has(resolved) || trackedDirSet.has(resolved);
}

const broken = [];
let relativeLinkCount = 0;
let skippedCount = 0;

for (const file of markdownFiles) {
  const lines = readFileSync(path.join(ROOT, file), "utf8").split("\n");
  let openFence = null;

  lines.forEach((line, index) => {
    const fence = FENCE.exec(line);
    if (openFence) {
      // 閉じフェンスは開きと同種で、同じ長さ以上でなければならない（CommonMark）
      if (fence && fence[1][0] === openFence[0] && fence[1].length >= openFence.length) {
        openFence = null;
      }
      return;
    }
    if (fence) {
      openFence = fence[1];
      return;
    }

    /** この行に現れたリンク先の候補。インライン記法と参照式定義の両方を集める */
    const targets = [];
    for (const match of line.matchAll(INLINE_LINK)) {
      if (match[1]) continue; // `![alt](path)` の画像は対象外
      targets.push(match[2]);
    }
    const definition = REFERENCE_DEFINITION.exec(line);
    if (definition) targets.push(definition[1]);

    for (const target of targets) {
      const resolved = resolveTarget(target, file);
      if (resolved === null) {
        skippedCount++;
        continue;
      }
      relativeLinkCount++;
      if (isTracked(resolved)) continue;

      /*
       * ここから先は失敗メッセージを作るためだけの分岐である。
       * **`existsSync` を合否に混ぜてはいけない。** 混ぜた瞬間、#209 が直した形
       * （`.gitignore` 対象へのリンク）が手元でだけ緑になる。
       */
      const untrackedButPresent = existsSync(path.join(ROOT, resolved));
      broken.push({ file, line: index + 1, target, resolved, untrackedButPresent });
    }
  });
}

if (broken.length > 0) {
  console.error(`${LABEL} FAIL: 解決できない相対リンクが ${broken.length} 件あります。`);
  for (const item of broken) {
    console.error(`  ${item.file}:${item.line}  ${item.target}  →  ${item.resolved}`);
    if (item.untrackedButPresent) {
      console.error(
        "      このパスは作業ツリーには存在しますが、Git の追跡対象ではありません" +
          "（`.gitignore` で除外されている可能性が高い）。"
      );
      console.error(
        "      docs/INDEX.md の運用原則に従い、リンクにせずパス名をコード表記で書き、" +
          "除外の理由と入手方法を添えてください（#209）。"
      );
    }
  }
  console.error("");
  console.error("  よくある原因:");
  console.error("    1. ファイルを改名・移動したが、参照元を直していない");
  console.error("    2. `.gitignore` で除外したファイルへリンクしている（#209 の形）");
  console.error("    3. 新規ファイルを `git add` していない（追跡されていないので切れ扱いになる）");
  console.error("");
  console.error(
    "  この検査は Git の追跡対象だけを見ます。作業ツリーに在ることは根拠になりません。"
  );
  process.exit(1);
}

console.log(
  `${LABEL} OK: 追跡 .md ${markdownFiles.length}本 / 相対リンク ${relativeLinkCount}本 / 切れ 0件` +
    `（外部URL・アンカーのみなど ${skippedCount}本は対象外）。`
);
