import type { Locale } from "@/i18n/routing";

/**
 * ご来場の方へ（注意事項・お願い）
 *
 * 文言は `Record<Locale, GuideContent>` で4言語を持つ（`about.ts` / `access.ts` と同じ形）。
 * ロケールによらない真偽値は `guideFlags` に分けてある。
 */

/** ロケールによらない設備の有無 */
export const guideFlags = {
  accessibility: {
    wheelchairAccessible: true,
    multipurposeRestrooms: true,
    nursingRoom: true,
  },
  forFamilies: {
    nursingRoom: true,
    diaperChangingStation: true,
  },
} as const;

export interface GuideContent {
  admission: {
    fee: string;
    time: string;
    notes: readonly string[];
  };
  /** id は表示に使わない安定識別子（React の key に使う） */
  precautions: readonly { id: string; category: string; content: string }[];
  accessibility: {
    /** 「、」「, 」など、ロケールに合った区切りで連結済みの文字列 */
    elevators: string;
    notes: readonly string[];
  };
  weatherInfo: {
    rainPolicy: string;
    notes: readonly string[];
  };
  lostAndFound: {
    location: string;
    hours: string;
    notes: readonly string[];
  };
  forFamilies: {
    notes: readonly string[];
  };
  emergency: {
    medicalRoom: string;
    emergencyContact: string;
    notes: readonly string[];
  };
}

