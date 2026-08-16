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
    // 著名人企画は「企画を探す」の子として置く。ヘッダー直下に独立項目として
    // 並べると、デスクトップナビが出る lg (1024px) の下端で要素が接触するため。
    //
    // 実測（2026-08-16 / 1280px）: padding 24×2 + ロゴ 208 + ナビ 766 + 言語切替 90 = 1112px。
    // 6項目では 1024〜1112px の帯で破綻する（5項目なら 1000px で収まっていた）。
    //
    // 未解禁（SPECIAL_VISIBLE=false）でも項目は出す。/special は準備中ページとして
    // 成立し、「今年も著名人企画がある」ことを伏せる必要はないため（出演者名は出ない）。
    {
      labelKey: "events",
      href: "/events",
      children: [
        { labelKey: "eventList", href: "/events" },
        { labelKey: "special", href: "/special" },
      ],
    },
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
        { labelKey: "special", href: "/special" },
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
