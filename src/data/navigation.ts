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
 * ナビゲーション設定の型定義
 */
export type NavigationConfig = typeof navigationConfig;
