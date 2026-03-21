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
    <div className="rounded-lg border border-gray-200/20 bg-white/10 p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">絞り込み</h2>
        <button
          onClick={handleReset}
          className="text-sm text-gray-900 underline hover:text-gray-900/80"
          aria-label="フィルターをリセット"
        >
          リセット
        </button>
      </div>

      <div className="space-y-6">
        {/* 日程フィルター */}
        <div>
          <label className="mb-2 block text-sm font-semibold text-gray-900/90">開催日</label>
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange("date", option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  currentDate === option.value
                    ? "border-gray-200 bg-white text-primary"
                    : "border-gray-200/30 bg-white/10 text-gray-900 hover:border-gray-200 hover:bg-white/20"
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
          <label className="mb-2 block text-sm font-semibold text-gray-900/90">企画種別</label>
          <div className="flex flex-wrap gap-2">
            {typeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange("type", option.value)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                  currentType === option.value
                    ? "border-gray-200 bg-white text-primary"
                    : "border-gray-200/30 bg-white/10 text-gray-900 hover:border-gray-200 hover:bg-white/20"
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
            className="mb-2 block text-sm font-semibold text-gray-900/90"
          >
            建物
          </label>
          <select
            id="building-filter"
            value={currentBuilding}
            onChange={(e) => handleFilterChange("building", e.target.value)}
            className="w-full rounded-lg border border-gray-200/30 bg-white/10 px-4 py-2 text-sm text-gray-900 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
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
            className="mb-2 block text-sm font-semibold text-gray-900/90"
          >
            キーワード検索
          </label>
          <input
            type="text"
            id="keyword-search"
            placeholder="企画名、団体名などで検索"
            value={currentKeyword}
            onChange={(e) => handleFilterChange("keyword", e.target.value)}
            className="w-full rounded-lg border border-gray-200/30 bg-white/10 px-4 py-2 text-sm text-gray-900 placeholder-white/50 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-white/20"
          />
        </div>
      </div>
    </div>
  );
}
