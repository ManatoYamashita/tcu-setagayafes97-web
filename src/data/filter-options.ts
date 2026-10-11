import type { Event, EventDate, EventType } from "@/types/events";

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
 * 企画が「建物」を持たないときの受け皿
 *
 * microCMS の「建物」（`buildings`）の選択肢 `その他` と同じ文字列です。明示的に「その他」を
 * 選んだ企画と、値の無い企画（API から直接書き込んだ場合など。管理画面では必須）が同じ選択肢に
 * まとまります。建物名ではなく振り分け先の名前なので、関連企画の一致や検索には使いません。
 */
export const OTHER_BUILDING_ID = "その他";

/**
 * 企画の建物を返す。**絞り込み・関連企画・検索は必ずこれを通すこと**
 *
 * microCMS の「建物」（`buildings`。複数選択・必須）の値をそのまま返します。
 * 値が無ければ `[OTHER_BUILDING_ID]` を返すので、**企画がどの選択肢にも属さず消える経路はありません。**
 *
 * @returns 1つ以上の建物名
 */
export function getEventBuildings(event: Pick<Event, "buildings">): string[] {
  // 型の上では必ずあるが、normalizeEvent() を通らない企画（欠落フィールドを持つ検索のテスト
  // データなど。#166）でも例外にしない
  const entered = event.buildings ?? [];
  return entered.length > 0 ? entered : [OTHER_BUILDING_ID];
}

/**
 * 名前の付いた場所の並び順
 *
 * 漢字の名前は `Intl.Collator("ja")` / `localeCompare("ja")` でも読みの順に並ばない
 * （単語の読みを見ない）ため、順序は表で持ちます。
 * **表に無い名前は「その他」の直前へ、出てきた順に並べます。** 選択肢から消えることはありません。
 */
const NAMED_BUILDING_ORDER = ["図書館", "屋外", "ホール", "グラウンド"];

const NUMBERED_HALL_PATTERN = /^(\d+)号館$/;
const NUMBERED_ARENA_PATTERN = /^第(\d+)アリーナ$/;

/** 並べ替えの鍵。`[群, 群の中の順]` */
function buildingSortKey(buildingId: string): [number, number] {
  const normalized = buildingId.normalize("NFKC");
  const hall = normalized.match(NUMBERED_HALL_PATTERN);
  if (hall) return [0, Number(hall[1])];
  const arena = normalized.match(NUMBERED_ARENA_PATTERN);
  if (arena) return [1, Number(arena[1])];
  if (buildingId === OTHER_BUILDING_ID) return [4, 0];
  const named = NAMED_BUILDING_ORDER.indexOf(buildingId);
  return named >= 0 ? [2, named] : [3, 0];
}

/**
 * 建物を選択肢の順に並べる
 *
 * `N号館`（数字順）→ `第Nアリーナ`（数字順）→ 名前の付いた場所（`NAMED_BUILDING_ORDER`）
 * → 表に無い名前（入力の順）→ 「その他」。
 * 数字は文字列ではなく数値で比べるので、`10号館` は `9号館` の後に来ます。
 *
 * @param buildingIds 並べる建物名（この配列は変更しません）
 */
export function sortBuildingIds(buildingIds: readonly string[]): string[] {
  // Array.prototype.sort は安定ソートなので、同じ鍵（表に無い名前）は入力の順を保つ
  return [...buildingIds].sort((a, b) => {
    const [groupA, orderA] = buildingSortKey(a);
    const [groupB, orderB] = buildingSortKey(b);
    return groupA - groupB || orderA - orderB;
  });
}
