/**
 * ご来場の方へ（注意事項・お願い）
 */
export const guideConfig = {
  // 入場案内
  admission: {
    fee: "無料",
    time: "10:00〜18:00（両日とも）",
    notes: [
      "入退場自由です。",
      "パンフレットは各案内所にて配布しています。",
      "事前予約は不要です。",
    ],
  },

  // 来場時の注意事項
  precautions: [
    {
      category: "駐車場",
      content: "当日は駐車場のご利用ができません。公共交通機関をご利用ください。",
      icon: "🚗",
    },
    {
      category: "喫煙",
      content: "キャンパス内は原則禁煙です。喫煙は指定場所でお願いします。",
      icon: "🚭",
    },
    {
      category: "ゴミ",
      content: "ゴミは各自お持ち帰りください。分別にご協力をお願いします。",
      icon: "♻️",
    },
    {
      category: "ペット",
      content: "ペット同伴でのご来場はご遠慮ください（盲導犬・介助犬を除く）。",
      icon: "🐕",
    },
    {
      category: "危険物",
      content: "刃物類、花火、爆竹などの危険物の持ち込みは固く禁止します。",
      icon: "⚠️",
    },
    {
      category: "撮影",
      content: "無断での企画内容の撮影・録音はお控えください。",
      icon: "📷",
    },
  ],

  // バリアフリー情報
  accessibility: {
    wheelchairAccessible: true,
    elevators: ["1号館", "2号館", "3号館", "6号館", "7号館"],
    multipurposeRestrooms: true,
    nursingRoom: true,
    notes: [
      "車椅子でのご来場も可能です。エレベーターをご利用ください。",
      "多目的トイレは各棟1階に設置されています。",
      "授乳室は6号館1階にございます。",
      "ご不明な点がございましたら、案内所までお問い合わせください。",
    ],
  },

  // 天候による影響
  weatherInfo: {
    rainPolicy: "雨天決行",
    notes: [
      "荒天の場合、屋外企画は中止または変更となる場合がございます。",
      "最新情報は公式SNSおよび当サイトでお知らせします。",
    ],
  },

  // 落とし物・忘れ物
  lostAndFound: {
    location: "1号館1F 総合案内所",
    hours: "10:00〜18:00（両日とも）",
    notes: [
      "お心当たりのある方は、総合案内所までお問い合わせください。",
      "お預かり期間は当日限りです。後日のお問い合わせは公式サイトのお問い合わせフォームからお願いします。",
    ],
  },

  // お子様連れの方へ
  forFamilies: {
    nursingRoom: true,
    diaperChangingStation: true,
    notes: [
      "授乳室・おむつ交換台は6号館1階にございます。",
      "迷子になった際は、お近くのスタッフまたは総合案内所までお声がけください。",
    ],
  },

  // 緊急時の対応
  emergency: {
    medicalRoom: "1号館1F 救護室",
    emergencyContact: "総合案内所（1号館1F）",
    notes: [
      "体調不良の際は、お近くのスタッフまたは救護室までお声がけください。",
      "災害発生時は、スタッフの指示に従って避難してください。",
    ],
  },
} as const;

/**
 * ガイド情報の型定義
 */
export type GuideConfig = typeof guideConfig;
