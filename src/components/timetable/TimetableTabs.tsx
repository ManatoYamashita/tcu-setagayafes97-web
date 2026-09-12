"use client";

import { useRouter, usePathname } from "next/navigation";
import type { EventDate } from "@/types/events";
import type { StageOption } from "@/lib/timetable";

interface TimetableTabsProps {
  selectedDate: EventDate;
  selectedStage: string;
  /**
   * タブに出すステージ。`listStageTabs()` の並び順（stages の宣言順 → その他）を
   * そのまま使う。「その他」を含むため `stages` 配列には無いIDも来る。
   */
  availableStages: StageOption[];
}

export const TIMETABLE_DATE_OPTIONS = [
  { value: "day1", ordinal: "1日目", dateLabel: "10月31日（土）" },
  { value: "day2", ordinal: "2日目", dateLabel: "11月1日（日）" },
] as const satisfies ReadonlyArray<{
  value: EventDate;
  ordinal: string;
  dateLabel: string;
}>;

export function getTimetableDateLabel(date: EventDate): string {
  return TIMETABLE_DATE_OPTIONS.find((option) => option.value === date)?.dateLabel ?? "";
}

// このページは PageSheetLayout の白いシート（bg-white）の上に載る。
// 旧実装は淡紫のページ背景を前提にした bg-white/10 + border-gray-200/20 で、
// 白地では未選択タブが純白（枠は 1.08:1）になり、下地と分離しなかった。
// 選択タブも bg-white + text-primary で、面が消えたうえに文字が 3.10:1 しかなく AA を満たさない。
//
// 白いシート上の基準は docs/frontend/design.md「コントラスト比（アクセシビリティ）」に従う。比率は出力CSSの実配信値で算出している。
// - 未選択: border-gray-400（#8f8f8f / 3.23:1）の枠 + 白面
// - 選択:   bg-primary-600（#7b359a）に白文字で 7.45:1
// 状態を色だけで伝えないよう aria-pressed を併記する。
const TAB_BASE =
  "min-h-11 rounded-lg px-4 py-2 text-sm font-semibold transition-colors " +
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600";
const TAB_SELECTED = "bg-primary-600 text-white";
const TAB_UNSELECTED =
  "border border-gray-400 bg-white text-gray-900 hoverable:hover:border-primary-600 hoverable:hover:bg-primary-50";

function tabClass(isSelected: boolean) {
  return `${TAB_BASE} ${isSelected ? TAB_SELECTED : TAB_UNSELECTED}`;
}

/**
 * タイムテーブルタブコンポーネント
 * 日程タブとステージタブを表示
 */
export function TimetableTabs({
  selectedDate,
  selectedStage,
  availableStages,
}: TimetableTabsProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleDateChange = (date: EventDate) => {
    const params = new URLSearchParams();
    params.set("date", date);
    params.set("stage", "all");
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleStageChange = (stage: string) => {
    const params = new URLSearchParams();
    params.set("date", selectedDate);
    params.set("stage", stage);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-5 rounded-xl bg-gray-50 p-4 sm:p-5">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-gray-700">表示する日</legend>
        {/*
          data-* は E2E がタブ群にスコープするための目印。開発サーバでは
          AgentationDevTool がオーバーレイを差し込むため、aria-pressed を
          ページ全体から素で数えると壊れる（docs/frontend/layout-e2e.md）
        */}
        <div data-timetable-date-tabs className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
          {TIMETABLE_DATE_OPTIONS.map((option) => {
            const isSelected = selectedDate === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => handleDateChange(option.value)}
                aria-pressed={isSelected}
                className={`${tabClass(isSelected)} text-start sm:text-center`}
              >
                <span className="block">{option.ordinal}</span>
                <span className={`block text-xs ${isSelected ? "text-white/85" : "text-gray-600"}`}>
                  {option.dateLabel}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-3 text-sm font-semibold text-gray-700">表示するステージ</legend>
        <div data-timetable-stage-tabs className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => handleStageChange("all")}
            aria-pressed={selectedStage === "all"}
            className={tabClass(selectedStage === "all")}
          >
            すべて
          </button>
          {/*
            親配列は availableStages 側。stages 配列を親にして filter すると、
            そこに存在しない「その他」のタブが永久に出せない
          */}
          {availableStages.map((stage) => (
            <button
              key={stage.id}
              type="button"
              onClick={() => handleStageChange(stage.id)}
              aria-pressed={selectedStage === stage.id}
              className={tabClass(selectedStage === stage.id)}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </fieldset>
    </div>
  );
}
