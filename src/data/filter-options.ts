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
 */
export interface TypeFilterOption {
  value: EventType | "all";
  label: string;
}

export const typeFilterOptions: TypeFilterOption[] = [
  { value: "all", label: "すべて" },
  { value: "room", label: "教室企画" },
  { value: "stage", label: "ステージ企画" },
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

export const buildingFilterOptions: BuildingFilterOption[] = [
  { value: "all", label: "すべて" },
  { value: "1号館", label: "1号館" },
  { value: "2号館", label: "2号館" },
  { value: "3号館", label: "3号館" },
  { value: "4号館", label: "4号館" },
  { value: "5号館", label: "5号館" },
  { value: "6号館", label: "6号館" },
  { value: "7号館", label: "7号館" },
  { value: "8号館", label: "8号館" },
  { value: "9号館", label: "9号館" },
  { value: "10号館", label: "10号館" },
  { value: "体育館", label: "体育館" },
  { value: "ホール", label: "ホール" },
  { value: "グラウンド", label: "グラウンド" },
  { value: "その他", label: "その他" },
];
