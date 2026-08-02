import { defineRouting } from "next-intl/routing";

/**
 * i18n ルーティング設定
 *
 * localePrefix: 'as-needed'
 * - 日本語（デフォルト）: /about
 * - 英語/中国語/韓国語: /en/about, /zh/about, /ko/about
 */
export const routing = defineRouting({
  locales: ["ja", "en", "zh", "ko"],
  defaultLocale: "ja",
  localePrefix: "as-needed",

  /**
   * Accept-Language ヘッダによる自動リダイレクトを停止する。
   * CMSコンテンツ（企画・お知らせ）は日本語のみのため、ブラウザ言語だけを根拠に
   * 情報量の少ない多言語ページへ来場者を送らない。言語の選択はヘッダーの
   * 言語切替UI（LanguageSwitcher）に委ね、URLを言語の唯一の出典とする。
   */
  localeDetection: false,

  /**
   * NEXT_LOCALE Cookie の発行を停止する。
   * localeDetection: false だけでは書き込みが止まらない（next-intl の
   * middleware/syncCookie.ts は localeCookie のみを参照するため）。
   */
  localeCookie: false,
});

export type Locale = (typeof routing.locales)[number];
