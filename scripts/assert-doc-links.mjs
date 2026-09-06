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
 * ## 検査するもの
 *
 * - インラインリンク `[label](path)`（`path` に1段までの括弧を含んでよい）
 * - 参照式リンクの**定義** `[label]: path`
 * - HTML の `<a href="path">`
 *
 * ## 対応していないもの（意図的。ここに挙げていない取りこぼしは不具合として扱う）
 *
 * - **`#anchor` の存在検証**。フラグメントは落として judgement に使わない。
 *   したがって**見出しの改名で壊れた anchor はこの検査を緑で通る。人が見る担当のまま残る**
 * - **画像リンク `![alt](path)`**。本文リンクだけを見る。`[![alt](img)](path)` は
 *   外側の `path` だけを検査する
 * - **fenced code block の中身**。リンクの書き方の例をコードブロックへ貼っても落ちない。
 *   引用の中（`> ```）も fence として扱う
 * - **インラインコードスパンの中身**（`` `[label](path)` ``）。CommonMark と同じく
 *   コードスパンをリンクより先に潰す
 * - **複数行にまたがるリンク**。行ベースで走査して `file:line` を出すことを優先している
 * - **参照式リンクの使用側**（`[text][ref]` の `ref` が定義されているか）。定義側は検査する
 * - 外部URLの到達性。ネットワークを要求した時点でこのジョブに置けなくなる
 *
 * **fence が閉じないまま EOF に達したら失敗させる。** 閉じ忘れは、それ以降の行を丸ごと
 * 走査対象から外し、検査を黙って空振りさせるためである（`FIXTURES` の「未閉じ fence」を参照）。
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

/**
 * 行頭の引用マーカー
 *
 * 剥がしてから fence を判定する。剥がさないと `> ```bash` が fence として認識されず、
 * **引用の中のコードブロックだけが走査対象に残る。** 現在3箇所ある
 * （`docs/dev/ci-env.md` / `docs/frontend/browser-verification-pitfalls.md` /
 * `docs/frontend/design.md`）。
 */
const BLOCKQUOTE = /^(?: {0,3}>\s?)+/;

/**
 * インラインコードスパン
 *
 * CommonMark ではコードスパンがリンクより強く結合するため、リンクより先に潰す。
 * #209 の運用原則が「リンクにせずパス名をコード表記で書く」を推奨している以上、
 * コード表記の中にリンク構文が現れる導線は既にある。
 */
const CODE_SPAN = /(`+)(?:(?!\1)[^\n])*?\1/g;

/** 画像 `![alt](path)`。本文リンクだけを見るため、リンク抽出の前に潰す */
const IMAGE =
  /!\[(?:[^\]\\]|\\.)*\]\(\s*(?:<[^>]*>|(?:[^()\s]|\([^()\s]*\))*?)(?:\s+["'][^"']*["'])?\s*\)/g;

/**
 * `[label](target "title")`
 *
 * `target` は1段までの括弧を許す（`./a(1).md`）。CommonMark は釣り合った括弧を
 * 何段でも許すが、行ベースの検査で必要になるのは1段までである。
 * 先頭の `(!?)` は画像の取りこぼしに対する保険で、通常は `IMAGE` が先に潰している。
 */
const INLINE_LINK =
  /(!?)\[(?:[^\]\\]|\\.)*\]\(\s*(<[^>]*>|(?:[^()\s]|\([^()\s]*\))*?)(?:\s+["'][^"']*["'])?\s*\)/g;

/**
 * 参照式リンクの定義（`[label]: target "title"`）
 *
 * 現在 docs 配下に 0 件だが、将来入ったときに黙って素通りするほうが害が大きいので拾う。
 */
const REFERENCE_DEFINITION = /^ {0,3}\[(?:[^\]\\]|\\.)+\]:\s*(<[^>]*>|\S+)/;

/** HTML の `<a href="...">`。markdown 記法だけを見ていると素通りする */
const HTML_LINK = /<a\s[^>]*?href\s*=\s*["']([^"']*)["']/gi;

/** スキーム付きの絶対URL（`https:` `mailto:` `tel:` 等） */
const SCHEME = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;

/** 潰した記法を同じ長さの空白へ置き換える。前後のトークンが繋がるのを防ぐ */
const blank = (matched) => " ".repeat(matched.length);

/**
 * 1本の markdown からリンク先の候補を行番号つきで取り出す
 *
 * ここでは解決も存在判定もしない。純粋に「どの行にどの文字列が書かれているか」だけを返す。
 * `FIXTURES` が固定しているのはこの関数の振る舞いである。
 *
 * @param {string} text
 * @returns {{ targets: { line: number, target: string }[], unclosedFenceLine: number | null }}
 */
function extractLinkTargets(text) {
  const targets = [];
  let openFence = null;
  let openFenceLine = null;

  text.split("\n").forEach((rawLine, index) => {
    const line = rawLine.replace(BLOCKQUOTE, "");

    const fence = FENCE.exec(line);
    if (openFence) {
      // 閉じフェンスは開きと同種で、同じ長さ以上でなければならない（CommonMark）
      if (fence && fence[1][0] === openFence[0] && fence[1].length >= openFence.length) {
        openFence = null;
        openFenceLine = null;
      }
      return;
    }
    if (fence) {
      openFence = fence[1];
      openFenceLine = index + 1;
      return;
    }

    // コードスパン → 画像 の順に潰す。この順でないと
    // `` `![alt](path)` `` のようなコード表記の中の画像を二重に扱うことになる。
    const scannable = line.replace(CODE_SPAN, blank).replace(IMAGE, blank);

    for (const match of scannable.matchAll(INLINE_LINK)) {
      if (match[1]) continue; // `IMAGE` が潰し損ねた画像
      targets.push({ line: index + 1, target: match[2] });
    }
    const definition = REFERENCE_DEFINITION.exec(scannable);
    if (definition) targets.push({ line: index + 1, target: definition[1] });
    for (const match of scannable.matchAll(HTML_LINK)) {
      targets.push({ line: index + 1, target: match[1] });
    }
  });

  return { targets, unclosedFenceLine: openFence ? openFenceLine : null };
}

/**
 * `extractLinkTargets` の振る舞いを固定するフィクスチャ
 *
 * この検査が壊れるときの壊れ方は「赤くなる」ではなく「黙って何も見つけなくなる」である。
 * lint も build も型も気付かない（docs/dev/testing.md の「テストを足すかどうかの判断」）。
 * 実データ 53本は誤検出（偽陽性）しか捕まえられないので、取りこぼし（偽陰性）はここで固定する。
 *
 * `target` は抽出したままの文字列で、外部URLやアンカーの切り捨ては `resolveTarget` の担当。
 */
const FIXTURES = [
  { name: "インラインリンク", md: "[a](./a.md)", expect: ["./a.md"] },
  { name: "画像は対象外", md: "![alt](./a.png)", expect: [] },
  {
    name: "画像を内側に持つリンクは外側だけ見る",
    md: "[![alt](./a.png)](./b.md)",
    expect: ["./b.md"],
  },
  { name: "コードスパンの中は対象外", md: "`[a](./a.md)`", expect: [] },
  { name: "fenced code block の中は対象外", md: "```\n[a](./a.md)\n```", expect: [] },
  { name: "引用の中の fence も fence として扱う", md: "> ```\n> [a](./a.md)\n> ```", expect: [] },
  { name: "引用の中の本文リンクは検査する", md: "> [a](./a.md)", expect: ["./a.md"] },
  { name: "括弧を1段含むパス", md: "[a](./a(1).md)", expect: ["./a(1).md"] },
  { name: "参照式リンクの定義", md: "[a]: ./a.md", expect: ["./a.md"] },
  { name: "HTML の a 要素", md: '<a href="./a.md">a</a>', expect: ["./a.md"] },
  { name: "アンカーのみ（切り捨ては resolveTarget の担当）", md: "[a](#h)", expect: ["#h"] },
  { name: "未閉じ fence", md: "```\n[a](./a.md)", expect: [], unclosedFenceLine: 1 },
];

