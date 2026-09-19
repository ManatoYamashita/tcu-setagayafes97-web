#!/usr/bin/env node
/**
 * Tailwind の走査範囲に禁止色トークンが1つも無いことを検査する（#230）
 *
 * `Static Checks` から `pnpm check:colors` で走る。`git ls-files` 以外に何も要求しない
 * （secrets もビルド成果物もブラウザも不要）ため、同ジョブの「`pnpm install` だけで完結する」
 * 性質と、**fork からの PR でも結果が出る**という性質を壊さない。
 *
 * ## なぜ ESLint だけでは足りないのか
 *
 * **Tailwind のソース走査はテキスト走査であり、コードコメントの中のクラス名も
 * 「使われている」と見なす。** 一方 `eslint.config.mjs` の `no-restricted-syntax` が
 * 見るのは AST の `Literal` と `TemplateElement` だけで、**コメントは対象外**である。
 * つまりガードの死角と Tailwind の感度がずれている。
 *
 * 2026-09-19 まで、`src/components/about/AboutHero.tsx` のコメントに残っていた
 * 旧グラデーションのクラス名のせいで、どこからも使っていない紫と桃のユーティリティが
 * 本番CSSへ出続けていた（#227 のレビューで発覚）。**画面は壊れないので誰も気づかない。**
 *
 * #230 のレビューまで、この穴は「手順で守る」とだけ書かれていた。
 * `scripts/assert-doc-links.mjs` と同じ理由で、手順は装置に置き換える
 * ——「原則を守っているかを確かめる手段はレビューしかなかった」状態を作らない。
 *
 * ## なぜ「コメントだけ」を見ないのか
 *
 * コメントだけを抜き出すには、文字列リテラルやテンプレートリテラルの中の `//` を
 * 区別する必要があり、**その判定を外した箇所がそのまま死角になる。**
 * ここでは走査範囲の生テキストを丸ごと見る。ESLint と重なる範囲は二重に落ちるが、
 * 二重に落ちても困らない。**死角が無いことのほうが重要である。**
 *
 * ## 何を落として、何を通すのか
 *
 * 落とすのは**接頭辞を伴う形**だけである（`from-purple-500` `text-gray-300` など）。
 * 色のユーティリティは必ず名前空間の接頭辞を持つので、**接頭辞の無い裸のトークンからは
 * 何も出力されない。** 「旧・既定パレット 紫の500段（旧 purple-500）」のように
 * 実測値を説明する表はコメントに残せる必要があり、そこまで禁じると
 * ドキュメントのほうが壊れる。
 *
 * 接頭辞の一覧は持たない。**一覧を持つと、載せ忘れた接頭辞がそのまま死角になる**
 * ——この検査が存在する理由そのものである。判定は
 * `scripts/restricted-color-tokens.mjs` の `emittableUtilityRegex()` に置いてある。
 *
 * なお裸のトークンを**コード（文字列リテラル）へ書いた**場合は、
 * `eslint.config.mjs` の `no-restricted-syntax` が落とす。役割は次のように分かれている。
 *
 * - ESLint — 「禁止色を**書かない**」を守る（コードが対象。コメントは見えない）
 * - この検査 — 「禁止色が**配信CSSへ出ない**」を守る（生テキストが対象）
 *
 * ## なぜ作業ツリーを歩いてはいけないのか
 *
 * `scripts/assert-doc-links.mjs` と同じ。走査対象は **Git の追跡対象集合**で決める。
 * ディレクトリを再帰的に歩くと、`.gitignore` 対象のローカルファイル（ビルド生成物や
 * 実験用のコピー）が偽陽性を出す。**CI はクリーンチェックアウトなので CI では
 * 再現せず、手元で走らせた人間だけが嘘を見る。**
 *
 * ## 走査範囲は globals.css から読む
 *
 * 範囲をこのファイルへベタ書きすると、`@source` を動かしたときに黙ってずれる。
 * `src/app/globals.css` の `@import "tailwindcss" source(none);` と `@source "..."` を
 * 読んで、Tailwind が実際に見る範囲をそのまま使う。`source(none)` が外れていたら
 * （＝Tailwind が自動検出で広い範囲を見ていたら）この検査は範囲を保証できないので落とす。
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { RESTRICTED_COLOR_TOKENS, emittableUtilityRegex } from "./restricted-color-tokens.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const GLOBALS_CSS = "src/app/globals.css";

/** 追跡集合から1件も取れない拡張子（テキストとして読まない） */
const BINARY_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".webp",
  ".avif",
  ".ico",
  ".woff",
  ".woff2",
  ".ttf",
  ".otf",
  ".mp4",
  ".webm",
  ".pdf",
]);

