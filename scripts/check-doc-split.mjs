#!/usr/bin/env node
/**
 * ドキュメントを分割・圧縮したときに、元ファイルの行がどこかに残っているかを照合する
 *
 * 使い方:
 *   pnpm docs:split-check <元ファイル> <分割後のファイル...>
 *   例: pnpm docs:split-check docs/dev/git.md docs/dev/git.md docs/dev/staging-and-merge.md
 *
 * 元ファイルは `origin/main`（環境変数 BASE で変更可）から読み、分割後のファイルは作業ツリーから読む。
 * 元の非空行のうち、分割後のどのファイルにも（前後の空白を除いて）同じ行が無いものを列挙する。
 *
 * これは「落とした行の一覧」を出す道具であって、合否を判定しない（常に exit 0）。
 * 分割では書き換えや意図した削除が必ず出るため、列挙された行が**意図したものだけか**を人が確かめ、
 * PR の本文に理由付きで載せる。2026-09-30 の #311 では、設計理由の1行をこの照合で拾い漏らしから救った。
 *
 * シェルスクリプトにしていないのは、zsh が引用符の無い変数を単語分割しないためである。
 * `cat $FILES` のように複数のファイルを変数で渡すと1つのパスとして渡り、照合が黙って空振りする
 * （#311 の最初の照合で実際に踏んだ）。
 */

import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const LABEL = "[check-doc-split]";
const [orig, ...news] = process.argv.slice(2);

if (!orig || news.length === 0) {
  console.error(`${LABEL} 使い方: pnpm docs:split-check <元ファイル> <分割後のファイル...>`);
  process.exit(1);
}

const base = process.env.BASE ?? "origin/main";

let before;
try {
  before = execFileSync("git", ["show", `${base}:${orig}`], { encoding: "utf8" })
    .replace(/\n$/, "")
    .split("\n");
} catch {
  console.error(`${LABEL} ${base}:${orig} を読めません。BASE とパスを確かめてください。`);
  process.exit(1);
}

const kept = new Set(
  news.flatMap((file) =>
    readFileSync(file, "utf8")
      .split("\n")
      .map((line) => line.trim())
  )
);

const lost = before
  .map((line, index) => ({ number: index + 1, text: line.trim() }))
  .filter(({ text }) => text !== "" && !kept.has(text));

console.log(
  `${LABEL} ${base}:${orig}（${before.length} 行）のうち ${lost.length} 行が、${news.join(" / ")} のどこにも無い`
);
for (const { number, text } of lost) {
  console.log(`  ${number}: ${text.length > 100 ? `${text.slice(0, 100)}…` : text}`);
}
