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
});

export type Locale = (typeof routing.locales)[number];
