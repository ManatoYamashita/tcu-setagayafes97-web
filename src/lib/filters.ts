import type { Event, EventDate, EventType } from "@/types/events";

/**
 * フィルターパラメータ型
 */
export interface FilterParams {
  date?: EventDate | "all";
  type?: EventType | "all";
  building?: string;
  keyword?: string;
}

/**
 * 1ページあたりの表示件数
 *
 * `EventsContent` のローカル定数でしたが、`src/app/events/page.tsx` が
 * <Suspense> の fallback 用に同じ区切りで1ページ目を切り出す必要があるため引き上げました。
 * 2箇所で別々に持つと、fallback と本描画で表示件数がずれます。
 */
export const EVENTS_PER_PAGE = 12;

/**
 * 絞り込み無しの状態
 *
 * クエリを持たない `/events` に相当します。`page.tsx` の fallback はこの状態を描きます。
 */
export const DEFAULT_EVENT_FILTERS: FilterParams = {
  date: "all",
  type: "all",
  building: "all",
  keyword: "",
};

/**
 * `URLSearchParams` の読み取りに必要な最小限の形
 *
 * `next/navigation` の `ReadonlyURLSearchParams` と `URLSearchParams` の両方が満たします。
 * このモジュールを Next.js に依存させないための構造的型で、ユニットテストからは
 * 素の `URLSearchParams` を渡せます。
 */
interface SearchParamsLike {
  get(name: string): string | null;
}

/**
 * URL のクエリからフィルターパラメータを組み立てる
 * @param params 読み取り元のクエリ
 * @returns 未指定の項目を既定値（"all" / 空文字）で埋めたフィルターパラメータ
 */
export function parseEventFilters(params: SearchParamsLike): FilterParams {
  return {
    date: (params.get("date") as EventDate | "all") || "all",
    type: (params.get("type") as EventType | "all") || "all",
    building: params.get("building") || "all",
    keyword: params.get("keyword") || "",
  };
}

/**
 * URL のクエリから現在のページ番号を取り出す
 * @param params 読み取り元のクエリ
 * @returns ページ番号。数値として読めない場合は 1
 *
 * 範囲の検証はしません。負値や範囲外は `paginateEvents` が空配列として扱います（#162）。
 */
export function parseEventPage(params: SearchParamsLike): number {
  return Number(params.get("page")) || 1;
}

/**
 * フィルターパラメータから URL のクエリ文字列を組み立てる
 * @param filters フィルターパラメータ
 * @param page ページ番号（1 のときは付けない）
 * @returns クエリ文字列。既定値だけなら空文字
 *
 * 既定値（"all" / 空文字 / page === 1）は落とします。`/events` の正規URLを
 * クエリ無しに保ち、`?date=all&type=all` のような同一内容の別URLを作らないためです。
 *
 * **現在URLの未知パラメータは引き継ぎません。** 以前は `searchParams.toString()` を
 * 起点にしていましたが、`/events` が読むパラメータは date / type / building / keyword / page の
 * 5つだけであり（`parseEventFilters` と `parseEventPage` が読む全て）、props から組み直しても
 * 等価です。この形にしたのは、`EventFilters` と `Pagination` から `useSearchParams()` を
 * 外すためです（理由は `EventsView` のコメントを参照）。
 */
export function buildEventsQuery(filters: FilterParams, page = 1): string {
  const params = new URLSearchParams();

  if (filters.date && filters.date !== "all") params.set("date", filters.date);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.building && filters.building !== "all") params.set("building", filters.building);
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

/**
 * フィルターパラメータから `/events` の URL を組み立てる
 * @param filters フィルターパラメータ
 * @param page ページ番号（1 のときは付けない）
 * @returns 例: `/events?type=stage`。既定値だけなら `/events`
 */
export function eventsHref(filters: FilterParams, page = 1): string {
  const query = buildEventsQuery(filters, page);
  return query ? `/events?${query}` : "/events";
}

/**
 * 企画をフィルタリング
 * @param events 企画の配列
 * @param filters フィルターパラメータ
 * @returns フィルタリングされた企画の配列
 */
export function filterEvents(events: Event[], filters: FilterParams): Event[] {
  let filtered = events;

  // 日程フィルター
  if (filters.date && filters.date !== "all") {
    filtered = filtered.filter((e) => e.date === filters.date);
  }

  // 企画種別フィルター
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((e) => e.type === filters.type);
  }

  // 建物フィルター
  if (filters.building && filters.building !== "all") {
    filtered = filtered.filter((e) => e.building === filters.building);
  }

  // キーワード検索
  if (filters.keyword) {
    const keyword = filters.keyword.toLowerCase();
    filtered = filtered.filter(
      (e) =>
        e.title.toLowerCase().includes(keyword) ||
        e.organizer.toLowerCase().includes(keyword) ||
        e.description.toLowerCase().includes(keyword) ||
        e.place.toLowerCase().includes(keyword) ||
        e.building.toLowerCase().includes(keyword)
    );
  }

  return filtered;
}

/**
 * ページネーション処理
 * @param events 企画の配列
 * @param page 現在のページ番号（1から開始）
 * @param perPage 1ページあたりの表示件数
 * @returns ページネーションされた企画の配列。存在しないページなら空配列
 *
 * **1未満のページを弾くこと。** `page` は URL のクエリから検証なしに入ります
 * （`parseEventPage` の `Number(params.get("page")) || 1`。`-1` は truthy なので
 * `|| 1` を素通りします）。始点が負のまま `slice()` へ渡すと末尾からの相対位置として
 * 解釈され、**空でも1ページ目でもない「別のページ」が返ります**（#162）。
 *
 * 範囲外を空にするのは、`page > 総ページ数` が既にそうなっているのと揃えるためです。
 */
export function paginateEvents(events: Event[], page: number, perPage: number): Event[] {
  // 小数は切り捨てる。?page=1.5 が slice(6, 18) という半端な窓を返さないように
  const safePage = Math.floor(page);
  if (safePage < 1) return [];

  const startIndex = (safePage - 1) * perPage;
  const endIndex = startIndex + perPage;
  return events.slice(startIndex, endIndex);
}

/**
 * 総ページ数を計算
 * @param totalCount 総件数
 * @param perPage 1ページあたりの表示件数
 * @returns 総ページ数
 */
export function getTotalPages(totalCount: number, perPage: number): number {
  return Math.ceil(totalCount / perPage);
}

/**
 * ページ番号の配列を生成（最大7個表示）
 * @param currentPage 現在のページ番号
 * @param totalPages 総ページ数
 * @returns 表示するページ番号の配列
 */
export function generatePageNumbers(currentPage: number, totalPages: number): number[] {
  const maxPages = 7;

  if (totalPages <= maxPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: number[] = [];
  const leftOffset = Math.floor(maxPages / 2);
  const rightOffset = maxPages - leftOffset - 1;

  let startPage = Math.max(1, currentPage - leftOffset);
  let endPage = Math.min(totalPages, currentPage + rightOffset);

  if (currentPage - leftOffset <= 0) {
    endPage = Math.min(totalPages, endPage + (leftOffset - currentPage + 1));
  }

  if (currentPage + rightOffset > totalPages) {
    startPage = Math.max(1, startPage - (currentPage + rightOffset - totalPages));
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return pages;
}
