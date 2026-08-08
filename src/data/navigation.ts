import type { FooterSectionKey, NavigationLabelKey } from "@/i18n/chrome-messages";
import type { Locale } from "@/i18n/routing";

/**
 * 言語切替の選択肢
 *
 * label は各言語の母語表記（autonym）。国旗絵文字は使用しない。
 * 🇺🇸=English は英語圏を米国に限定してしまい、Windows ではフォント欠落で
 * 表示されず、スクリーンリーダーの読み上げも不正確になるため。
 *
 * autonym は翻訳対象ではない（どの言語で閲覧していても「日本語」は「日本語」）
 * ため、messages ではなくここに置く。
 *
 * fallbackLabel は多言語未対応ページから切り替えた際の着地先ページ名。
 * `src/messages/<code>.json` の `guide.title` と同一文字列にすること。
 * 日本語は未対応ページでも常に現在ロケールになるため不要。
 */
export const languageOptions: ReadonlyArray<{
  code: Locale;
  label: string;
  fallbackLabel?: string;
}> = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English", fallbackLabel: "Visitor Guide" },
  { code: "zh", label: "简体中文", fallbackLabel: "参观指南" },
  { code: "ko", label: "한국어", fallbackLabel: "방문 안내" },
];

interface NavLinkConfig {
  /** `messages/chrome/<locale>.json` の `navigation.*` を指すキー */
  readonly labelKey: NavigationLabelKey;
  readonly href: string;
}

interface NavItemConfig extends NavLinkConfig {
  readonly children?: readonly NavLinkConfig[];
}

interface FooterSectionConfig {
  /** `messages/chrome/<locale>.json` の `footer.*` を指すキー */
  readonly titleKey: FooterSectionKey;
  readonly links: readonly NavLinkConfig[];
}

/**
 * ナビゲーション構成
 *
 * ラベルは翻訳キーで持つ。実際の文言解決とロケール別 href の組み立ては
 * `src/components/layout/useChromeNav.ts` が行う。
 *
 * `as const satisfies` はリテラル型を保ったままキーの実在を検証するための
 * 組み合わせ。`labelKey: "eventss"` のようなタイポはビルドで落ちる。
 *
 * IMPORTANT: href にロケール接頭辞を書かないこと。多言語版が存在するのは
 * `LOCALIZED_PATHNAMES` の6パスだけで、接頭辞の要否は `localizeNavHref()` が
 * 判定する。
 */
export const navigationConfig = {
  // ヘッダーナビゲーション
  header: [
    { labelKey: "events", href: "/events" },
    { labelKey: "timetable", href: "/timetable" },
    { labelKey: "access", href: "/access" },
    {
      labelKey: "info",
      href: "/info",
      children: [
        { labelKey: "news", href: "/info" },
        { labelKey: "guide", href: "/info/guide" },
        { labelKey: "faq", href: "/info/faq" },
        { labelKey: "pamphlet", href: "/info/pamphlet" },
        { labelKey: "contact", href: "/info/contact" },
      ],
    },
    { labelKey: "about", href: "/about" },
  ],

  // フッターナビゲーション
  footer: [
    {
      titleKey: "eventInfo",
      links: [
        { labelKey: "events", href: "/events" },
        { labelKey: "timetable", href: "/timetable" },
      ],
    },
    {
      titleKey: "venueInfo",
      links: [{ labelKey: "access", href: "/access" }],
    },
    {
      titleKey: "information",
      links: [
        { labelKey: "news", href: "/info" },
        { labelKey: "guide", href: "/info/guide" },
        { labelKey: "faq", href: "/info/faq" },
        { labelKey: "contact", href: "/info/contact" },
      ],
    },
    {
      titleKey: "aboutCommittee",
      links: [
        { labelKey: "about", href: "/about" },
        { labelKey: "privacy", href: "/about/privacy" },
      ],
    },
  ],
} as const satisfies {
  readonly header: readonly NavItemConfig[];
  readonly footer: readonly FooterSectionConfig[];
};
