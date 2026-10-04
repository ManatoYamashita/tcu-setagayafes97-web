"use client";

import { useId } from "react";
import type { FilterParams } from "@/lib/filters";
import {
  dateFilterOptions,
  typeFilterOptions,
  type BuildingFilterOption,
} from "@/data/filter-options";

interface EventFilterFieldsProps {
  /** 現在のフィルター。選択状態の表示に使う */
  filters: FilterParams;
  /** 建物の選択肢。実データに存在する建物だけが渡ってくる（`listBuildingOptions`） */
  buildingOptions: BuildingFilterOption[];
  /** 選択が変わったときに、変わった項目だけを渡す */
  onChange: (patch: Partial<FilterParams>) => void;
}

/**
 * 開催日・企画種別・建物の絞り込み項目
 *
 * `EventFilters` が2箇所に描きます（lg 以上のサイドバーと、lg 未満のボトムシート）。
 * 片方は常に `display: none` なので支援技術には1組しか見えませんが、`id` は文書内で
 * 一意でなければならないため `useId()` で振ります。
 *
 * `EventsView` 経由で `<Suspense>` の fallback にも描かれるため、`useSearchParams()` を
 * 呼んではいけません（#156）。現在値は props で受け取ります。
 */
export function EventFilterFields({ filters, buildingOptions, onChange }: EventFilterFieldsProps) {
  const buildingId = useId();

  const currentDate = filters.date ?? "all";
  const currentType = filters.type ?? "all";
  const currentBuilding = filters.building ?? "all";

  return (
    <div className="space-y-6">
      {/* 日程フィルター */}
      <fieldset className="mx-0 min-w-0 border-0 p-0">
        <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
          開催日
        </legend>
        <div className="flex flex-wrap gap-2">
          {dateFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ date: option.value })}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
                currentDate === option.value
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
              }`}
              aria-pressed={currentDate === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 企画種別フィルター */}
      <fieldset className="mx-0 min-w-0 border-0 p-0">
        <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
          企画種別
        </legend>
        <div className="flex flex-wrap gap-2">
          {typeFilterOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange({ type: option.value })}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
                currentType === option.value
                  ? "border-primary-600 bg-primary-600 text-white"
                  : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
              }`}
              aria-pressed={currentType === option.value}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      {/* 建物フィルター（企画が1件以上ある建物だけを出す） */}
      <div>
        <label htmlFor={buildingId} className="mb-2 block text-sm font-semibold text-gray-900/90">
          建物
        </label>
        <select
          id={buildingId}
          value={currentBuilding}
          onChange={(e) => onChange({ building: e.target.value })}
          className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-base text-gray-900 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600 sm:text-sm"
        >
          {buildingOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