/**
 * `globals.css` を読んで Tailwind の走査範囲（リポジトリ相対）を返す
 *
 * @returns {string[]} `git ls-files` へ渡せるパス接頭辞
 */
function readScanRoots() {
  const cssPath = path.join(repoRoot, GLOBALS_CSS);
  const css = readFileSync(cssPath, "utf8");

  if (!/@import\s+["']tailwindcss["']\s+source\(none\)/.test(css)) {
    throw new Error(
      `${GLOBALS_CSS} の @import から source(none) が外れています。` +
        `Tailwind が自動検出で走査する範囲はこの検査では保証できません。` +
        `source(none) を戻すか、この検査の走査範囲の決め方を作り直してください。`
    );
  }

  const roots = [...css.matchAll(/@source\s+["']([^"']+)["']/g)].map((m) =>
    path.relative(repoRoot, path.resolve(path.dirname(cssPath), m[1]))
  );

  if (roots.length === 0) {
    throw new Error(`${GLOBALS_CSS} に @source が1つもありません。走査範囲を決められません。`);
  }
  return roots;
}

/**
 * 追跡対象のテキストファイルを列挙する
 *
 * @param {string[]} roots
 * @returns {string[]}
 */
function listTrackedTextFiles(roots) {
  const out = execFileSync("git", ["ls-files", "-z", "--", ...roots], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 32 * 1024 * 1024,
  });
  return out
    .split("\0")
    .filter(Boolean)
    .filter((p) => !BINARY_EXTENSIONS.has(path.extname(p).toLowerCase()));
}

function main() {
  const roots = readScanRoots();
  const files = listTrackedTextFiles(roots);

  const matchers = RESTRICTED_COLOR_TOKENS.map((token) => ({
    ...token,
    regex: emittableUtilityRegex(token),
  }));

  /** @type {{file: string, line: number, column: number, text: string, message: string}[]} */
  const violations = [];

  for (const file of files) {
    const content = readFileSync(path.join(repoRoot, file), "utf8");
    const lines = content.split("\n");
    lines.forEach((line, index) => {
      for (const matcher of matchers) {
        matcher.regex.lastIndex = 0;
        let hit;
        while ((hit = matcher.regex.exec(line)) !== null) {
          // 先頭の1文字は区切り（行頭なら無し）なので、報告からは落とす
          const matched = hit[0].replace(/^[^a-z-]/, "");
          violations.push({
            file,
            line: index + 1,
            column: hit.index + 1 + (hit[0].length - matched.length),
            text: matched,
            message: matcher.message,
          });
        }
      }
    });
  }

  const scanned = `走査範囲 ${roots.join(", ")} / 追跡ファイル ${files.length} 本`;

  if (violations.length === 0) {
    console.log(`禁止色トークンは見つかりませんでした（${scanned}）`);
    return;
  }

  console.error(`禁止色トークンが ${violations.length} 件見つかりました（${scanned}）\n`);
  for (const v of violations) {
    console.error(`  ${v.file}:${v.line}:${v.column}  ${v.text}`);
    console.error(`    ${v.message}`);
  }
  console.error(
    `\n**コメントの中でも同じ扱いになります。** Tailwind のソース走査はテキスト走査なので、
コメントに書いたクラス名もそのまま配信CSSへ出ます。説明したいときは
「既定パレットの紫の500段」のように接頭辞なしで書いてください
（docs/frontend/design.md「コメントの中のクラス名」）。`
  );
  process.exitCode = 1;
}

try {
  main();
} catch (error) {
  console.error(`検査を実行できませんでした: ${error.message}`);
  process.exitCode = 1;
}
