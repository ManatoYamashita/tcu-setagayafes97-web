#!/usr/bin/env node
/**
 * Layout E2E の装置一覧が `e2e/` の実態と一致しているかを検査する（#406）
 *
 * `Static Checks` から `pnpm check:e2e-guards` で走る。`git ls-files` 以外に何も要求しない
 * （secrets もビルド成果物もブラウザも不要）ため、同ジョブの「`pnpm install` だけで完結する」
 * 性質と、**fork からの PR でも結果が出る**という性質を壊さない。
 *
 * ## なぜ要るのか
 *
 * 装置の一覧は4か所に書かれている。
 *
 * | 場所                                             | 書かれているもの                 |
 * | ------------------------------------------------ | -------------------------------- |
 * | `docs/frontend/layout-e2e.md` 冒頭の表           | 装置（`e2e/` 直下のディレクトリ） |
 * | `docs/frontend/layout-e2e.md`「構成」のツリー    | ファイル                         |
 * | `playwright.config.ts` 冒頭のコメント            | 装置                             |
 * | 本文の装置数（layout-e2e.md の2か所・CLAUDE.md） | 数                               |
 *
 * 装置を足すたびにどれかが置き去りになっていた。#405 の時点で `e2e/events/` は表にも
 * 構成にも無く、`.claude/CLAUDE.md` は「現在2つ載っている」のまま（実際は5つ）だった。
 * **lint・型・テスト・ビルド・リンク検査のどれも通過していた。**
 *
 * ## 落とすもの
 *
 * | 種類            | 条件                                                 |
 * | --------------- | ---------------------------------------------------- |
 * | `table-missing` | `e2e/` 直下のディレクトリが表に無い                  |
 * | `table-stale`   | 表のディレクトリが存在しない（改名・削除）           |
 * | `tree-missing`  | 追跡ファイルが「構成」のツリーに無い                 |
 * | `tree-stale`    | ツリーのファイルが存在しない                         |
 * | `config-missing`| ディレクトリが `playwright.config.ts` の冒頭に無い   |
 * | `config-stale`  | 冒頭のディレクトリが存在しない                       |
 * | `count`         | 本文の装置数がディレクトリ数と違う                   |
 * | `unreadable`    | 照合する文・表・ツリーが見つからない                 |
 *
 * `unreadable` を落とすのは、**文言を変えただけで検査が黙って空振りする**（fail-open）のを防ぐためである。
 * 照合の書式を変えたいときは、この検査の正規表現も同じ PR で直すこと。
 *
 * ## 見ないもの
 *
 * - 表の「対象」「防いでいる事故」の中身、ツリーのコメント、`[desktop]` / `[mobile]` の正しさ
 * - `e2e/` の外にあるテスト
 */

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const LABEL = "[assert-e2e-guard-list]";

const LAYOUT_DOC = "docs/frontend/layout-e2e.md";
const PLAYWRIGHT_CONFIG = "playwright.config.ts";
const CLAUDE_MD = ".claude/CLAUDE.md";

