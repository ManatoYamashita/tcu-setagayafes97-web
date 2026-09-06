import { normalizeText } from "@/lib/text";
import type { EventDate, EventType } from "@/types/events";

/**
 * 日程フィルターの選択肢
 */
export interface DateFilterOption {
  value: EventDate | "all";
  label: string;
}

export const dateFilterOptions: DateFilterOption[] = [
  { value: "all", label: "すべて" },
  { value: "day1", label: "1日目" },
  { value: "day2", label: "2日目" },
  { value: "both", label: "両日開催" },
  { value: "other", label: "その他" },
];

/**
 * 企画種別フィルターの選択肢
 *
 * `EventType` を増やしたらここも増やすこと。`src/lib/events.ts` の
 * `normalizeEventType()` と合わせて3箇所を同時に直す必要があります
 * （docs/dev/microcms.md「select の選択肢を増やしたら正規化関数も直す」）。
 */
export interface TypeFilterOption {
  value: EventType | "all";
  label: string;
}

export const typeFilterOptions: TypeFilterOption[] = [
  { value: "all", label: "すべて" },
  { value: "room", label: "教室企画" },
  { value: "stage", label: "ステージ企画" },
  { value: "store", label: "模擬店" },
  { value: "special", label: "スペシャル企画" },
  { value: "other", label: "その他" },
];

/**
 * 建物フィルターの選択肢
 */
export interface BuildingFilterOption {
  value: string;
  label: string;
}

/**
 * 建物の定義
 *
 * `patterns` は `place`（および `building`）に含まれていたら、その建物と見なす語です。
 * 表記は読みやすい形で書き、照合時に `normalizeText()` を通します。
 */
export interface BuildingDef {
  id: string;
  label: string;
  patterns: string[];
}

/**
 * 建物一覧
 *
 * > [!IMPORTANT]
 * > **この配列の並び順は仕様です。** `resolveBuildingId()` は宣言順に部分一致を試すため、
 * > 入れ替えると誤配されます。守るべき順序は2つ。
 * >
 * > 1. `10号館` を `1号館` より前に置く
 * > 2. **`号館` 系をすべて `体育館`（`アリーナ`）より前に置く。** `９号館アリーナ` は
 * >    `9号館` であって体育館ではありません。逆にすると3件が体育館へ流れます
 *
 * microCMS の `building` は「建物番号」という名前のテキストフィールドで、実データでは
 * 18件すべてが未入力です（2026-09-06 実測）。したがって実質的な入力は `place` 一本であり、
 * ここでの導出が絞り込みの成否を決めます。
 */
export const buildings: BuildingDef[] = [
  { id: "10号館", label: "10号館", patterns: ["10号館"] },
  { id: "1号館", label: "1号館", patterns: ["1号館"] },
  { id: "2号館", label: "2号館", patterns: ["2号館"] },
  { id: "3号館", label: "3号館", patterns: ["3号館"] },
  { id: "4号館", label: "4号館", patterns: ["4号館"] },
  { id: "5号館", label: "5号館", patterns: ["5号館"] },
  { id: "6号館", label: "6号館", patterns: ["6号館"] },
  { id: "7号館", label: "7号館", patterns: ["7号館"] },
  { id: "8号館", label: "8号館", patterns: ["8号館"] },
  { id: "9号館", label: "9号館", patterns: ["9号館"] },
  { id: "体育館", label: "体育館", patterns: ["体育館", "アリーナ"] },
  { id: "ホール", label: "ホール", patterns: ["ホール", "講堂"] },
  { id: "グラウンド", label: "グラウンド", patterns: ["グラウンド", "運動場"] },
  { id: "屋外", label: "屋外", patterns: ["SAKURA GARDEN", "テント", "中庭", "屋外", "ベンチ"] },
];

/**
 * どの建物にも解決できなかった企画の受け皿
 *
 * `buildings` 配列には加えません。あの配列は「実在する建物」の定義であり、「その他」は
 * 建物ではなく振り分け先の名前だからです（`src/data/stages.ts` の `OTHER_STAGE_ID` と同じ理由）。
 */
export const OTHER_BUILDING_ID = "その他";
export const OTHER_BUILDING_LABEL = "その他";

/** 照合用に正規化済みの索引。モジュール評価時に1回だけ作る */
const normalizedBuildings = buildings.map((building) => ({
  id: building.id,
  patterns: building.patterns.map(normalizeText).filter(Boolean),
}));

