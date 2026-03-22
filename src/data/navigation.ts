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
      label: "マップ・アクセス",
      href: "/map",
      children: [
        {
          label: "キャンパスマップ",
          href: "/map",
        },
        {
          label: "交通アクセス",
          href: "/map/access",
        },
      ],
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
      ],
    },
    {
      label: "委員会・その他",
      href: "/about",
      children: [
        {
          label: "委員長挨拶・理念",
          href: "/about",
        },
        {
          label: "協賛企業一覧",
          href: "/about/sponsors",
        },
        {
          label: "お問い合わせ",
          href: "/about/contact",
        },
        {
          label: "プライバシーポリシー",
          href: "/about/privacy",
        },
      ],
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
          label: "キャンパスマップ",
          href: "/map",
        },
        {
          label: "交通アクセス",
          href: "/map/access",
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
      ],
    },
    {
      title: "委員会について",
      links: [
        {
          label: "委員長挨拶・理念",
          href: "/about",
        },
        {
          label: "協賛企業一覧",
          href: "/about/sponsors",
        },
        {
          label: "お問い合わせ",
          href: "/about/contact",
        },
        {
          label: "プライバシーポリシー",
          href: "/about/privacy",
        },
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
        label: "キャンパスマップ",
        href: "/map",
        ariaLabel: "キャンパスマップ",
      },
      { label: "交通アクセス", href: "/map/access", ariaLabel: "交通アクセス" },
    ],
  },
  {
    label: "Other",
    bgColor: "#3d1a6e",
    textColor: "#fff",
    links: [
      { label: "委員長挨拶・理念", href: "/about", ariaLabel: "委員長挨拶" },
      {
        label: "協賛企業一覧",
        href: "/about/sponsors",
        ariaLabel: "協賛企業",
      },
      {
        label: "お問い合わせ",
        href: "/about/contact",
        ariaLabel: "お問い合わせ",
      },
      {
        label: "プライバシーポリシー",
        href: "/about/privacy",
        ariaLabel: "プライバシーポリシー",
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
