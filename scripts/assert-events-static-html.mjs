#!/usr/bin/env node
/**
 * `/events` のページ本体が静的HTMLに残っているかを検査する（#156 の再発防止装置）
 *
 * `pnpm build` の末尾で走る。**フラグが false の間は自動でスキップし、
 * `NEXT_PUBLIC_EVENTS_VISIBLE=true` になった瞬間から検査を始める。**
 * 解禁のタイミングで誰かが検査を「足す」必要は無い。
 *
 * ## なぜ ESLint だけでは足りないのか
 *
 * `eslint.config.mjs` の `no-restricted-imports` は「クエリを読む場所」を固定するが、
 * `src/app/events/page.tsx` から `<Suspense>` 境界そのものを外す変更は止められない。
 * 境界が消えると `src/app/events/loading.tsx` が代役になり、ページ本体が丸ごと
 * クライアント描画へ落ちる。**エラーは出ない。** 境界の有無はビルド生成物を
 * 読む以外に確かめる方法が無い。
 *
 * ## 何を見ているか
 *
 * `EventFilters` が描くキーワード入力欄の `id` を見る。これは `EventsView` ツリーが
 * サーバー描画されたことの証拠であり、**企画が0件でも描かれる**（`EventGrid` が
 * 空状態を出すだけで、フィルターUI自体は残る）。したがって microCMS が一時的に
 * 空を返しても誤検知しない。件数に依存する指標を条件にしてはいけない。
 *
 * `data-page-hero` と `data-page-sheet` は**使えない。** `ComingSoon` も
 * `PageSheetLayout` を通るため、フラグが false の本番でも 1 件出る（2026-09-05 実測）。
 *
 * 背景と実測は docs/frontend/static-html-and-search-params.md を参照。
 */

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

/** `next build` が `/events` を事前描画した成果物 */
const HTML_PATH = path.resolve(process.cwd(), ".next/server/app/events.html");

/**
 * `EventFilters` のキーワード入力欄
 *
 * これを改名するときは本ファイルも同時に直すこと。CI と Vercel Preview が
 * 先に赤くなるため、本番へ到達する前に気付ける。
 */
const EVENTS_UI_MARKER = 'id="keyword-search"';

/** `ComingSoon` の見出し。フラグが false のときに出る */
const COMING_SOON_MARKER = "企画情報は準備中です";

/** 参考値としてだけ数える。件数は入稿状況で変わるので合否条件にしない */
const EVENT_LINK_PATTERN = /href="\/events\/[a-zA-Z0-9_-]+"/g;

const LABEL = "[assert-events-static-html]";

function fail(message, hint) {
  console.error(`${LABEL} FAIL: ${message}`);
  if (hint) console.error(hint);
  process.exit(1);
}

const eventsVisible = process.env.NEXT_PUBLIC_EVENTS_VISIBLE === "true";

if (!existsSync(HTML_PATH)) {
  fail(
    `${path.relative(process.cwd(), HTML_PATH)} が見つかりません。`,
    [
      "  /events が事前描画されなくなった可能性があります。",
      "  ルートが動的化した（searchParams / cookies / headers を読む等）か、",
      "  Next.js の出力先が変わったかのどちらかです。どちらも意図した変更なら、",
      "  このスクリプトの HTML_PATH を実際の出力先へ合わせてください。",
    ].join("\n")
  );
}

const html = readFileSync(HTML_PATH, "utf8");
const hasEventsUi = html.includes(EVENTS_UI_MARKER);

if (!eventsVisible) {
  // 検査対象そのものが存在しない状態。ただし「スキップした」で終わらせず、
  // 準備中ページが実際に描かれていることまでは確かめる。
  if (!html.includes(COMING_SOON_MARKER)) {
    fail(
      `NEXT_PUBLIC_EVENTS_VISIBLE が "true" ではないのに、準備中の文言（${COMING_SOON_MARKER}）がHTMLにありません。`,
      "  /events の静的HTMLが期待どおりに描かれていません。フラグの値とページの分岐を確認してください。"
    );
  }
  if (hasEventsUi) {
    fail(
      `NEXT_PUBLIC_EVENTS_VISIBLE が "true" ではないのに、企画一覧のUI（${EVENTS_UI_MARKER}）がHTMLに出ています。`,
      "  非公開のはずの企画情報が配信されています。EVENTS_VISIBLE の分岐を確認してください。"
    );
  }
  console.log(
    `${LABEL} SKIP: NEXT_PUBLIC_EVENTS_VISIBLE が "true" ではないため、企画一覧の検査は行いません。` +
      ` 準備中ページの描画のみ確認しました。**フラグを true にすると、この検査は自動で有効になります。**`
  );
  process.exit(0);
}

if (!hasEventsUi) {
  fail(
    `/events の静的HTMLに企画一覧のUI（${EVENTS_UI_MARKER}）がありません。ページ本体がクライアント描画へ落ちています（#156 の再発）。`,
    [
      "  よくある原因:",
      "    1. src/app/events/page.tsx から <Suspense> 境界が外れた",
      "       → 境界が無いと src/app/events/loading.tsx が代役になり、ページ本体が丸ごと落ちます",
      "    2. <Suspense> の fallback が EventsView ではなくプレースホルダに戻った",
      "       → fallback はサーバーで描かれてHTMLに出る唯一の部分です",
      "    3. fallback ツリーのどれかが useSearchParams() を呼んだ",
      "       → 通常は eslint.config.mjs の no-restricted-imports が先に止めます",
      "",
      "  手で確かめる:",
      "    grep -o 'id=\"keyword-search\"' .next/server/app/events.html | wc -l",
      "    grep -o '.\\{160\\}BAILOUT_TO_CLIENT_SIDE_RENDERING' .next/server/app/events.html",
      "",
      "  詳細: docs/frontend/static-html-and-search-params.md",
    ].join("\n")
  );
}

const eventLinks = new Set(html.match(EVENT_LINK_PATTERN) ?? []);
console.log(
  `${LABEL} OK: /events の静的HTMLにページ本体があります（企画詳細へのリンク ${eventLinks.size} 本）。`
);

if (eventLinks.size === 0) {
  // 企画が未入稿でも UI は描かれるため、これは異常ではない。合否条件にはしない。
  console.warn(
    `${LABEL} NOTE: 企画詳細へのリンクが0本です。microCMS に企画が未入稿か、` +
      `取得に失敗している可能性があります（UIは描かれているため検査は成功扱い）。`
  );
}
