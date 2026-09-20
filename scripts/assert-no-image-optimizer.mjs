#!/usr/bin/env node
/**
 * どの画像も Vercel の Image Optimization を通っていないことを検査する（#237 / #241）
 *
 * `pnpm build` の末尾で走る。
 *
 * ## なぜ必要か
 *
 * 2026-09-19、本番の `/_next/image` が `402 Payment Required` を返し、企画サムネイルの
 * 一部が壊れた。Vercel Free Plan の変換枠（Hobby は月5,000変換）の枯渇である。
 * **この仕組みは静かに外れる。**
 *
 * - 新しく画像を描いた人が `AppImage` ではなく `next/image` を直接使う
 * - `AppImage` から `loader` / `unoptimized` の指定が消える
 * - 新しいリモート画像ホストを増やし、ローダーの分岐に入れ忘れる
 *
 * どれもビルドは通り、画面も（枠が残っているうちは）正常に見える。**枠を使い切った
 * 時点で初めて壊れ、しかも「一部の画像だけ」という分かりにくい形で出る。**
 * `src/lib/image-loader.test.ts` はローダー関数の契約しか見ないため、
 * **関数が呼ばれないこと自体を1つも検出できない。** 生成物を読む以外に方法が無い。
 *
 * ## 2026-09-20 に射程を広げた
 *
 * 以前はリモート画像だけを見ていた。「静的画像は枠の 7% しか使わないので Vercel に
 * 残してよい」という #240 の判断に合わせていたためである。**その判断が誤りだった。**
 * 枠は総量で枯れるので、消費が 7% の利用者もすでに枯れた枠の上では 402 になる。
 * 実際、2026-09-20 のトップページは静的画像 srcset 128通り中81通りが 402 で、
 * オープナーのロゴは Retina で必ず消えていた（#241）。
 *
 * **いまはローカルの静的画像も含め、`/_next/image` が1本でも出たら落とす。**
 *
 * ## 何を見ているか
 *
 * 事前描画されたHTMLについて、次の2つ。
 *
 * 1. `/_next/image?url=` へ画像を渡すURLが **1本も** 現れないこと
 * 2. `public/` の静的画像が**実体のパスで**出ていること（0本なら検査の空振り）
 *
 * 2 が要る。`AppImage` から `unoptimized` が外れると静的画像は全部 `/_next/image` へ回り、
 * **`public/` のパスがHTMLから消える。** 1 だけでも捕まるが、逆に「静的画像を
 * 描かなくなった」種類の退行は 1 では見えない。静的画像は公開フラグに依存しないので、
 * 0本は常に異常である。
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
 * Vercel の最適化エンドポイントへ画像を渡すURL。**出どころを問わず1本でも落とす。**
 */
const OPTIMIZER_PATTERN = /\/_next\/image\?url=([^&"']+)/g;

/** `src/lib/image-loader.ts` が生成する imgix URL の目印 */
const IMGIX_MARKER = "images.microcms-assets.io/";

/**
 * `public/` の静的画像が実体のパスで出ている目印。
 *
 * `AppImage` から `unoptimized` が外れるとこれが 0 本になり、同時に
 * `/_next/image` が増える。公開フラグに依存しないので 0 本は常に異常である。
 */
const STATIC_IMAGE_PATTERN =
  /(?:src|href)="\/(?:images|materials)\/[^"]+\.(?:avif|webp|png|jpe?g)"/;

const LABEL = "[assert-no-image-optimizer]";

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
let staticImageCount = 0;

for (const file of htmlFiles) {
  const html = readFileSync(file, "utf8");

  if (html.includes(IMGIX_MARKER)) imgixCount += 1;
  if (STATIC_IMAGE_PATTERN.test(html)) staticImageCount += 1;

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
    /*
     * ローカルの静的画像（`/images/...`）にはホストが無いので `new URL()` が投げる。
     * 出どころを問わず落とすようになったため、先頭 60 文字をそのまま識別子に使う。
     */
    hosts.add(decoded.startsWith("http") ? new URL(decoded).host : decoded.slice(0, 60));
  }
  if (hosts.size > 0) violations.set(path.relative(APP_DIR, file), hosts);
}

if (violations.size > 0) {
  const detail = [...violations.entries()]
    .slice(0, 10)
    .map(([file, hosts]) => `    ${file} → ${[...hosts].join(", ")}`)
    .join("\n");
  fail(
    `画像が Vercel の Image Optimization を通っています（${violations.size} ファイル）。#237 / #241 の再発です。`,
    [
      detail,
      violations.size > 10 ? `    ...ほか ${violations.size - 10} ファイル` : "",
      "",
      "  よくある原因:",
      "    1. AppImage ではなく next/image を直接使った（最も多い）",
      "       → 通常は eslint.config.mjs の no-restricted-imports が先に止めます",
      "    2. AppImage から loader / unoptimized の指定が外れた",
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

if (staticImageCount === 0) {
  fail(
    "public/ の静的画像が実体のパスで1本も出ていません。",
    [
      "  AppImage から unoptimized が外れると、静的画像は全部 /_next/image へ回り",
      "  このパターンがHTMLから消えます（枠が生きているうちは画面も正常に見えます）。",
      "",
      "  手で確かめる:",
      '    grep -rho \'src="/\\(images\\|materials\\)/[^"]*"\' .next/server/app | sort -u | head',
      "",
      "  詳細: docs/frontend/image-delivery.md",
    ].join("\n")
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
  `${LABEL} OK: Vercel の画像最適化を通る画像は1本もありません` +
    `（HTML ${htmlFiles.length} 枚中 ${imgixCount} 枚が imgix 経由、` +
    `${staticImageCount} 枚が public/ の静的画像を含む）。`
);
