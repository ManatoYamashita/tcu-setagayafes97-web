#!/usr/bin/env node
/**
 * 画像が Vercel の Image Optimization を通っていないことを検査する（#237 の再発防止装置）
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
 * `public/` の静的画像が最適化を失う**（2026-09-19 実測）。渡し忘れを機械で拾う
 * この検査は、その代償を払わないための装置である。
 *
 * ## 何を見ているか
 *
 * 事前描画されたHTMLに、**リモート画像**を `/_next/image?url=` へ渡すURLが
 * **1本も**現れないこと。
 *
 * **ローカルの静的画像は対象外である。意図して Vercel の最適化に残している。**
 * 枠を焼いていたのは microCMS 側だけで、2026-09-20 に本番HTMLの srcset を全数えした
 * 結果は静的画像11ファイルで 178通り×2形式＝上限 356 変換（枠 5,000 の 7%）。
 * 一方 microCMS は企画サムネイル93枚だけで約3,348（#237）。静的画像まで外すと
 * LCP 要素が 4.7倍になるので、そちらは Vercel に残す。
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
 * Vercel の最適化エンドポイントへ画像を渡すURL。
 *
 * **ここで落とすのはリモート画像だけである。** ローカルの静的画像（`/images/...` など）は
 * 意図して Vercel の最適化に残しているので、出ていても正常。
 */
const OPTIMIZER_PATTERN = /\/_next\/image\?url=([^&"']+)/g;

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
  for (const match of html.matchAll(OPTIMIZER_PATTERN)) {
    /*
     * 壊れた percent エンコードで例外にしない。復号できない値はそのまま扱い、
     * 親切なメッセージを出したまま exit 1 へ進む。
     */
    let decoded;
    try {
      decoded = decodeURIComponent(match[1]);
    } catch {
      decoded = match[1];
    }
    // ローカルの静的画像は Vercel の最適化に残しているので対象外
    if (!decoded.startsWith("http")) continue;
    hosts.add(new URL(decoded).host);
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
      "    1. AppImage ではなく next/image を直接使った（最も多い）",
      "       → 通常は eslint.config.mjs の no-restricted-imports が先に止めます",
      "    2. AppImage から loader の指定が外れた",
      "    3. 新しいリモート画像ホストを追加し、src/lib/image-loader.ts の分岐に入れ忘れた",
      "",
      "  手で確かめる:",
      "    grep -ro '/_next/image?url=http[^\"&]*' .next/server/app | sort -u | head",
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
  const flagState =
    enabledFlags.length === 0
      ? "公開フラグはすべて false"
      : `公開フラグ（${enabledFlags.join(", ")}）は有効`;
  console.warn(
    `${LABEL} NOTE: 違反はありませんが、imgix 経由の画像も検出できませんでした（${flagState}）。` +
      ` 協賛企業（SponsorBanner / /about/sponsors）はどの公開フラグにも依存しないため、` +
      `本来はフラグが全て false でも microCMS の画像がHTMLに出ます。` +
      ` 0枚ということは協賛の取得が0件だった可能性が高く、検査は空振りしています` +
      `（HTML ${htmlFiles.length} 枚を走査）。`
  );
  process.exit(0);
}

console.log(
  `${LABEL} OK: Vercel の画像最適化を通るリモート画像はありません` +
    `（HTML ${htmlFiles.length} 枚中 ${imgixCount} 枚が imgix 経由の画像を含む）。` +
    ` ローカルの静的画像は意図して Vercel の最適化に残しています。`
);
