/**
 * 建物情報（3Dマップ用）
 */
export const buildingsConfig = [
  {
    id: "building-1",
    name: "1号館",
    floors: 5,
    description: "教室・研究室",
    color: "#FF6B6B",
    position: { x: 0, y: 0, z: 0 }, // 3D座標（実際のマップ設計時に調整）
  },
  {
    id: "building-2",
    name: "2号館",
    floors: 4,
    description: "教室・研究室",
    color: "#4ECDC4",
    position: { x: 50, y: 0, z: 0 },
  },
  {
    id: "building-3",
    name: "3号館",
    floors: 6,
    description: "教室・研究室",
    color: "#45B7D1",
    position: { x: 100, y: 0, z: 0 },
  },
  {
    id: "building-4",
    name: "4号館",
    floors: 3,
    description: "教室・研究室",
    color: "#96CEB4",
    position: { x: 0, y: 0, z: 50 },
  },
  {
    id: "building-5",
    name: "5号館",
    floors: 5,
    description: "教室・研究室",
    color: "#FFEAA7",
    position: { x: 50, y: 0, z: 50 },
  },
  {
    id: "building-6",
    name: "6号館",
    floors: 4,
    description: "図書館・学生ホール",
    color: "#DFE6E9",
    position: { x: 100, y: 0, z: 50 },
  },
  {
    id: "building-7",
    name: "7号館",
    floors: 7,
    description: "ステージ・ホール",
    color: "#CD79EE",
    position: { x: 0, y: 0, z: 100 },
  },
  {
    id: "building-8",
    name: "8号館",
    floors: 3,
    description: "実験棟",
    color: "#74B9FF",
    position: { x: 50, y: 0, z: 100 },
  },
  {
    id: "building-9",
    name: "9号館",
    floors: 4,
    description: "教室・研究室",
    color: "#A29BFE",
    position: { x: 100, y: 0, z: 100 },
  },
  {
    id: "building-10",
    name: "10号館",
    floors: 2,
    description: "事務棟",
    color: "#FD79A8",
    position: { x: 150, y: 0, z: 0 },
  },
  {
    id: "gym",
    name: "体育館",
    floors: 2,
    description: "ステージ・展示スペース",
    color: "#FDCB6E",
    position: { x: 150, y: 0, z: 50 },
  },
] as const;

/**
 * 建物情報の型定義
 */
export type Building = (typeof buildingsConfig)[number];
