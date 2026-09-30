#!/usr/bin/env node
/**
 * 追跡ファイルの `.md` が 300 行以下かを検査する（#322）
 *
 * `Static Checks` から `pnpm check:doc-lines` で走る。`git ls-files` 以外に何も要求しない
 * （secrets もビルド成果物もブラウザも不要）ため、同ジョブの「`pnpm install` だけで完結する」
 * 性質と、**fork からの PR でも結果が出る**という性質を壊さない。
 *
 * ## なぜ文章の規約では足りないのか
 *
 * `.claude/CLAUDE.md` の「命名・配置ガイド」は「1ファイルが 300 行超 → 分割」と定めているが、
 * 守られているかを確かめる手段は人の目しかなかった。#318 では `docs/frontend/layout-e2e.md` が
 * 326 行へ伸びたことに、マージ直前にたまたま `wc -l` を打つまで誰も気づかなかった。
 * 導入時点（2026-09-30）で、追跡 `.md` 65 本のうち **18 本がすでに 300 行を超えていた。**
 * このうち `docs/frontend/agent-browser-workflow.md` は導入 PR のレビュー中に #323 が 188 行へ書き直したため、
 * 記録は 17 本で始まった（この検査が最初に落としたのは、その解消済みの記録だった）。
 *
 * ## 対象
 *
 * **追跡されているすべての `.md`**（`.agents/skills/`・`DESIGN.md`・`.claude/CLAUDE.md` を含む）。
 * 範囲は #322 で決めた。走査は `assert-doc-links.mjs` と同じく Git の追跡対象集合で行い、
 * 作業ツリーを歩かない（`.gitignore` 対象のローカルファイルを数えないため）。
 *
 * ## 既存の超過はラチェットで扱う
 *
 * 導入時点で超えていたファイルは、そのときの行数を上限として下の `GRANDFATHERED` に記録してある。
 * 次の5つを落とす。
 *
 * | 種類      | 条件                                           | 直し方                                   |
 * | --------- | ---------------------------------------------- | ---------------------------------------- |
 * | `new`     | 表に無いファイルが 300 行を超えた              | 分割する（#318 の形）                    |
 * | `grew`    | 表にあるファイルが記録した上限を超えた         | 同じ行数を削るか、内容を別ファイルへ出す |
 * | `settled` | 表にあるファイルが 300 行以下になった          | 表からその行を消す                       |
 * | `missing` | 表にあるファイルが追跡されていない（改名・削除） | 表を直す（改名なら新しいパスで記録する） |
 * | `shrunk`  | 表にあるファイルが上限より縮んだ（300 行はまだ超えている） | 表の上限を現在の行数へ下げる |
 *
 * `settled` と `missing` を落とすのは、**空振りする記録を残さない**ためである。
 * 分割しても記録が残ると、そのファイルは上限まで再び伸ばせてしまう。
 *
 * `shrunk` を落とすのは、**上限を実際の行数より緩いまま残さない**ためである（#322 で決定）。
 * 残すと、削った分だけ再び伸ばせてしまう。上限は下がる一方で、上がることは無い。
 * 代償として、表にあるファイルから行を削る PR は、同じ PR で表も直すことになる。
 *
 * ## 行の数え方
 *
 * 改行文字（`\n`）の数。ただし末尾に改行が無い最終行も1行と数える。
 * 改行で終わるファイルでは `wc -l` と一致する（導入時点で全65本が改行で終わっていた）。
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const LABEL = "[assert-doc-line-budget]";

/** `.claude/CLAUDE.md` の「命名・配置ガイド」が定める上限 */
const LINE_LIMIT = 300;

/**
 * 導入時点（2026-09-30、#322）で上限を超えていたファイルと、そのときの行数
 *
 * **ここへ行を足してはいけない。** 新しく 300 行を超えたファイルは分割する。
 * 減らすのは、分割して 300 行以下になったとき（`settled`）と、改名・削除したとき（`missing`）。
 */
const GRANDFATHERED = new Map([
  ["docs/frontend/design.md", 675],
  ["DESIGN.md", 688],
  [".claude/CLAUDE.md", 666],
  ["docs/requires/require.md", 614],
  ["docs/frontend/page-transition.md", 540],
  ["docs/frontend/image-delivery.md", 530],
  ["docs/frontend/events-semantic-search.md", 496],
  ["docs/dev/ci-env.md", 479],
  ["docs/frontend/performance.md", 450],
  ["docs/frontend/timetable-gantt.md", 448],
  ["docs/dev/legacy-site-deindex.md", 435],
  ["docs/requires/todo.md", 414],
  [".agents/skills/next-cache-components/SKILL.md", 411],
  ["docs/dev/microcms.md", 326],
  [".agents/skills/deploy-to-vercel/SKILL.md", 321],
  ["docs/frontend/events-search.md", 312],
]);

/** 行数を数える。数え方の定義は冒頭の「行の数え方」 */
function countLines(text) {
  if (text.length === 0) return 0;
  const newlines = text.split("\n").length - 1;
  return text.endsWith("\n") ? newlines : newlines + 1;
}

/**
 * 違反を判定する。**合否はこの関数だけで決める**
 *
 * @param {Map<string, number>} lineCounts 追跡 `.md` のパスと行数
 * @param {Map<string, number>} grandfathered 記録済みの超過と、その上限
 * @returns {Array<{ kind: string, file: string, lines?: number, ceiling?: number }>}
 */