/** フィクスチャが1件でも外れたら、実データを見る前に落とす */
function runSelfCheck() {
  const failures = [];
  for (const fixture of FIXTURES) {
    const { targets, unclosedFenceLine } = extractLinkTargets(fixture.md);
    const actual = targets.map((item) => item.target);
    const expectedFence = fixture.unclosedFenceLine ?? null;
    if (JSON.stringify(actual) !== JSON.stringify(fixture.expect)) {
      failures.push(
        `${fixture.name}: 期待 ${JSON.stringify(fixture.expect)} / 実際 ${JSON.stringify(actual)}`
      );
    }
    if (unclosedFenceLine !== expectedFence) {
      failures.push(
        `${fixture.name}: 未閉じ fence 期待 ${expectedFence} / 実際 ${unclosedFenceLine}`
      );
    }
  }
  if (failures.length > 0) {
    console.error(`${LABEL} FAIL: 抽出器の自己検査が ${failures.length} 件外れました。`);
    for (const failure of failures) console.error(`  ${failure}`);
    console.error("");
    console.error("  実データを見る前に落としています。抽出器を直してから再実行してください。");
    process.exit(1);
  }
}

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

  // `/` 始まりはリポジトリルート起点として解決する
  const joined = decoded.startsWith("/")
    ? path.normalize(decoded.slice(1))
    : path.normalize(path.join(path.dirname(sourceFile), decoded));

  return joined.replace(/\/+$/, "");
}

/** 追跡集合に居るか。**合否はこの関数だけで決める**（`existsSync` は使わない） */
function isTracked(resolved) {
  return trackedFileSet.has(resolved) || trackedDirSet.has(resolved);
}

runSelfCheck();

const broken = [];
const unclosedFences = [];
let relativeLinkCount = 0;
let skippedCount = 0;

for (const file of markdownFiles) {
  const { targets, unclosedFenceLine } = extractLinkTargets(
    readFileSync(path.join(ROOT, file), "utf8")
  );

  if (unclosedFenceLine !== null) unclosedFences.push({ file, line: unclosedFenceLine });

  for (const { line, target } of targets) {
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
    broken.push({ file, line, target, resolved, untrackedButPresent });
  }
}

if (unclosedFences.length > 0) {
  console.error(
    `${LABEL} FAIL: 閉じていない fenced code block が ${unclosedFences.length} 件あります。`
  );
  for (const item of unclosedFences) {
    console.error(
      `  ${item.file}:${item.line}  ここで開いた fence が閉じないまま EOF に達しました`
    );
  }
  console.error("");
  console.error(
    "  **この行より後ろは1行も検査されていません。** 閉じ忘れは検査を黙って空振りさせます。"
  );
  process.exit(1);
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
  console.error(
    "  `#anchor` の存在は検査していません。見出しを改名したときは自分で追ってください。"
  );
  process.exit(1);
}

console.log(
  `${LABEL} OK: 追跡 .md ${markdownFiles.length}本 / 相対リンク ${relativeLinkCount}本 / 切れ 0件` +
    `（外部URL・アンカーのみなど ${skippedCount}本は対象外）。`
);
