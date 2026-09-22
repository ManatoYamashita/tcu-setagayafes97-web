#!/usr/bin/env node
/**
 * 事前描画HTMLのフォント preload が過剰でないことを検査する（#90）
 *
 * `pnpm build` の末尾で走る。2026-08-24 の本番では、Kaisei Opti の
 * `preload: true` によりトップページへ244本・約4.6 MiBのフォントが先読みされ、
 * モバイル Performance が34まで低下した。
 *
 * `next/font` の設定だけを検査してはいけない。フォントの追加場所やNext.jsの生成仕様が
 * 変わっても、利用者へ届く最終的な `<link rel="preload" as="font">` の本数が契約である。
 * そのため、全事前描画HTMLの `<head>` を読み、1ルートでも10本以上なら失敗させる。
 *
 * Modern Web Guidanceは初期フォントpreloadを2〜3本以内に抑えることを推奨するが、
 * 本検査はIssue #90の完了条件「10本未満」を回帰境界として固定する。より厳しい上限へ
 * 変更するときは、実測値と意図を docs/frontend/performance.md に記録すること。
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** `next build` が事前描画したHTMLの置き場 */
const APP_DIR = path.resolve(process.cwd(), ".next/server/app");

/** Issue #90 の完了条件は「10本未満」 */
const MAX_FONT_PRELOADS_PER_PAGE = 9;

const LINK_PATTERN = /<link\b[^>]*>/gi;
const LABEL = "[assert-font-preloads]";

function fail(message, hint) {
  console.error(`${LABEL} FAIL: ${message}`);
  if (hint) console.error(hint);
  process.exit(1);
}

function collectHtmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
}

function readAttribute(tag, name) {
  const pattern = new RegExp(`\\s${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s>]+))`, "i");
  const match = pattern.exec(tag);
  return match ? (match[1] ?? match[2] ?? match[3]) : null;
}

function countFontPreloads(html) {
  const headEnd = html.search(/<\/head\s*>/i);
  if (headEnd === -1) return null;

  const head = html.slice(0, headEnd);
  return [...head.matchAll(LINK_PATTERN)].filter((match) => {
    const tag = match[0];
    const rel = readAttribute(tag, "rel")?.toLowerCase().split(/\s+/) ?? [];
    const as = readAttribute(tag, "as")?.toLowerCase();
    return rel.includes("preload") && as === "font";
  }).length;
}

/** 属性順・引用符・relの複数値を含む最小の自己検査 */
const FIXTURES = [
  {
    name: "標準の属性順",
    html: '<html><head><link rel="preload" as="font" href="/a.woff2"></head></html>',
    expected: 1,
  },
  {
    name: "属性順と引用符が異なる",
    html: "<html><head><link as='font' href='/a.woff2' rel='modulepreload preload'></head></html>",
    expected: 1,
  },
  {
    name: "画像preloadとstylesheetは対象外",
    html: [
      "<html><head>",
      '<link rel="preload" as="image" href="/a.avif">',
      '<link rel="stylesheet" href="/a.css">',
      "</head></html>",
    ].join(""),
    expected: 0,
  },
  {
    name: "body内の文字列は対象外",
    html: '<html><head></head><body><script>"<link rel=preload as=font>"</script></body></html>',
    expected: 0,
  },
];

for (const fixture of FIXTURES) {
  const actual = countFontPreloads(fixture.html);
  if (actual !== fixture.expected) {
    fail(
      `抽出器の自己検査「${fixture.name}」が外れました（期待 ${fixture.expected} / 実際 ${actual}）。`
    );
  }
}

if (!existsSync(APP_DIR)) {
  fail(
    `${path.relative(process.cwd(), APP_DIR)} が見つかりません。`,
    "  next build の出力先が変わった可能性があります。APP_DIR を実際の出力先へ合わせてください。"
  );
}

const htmlFiles = collectHtmlFiles(APP_DIR);

if (htmlFiles.length === 0) {
  fail(
    "事前描画されたHTMLが1枚もありません。",
    "  全ルートが動的化した可能性があります。この状態では本検査は何も守れません。"
  );
}

const missingHead = [];
const results = [];

for (const file of htmlFiles) {
  const relative = path.relative(APP_DIR, file);
  const count = countFontPreloads(readFileSync(file, "utf8"));
  if (count === null) missingHead.push(relative);
  else results.push({ file: relative, count });
}

if (missingHead.length > 0) {
  fail(
    `<head> を閉じていないHTMLが ${missingHead.length} 枚あります。フォントpreloadを検査できません。`,
    missingHead
      .slice(0, 10)
      .map((file) => `    ${file}`)
      .join("\n")
  );
}

const violations = results.filter(({ count }) => count > MAX_FONT_PRELOADS_PER_PAGE);

if (violations.length > 0) {
  const detail = violations
    .slice(0, 10)
    .map(({ file, count }) => `    ${file}: ${count} 本`)
    .join("\n");
  fail(
    `フォントpreloadが10本以上あるHTMLが ${violations.length} 枚あります。#90 の再発です。`,
    [
      detail,
      violations.length > 10 ? `    ...ほか ${violations.length - 10} 枚` : "",
      "",
      "  日本語フォントは unicode-range ごとのファイル数が多いため、",
      "  next/font/google の preload を原則 false にしてください。",
      "  詳細: docs/frontend/performance.md「Webフォント」",
    ]
      .filter(Boolean)
      .join("\n")
  );
}

const peak = results.reduce(
  (current, result) => (result.count > current.count ? result : current),
  results[0]
);
const total = results.reduce((sum, result) => sum + result.count, 0);

console.log(
  `${LABEL} OK: HTML ${results.length} 枚のフォントpreloadは最大 ${peak.count} 本` +
    `（${peak.file}、全HTML合計 ${total} 本）です。`
);