function judge(lineCounts, grandfathered) {
  const violations = [];

  for (const [file, lines] of lineCounts) {
    const ceiling = grandfathered.get(file);
    if (ceiling === undefined) {
      if (lines > LINE_LIMIT) violations.push({ kind: "new", file, lines });
    } else if (lines > ceiling) {
      violations.push({ kind: "grew", file, lines, ceiling });
    } else if (lines <= LINE_LIMIT) {
      violations.push({ kind: "settled", file, lines, ceiling });
    } else if (lines < ceiling) {
      violations.push({ kind: "shrunk", file, lines, ceiling });
    }
  }

  for (const [file, ceiling] of grandfathered) {
    if (!lineCounts.has(file)) violations.push({ kind: "missing", file, ceiling });
  }

  return violations;
}

/**
 * 実データを見る前に、数え方と判定そのものが正しいかを合成した入力で確かめる
 *
 * 判定が黙って甘くなる（fail-open）と、この検査は「緑なのに何も守っていない」装置になる。
 * 5種類の違反のそれぞれが検出され、境界（ちょうど 300 行・ちょうど上限）では落ちないことを見る。
 */
function runSelfCheck() {
  const failures = [];
  const expect = (label, actual, expected) => {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) failures.push(`${label}: 期待 ${e} / 実際 ${a}`);
  };

  expect("空のファイル", countLines(""), 0);
  expect("改行で終わる1行", countLines("a\n"), 1);
  expect("改行で終わらない1行", countLines("a"), 1);
  expect("改行で終わらない2行", countLines("a\nb"), 2);
  expect("空行を含む", countLines("a\n\n"), 2);
  expect("CRLF", countLines("a\r\nb\r\n"), 2);

  const table = new Map([
    ["grown.md", 400],
    ["exact.md", 400],
    ["shrunk.md", 400],
    ["settled.md", 400],
    ["renamed.md", 400],
  ]);
  const counts = new Map([
    ["at-limit.md", LINE_LIMIT],
    ["over-limit.md", LINE_LIMIT + 1],
    ["grown.md", 401],
    ["exact.md", 400],
    ["shrunk.md", 350],
    ["settled.md", LINE_LIMIT],
  ]);
  const kinds = judge(counts, table)
    .map((v) => `${v.kind}:${v.file}`)
    .sort();

  expect("違反の一覧", kinds, [
    "grew:grown.md",
    "missing:renamed.md",
    "new:over-limit.md",
    "settled:settled.md",
    "shrunk:shrunk.md",
  ]);

  if (failures.length > 0) {
    console.error(`${LABEL} FAIL: 判定の自己検査が ${failures.length} 件外れました。`);
    for (const failure of failures) console.error(`  ${failure}`);
    console.error("");
    console.error("  実データを見る前に落としています。判定を直してから再実行してください。");
    process.exit(1);
  }
}

runSelfCheck();

const ROOT = execFileSync("git", ["rev-parse", "--show-toplevel"], { encoding: "utf8" }).trim();

/**
 * 追跡ファイルの一覧。`-z` はパスに空白や非ASCIIが入っても壊れないため
 * （`core.quotePath` の既定が true なので、改行区切りだとエスケープ表記を掴まされる）
 */
const markdownFiles = execFileSync("git", ["ls-files", "-z"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter((file) => file.toLowerCase().endsWith(".md"));

const lineCounts = new Map();
for (const file of markdownFiles) {
  const absolute = path.join(ROOT, file);
  // 追跡されているが作業ツリーから消したファイル（コミット前の削除）。消えたものとして扱う
  if (!existsSync(absolute)) continue;
  lineCounts.set(file, countLines(readFileSync(absolute, "utf8")));
}

const violations = judge(lineCounts, GRANDFATHERED);

if (violations.length > 0) {
  const MESSAGES = {
    new: (v) =>
      `${v.file}: ${v.lines} 行（上限 ${LINE_LIMIT} 行）。分割すること` +
      `（照合は \`pnpm docs:split-check\`。#318 が分割の例）。GRANDFATHERED へ足してはいけない`,
    grew: (v) =>
      `${v.file}: ${v.lines} 行（記録した上限 ${v.ceiling} 行を ${v.lines - v.ceiling} 行超えた）。` +
      `同じ行数を削るか、内容を別のファイルへ出すこと`,
    settled: (v) =>
      `${v.file}: ${v.lines} 行（${LINE_LIMIT} 行以下になった）。` +
      `scripts/assert-doc-line-budget.mjs の GRANDFATHERED からこの行を消すこと`,
    missing: (v) =>
      `${v.file}: 追跡されていない（改名・削除）。GRANDFATHERED を直すこと` +
      `（改名したなら新しいパスで記録し直す。上限は ${v.ceiling} 行のまま）`,
    shrunk: (v) =>
      `${v.file}: ${v.lines} 行（記録した上限 ${v.ceiling} 行より ${v.ceiling - v.lines} 行縮んだ）。` +
      `scripts/assert-doc-line-budget.mjs の GRANDFATHERED で上限を ${v.lines} へ下げること`,
  };

  console.error(`${LABEL} FAIL: ${violations.length} 件の違反があります。`);
  for (const violation of violations) {
    console.error(`  [${violation.kind}] ${MESSAGES[violation.kind](violation)}`);
  }
  console.error("");
  console.error(
    `  規約: .claude/CLAUDE.md「命名・配置ガイド」— 1ファイルが ${LINE_LIMIT} 行超なら分割する。`
  );
  console.error(
    "  この検査は Git の追跡対象だけを見ます。新規ファイルは `git add` してから数えます。"
  );
  process.exit(1);
}

const withinLimit = [...lineCounts.values()].filter((lines) => lines <= LINE_LIMIT).length;
console.log(
  `${LABEL} OK: 追跡 .md ${lineCounts.size}本 / ${LINE_LIMIT}行以下 ${withinLimit}本 / ` +
    `上限つきで記録 ${GRANDFATHERED.size}本（上限と一致）。`
);
