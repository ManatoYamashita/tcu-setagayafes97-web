/**
 * ステージ情報
 * タイムテーブルページで使用する静的データ
 */
export interface Stage {
  id: string;
  /** 列見出し・タブ・企画詳細パネルに出す名前。パンフレットの表記に揃える */
  name: string;
  description?: string;
  /**
   * `place` がこの文字列を含めばこのステージとみなす（`id` に加えて）
   *
   * 表示名は判定に使いません。表示名を変えただけで振り分けが変わると、
   * 文言の調整が「企画が『その他』へ落ちる」事故になるためです。
   */
  aliases?: string[];
}

/**
 * ステージ一覧
 *
 * **宣言順がそのまま盤面の列順になります。** 先頭の4つはパンフレットのタイムテーブル
 * （P.17-18）と同じ並びです（#474）。
 */
export const stages: Stage[] = [
  {
    id: "ホール",
    name: "TCUホール（7号館）",
    description: "7号館1階の講堂ホール",
  },
  {
    id: "体育館",
    name: "体育館（第1アリーナ）",
    description: "9号館の第1アリーナ",
    // 実データは「9号館 体育館(第1アリーナ)」のほか「9号館アリーナ」「９号館アリーナ」でも
    // 入稿されている。号館を含む表記も除外しない（除外すると全件が「その他」へ落ちる。#302）
    aliases: ["アリーナ"],
  },
  {
    id: "SAKURA",
    name: "SAKURAガーデン",
    description: "屋外のステージ",
  },
  {
    id: "61C",
    name: "61C",
    description: "6号館の教室",
  },
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
    id: "中庭",
    name: "中庭特設ステージ",
    description: "屋外特設ステージ",
  },
];

/**
 * どのステージにも一致しなかった企画の受け皿
 *
 * `stages` 配列には加えません。あの配列は「実在する会場」の定義であり、「その他」は
 * 会場ではなく振り分け先の名前だからです。混ぜると、会場一覧として読む箇所へ
 * 実在しない会場が漏れます。
 *
 * 現時点で `stages` を読むのは `src/lib/timetable.ts` だけですが、キャンパスマップや
 * 企画一覧が会場一覧として参照し始めたときに黙って壊れないよう、定数を分けてあります。
 */
export const OTHER_STAGE_ID = "other";
export const OTHER_STAGE_NAME = "その他";

/**
 * ステージIDからステージ名を取得
 */
export function getStageName(stageId: string): string {
  if (stageId === OTHER_STAGE_ID) return OTHER_STAGE_NAME;
  const stage = stages.find((s) => s.id === stageId);
  return stage?.name || stageId;
}

/**
 * 場所からステージIDを推定
 * placeフィールドにステージIDが含まれているか判定
 *
 * 一致しなければ null を返します。「一致したか」を知りたい場面（未入稿の検出など）
 * のための関数で、振り分けには `resolveStageId()` を使ってください。
 */
export function extractStageId(place: string): string | null {
  if (!place) return null;

  // 正確なマッチング
  const exactMatch = stages.find((s) => place.includes(s.id));
  if (exactMatch) return exactMatch.id;

  // 別表記（「体育館」に対する「アリーナ」など）。ID 判定で拾えなかったものだけをここで拾う。
  // 建物フィルタ（src/data/filter-options.ts）で「9号館アリーナ」を 9号館 とするのは別の判定。
  const aliasMatch = stages.find((s) => s.aliases?.some((alias) => place.includes(alias)));
  if (aliasMatch) return aliasMatch.id;

  return null;
}

/**
 * 実在するステージID（`stages` の定義、または「その他」）かどうか
 *
 * URL のクエリなど外部由来の文字列を、そのままステージとして扱ってよいかの判定に使います。
 * 素通しにすると、任意の文字列が `getStageName()` を経由してタブのラベルとして表示されます。
 */
export function isKnownStageId(stageId: string): boolean {
  return stageId === OTHER_STAGE_ID || stages.some((stage) => stage.id === stageId);
}

/**
 * 場所を必ずいずれかのステージIDへ解決する
 *
 * 一致しなければ `OTHER_STAGE_ID` を返すため、**企画がどこにも属さず消える経路がありません。**
 *
 * タイムテーブルの絞り込みとグループ化は、必ず両方ともこの関数を通してください。
 * 片方だけ `extractStageId()`（null を返す）に戻すと、グループ化では「その他」へ入るのに
 * 絞り込みでは `null !== "other"` で必ず外れるため、「その他」タブが常に空になります。
 */
export function resolveStageId(place: string): string {
  return extractStageId(place) ?? OTHER_STAGE_ID;
}
