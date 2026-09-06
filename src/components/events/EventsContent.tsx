"use client";

import { useSearchParams } from "next/navigation";
import type { Event } from "@/types/events";
import type { BuildingFilterOption } from "@/data/filter-options";
import {
  filterEvents,
  paginateEvents,
  getTotalPages,
  parseEventFilters,
  parseEventPage,
  EVENTS_PER_PAGE,
} from "@/lib/filters";
import { EventsView } from "./EventsView";

interface EventsContentProps {
  initialEvents: Event[];
  /**
   * 建物の選択肢
   *
   * ここで `listBuildingOptions()` を呼び直さず、`page.tsx` が作ったものを受け取ります。
   * 同じ値を2箇所で別々に作ると、fallback と本描画でセレクトの中身がずれます。
   */
  buildingOptions: BuildingFilterOption[];
}

/**
 * 企画一覧コンテンツ
 * クライアントサイドでフィルタリング・ページネーション処理
 *
 * **このアプリで `/events` のクエリを読むのはここだけです。** `useSearchParams()` は
 * 静的レンダリング時に「最も近い `<Suspense>` 境界より内側」をクライアント描画へ落とします。
 * 読む場所を増やすと落ちる範囲が広がるため、下位（`EventFilters` / `Pagination`）へは
 * 値を props で渡します。境界は `src/app/events/page.tsx` にあります（#156）。
 */
export function EventsContent({ initialEvents, buildingOptions }: EventsContentProps) {
  const searchParams = useSearchParams();

  // URL Search Params からフィルター情報を取得
  const filters = parseEventFilters(searchParams);
  const currentPage = parseEventPage(searchParams);

  // フィルタリング
  const filteredEvents = filterEvents(initialEvents, filters);

  // ページネーション
  const totalPages = getTotalPages(filteredEvents.length, EVENTS_PER_PAGE);
  const paginatedEvents = paginateEvents(filteredEvents, currentPage, EVENTS_PER_PAGE);

  return (
    <EventsView
      events={paginatedEvents}
      filters={filters}
      buildingOptions={buildingOptions}
      totalCount={filteredEvents.length}
      currentPage={currentPage}
      totalPages={totalPages}
    />
  );
}