/**
 * 教室コードの規則
 *
 * 東京都市大学の教室表記は「先頭1桁が号館番号」です（`11D` = 1号館 / `61C` = 6号館）。
 * 実データには `11D` と `61C` が入っています。
 *
 * **数字だけの表記も同じ規則で読みます**（`100` → 1号館 / `999` → 9号館）。
 * 教室番号が英字を伴わずに入稿されても拾うためです。
 *
 * **歯止めは桁数だけです。** 全体で3桁 + 英字1文字までしか許さないので、`2026` のような
 * 年号は弾かれて「その他」へ落ちます。ここを緩めると年号や金額を建物へ吸い込みます。
 */
const ROOM_CODE_PATTERN = /^([1-9])\d{1,2}[a-z]?$/;

/** `building` に号館番号だけ（`7` など）が入稿された場合の規則 */
const BUILDING_NUMBER_PATTERN = /^([1-9]|10)$/;

/** 正規化済みテキストから建物IDを探す。見つからなければ null */
function matchBuildingPattern(normalized: string): string | null {
  if (!normalized) return null;
  const hit = normalizedBuildings.find((building) =>
    building.patterns.some((pattern) => normalized.includes(pattern))
  );
  return hit ? hit.id : null;
}

/** 数字だけの表記（`7` / `11d` / `61c`）から建物IDを導く。該当しなければ null */
function matchBuildingNumber(normalized: string): string | null {
  const asNumber = normalized.match(BUILDING_NUMBER_PATTERN);
  if (asNumber) {
    const id = `${asNumber[1]}号館`;
    return buildings.some((building) => building.id === id) ? id : null;
  }

  const asRoom = normalized.match(ROOM_CODE_PATTERN);
  if (asRoom) {
    const id = `${asRoom[1]}号館`;
    return buildings.some((building) => building.id === id) ? id : null;
  }

  return null;
}

/**
 * 場所を必ずいずれかの建物IDへ解決する
 *
 * 一致しなければ `OTHER_BUILDING_ID` を返すため、**企画がどこにも属さず消える経路がありません**
 * （`src/data/stages.ts` の `resolveStageId()` と同じ設計）。
 *
 * 解決順（**この順序が仕様**）:
 *
 * 1. `building` が入稿されていればそれを優先する（将来 CMS 側を埋めたときに勝たせる）
 * 2. `place` を `buildings` の宣言順で部分一致
 * 3. 教室コード規則（`11D` → `1号館`）
 * 4. どれにも当たらなければ「その他」
 *
 * @param place 場所（microCMS の `place`。必須フィールドだが防御的に optional で受ける）
 * @param building 建物番号（microCMS の `building`。実データでは常に空）
 * @returns 建物ID。解決できなければ `OTHER_BUILDING_ID`
 */
export function resolveBuildingId(place?: string, building?: string): string {
  const normalizedBuilding = normalizeText(building);
  if (normalizedBuilding) {
    const fromBuilding =
      matchBuildingPattern(normalizedBuilding) ?? matchBuildingNumber(normalizedBuilding);
    if (fromBuilding) return fromBuilding;
  }

  const normalizedPlace = normalizeText(place);
  const fromPlace = matchBuildingPattern(normalizedPlace) ?? matchBuildingNumber(normalizedPlace);
  if (fromPlace) return fromPlace;

  return OTHER_BUILDING_ID;
}

/**
 * 建物IDから表示名を取得
 * @param buildingId 建物ID
 * @returns 表示名。未知のIDはそのまま返す
 */
export function getBuildingLabel(buildingId: string): string {
  if (buildingId === OTHER_BUILDING_ID) return OTHER_BUILDING_LABEL;
  return buildings.find((building) => building.id === buildingId)?.label ?? buildingId;
}

/**
 * 実在する建物ID（`buildings` の定義、または「その他」）かどうか
 *
 * URL のクエリなど外部由来の文字列を、そのまま建物として扱ってよいかの判定に使います。
 * 素通しにすると、任意の文字列が `<select>` の value になり選択肢と食い違います。
 */
export function isKnownBuildingId(buildingId: string): boolean {
  return (
    buildingId === OTHER_BUILDING_ID || buildings.some((building) => building.id === buildingId)
  );
}
