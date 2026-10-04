"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useSheetDialog } from "@/components/ui/useSheetDialog";
import type { FilterParams } from "@/lib/filters";
import type { BuildingFilterOption } from "@/data/filter-options";
import { EventFilterFields } from "./EventFilterFields";

interface EventFilterSheetProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterParams;
  buildingOptions: BuildingFilterOption[];
  onChange: (patch: Partial<FilterParams>) => void;
  /** 開催日・種別・建物だけを既定へ戻す。キーワードはシートの外（検索バー）が持つ */
  onClear: () => void;
  /** 開催日・種別・建物のうち、選択中の項目数。0 ならクリアを無効にする */
  activeCount: number;
  /** 現在の絞り込み結果の件数。閉じるボタンに出す */
  resultCount: number;
  /** 意味検索の応答待ち。件数が確定していないので数字を出さない */
  isSearching: boolean;
}

/** lg（64rem）。`globals.css` の `.events-filter-sheet` が lg 以上で消える境界と揃える */
const DESKTOP_QUERY = "(min-width: 64rem)";

/**
 * lg 未満で開催日・種別・建物を選ぶボトムシート
 *
 * 選択は開いたまま即時に URL へ反映され、背後の一覧と閉じるボタンの件数が追従します。
 * 下書きを持たないのは、選んだ結果の件数をその場で見せて「0件になる組み合わせ」を
 * 閉じる前に気づけるようにするためです。
 *
 * 開閉の状態は URL に持ちません（`EventFilters` のローカル state）。
 *
 * 設計は docs/frontend/events-filter-sheet.md を参照。
 */
export function EventFilterSheet({
  isOpen,
  onClose,
  filters,
  buildingOptions,
  onChange,
  onClear,
  activeCount,
  resultCount,
  isSearching,
}: EventFilterSheetProps) {
  const { dialogRef, handleClick } = useSheetDialog({ isOpen, onClose });

  /*
    開いたまま lg へ広げると、シートは CSS で消えるが showModal() の inert は残り、
    サイドバーも一覧も操作できなくなる。境界を越えた時点で閉じる。
  */
  useEffect(() => {
    if (!isOpen) return;
    const query = window.matchMedia(DESKTOP_QUERY);
    if (query.matches) {
      onClose();
      return;
    }
    const onQueryChange = (e: MediaQueryListEvent) => {
      if (e.matches) onClose();
    };
    query.addEventListener("change", onQueryChange);
    return () => query.removeEventListener("change", onQueryChange);
  }, [isOpen, onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="events-filter-sheet"
      aria-labelledby="events-filter-sheet-title"
      onClick={handleClick}
    >
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2">
          <h2 id="events-filter-sheet-title" className="text-lg font-bold text-gray-900">
            絞り込み
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="閉じる"
            className="-me-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors hoverable:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
          <EventFilterFields
            filters={filters}
            buildingOptions={buildingOptions}
            onChange={onChange}
          />
        </div>

        <div className="flex shrink-0 items-center gap-3 border-t border-gray-200 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={onClear}
            disabled={activeCount === 0}
            className="h-11 shrink-0 rounded-lg px-3 text-sm font-medium text-gray-900 underline transition-colors disabled:text-gray-500 disabled:no-underline hoverable:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            クリア
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 rounded-lg bg-primary-600 px-4 text-sm font-bold text-white transition-colors hoverable:hover:bg-primary-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {isSearching ? (
              "結果を表示"
            ) : (
              <>
                <span className="tabular-nums">{resultCount}</span> 件の企画を表示
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
}
