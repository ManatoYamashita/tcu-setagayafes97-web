/**
 * アクセス情報
 *
 * 交通経路は東京都市大学の公式案内を参照する。
 * https://www.tcu.ac.jp/access/
 */
export const accessConfig = {
  address: "〒158-8557 東京都世田谷区玉堤1-28-1",
  phone: "03-5707-0104",

  publicTransport: [
    {
      type: "電車",
      routes: [
        {
          line: "東急大井町線",
          station: "尾山台駅",
          walkTime: 12,
          description: "「東京都市大学 世田谷キャンパス前」尾山台駅から徒歩約12分です。",
        },
      ],
    },
    {
      type: "バス",
      routes: [
        {
          line: "東急バス 玉11系統",
          stop: "東京都市大南入口",
          from: "多摩川駅",
          rideTime: 6,
          walkTime: 3,
          description: "二子玉川駅行に乗車し、バス停下車後徒歩約3分です。",
        },
        {
          line: "東急バス 玉11系統",
          stop: "東京都市大南入口",
          from: "二子玉川駅",
          rideTime: 7,
          walkTime: 3,
          description: "多摩川駅行に乗車し、バス停下車後徒歩約3分です。",
        },
        {
          line: "東急バス 園01系統",
          stop: "東京都市大北入口",
          from: "田園調布駅",
          rideTime: 5,
          walkTime: 5,
          description: "千歳船橋駅行に乗車し、バス停下車後徒歩約5分です。",
        },
      ],
    },
  ],

  car: {
    parkingAvailable: false,
    note: "世田谷祭当日は駐車場をご利用いただけません。公共交通機関でお越しください。",
  },

  bicycle: {
    parkingAvailable: true,
    capacity: 200,
    location: "正門脇 駐輪場",
    note: "当日の駐輪場所・利用方法は、詳細が決まり次第ご案内します。",
  },

  googleMapsUrl:
    "https://www.google.com/maps/search/?api=1&query=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%B8%82%E5%A4%A7%E5%AD%A6+%E4%B8%96%E7%94%B0%E8%B0%B7%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%91%E3%82%B9",
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=%E6%9D%B1%E4%BA%AC%E9%83%BD%E5%B8%82%E5%A4%A7%E5%AD%A6%20%E4%B8%96%E7%94%B0%E8%B0%B7%E3%82%AD%E3%83%A3%E3%83%B3%E3%83%91%E3%82%B9&output=embed",
  officialAccessUrl: "https://www.tcu.ac.jp/access/",
} as const;

/**
 * 日本語Accessページの表示文言
 */
export interface AccessPageContent {
  introduction: {
    label: string;
    title: string;
    description: string;
    mapLinkLabel: string;
    officialLinkLabel: string;
  };
  location: {
    title: string;
    venue: string;
    phoneLabel: string;
    mapTitle: string;
    mapCaption: string;
  };
  directions: {
    label: string;
    title: string;
    description: string;
    trainTitle: string;
    busTitle: string;
    recommended: string;
    rideTimeLabel: string;
    walkTimeLabel: string;
    minuteUnit: string;
    congestionNote: string;
  };
  visitNotes: {
    label: string;
    title: string;
    items: readonly {
      title: string;
      description: string;
    }[];
  };
  campusMap: {
    label: string;
    title: string;
    description: string;
  };
}

export const accessPageContent = {
  introduction: {
    label: "Setagaya Campus",
    title: "世田谷祭への生き方",
    description:
      "会場は東京都市大学 世田谷キャンパスです。最寄りの尾山台駅からは徒歩約12分。時間に余裕を持ってお越しください。",
    mapLinkLabel: "Google マップで開く",
    officialLinkLabel: "大学公式の交通案内",
  },
  location: {
    title: "会場所在地",
    venue: "東京都市大学 世田谷キャンパス",
    phoneLabel: "大学代表",
    mapTitle: "東京都市大学 世田谷キャンパス周辺地図",
    mapCaption: "地図を拡大したい場合は「Google マップで開く」をご利用ください。",
  },
  directions: {
    label: "Directions",
    title: "会場までの行き方",
    description: "徒歩でお越しの場合は、尾山台駅からのルートがもっとも分かりやすい経路です。",
    trainTitle: "電車・徒歩",
    busTitle: "バス",
    recommended: "おすすめ",
    rideTimeLabel: "乗車",
    walkTimeLabel: "徒歩",
    minuteUnit: "分",
    congestionNote: "所要時間は目安です。当日の混雑や交通状況により前後します。",
  },
  visitNotes: {
    label: "Before you visit",
    title: "ご来場前にご確認ください",
    items: [
      {
        title: "お車での来場はできません",
        description: "学内駐車場はご利用いただけません。公共交通機関をご利用ください。",
      },
      {
        title: "駐輪案内は準備中です",
        description: "当日の駐輪場所と利用方法は、決まり次第このページでお知らせします。",
      },
      {
        title: "混雑を見込んでお越しください",
        description: "駅やバス停、周辺道路の混雑が予想されます。時間に余裕を持ってお越しください。",
      },
    ],
  },
  campusMap: {
    label: "Campus map",
    title: "キャンパスマップは準備中です",
    description:
      "企画会場や案内所を掲載した当日用マップは、詳細が決まり次第このページで公開します。",
  },
} as const satisfies AccessPageContent;

