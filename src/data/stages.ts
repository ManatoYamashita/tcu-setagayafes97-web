/**
 * ステージ情報
 * タイムテーブルページで使用する静的データ
 */
export interface Stage {
  id: string;
  name: string;
  description?: string;
}

/**
 * ステージ一覧
 */
export const stages: Stage[] = [
  {
    id: "7A",
    name: "7号館A（7A）",
    description: "7号館A棟のステージスペース",
  },
  {
    id: "7B",
    name: "7号館B（7B）",
    description: "7号館B棟のステージスペース",
  },
  {
    id: "体育館",
    name: "体育館",
    description: "メインアリーナでの大型ステージ",
  },
  {
    id: "ホール",
    name: "ホール",
    description: "講堂ホール（演劇・公演向け）",
  },
  {
    id: "中庭",
    name: "中庭特設ステージ",
    description: "屋外特設ステージ",
  },
];

/**
 * ステージIDからステージ名を取得
 */
export function getStageName(stageId: string): string {
  const stage = stages.find((s) => s.id === stageId);
  return stage?.name || stageId;
}

/**
 * 場所からステージIDを推定
 * placeフィールドにステージIDが含まれているか判定
 */
export function extractStageId(place: string): string | null {
  // 正確なマッチング
  const exactMatch = stages.find((s) => place.includes(s.id));
  if (exactMatch) return exactMatch.id;

  // 部分マッチング（ステージ名が含まれている場合）
  const partialMatch = stages.find((s) => place.includes(s.name));
  if (partialMatch) return partialMatch.id;

  return null;
}
