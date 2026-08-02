import type { Locale } from "@/i18n/routing";

/**
 * 言語切替の選択肢
 *
 * label は各言語の母語表記（autonym）。国旗絵文字は使用しない。
 * 🇺🇸=English は英語圏を米国に限定してしまい、Windows ではフォント欠落で
 * 表示されず、スクリーンリーダーの読み上げも不正確になるため。
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

/**
 * ナビゲーション構成
 */
export const navigationConfig = {
  // ヘッダーナビゲーション
  header: [
    {
      label: "企画を探す",
      href: "/events",
    },
    {
      label: "タイムテーブル",
      href: "/timetable",
    },
    {
      label: "アクセス",
      href: "/access",
    },
    {
      label: "インフォメーション",
      href: "/info",
      children: [
        {
          label: "お知らせ",
          href: "/info",
        },
        {
          label: "ご来場の方へ",
          href: "/info/guide",
        },
        {
          label: "よくある質問",
          href: "/info/faq",
        },
        {
          label: "パンフレットDL",
          href: "/info/pamphlet",
        },
        {
          label: "お問い合わせ",
          href: "/info/contact",
        },
      ],
    },
    {
      label: "委員会について",
      href: "/about",
    },
  ],

  // フッターナビゲーション
  footer: [
    {
      title: "企画情報",
      links: [
        {
          label: "企画を探す",
          href: "/events",
        },
        {
          label: "タイムテーブル",
          href: "/timetable",
        },
      ],
    },
    {
      title: "会場案内",
      links: [
        {
          label: "アクセス",
          href: "/access",
        },
      ],
    },
    {
      title: "インフォメーション",
      links: [
        {
          label: "お知らせ",
          href: "/info",
        },
        {
          label: "ご来場の方へ",
          href: "/info/guide",
        },
        {
          label: "よくある質問",
          href: "/info/faq",
        },
        {
          label: "お問い合わせ",
          href: "/info/contact",
        },
      ],
    },
    {
      title: "委員会について",
      links: [
        {
          label: "委員会について",
          href: "/about",
        },
        {
          label: "プライバシーポリシー",
          href: "/about/privacy",
        },
      ],
    },
  ],
} as const;

/**
 * CardNav 用カード構成データ
 * About（インフォメーション）/ Event（企画）/ Other（委員会・その他）の3カード
 */
export const cardNavItems = [
  {
    label: "About",
    bgColor: "#1a0a2e",
    textColor: "#fff",
    links: [
      { label: "お知らせ", href: "/info", ariaLabel: "お知らせ一覧" },
      { label: "ご来場の方へ", href: "/info/guide", ariaLabel: "ご来場案内" },
      { label: "よくある質問", href: "/info/faq", ariaLabel: "FAQ" },
      {
        label: "パンフレットDL",
        href: "/info/pamphlet",
        ariaLabel: "パンフレットダウンロード",
      },
    ],
  },
  {
    label: "Event",
    bgColor: "#2d1052",
    textColor: "#fff",
    links: [
      { label: "企画を探す", href: "/events", ariaLabel: "企画検索" },
      {
        label: "タイムテーブル",
        href: "/timetable",
        ariaLabel: "タイムテーブル",
      },
      {
        label: "アクセス",
        href: "/access",
        ariaLabel: "キャンパスマップ・交通アクセス",
      },
    ],
  },
  {
    label: "Other",
    bgColor: "#3d1a6e",
    textColor: "#fff",
    links: [
      { label: "委員会について", href: "/about", ariaLabel: "委員会について" },
      {
        label: "お問い合わせ",
        href: "/info/contact",
        ariaLabel: "お問い合わせ",
      },
    ],
  },
] as const;

/**
 * ナビゲーション設定の型定義
 */
export type NavigationConfig = typeof navigationConfig;

/**
 * ヘッダーナビを取得
 */
export function getFilteredHeaderNav() {
  return navigationConfig.header.map((item) => ({ ...item })) as Array<{
    label: string;
    href: string;
    children?: Array<{ label: string; href: string }>;
  }>;
}

/**
 * フッターナビを取得
 */
export function getFilteredFooterNav() {
  return navigationConfig.footer.map((section) => ({ ...section }));
}
