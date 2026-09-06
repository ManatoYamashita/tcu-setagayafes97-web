import type { Event } from "@/types/events";
import type { FilterParams } from "@/lib/filters";
import type { BuildingFilterOption } from "@/data/filter-options";
import { EventGrid } from "./EventGrid";
import { EventFilters } from "./EventFilters";
import { Pagination } from "./Pagination";

interface EventsViewProps {
  /** 表示するページ分の企画（フィルタリング・ページネーション適用後） */
  events: Event[];
  /** 現在のフィルター。EventFilters と Pagination が遷移先URLの組み立てに使う */
  filters: FilterParams;
  /**
   * 建物の選択肢
   *
   * 全企画から導出するため、ページ分割後の `events` からは作れません。
   * `src/app/events/page.tsx` が `listBuildingOptions()` で1回だけ作って降ろします。
   */
  buildingOptions: BuildingFilterOption[];
  /** フィルタリング後の総件数（「N 件の企画が見つかりました」の N） */
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

/**
 * 企画一覧の表示ツリー
 *
 * **`useSearchParams()` に依存させないこと。** これは意図的な制約です。
 *
 * このツリーは `src/app/events/page.tsx` の `<Suspense>` の fallback としても描かれます。
 * fallback は「境界がクライアント描画へ落ちたときに静的HTMLへ出力されるもの」であり、
 * その中で `useSearchParams()` を呼ぶと fallback 自身が bailout して落ちる先を失います。
 * クエリを読むのは `EventsContent` の1箇所だけに保ってください。
 *
 * 背景と実測は docs/frontend/static-html-and-search-params.md を参照。
 */
export function EventsView({
  events,
  filters,
  buildingOptions,
  totalCount,
  currentPage,
  totalPages,
}: EventsViewProps) {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* サイドバー: フィルター */}
        <aside className="mb-8 lg:mb-0">
          <EventFilters filters={filters} buildingOptions={buildingOptions} />
        </aside>

        {/* メインコンテンツ */}
        <main>
          {/* 検索結果件数 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-700" role="status" aria-live="polite">
              <span className="font-semibold text-gray-900">{totalCount}</span>{" "}
              件の企画が見つかりました
            </p>
          </div>

          {/* 企画グリッド */}
          <EventGrid events={events} />

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination filters={filters} currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
