/**
 * ナビゲーション構成（本番版）
 * Header / MobileMenu / Footer が全てこのデータを参照する
 */
export const navigationConfig = {
  // ヘッダーナビゲーション
  header: [
    {
      label: "HOME",
      href: "/",
    },
    {
      label: "企画を探す",
      href: "/events",
    },
    {
      label: "タイムテーブル",
      href: "/timetable",
    },
    {
      label: "マップ",
      href: "/map",
      children: [
        { label: "キャンパスマップ", href: "/map" },
        { label: "アクセス", href: "/map/access" },
      ],
    },
    {
      label: "インフォメーション",
      href: "/info",
      children: [
        { label: "お知らせ", href: "/info" },
        { label: "ご来場の方へ", href: "/info/guide" },
        { label: "FAQ", href: "/info/faq" },
        { label: "パンフレット", href: "/info/pamphlet" },
      ],
    },
    {
      label: "委員会",
      href: "/about",
      children: [
        { label: "委員長挨拶", href: "/about" },
        { label: "協賛企業", href: "/about/sponsors" },
        { label: "お問い合わせ", href: "/about/contact" },
        { label: "プライバシーポリシー", href: "/about/privacy" },
      ],
    },
  ],

  // フッターナビゲーション
  footer: [
    {
      title: "企画情報",
      links: [
        { label: "企画を探す", href: "/events" },
        { label: "タイムテーブル", href: "/timetable" },
      ],
    },
    {
      title: "会場案内",
      links: [
        { label: "キャンパスマップ", href: "/map" },
        { label: "アクセス", href: "/map/access" },
      ],
    },
    {
      title: "インフォメーション",
      links: [
        { label: "お知らせ", href: "/info" },
        { label: "ご来場の方へ", href: "/info/guide" },
        { label: "FAQ", href: "/info/faq" },
      ],
    },
    {
      title: "その他",
      links: [
        { label: "委員長挨拶", href: "/about" },
        { label: "協賛企業", href: "/about/sponsors" },
        { label: "お問い合わせ", href: "/about/contact" },
        { label: "プライバシーポリシー", href: "/about/privacy" },
      ],
    },
  ],

  // 言語切り替え
  languages: [
    {
      code: "ja",
      label: "日本語",
      flag: "🇯🇵",
    },
    {
      code: "en",
      label: "English",
      flag: "🇺🇸",
    },
    {
      code: "zh",
      label: "简体中文",
      flag: "🇨🇳",
    },
    {
      code: "ko",
      label: "한국어",
      flag: "🇰🇷",
    },
  ],
} as const;

/**
 * CardNav 用カード構成データ（カウントダウン版）
 * Info / SNS / Contact の3カード
 */
export const cardNavItems = [
  {
    label: "Info",
    bgColor: "#1a0a2e",
    textColor: "#fff",
    links: [{ label: "トップ", href: "/", ariaLabel: "トップページ" }],
  },
  {
    label: "SNS",
    bgColor: "#2d1052",
    textColor: "#fff",
    links: [
      {
        label: "X (Twitter)",
        href: "https://twitter.com/tcu_setagayafes",
        ariaLabel: "X (Twitter)",
      },
      {
        label: "Instagram",
        href: "https://instagram.com/tcu_setagayafes",
        ariaLabel: "Instagram",
      },
    ],
  },
  {
    label: "Contact",
    bgColor: "#3d1a6e",
    textColor: "#fff",
    links: [
      {
        label: "お問い合わせ",
        href: "/about/contact",
        ariaLabel: "お問い合わせ",
      },
    ],
  },
] as const;

/**
 * ナビゲーション設定の型定義
 */
export type NavigationConfig = typeof navigationConfig;