export const accessPageContents = {
  ja: accessPageContent,
  en: {
    introduction: {
      label: "Setagaya Campus",
      title: "Your way to Setagaya Festival.",
      description:
        "The venue is Tokyo City University Setagaya Campus. It is about a 12-minute walk from the nearest station, Oyamadai. Please allow extra travel time.",
      mapLinkLabel: "Open in Google Maps",
      officialLinkLabel: "Official campus directions",
    },
    location: {
      title: "Venue location",
      venue: "Tokyo City University Setagaya Campus",
      phoneLabel: "University main line",
      mapTitle: "Map around Tokyo City University Setagaya Campus",
      mapCaption: "Use “Open in Google Maps” to enlarge the map or start navigation.",
    },
    directions: {
      label: "Directions",
      title: "How to reach the venue",
      description: "The clearest walking route is from Oyamadai Station.",
      trainTitle: "Train & walk",
      busTitle: "Bus",
      recommended: "Recommended",
      rideTimeLabel: "Ride",
      walkTimeLabel: "Walk",
      minuteUnit: " min",
      congestionNote: "Travel times are estimates and may vary due to traffic or congestion.",
    },
    visitNotes: {
      label: "Before you visit",
      title: "Please check before arrival",
      items: [
        {
          title: "No visitor parking",
          description: "Campus parking is not available. Please use public transportation.",
        },
        {
          title: "Bicycle parking details pending",
          description: "Locations and instructions will be posted here once confirmed.",
        },
        {
          title: "Allow extra travel time",
          description: "Stations, bus stops, and nearby streets are expected to be crowded.",
        },
      ],
    },
    campusMap: {
      label: "Campus map",
      title: "The festival campus map is coming soon",
      description:
        "A day-of map showing event venues and information desks will be published here once finalized.",
    },
  },
  zh: {
    introduction: {
      label: "Setagaya Campus",
      title: "轻松抵达世田谷祭。",
      description:
        "会场位于东京都市大学世田谷校区。从最近的尾山台站步行约12分钟，请预留充足的出行时间。",
      mapLinkLabel: "在 Google 地图中打开",
      officialLinkLabel: "大学官方交通指南",
    },
    location: {
      title: "会场地址",
      venue: "东京都市大学 世田谷校区",
      phoneLabel: "大学总机",
      mapTitle: "东京都市大学世田谷校区周边地图",
      mapCaption: "如需放大地图或开始导航，请使用“在 Google 地图中打开”。",
    },
    directions: {
      label: "Directions",
      title: "前往会场的交通方式",
      description: "步行前往时，从尾山台站出发的路线最为清晰。",
      trainTitle: "电车・步行",
      busTitle: "巴士",
      recommended: "推荐",
      rideTimeLabel: "乘车",
      walkTimeLabel: "步行",
      minuteUnit: "分钟",
      congestionNote: "所需时间仅供参考，可能因当天交通和拥堵情况而有所变化。",
    },
    visitNotes: {
      label: "Before you visit",
      title: "到场前请确认",
      items: [
        {
          title: "无法驾车来场",
          description: "校内停车场不对访客开放，请使用公共交通工具。",
        },
        {
          title: "自行车停放信息准备中",
          description: "停放地点和使用方法确定后将在本页公布。",
        },
        {
          title: "请预留充足时间",
          description: "车站、巴士站及周边道路预计会较为拥挤。",
        },
      ],
    },
    campusMap: {
      label: "Campus map",
      title: "校园活动地图正在准备中",
      description: "标注活动会场和服务台的当日地图将在确定后于本页发布。",
    },
  },
  ko: {
    introduction: {
      label: "Setagaya Campus",
      title: "헤매지 않고 세타가야 축제로.",
      description:
        "행사장은 도쿄도시대학 세타가야 캠퍼스입니다. 가장 가까운 오야마다이역에서 도보 약 12분이므로 여유 있게 방문해 주세요.",
      mapLinkLabel: "Google 지도에서 열기",
      officialLinkLabel: "대학 공식 교통 안내",
    },
    location: {
      title: "행사장 위치",
      venue: "도쿄도시대학 세타가야 캠퍼스",
      phoneLabel: "대학 대표번호",
      mapTitle: "도쿄도시대학 세타가야 캠퍼스 주변 지도",
      mapCaption: "지도를 확대하거나 길 안내를 시작하려면 ‘Google 지도에서 열기’를 이용해 주세요.",
    },
    directions: {
      label: "Directions",
      title: "행사장까지 오시는 길",
      description: "도보로 오실 때는 오야마다이역에서 출발하는 경로가 가장 알기 쉽습니다.",
      trainTitle: "전철・도보",
      busTitle: "버스",
      recommended: "추천",
      rideTimeLabel: "승차",
      walkTimeLabel: "도보",
      minuteUnit: "분",
      congestionNote: "소요 시간은 기준이며 당일 교통 및 혼잡 상황에 따라 달라질 수 있습니다.",
    },
    visitNotes: {
      label: "Before you visit",
      title: "방문 전에 확인해 주세요",
      items: [
        {
          title: "자동차로 방문할 수 없습니다",
          description: "교내 주차장을 이용할 수 없으므로 대중교통을 이용해 주세요.",
        },
        {
          title: "자전거 주차 안내 준비 중",
          description: "당일 주차 장소와 이용 방법은 확정되는 대로 이 페이지에서 안내합니다.",
        },
        {
          title: "시간에 여유를 두세요",
          description: "역, 버스 정류장, 주변 도로의 혼잡이 예상됩니다.",
        },
      ],
    },
    campusMap: {
      label: "Campus map",
      title: "캠퍼스 안내 지도는 준비 중입니다",
      description: "행사장과 안내소가 표시된 당일 지도는 확정되는 대로 이 페이지에 공개합니다.",
    },
  },
} as const satisfies Record<"ja" | "en" | "zh" | "ko", AccessPageContent>;

export type AccessConfig = typeof accessConfig;
