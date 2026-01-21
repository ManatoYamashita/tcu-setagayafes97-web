"use client";

import { useSearchParams } from "next/navigation";
import type { Event, EventDate, EventType } from "@/types/events";
import { filterEvents, paginateEvents, getTotalPages, type FilterParams } from "@/lib/filters";
import { EventGrid } from "./EventGrid";
import { EventFilters } from "./EventFilters";
import { Pagination } from "./Pagination";

interface EventsContentProps {
  initialEvents: Event[];
}

const EVENTS_PER_PAGE = 12;

/**
 * 企画一覧コンテンツ
 * クライアントサイドでフィルタリング・ページネーション処理
 */
export function EventsContent({ initialEvents }: EventsContentProps) {
  const searchParams = useSearchParams();

  // URL Search Params からフィルター情報を取得
  const filters: FilterParams = {
    date: (searchParams.get("date") as EventDate | "all") || "all",
    type: (searchParams.get("type") as EventType | "all") || "all",
    building: searchParams.get("building") || "all",
    keyword: searchParams.get("keyword") || "",
  };

  const currentPage = Number(searchParams.get("page")) || 1;

  // フィルタリング
  const filteredEvents = filterEvents(initialEvents, filters);

  // ページネーション
  const totalPages = getTotalPages(filteredEvents.length, EVENTS_PER_PAGE);
  const paginatedEvents = paginateEvents(filteredEvents, currentPage, EVENTS_PER_PAGE);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/* サイドバー: フィルター */}
        <aside className="mb-8 lg:mb-0">
          <EventFilters />
        </aside>

        {/* メインコンテンツ */}
        <main>
          {/* 検索結果件数 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{filteredEvents.length}</span>{" "}
              件の企画が見つかりました
            </p>
          </div>

          {/* 企画グリッド */}
          <EventGrid events={paginatedEvents} />

          {/* ページネーション */}
          {totalPages > 1 && (
            <div className="mt-12">
              <Pagination currentPage={currentPage} totalPages={totalPages} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
