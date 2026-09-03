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

// このページは PageSheetLayout の白いシート（bg-white）の上に載る。
// 旧実装は淡紫のページ背景を前提にした bg-white/10 + border-gray-200/20 で、
// 白地では未選択タブが純白（枠は 1.08:1）になり、下地と分離しなかった。
// 選択タブも bg-white + text-primary で、面が消えたうえに文字が 3.10:1 しかなく AA を満たさない。
//
// 白いシート上の基準は docs/frontend/design.md「コントラスト比（アクセシビリティ）」に従う。比率は出力CSSの実配信値で算出している。
// - 未選択: border-gray-200（#d1d1d1 / 1.53:1）の枠 + 白面。hover で gray-400（3.23:1）へ
// - 選択:   bg-primary-600（#7b359a）に白文字で 7.45:1
// 状態を色だけで伝えないよう aria-pressed を併記する。
const TAB_BASE = "rounded-lg px-6 py-3 font-medium transition-colors";
const TAB_SELECTED = "bg-primary-600 text-white";
const TAB_UNSELECTED =
  "border border-gray-200 bg-white text-gray-900 hover:border-gray-400 hover:bg-gray-50";

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
    <div className="space-y-6">
      {/* 日程タブ */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900/90">日程</h2>
        {/*
          data-* は E2E がタブ群にスコープするための目印。開発サーバでは
          AgentationDevTool がオーバーレイを差し込むため、aria-pressed を
          ページ全体から素で数えると壊れる（docs/frontend/layout-e2e.md）
        */}
        <div data-timetable-date-tabs className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDateChange("day1")}
            aria-pressed={selectedDate === "day1"}
            className={tabClass(selectedDate === "day1")}
          >
            Day 1（10/31）
          </button>
          <button
            onClick={() => handleDateChange("day2")}
            aria-pressed={selectedDate === "day2"}
            className={tabClass(selectedDate === "day2")}
          >
            Day 2（11/1）
          </button>
        </div>
      </div>

      {/* ステージタブ */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-900/90">ステージ</h2>
        <div data-timetable-stage-tabs className="flex flex-wrap gap-2">
          <button
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
              onClick={() => handleStageChange(stage.id)}
              aria-pressed={selectedStage === stage.id}
              className={tabClass(selectedStage === stage.id)}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