export const guideContents = {
  ja: {
    admission: {
      fee: "無料",
      time: "10:00〜19:30（両日とも）",
      notes: [
        "入退場自由です。",
        "パンフレットは入場門でのみ配布しています。",
        "事前予約は不要です。",
      ],
    },
    precautions: [
      {
        id: "parking",
        category: "駐車場",
        content: "当日は駐車場のご利用ができません。公共交通機関をご利用ください。",
      },
      {
        id: "smoking",
        category: "喫煙",
        content: "キャンパス内は原則禁煙です。喫煙は指定場所でお願いします。",
      },
      {
        id: "trash",
        category: "ゴミ",
        content:
          "家庭ごみの持ち込みはご遠慮ください。模擬店など世田谷祭内で出たごみは、各所に設置したごみ箱で回収します。",
      },
      {
        id: "pets",
        category: "ペット",
        content: "ペット同伴でのご来場はご遠慮ください（盲導犬・介助犬を除く）。",
      },
      {
        id: "hazardous",
        category: "危険物",
        content: "刃物類、花火、爆竹などの危険物の持ち込みは固く禁止します。",
      },
      {
        id: "photos",
        category: "撮影",
        content: "無断での企画内容の撮影・録音はお控えください。",
      },
    ],
    accessibility: {
      elevators: "1号館、2号館、3号館、6号館、7号館",
      notes: [
        "車椅子でのご来場も可能です。エレベーターをご利用ください。",
        "多目的トイレは各棟1階に設置されています。",
        "授乳室は6号館1階にございます。",
        "ご不明な点がございましたら、9号館前本部までお問い合わせください。",
      ],
    },
    weatherInfo: {
      rainPolicy: "雨天決行",
      notes: [
        "荒天の場合、屋外企画は中止または変更となる場合がございます。",
        "最新情報は公式SNSおよび当サイトでお知らせします。",
      ],
    },
    lostAndFound: {
      location: "9号館前本部",
      hours: "10:00〜19:30（両日とも）",
      notes: [
        "お心当たりのある方は、9号館前本部までお問い合わせください。",
        "お預かり期間は当日限りです。後日のお問い合わせは公式サイトのお問い合わせフォームからお願いします。",
      ],
    },
    forFamilies: {
      notes: [
        "授乳室・おむつ交換台は6号館1階にございます。",
        "迷子になった際は、お近くのスタッフまたは9号館前本部までお声がけください。",
      ],
    },
    emergency: {
      medicalRoom: "1号館1F 救護室",
      emergencyContact: "9号館前本部",
      notes: [
        "体調不良の際は、お近くのスタッフまたは救護室までお声がけください。",
        "災害発生時は、スタッフの指示に従って避難してください。",
      ],
    },
  },

  en: {
    admission: {
      fee: "Free",
      time: "10:00–19:30 (both days)",
      notes: [
        "You may enter and leave freely.",
        "Pamphlets are distributed only at the entrance gate.",
        "No advance reservation is required.",
      ],
    },
    precautions: [
      {
        id: "parking",
        category: "Parking",
        content: "Parking is not available on the day. Please use public transportation.",
      },
      {
        id: "smoking",
        category: "Smoking",
        content: "The campus is smoke-free in principle. Please smoke only in designated areas.",
      },
      {
        id: "trash",
        category: "Trash",
        content:
          "Please do not bring household trash. Trash from the festival, such as from food stalls, is collected in the bins placed around the campus.",
      },
      {
        id: "pets",
        category: "Pets",
        content: "Please do not bring pets (guide dogs and service dogs are welcome).",
      },
      {
        id: "hazardous",
        category: "Hazardous items",
        content:
          "Bringing hazardous items such as knives, fireworks, and firecrackers is strictly prohibited.",
      },
      {
        id: "photos",
        category: "Photography",
        content: "Please refrain from photographing or recording exhibits without permission.",
      },
    ],
    accessibility: {
      elevators: "Building 1, Building 2, Building 3, Building 6, Building 7",
      notes: [
        "Wheelchair users are welcome. Please use the elevators.",
        "Accessible restrooms are located on the first floor of each building.",
        "The nursing room is on the first floor of Building 6.",
        "If you have any questions, please ask at the Headquarters in front of Building 9.",
      ],
    },
    weatherInfo: {
      rainPolicy: "Held rain or shine",
      notes: [
        "In case of severe weather, outdoor events may be cancelled or changed.",
        "The latest information will be posted on our official social media and this website.",
      ],
    },
    lostAndFound: {
      location: "Headquarters in front of Building 9",
      hours: "10:00–19:30 (both days)",
      notes: [
        "If you think an item may be yours, please ask at the Headquarters in front of Building 9.",
        "Items are held for the day only. For later inquiries, please use the contact form on our official website.",
      ],
    },
    forFamilies: {
      notes: [
        "The nursing room and diaper-changing station are on the first floor of Building 6.",
        "If a child gets lost, please speak to the nearest staff member or the Headquarters in front of Building 9.",
      ],
    },
    emergency: {
      medicalRoom: "First Aid Room, Building 1, 1F",
      emergencyContact: "Headquarters in front of Building 9",
      notes: [
        "If you feel unwell, please speak to the nearest staff member or go to the First Aid Room.",
        "In the event of a disaster, please evacuate following the staff's instructions.",
      ],
    },
  },

  zh: {
    admission: {
      fee: "免费",
      time: "10:00～19:30（两天均相同）",
      notes: ["可自由进出。", "宣传手册仅在入场门发放。", "无需提前预约。"],
    },
    precautions: [
      {
        id: "parking",
        category: "停车场",
        content: "活动当天停车场不开放，请乘坐公共交通工具前来。",
      },
      {
        id: "smoking",
        category: "吸烟",
        content: "校园内原则上禁止吸烟，请在指定区域吸烟。",
      },
      {
        id: "trash",
        category: "垃圾",
        content: "请勿携带家庭垃圾入场。摊位等世田谷祭内产生的垃圾，由各处设置的垃圾箱回收。",
      },
      {
        id: "pets",
        category: "宠物",
        content: "请勿携带宠物入场（导盲犬、辅助犬除外）。",
      },
      {
        id: "hazardous",
        category: "危险物品",
        content: "严禁携带刀具、烟花、爆竹等危险物品入场。",
      },
      {
        id: "photos",
        category: "拍摄",
        content: "未经许可，请勿拍摄或录制企划内容。",
      },
    ],
    accessibility: {
      elevators: "1号馆、2号馆、3号馆、6号馆、7号馆",
      notes: [
        "欢迎轮椅使用者前来，请使用电梯。",
        "各栋1楼均设有无障碍卫生间。",
        "哺乳室位于6号馆1楼。",
        "如有疑问，请向9号馆前本部询问。",
      ],
    },
    weatherInfo: {
      rainPolicy: "雨天照常举行",
      notes: ["遇恶劣天气时，室外企划可能取消或变更。", "最新信息将通过官方社交媒体及本网站发布。"],
    },
    lostAndFound: {
      location: "9号馆前本部",
      hours: "10:00～19:30（两天均相同）",
      notes: [
        "如有遗失物品的线索，请前往9号馆前本部询问。",
        "物品仅保管至当天。之后如需咨询，请通过官方网站的联系表单。",
      ],
    },
    forFamilies: {
      notes: [
        "哺乳室及尿布更换台位于6号馆1楼。",
        "如孩子走失，请联系附近的工作人员或9号馆前本部。",
      ],
    },
    emergency: {
      medicalRoom: "1号馆1楼 医务室",
      emergencyContact: "9号馆前本部",
      notes: [
        "如身体不适，请联系附近的工作人员或前往医务室。",
        "发生灾害时，请听从工作人员指示避难。",
      ],
    },
  },

  ko: {
    admission: {
      fee: "무료",
      time: "10:00~19:30 (양일 동일)",
      notes: [
        "자유롭게 입장 및 퇴장하실 수 있습니다.",
        "팸플릿은 입장문에서만 배부합니다.",
        "사전 예약은 필요하지 않습니다.",
      ],
    },
    precautions: [
      {
        id: "parking",
        category: "주차장",
        content: "행사 당일에는 주차장을 이용하실 수 없습니다. 대중교통을 이용해 주세요.",
      },
      {
        id: "smoking",
        category: "흡연",
        content: "캠퍼스 내는 원칙적으로 금연입니다. 흡연은 지정된 장소에서 해 주세요.",
      },
      {
        id: "trash",
        category: "쓰레기",
        content:
          "가정 쓰레기의 반입은 삼가 주세요. 노점 등 세타가야사이에서 나온 쓰레기는 곳곳에 설치된 쓰레기통에서 수거합니다.",
      },
      {
        id: "pets",
        category: "반려동물",
        content: "반려동물 동반 방문은 삼가 주세요(안내견·보조견 제외).",
      },
      {
        id: "hazardous",
        category: "위험물",
        content: "칼, 불꽃놀이, 폭죽 등 위험물의 반입은 엄격히 금지합니다.",
      },
      {
        id: "photos",
        category: "촬영",
        content: "허가 없이 기획 내용을 촬영·녹음하는 것은 삼가 주세요.",
      },
    ],
    accessibility: {
      elevators: "1호관, 2호관, 3호관, 6호관, 7호관",
      notes: [
        "휠체어로도 방문하실 수 있습니다. 엘리베이터를 이용해 주세요.",
        "장애인 화장실은 각 건물 1층에 있습니다.",
        "수유실은 6호관 1층에 있습니다.",
        "궁금한 점이 있으시면 9호관 앞 본부로 문의해 주세요.",
      ],
    },
    weatherInfo: {
      rainPolicy: "우천 시에도 진행",
      notes: [
        "악천후 시 야외 기획은 중지 또는 변경될 수 있습니다.",
        "최신 정보는 공식 SNS 및 본 사이트에서 안내합니다.",
      ],
    },
    lostAndFound: {
      location: "9호관 앞 본부",
      hours: "10:00~19:30 (양일 동일)",
      notes: [
        "짐작 가는 분실물이 있으시면 9호관 앞 본부로 문의해 주세요.",
        "보관 기간은 당일까지입니다. 이후 문의는 공식 사이트의 문의 양식을 이용해 주세요.",
      ],
    },
    forFamilies: {
      notes: [
        "수유실과 기저귀 교환대는 6호관 1층에 있습니다.",
        "아이를 잃어버렸을 때는 가까운 스태프 또는 9호관 앞 본부로 알려 주세요.",
      ],
    },
    emergency: {
      medicalRoom: "1호관 1층 구호실",
      emergencyContact: "9호관 앞 본부",
      notes: [
        "몸이 좋지 않을 때는 가까운 스태프에게 말씀하시거나 구호실로 가 주세요.",
        "재해 발생 시에는 스태프의 지시에 따라 대피해 주세요.",
      ],
    },
  },
} as const satisfies Record<Locale, GuideContent>;

/** 未対応のロケールが渡された場合は日本語へフォールバックする */
export function resolveGuide(locale: Locale): GuideContent {
  return guideContents[locale] ?? guideContents.ja;
}
