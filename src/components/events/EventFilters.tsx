"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { dateFilterOptions, typeFilterOptions, buildingFilterOptions } from "@/data/filter-options";

/**
 * 企画フィルターコンポーネント
 * URL Search Params で状態管理
 */
export function EventFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentDate = searchParams.get("date") || "all";
  const currentType = searchParams.get("type") || "all";
  const currentBuilding = searchParams.get("building") || "all";
  const currentKeyword = searchParams.get("keyword") || "";

  /**
   * フィルター変更ハンドラー
   */
  const handleFilterChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value === "" || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }

    // ページネーションをリセット
    params.delete("page");

    router.push(`/events?${params.toString()}`);
  };

  /**
   * フィルターをリセット
   */
  const handleReset = () => {
    router.push("/events");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">絞り込み</h2>
        <button
          onClick={handleReset}
          className="text-sm text-primary underline hover:text-primary/80"
          aria-label="フィルターをリセット"
        >
          リセット
        </button>
      </div>

      <div className="space-y-6">
        {/* 日程フィルター */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">開催日</label>
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange("date", option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  currentDate === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/10"
                }`}
                aria-pressed={currentDate === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 企画種別フィルター */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-700">企画種別</label>
          <div className="flex flex-wrap gap-2">
            {typeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange("type", option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  currentType === option.value
                    ? "border-primary bg-primary text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/10"
                }`}
                aria-pressed={currentType === option.value}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 建物フィルター */}
        <div>
          <label
            htmlFor="building-filter"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            建物
          </label>
          <select
            id="building-filter"
            value={currentBuilding}
            onChange={(e) => handleFilterChange("building", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {buildingFilterOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* キーワード検索 */}
        <div>
          <label
            htmlFor="keyword-search"
            className="mb-2 block text-sm font-semibold text-gray-700"
          >
            キーワード検索
          </label>
          <input
            type="text"
            id="keyword-search"
            placeholder="企画名、団体名などで検索"
            value={currentKeyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </div>
  );
}
