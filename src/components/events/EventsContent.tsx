"use client";

import { useSearchParams } from "next/navigation";
import type { Event } from "@/types/events";
import {
  filterEvents,
  listBuildingOptions,
  parseEventFilters,
  parseEventPage,
  resolveVisibleCount,
  EVENTS_PER_PAGE,
} from "@/lib/filters";
import { EventsView } from "./EventsView";

interface EventsContentProps {
  initialEvents: Event[];
}

/**
 * 企画一覧コンテンツ
 * クライアントサイドで絞り込みを行い、一覧は無限スクロールで継ぎ足す
 *
 * **このアプリで `/events` のクエリを読むのはここだけです。** `useSearchParams()` は
 * 静的レンダリング時に「最も近い `<Suspense>` 境界より内側」をクライアント描画へ落とします。
 * 読む場所を増やすと落ちる範囲が広がるため、下位（`EventFilters` / `EventInfiniteList`）へは
 * 値を props で渡します。境界は `src/app/events/(list)/page.tsx` にあります（#156）。
 */
export function EventsContent({ initialEvents }: EventsContentProps) {
  const searchParams = useSearchParams();

  // URL Search Params からフィルター情報を取得
  const filters = parseEventFilters(searchParams);
  const currentPage = parseEventPage(searchParams);

  // 建物の選択肢。全企画から導出するので、絞り込み後の配列からは作れない。
  //
  // **選択中の建物を渡せるのはここだけ。** page.tsx は useSearchParams() を読まないため
  // 選択値を知らず、そちらで作った配列を降ろすと listBuildingOptions() の selected が
  // production から一度も渡らない。該当0件の建物（?building=7号館 など）を指定されたとき、
  // <select> の value が選択肢に無い状態＝ selectedIndex = -1 になり、絞り込みが
  // 効いていないように見える。
  const buildingOptions = listBuildingOptions(initialEvents, filters.building);

  // フィルタリング
  const filteredEvents = filterEvents(initialEvents, filters);

  /*
   * ページ分割はしない。絞り込み後の全件をそのまま降ろし、表示範囲は
   * EventInfiniteList が自分の state で決める（#239）。
   *
   * `?page=N` は「N ページ目だけを見せる」ではなく「N ページ分を展開した状態で着地する」
   * という意味になった。ページ分割の時代に配られたURLとブラウザバックを壊さないための
   * 後方互換で、負値や範囲外の丸めは resolveVisibleCount が引き受ける。
   */
  return (
    <EventsView
      events={filteredEvents}
      filters={filters}
      buildingOptions={buildingOptions}
      initialVisibleCount={resolveVisibleCount(currentPage, EVENTS_PER_PAGE, filteredEvents.length)}
      step={EVENTS_PER_PAGE}
    />
  );
}
