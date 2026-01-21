"use client";

import { useRouter, usePathname } from "next/navigation";
import type { EventDate } from "@/types/events";
import { stages, getStageName } from "@/data/stages";

interface TimetableTabsProps {
  selectedDate: EventDate;
  selectedStage: string;
  availableStages: string[];
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
        <h2 className="mb-3 text-sm font-semibold text-gray-700">日程</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleDateChange("day1")}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              selectedDate === "day1"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Day 1（10/31）
          </button>
          <button
            onClick={() => handleDateChange("day2")}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              selectedDate === "day2"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            Day 2（11/1）
          </button>
        </div>
      </div>

      {/* ステージタブ */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-gray-700">ステージ</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleStageChange("all")}
            className={`rounded-lg px-6 py-3 font-medium transition-all ${
              selectedStage === "all"
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            すべて
          </button>
          {stages
            .filter((stage) => availableStages.includes(stage.id))
            .map((stage) => (
              <button
                key={stage.id}
                onClick={() => handleStageChange(stage.id)}
                className={`rounded-lg px-6 py-3 font-medium transition-all ${
                  selectedStage === stage.id
                    ? "bg-primary text-white shadow-md"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                {getStageName(stage.id)}
              </button>
            ))}
        </div>
      </div>
    </div>
  );
}