/** 表の行のうち、先頭のセルが `` `e2e/<dir>/` `` だけのもの */
const TABLE_ROW = /^\|\s*`e2e\/([^/`]+)\/`\s*\|/gm;

/** `playwright.config.ts` 冒頭の ` * - e2e/<dir>/ — ...` */
const CONFIG_ENTRY = /^\s*\*\s*-\s*e2e\/([^/\s]+)\/\s*—/gm;

/** 本文の装置数。数字は半角で書くこと */
const COUNT_SENTENCES = [
  { file: LAYOUT_DOC, pattern: /現在(\d+)つの装置が載っています/g },
  { file: LAYOUT_DOC, pattern: /現在載っている(\d+)つ/g },
  { file: CLAUDE_MD, pattern: /時点で(\d+)つある/g },
];

/** 「構成」見出しの直後にある最初のコードブロック */
const TREE_BLOCK = /^## 構成\s*\n+```[^\n]*\n([\s\S]*?)\n```/m;

/** ツリーの1行。字下げは `│   ` か空白4つの繰り返し */
const TREE_LINE = /^((?:│ {3}| {4})*)(?:├── |└── )(\S+)/;

/**
 * 「構成」のツリーから、`e2e/` からの相対パスの集合を作る
 *
 * @param {string} block コードブロックの中身
 * @returns {Set<string>} `events/results-scroll.spec.ts` や `fixtures.ts`
 */
function parseTree(block) {
  const files = new Set();
  const dirs = [];
  for (const line of block.split("\n")) {
    const match = TREE_LINE.exec(line);
    if (!match) continue;
    const depth = match[1].length / 4;
    const name = match[2];
    dirs.length = depth;
    if (name.endsWith("/")) {
      dirs.push(name);
    } else {
      files.add(dirs.join("") + name);
    }
  }
  return files;
}

/** 正規表現の1番目のグループをすべて取り出す */
function captureAll(pattern, text) {
  return [...text.matchAll(pattern)].map((match) => match[1]);
}

/**
 * 違反を判定する。**合否はこの関数だけで決める**
 *
 * @param {object} input
 * @param {string[]} input.tracked `e2e/` 配下の追跡ファイル（`e2e/` からの相対パス）
 * @param {string[] | null} input.tableDirs 表のディレクトリ。表が見つからなければ null
 * @param {Set<string> | null} input.treeFiles ツリーのファイル。ツリーが見つからなければ null
 * @param {string[] | null} input.configDirs 冒頭のディレクトリ。見つからなければ null
 * @param {Array<{ where: string, values: number[] }>} input.counts 本文の装置数
 * @returns {Array<{ kind: string, subject: string, detail?: string }>}
 */
function judge({ tracked, tableDirs, treeFiles, configDirs, counts }) {
  const violations = [];
  const dirs = new Set(tracked.filter((file) => file.includes("/")).map((file) => file.split("/")[0]));

  const compareDirs = (listed, prefix) => {
    if (listed === null) {
      violations.push({ kind: "unreadable", subject: prefix });
      return;
    }
    const listedSet = new Set(listed);
    for (const dir of dirs) {
      if (!listedSet.has(dir)) violations.push({ kind: `${prefix}-missing`, subject: `e2e/${dir}/` });
    }
    for (const dir of listedSet) {
      if (!dirs.has(dir)) violations.push({ kind: `${prefix}-stale`, subject: `e2e/${dir}/` });
    }
  };

  compareDirs(tableDirs, "table");
  compareDirs(configDirs, "config");

  if (treeFiles === null) {
    violations.push({ kind: "unreadable", subject: "tree" });
  } else {
    for (const file of tracked) {
      if (!treeFiles.has(file)) violations.push({ kind: "tree-missing", subject: `e2e/${file}` });
    }
    const trackedSet = new Set(tracked);
    for (const file of treeFiles) {
      if (!trackedSet.has(file)) violations.push({ kind: "tree-stale", subject: `e2e/${file}` });
    }
  }

  for (const { where, values } of counts) {
    if (values.length === 0) {
      violations.push({ kind: "unreadable", subject: where });
      continue;
    }
    for (const value of values) {
      if (value !== dirs.size) {
        violations.push({ kind: "count", subject: where, detail: `${value} → ${dirs.size}` });
      }
    }
  }

  return violations;
}

/**
 * 実データを見る前に、読み取りと判定そのものが正しいかを合成した入力で確かめる
 *
 * 判定が黙って甘くなる（fail-open）と、この検査は「緑なのに何も守っていない」装置になる。
 * 8種類の違反のそれぞれが検出され、一致しているときは何も出さないことを見る。
 */
function runSelfCheck() {
  const failures = [];
  const expect = (label, actual, expected) => {
    const a = JSON.stringify(actual);
    const e = JSON.stringify(expected);
    if (a !== e) failures.push(`${label}: 期待 ${e} / 実際 ${a}`);
  };

  const tree = [
    "e2e/",
    "├── fixtures.ts                      # 共通",
    "├── alpha/",
    "│   ├── one.spec.ts                  # [desktop]",
    "│   └── two.spec.ts",
    "└── beta/",
    "    └── three.spec.ts",
  ].join("\n");
  expect("ツリーの読み取り", [...parseTree(tree)].sort(), [
    "alpha/one.spec.ts",
    "alpha/two.spec.ts",
    "beta/three.spec.ts",
    "fixtures.ts",
  ]);

  const doc = [
    "現在2つの装置が載っています。",
    "",
    "| 装置           | 対象 |",
    "| -------------- | ---- |",
    "| `e2e/alpha/`   | a    |",
    "| `e2e/beta/`    | b    |",
    "",
    "## 構成",
    "",
    "```",
    tree,
    "```",
  ].join("\n");
  expect("表の読み取り", captureAll(TABLE_ROW, doc), ["alpha", "beta"]);
  expect("ツリーの位置", TREE_BLOCK.test(doc), true);
  expect("装置数の読み取り", captureAll(COUNT_SENTENCES[0].pattern, doc), ["2"]);
  expect(
    "冒頭コメントの読み取り",
    captureAll(CONFIG_ENTRY, " * - e2e/alpha/ — #1。説明\n *   続き\n * - e2e/beta/ — #2"),
    ["alpha", "beta"]
  );

  const tracked = ["fixtures.ts", "alpha/one.spec.ts", "alpha/two.spec.ts", "beta/three.spec.ts"];
  const consistent = {
    tracked,
    tableDirs: ["alpha", "beta"],
    treeFiles: parseTree(tree),
    configDirs: ["alpha", "beta"],
    counts: [{ where: "doc", values: [2] }],
  };
  expect("一致しているときは違反なし", judge(consistent), []);

  const kinds = judge({
    tracked: [...tracked, "gamma/four.spec.ts"],
    tableDirs: ["alpha", "beta", "removed"],
    treeFiles: new Set([...parseTree(tree), "alpha/renamed.spec.ts"]),
    configDirs: ["alpha", "beta", "removed"],
    counts: [
      { where: "doc", values: [2] },
      { where: "claude", values: [] },
    ],
  })
    .map((v) => `${v.kind}:${v.subject}`)
    .sort();
  expect("違反の一覧", kinds, [
    "config-missing:e2e/gamma/",
    "config-stale:e2e/removed/",
    "count:doc",
    "table-missing:e2e/gamma/",
    "table-stale:e2e/removed/",
    "tree-missing:e2e/gamma/four.spec.ts",
    "tree-stale:e2e/alpha/renamed.spec.ts",
    "unreadable:claude",
  ]);

  const unreadable = judge({ ...consistent, tableDirs: null, treeFiles: null, configDirs: null })
    .map((v) => `${v.kind}:${v.subject}`)
    .sort();
  expect("読み取れないときは落とす", unreadable, [
    "unreadable:config",
    "unreadable:table",
    "unreadable:tree",
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

/** 追跡ファイルの `e2e/` 配下。`-z` はパスに空白や非ASCIIが入っても壊れないため */
const tracked = execFileSync("git", ["ls-files", "-z", "--", "e2e"], { cwd: ROOT, encoding: "utf8" })
  .split("\0")
  .filter(Boolean)
  // 追跡されているが作業ツリーから消したファイル（コミット前の削除）。消えたものとして扱う
  .filter((file) => existsSync(path.join(ROOT, file)))
  .map((file) => file.slice("e2e/".length));

const read = (file) => readFileSync(path.join(ROOT, file), "utf8");
const layoutDoc = read(LAYOUT_DOC);
const config = read(PLAYWRIGHT_CONFIG);

const tableDirs = captureAll(TABLE_ROW, layoutDoc);
const treeBlock = TREE_BLOCK.exec(layoutDoc);
const configDirs = captureAll(CONFIG_ENTRY, config);

const violations = judge({
  tracked,
  tableDirs: tableDirs.length > 0 ? tableDirs : null,
  treeFiles: treeBlock ? parseTree(treeBlock[1]) : null,
  configDirs: configDirs.length > 0 ? configDirs : null,
  counts: COUNT_SENTENCES.map(({ file, pattern }) => ({
    where: `${file}（${pattern.source}）`,
    values: captureAll(pattern, read(file)).map(Number),
  })),
});

if (violations.length > 0) {
  const MESSAGES = {
    "table-missing": (v) => `${LAYOUT_DOC} 冒頭の表に ${v.subject} の行が無い。対象と防いでいる事故を1行で足すこと`,
    "table-stale": (v) => `${LAYOUT_DOC} 冒頭の表の ${v.subject} は存在しない。行を消すか、新しい名前へ直すこと`,
    "tree-missing": (v) => `${LAYOUT_DOC}「構成」のツリーに ${v.subject} が無い。足すこと`,
    "tree-stale": (v) => `${LAYOUT_DOC}「構成」のツリーの ${v.subject} は存在しない。消すか、新しい名前へ直すこと`,
    "config-missing": (v) => `${PLAYWRIGHT_CONFIG} 冒頭のコメントに ${v.subject} が無い。足すこと`,
    "config-stale": (v) => `${PLAYWRIGHT_CONFIG} 冒頭のコメントの ${v.subject} は存在しない。消すこと`,
    count: (v) => `${v.subject} の装置数が実態と違う（${v.detail}）。数を直すこと`,
    unreadable: (v) =>
      `${v.subject} を読み取れない。文言や書式を変えたなら scripts/assert-e2e-guard-list.mjs の正規表現も直すこと`,
  };

  console.error(`${LABEL} FAIL: ${violations.length} 件の違反があります。`);
  for (const violation of violations) {
    console.error(`  [${violation.kind}] ${MESSAGES[violation.kind](violation)}`);
  }
  console.error("");
  console.error("  装置を足したら、表・「構成」・playwright.config.ts の冒頭・装置数を同じコミットで更新する。");
  console.error("  この検査は Git の追跡対象だけを見ます。新規ファイルは `git add` してから数えます。");
  process.exit(1);
}

const dirCount = new Set(tracked.filter((file) => file.includes("/")).map((file) => file.split("/")[0])).size;
console.log(
  `${LABEL} OK: 装置 ${dirCount}つ / 追跡ファイル ${tracked.length}本が、表・構成・` +
    `${PLAYWRIGHT_CONFIG} の冒頭・装置数（${COUNT_SENTENCES.length}か所）と一致しています。`
);
