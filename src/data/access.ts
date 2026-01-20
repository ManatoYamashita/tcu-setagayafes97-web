/**
 * アクセス情報
 */
export const accessConfig = {
  // 住所
  address: "〒158-8557 東京都世田谷区玉堤1-28-1",

  // 電話番号
  phone: "03-5707-0104",

  // 公共交通機関
  publicTransport: [
    {
      type: "電車",
      routes: [
        {
          line: "東急大井町線",
          station: "尾山台駅",
          walkTime: 12,
          description: "改札口を出て右折、徒歩約12分",
        },
        {
          line: "東急大井町線",
          station: "等々力駅",
          walkTime: 10,
          description: "改札口を出て左折、徒歩約10分",
        },
      ],
    },
    {
      type: "バス",
      routes: [
        {
          line: "東急バス",
          stop: "玉堤一丁目",
          from: "二子玉川駅",
          walkTime: 3,
          description: "バス停下車後、徒歩約3分",
        },
      ],
    },
  ],

  // 自動車
  car: {
    parkingAvailable: false,
    note: "当日は駐車場の利用ができません。公共交通機関をご利用ください。",
  },

  // 自転車
  bicycle: {
    parkingAvailable: true,
    capacity: 200,
    location: "正門脇 駐輪場",
    note: "駐輪場には限りがございます。満車の場合はご容赦ください。",
  },

  // Google Maps URL
  googleMapsUrl: "https://goo.gl/maps/example",

  // 最寄り駅からのルートマップ（画像パス）
  routeMaps: [
    {
      station: "尾山台駅",
      imagePath: "/images/route-oyamadai.jpg",
    },
    {
      station: "等々力駅",
      imagePath: "/images/route-todoroki.jpg",
    },
  ],
} as const;

/**
 * アクセス情報の型定義
 */
export type AccessConfig = typeof accessConfig;
