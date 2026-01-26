/**
 * About（委員会について）情報
 */
export const aboutConfig = {
  // 委員長挨拶
  chairpersonMessage: {
    name: "実行委員長 山田 太郎",
    position: "第97回 世田谷祭 実行委員長",
    image: "/images/chairperson-placeholder.jpg", // プレースホルダー画像
    message: `
ご来場の皆様、こんにちは。
第97回 世田谷祭 実行委員長の山田太郎と申します。

本年度の世田谷祭は「つながる、ひろがる、世田谷祭」をテーマに、
学生一人ひとりの個性と創造性を最大限に発揮し、
地域の皆様と共に創り上げる学園祭を目指してまいりました。

コロナ禍を経て、ようやく以前のような賑わいを取り戻しつつある今、
私たち実行委員一同は、来場者の皆様に心から楽しんでいただける
イベントを企画・運営するべく、日々尽力しております。

本サイトでは、企画情報、タイムテーブル、マップなど、
世田谷祭を楽しむための情報を網羅的に掲載しております。
ぜひご活用いただき、充実した一日をお過ごしください。

皆様のご来場を、実行委員一同、心よりお待ちしております。

令和8年10月
第97回 世田谷祭 実行委員長
山田 太郎
    `.trim(),
  },

  // 理念・ビジョン
  vision: {
    theme: "つながる、ひろがる、世田谷祭",
    description:
      "第97回 世田谷祭は、学生・地域・社会をつなぎ、新たな価値と感動を創造する学園祭を目指します。",
    values: [
      {
        title: "学生主体",
        description: "学生一人ひとりが主役となり、自主性と創造性を発揮できる場を提供します。",
        icon: "👨‍🎓",
      },
      {
        title: "地域連携",
        description: "地域の皆様と共に、地域社会に貢献する学園祭を実現します。",
        icon: "🤝",
      },
      {
        title: "多様性",
        description:
          "多様な価値観・文化・アイデアを尊重し、すべての人が楽しめるイベントを創造します。",
        icon: "🌈",
      },
      {
        title: "持続可能性",
        description: "環境に配慮し、次世代につながる持続可能な学園祭を目指します。",
        icon: "🌱",
      },
    ],
  },

  // 実行委員会について
  committee: {
    name: "東京都市大学 世田谷祭実行委員会",
    establishedYear: 1929, // 第1回開催年（仮）
    memberCount: 150, // 実行委員数（仮）
    description:
      "世田谷祭実行委員会は、東京都市大学の学生によって組織され、学園祭の企画・運営を行う団体です。毎年10月末〜11月初旬に開催される世田谷祭を通じて、学生の自主性・創造性を育み、地域社会との交流を深めることを目的としています。",
    departments: [
      "総務局",
      "渉外局",
      "企画局",
      "広報局",
      "制作局",
      "会場局",
      "ステージ局",
      "システム局",
    ],
  },

  // SNSリンク
  social: [
    {
      name: "X (Twitter)",
      url: "https://twitter.com/tcu_setagayafes",
      icon: "twitter",
    },
    {
      name: "Instagram",
      url: "https://instagram.com/tcu_setagayafes",
      icon: "instagram",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@tcu_setagayafes",
      icon: "youtube",
    },
  ],
} as const;

/**
 * About情報の型定義
 */
export type AboutConfig = typeof aboutConfig;
