"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { eventsHref, type FilterParams } from "@/lib/filters";
import { dateFilterOptions, typeFilterOptions, buildingFilterOptions } from "@/data/filter-options";

interface EventFiltersProps {
  /** 現在のフィルター。遷移先URLの組み立てと選択状態の表示に使う */
  filters: FilterParams;
}

/** キーワード入力からURL反映までのデバウンス時間（ms） */
const KEYWORD_DEBOUNCE_MS = 300;

/**
 * 企画フィルターコンポーネント
 * URL Search Params で状態管理
 *
 * **現在値は `useSearchParams()` ではなく props で受け取ります。** このコンポーネントは
 * `EventsView` 経由で `<Suspense>` の fallback にも描かれるため、ここでクエリを読むと
 * fallback 自身が bailout し、ページ本体が静的HTMLから消えます（#156）。
 * `useRouter()` は bailout を起こさないのでそのまま使えます。
 *
 * `lg` 未満では開閉可能なパネルにする。開催日・種別・建物・キーワードの4項目が
 * 常に全展開されていると、モバイルで最初のカードが画面外に押し出されるため。
 * 既定は折りたたみだが、URLに絞り込み条件が既にある場合（深いリンク・戻る/進む）は
 * 自動展開してその場で文脈が見えるようにする。
 */
export function EventFilters({ filters }: EventFiltersProps) {
  const router = useRouter();

  const currentDate = filters.date ?? "all";
  const currentType = filters.type ?? "all";
  const currentBuilding = filters.building ?? "all";
  const currentKeyword = filters.keyword ?? "";

  const activeFilterCount = [
    currentDate !== "all",
    currentType !== "all",
    currentBuilding !== "all",
    currentKeyword !== "",
  ].filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const [isOpen, setIsOpen] = useState(hasActiveFilters);

  // キーワードはURLへ即座に反映せず、入力が止まってから遷移する（デバウンス）。
  // 入力自体はローカル状態で即時反映し、体感の遅延を無くす。
  const [keywordInput, setKeywordInput] = useState(currentKeyword);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // リセットや戻る/進むなど、外部からURLのkeywordが変わったときはローカル入力も合わせる
  useEffect(() => {
    setKeywordInput(currentKeyword);
  }, [currentKeyword]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /**
   * フィルター変更ハンドラー
   *
   * ページ番号は引き継ぎません（絞り込みを変えたら1ページ目へ戻す）。
   * "all" と空文字は `eventsHref` がクエリから落とします。
   */
  const handleFilterChange = (patch: Partial<FilterParams>) => {
    router.push(eventsHref({ ...filters, ...patch }));
  };

  /**
   * キーワード入力ハンドラー
   *
   * 入力のたびに `router.push` すると1文字ごとに履歴が汚染され、200件規模の
   * 再フィルタリングも都度走る。ここだけ `router.replace` + デバウンスにする。
   */
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setKeywordInput(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      router.replace(eventsHref({ ...filters, keyword: value }));
    }, KEYWORD_DEBOUNCE_MS);
  };

  /**
   * フィルターをリセット
   */
  const handleReset = () => {
    router.push("/events");
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 lg:p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="hidden text-lg font-bold text-gray-900 lg:block">絞り込み</h2>
        <button
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="event-filters-panel"
          className="flex items-center gap-2 text-lg font-bold text-gray-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 lg:hidden"
        >
          <span>絞り込み</span>
          {hasActiveFilters && (
            <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary-600 px-1.5 text-xs font-semibold text-white">
              {activeFilterCount}
            </span>
          )}
          <ChevronDown
            className={`h-5 w-5 text-gray-700 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            aria-hidden="true"
          />
        </button>
        <button
          onClick={handleReset}
          className="text-sm text-gray-900 underline hover:text-gray-900/80 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
          aria-label="フィルターをリセット"
        >
          リセット
        </button>
      </div>

      <div id="event-filters-panel" className={`space-y-6 lg:block ${isOpen ? "" : "hidden"}`}>
        {/* 日程フィルター */}
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
            開催日
          </legend>
          <div className="flex flex-wrap gap-2">
            {dateFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange({ date: option.value })}
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
        <fieldset className="m-0 min-w-0 border-0 p-0">
          <legend className="m-0 mb-2 block p-0 text-sm font-semibold text-gray-900/90">
            企画種別
          </legend>
          <div className="flex flex-wrap gap-2">
            {typeFilterOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleFilterChange({ type: option.value })}
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
            onChange={(e) => handleFilterChange({ building: e.target.value })}
            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm text-gray-900 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600"
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
            value={keywordInput}
            onChange={handleKeywordChange}
            className="w-full rounded-lg border border-gray-400 bg-white px-4 py-2 text-sm text-gray-900 placeholder-gray-600 focus:border-gray-600 focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600"
          />
        </div>
      </div>
    </div>
  );
}
