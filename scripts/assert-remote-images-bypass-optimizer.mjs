#!/usr/bin/env node
/**
 * リモート画像が Vercel の Image Optimization を通っていないことを検査する（#237 の再発防止装置）
 *
 * `pnpm build` の末尾で走る。
 *
 * ## なぜ必要か
 *
 * 2026-09-19、本番の `/_next/image` が `402 Payment Required` を返し、企画サムネイルの
 * 一部が壊れた。Vercel Free Plan の変換枠（Image Transformations）の枯渇である。
 * `src/lib/image-loader.ts` の `appImageLoader` を `loader` prop で渡すことで根治したが、
 * **この仕組みは静かに外れる。**
 *
 * - 新しく `<Image>` を書いた人が `loader` prop を渡し忘れる
 * - 既存の `<Image>` から `loader` prop が消える
 * - 新しいリモート画像ホストを増やし、ローダーの分岐に入れ忘れる
 *
 * どれもビルドは通り、画面も（枠が残っているうちは）正常に見える。**枠を使い切った
 * 時点で初めて壊れ、しかも「一部の画像だけ」という分かりにくい形で出る。**
 * `src/lib/image-loader.test.ts` はローダー関数の契約しか見ないため、
 * **関数が呼ばれないこと自体を1つも検出できない。** 生成物を読む以外に方法が無い。
 *
 * `loader` prop はコンポーネントごとに渡す必要がある。`next.config.ts` の `loaderFile` で
 * 全体へ適用すれば渡し忘れは起きないが、**その設定は `/_next/image` を 404 にするため
 * `public/` の静的画像22枚が最適化を失う**（2026-09-19 実測）。渡し忘れを機械で拾う
 * この検査は、その代償を払わないための装置である。
 *
 * ## 何を見ているか
 *
 * 事前描画されたHTMLに `/_next/image?url=https%3A%2F%2F`（= リモート画像を Vercel の
 * 最適化へ渡すURL）が現れないこと。ホストを microCMS に限定していないのは、
 * **将来ホストを増やしたときにも漏れを捕まえるため**である。別ホストの画像を意図して
 * Vercel の最適化へ通す場合は、本ファイルを同じコミットで直すこと。
 *
 * 背景と設計は docs/frontend/image-delivery.md を参照。
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
/*
 * `@next/env` は CommonJS のため、`.mjs` から名前付き import できない
 * （Node 20 が `Named export 'loadEnvConfig' not found` で落ちる）。default 経由で取り出す。
 */
import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;

/** `next build` が事前描画したHTMLの置き場 */
const APP_DIR = path.resolve(process.cwd(), ".next/server/app");

/**
 * Vercel の最適化エンドポイントへリモート画像を渡すURL。
 *
 * `next/image` は `url` を `encodeURIComponent` して埋めるため、リモート画像は
 * 必ず `https%3A%2F%2F` で始まる。ローカル画像は `%2Fimages%2F...` になるので、
 * この検査には引っかからない。
 */
const OPTIMIZER_REMOTE_PATTERN = /\/_next\/image\?url=https%3A%2F%2F([^&"']+)/g;

/** `src/lib/image-loader.ts` が生成する imgix URL の目印 */
const IMGIX_MARKER = "images.microcms-assets.io/";

const LABEL = "[assert-remote-images-bypass-optimizer]";

function fail(message, hint) {
  console.error(`${LABEL} FAIL: ${message}`);
  if (hint) console.error(hint);
  process.exit(1);
}

/*
 * 公開フラグは `next build` と同じ手順で解決する。素の `process.env` だけを見ると、
 * `.env.local` で解禁した手元のビルドと食い違う（assert-events-static-html.mjs と同じ理由）。
 */
loadEnvConfig(process.cwd(), false, {
  info: () => {},
  error: (...args) => console.error(LABEL, ...args),
});

/** microCMS の画像がHTMLへ出うるかどうか。すべて false なら検査対象が存在しない */
const CONTENT_FLAGS = {
  NEXT_PUBLIC_EVENTS_VISIBLE: process.env.NEXT_PUBLIC_EVENTS_VISIBLE === "true",
  NEXT_PUBLIC_NEWS_VISIBLE: process.env.NEXT_PUBLIC_NEWS_VISIBLE === "true",
  NEXT_PUBLIC_SPECIAL_VISIBLE: process.env.NEXT_PUBLIC_SPECIAL_VISIBLE === "true",
};

function collectHtmlFiles(dir) {
  const found = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) found.push(...collectHtmlFiles(full));
    else if (entry.name.endsWith(".html")) found.push(full);
  }
  return found;
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

/** 違反を `ファイル → ホスト集合` で集める。同じホストの大量出力で画面を潰さない */
const violations = new Map();
let imgixCount = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");

  if (html.includes(IMGIX_MARKER)) imgixCount += 1;

  const hosts = new Set();
  for (const match of html.matchAll(OPTIMIZER_REMOTE_PATTERN)) {
    // `https%3A%2F%2F` の直後から、次の `%2F`（パスの区切り）までがホスト名
    hosts.add(decodeURIComponent(match[1]).split("/")[0]);
  }
  if (hosts.size > 0) violations.set(path.relative(APP_DIR, file), hosts);
}

if (violations.size > 0) {
  const detail = [...violations.entries()]
    .slice(0, 10)
    .map(([file, hosts]) => `    ${file} → ${[...hosts].join(", ")}`)
    .join("\n");
  fail(
    `リモート画像が Vercel の Image Optimization を通っています（${violations.size} ファイル）。#237 の再発です。`,
    [
      detail,
      violations.size > 10 ? `    ...ほか ${violations.size - 10} ファイル` : "",
      "",
      "  よくある原因:",
      "    1. <Image> に loader={appImageLoader} を渡し忘れた（最も多い）",
      "    2. 既存の <Image> から loader prop が消えた",
      "    3. 新しいリモート画像ホストを追加し、src/lib/image-loader.ts の分岐に入れ忘れた",
      "",
      "  手で確かめる:",
      "    grep -ro '/_next/image?url=https%3A%2F%2F[^\"&]*' .next/server/app | sort -u | head",
      "",
      "  詳細: docs/frontend/image-delivery.md",
    ]
      .filter(Boolean)
      .join("\n")
  );
}

const enabledFlags = Object.entries(CONTENT_FLAGS)
  .filter(([, on]) => on)
  .map(([name]) => name);

if (imgixCount === 0) {
  /*
   * 違反は無いが、imgix の画像も1枚も無い状態。検査が空振りしている可能性があるため
   * 黙って成功にはしない。ただし合否条件にもしない。microCMS の入稿状況と取得の成否で
   * 0 枚はいつでも起こりうるうえ、その区別はここでは付かない。
   */
  const reason =
    enabledFlags.length === 0
      ? "公開フラグがすべて false のため、microCMS の画像はHTMLに出ません"
      : `公開フラグ（${enabledFlags.join(", ")}）は有効ですが、microCMS の画像がHTMLにありません`;
  console.warn(
    `${LABEL} NOTE: 違反はありませんが、imgix 経由の画像も検出できませんでした。${reason}。` +
      ` 検査が空振りしている可能性があります（HTML ${htmlFiles.length} 枚を走査）。`
  );
  process.exit(0);
}

console.log(
  `${LABEL} OK: リモート画像は Vercel の最適化を通っていません` +
    `（HTML ${htmlFiles.length} 枚中 ${imgixCount} 枚が imgix 経由の画像を含む）。`
);
