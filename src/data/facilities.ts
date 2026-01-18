/**
 * 施設情報（トイレ、案内所、休憩所等）
 */
export const facilitiesConfig = {
  // 案内所
  infoDesks: [
    {
      id: "info-desk-1",
      name: "総合案内所",
      building: "1号館",
      floor: "1F",
      description: "パンフレット配布、迷子対応、落とし物受付",
      position: { x: 10, y: 0, z: 10 },
    },
    {
      id: "info-desk-2",
      name: "サブ案内所",
      building: "7号館",
      floor: "1F",
      description: "パンフレット配布、道案内",
      position: { x: 10, y: 0, z: 110 },
    },
  ],

  // トイレ
  restrooms: [
    {
      id: "restroom-1",
      building: "1号館",
      floors: ["1F", "2F", "3F", "4F", "5F"],
      hasMultipurpose: true,
    },
    {
      id: "restroom-2",
      building: "2号館",
      floors: ["1F", "2F", "3F", "4F"],
      hasMultipurpose: true,
    },
    {
      id: "restroom-3",
      building: "3号館",
      floors: ["1F", "2F", "3F", "4F", "5F", "6F"],
      hasMultipurpose: true,
    },
    {
      id: "restroom-4",
      building: "7号館",
      floors: ["1F", "2F", "3F"],
      hasMultipurpose: true,
    },
    {
      id: "restroom-5",
      building: "体育館",
      floors: ["1F"],
      hasMultipurpose: true,
    },
  ],

  // 休憩所
  restAreas: [
    {
      id: "rest-area-1",
      name: "学生ラウンジ",
      building: "6号館",
      floor: "1F",
      capacity: 100,
      hasSeating: true,
      hasVendingMachine: true,
    },
    {
      id: "rest-area-2",
      name: "中庭休憩スペース",
      building: "屋外",
      floor: "1F",
      capacity: 50,
      hasSeating: true,
      hasVendingMachine: false,
    },
  ],

  // 救護室
  medicalRooms: [
    {
      id: "medical-room-1",
      name: "救護室",
      building: "1号館",
      floor: "1F",
      description: "体調不良時の応急処置",
      staffed: true,
    },
  ],

  // 授乳室
  nursingRooms: [
    {
      id: "nursing-room-1",
      name: "授乳室",
      building: "6号館",
      floor: "1F",
      description: "ベビーベッド・授乳スペース完備",
    },
  ],

  // 喫煙所
  smokingAreas: [
    {
      id: "smoking-area-1",
      name: "喫煙所",
      building: "屋外（駐車場脇）",
      floor: "1F",
      description: "指定場所以外での喫煙は禁止",
    },
  ],

  // ATM
  atms: [
    {
      id: "atm-1",
      name: "ATM",
      building: "6号館",
      floor: "1F",
      description: "セブン銀行ATM",
    },
  ],
} as const;

/**
 * 施設情報の型定義
 */
export type FacilitiesConfig = typeof facilitiesConfig;
