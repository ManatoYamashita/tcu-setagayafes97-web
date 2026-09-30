#!/usr/bin/env node
/**
 * 事前描画されたページが 404 として生成されていないことを検査する（#287）
 *
 * `pnpm build` の末尾で走る。2026-09-28、ビルド中に microCMS が 429 を返し、
 * 企画詳細11ページが `"status": 404` で静的生成された。取得関数が例外を `null` に潰し、
 * ページが `notFound()` を呼んだためである。それでもビルドは exit 0 で、
 * 他の検査もすべて OK だった。
 *
 * 取得関数は現在「microCMS が存在しないと答えたときだけ `null`」にしてあり
 * （`src/lib/microcms.ts` の `isMicrocmsNotFound`）、それ以外はビルドを落とす。
 * 本検査はその判定が将来ゆるめられたときの最後の網である。
 *
 * 判定の根拠: 事前描画されるのは `generateStaticParams` が返した ID だけであり、
 * **一覧に載っていた ID が詳細で 404 になるのは常に矛盾**である。
 * したがって `_not-found` 以外の `.meta` に `"status": 404` があれば失敗させる。
 *
 * 2026-09-30 の実測（詳細取得にだけ 429 を注入し、修正前のコードでビルド）:
 * 企画詳細 98 ページと著名人企画 1 ページが 404 で生成され、`next build` は exit 0 だった。
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

/** `next build` が事前描画したページの置き場 */
const APP_DIR = path.resolve(process.cwd(), ".next/server/app");

/** 404 で生成されてよいページ（`src/app/not-found.tsx` 自身） */
const ALLOWED_404 = new Set(["_not-found.meta"]);

/** 空振りを見分けるための、microCMS 由来の動的詳細ページの置き場 */
const DETAIL_DIRS = ["events", "special", "info"];

const LABEL = "[assert-no-prerendered-404]";

function fail(message, hint) {
  console.error(`${LABEL} FAIL: ${message}`);
  if (hint) console.error(hint);
  process.exit(1);
}

function collectMetaFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collectMetaFiles(full));
    else if (entry.name.endsWith(".meta")) found.push(full);
  }
  return found;
}

if (!existsSync(APP_DIR)) {
  fail(
    `${path.relative(process.cwd(), APP_DIR)} が見つかりません。`,
    "  next build の出力先が変わった可能性があります。APP_DIR を実際の出力先へ合わせてください。"
  );
}

const metaFiles = collectMetaFiles(APP_DIR);

if (metaFiles.length === 0) {
  fail(
    "事前描画されたページの .meta が1枚もありません。",
    "  出力形式が変わった可能性があります。この状態では本検査は何も守れません。"
  );
}

const unexpected404 = [];
let detailPages = 0;

for (const file of metaFiles) {
  const relative = path.relative(APP_DIR, file);
  if (DETAIL_DIRS.some((dir) => relative.startsWith(`${dir}${path.sep}`))) detailPages += 1;
  if (ALLOWED_404.has(relative)) continue;

  let status;
  try {
    status = JSON.parse(readFileSync(file, "utf8")).status;
  } catch (error) {
    fail(`${relative} を JSON として読めません: ${error.message}`);
  }
  if (status === 404) unexpected404.push(relative);
}

if (unexpected404.length > 0) {
  const shown = unexpected404.slice(0, 10).map((file) => `  - ${file}`);
  if (unexpected404.length > shown.length) {
    shown.push(`  …ほか ${unexpected404.length - shown.length} 件`);
  }
  fail(
    `${unexpected404.length} ページが 404 として事前描画されました。\n${shown.join("\n")}`,
    [
      "  generateStaticParams が返した ID が詳細で 404 になっています。",
      "  ビルドログで microCMS の 429 / 5xx を探し、取得関数が例外を null に潰していないか確認してください。",
      "  詳細は docs/dev/microcms-fetch-failures.md。",
    ].join("\n")
  );
}

if (detailPages === 0) {
  console.log(
    `${LABEL} NOTE: microCMS 由来の詳細ページが1枚も事前描画されていません（公開フラグが false か、microCMS が未設定）。` +
      "この状態では本検査は何も守っていません。"
  );
}

console.log(
  `${LABEL} OK: 事前描画 ${metaFiles.length} ページ（うち詳細 ${detailPages}）に、_not-found 以外の 404 はありません。`
);
