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
        e.description.toLowerCase().includes(keyword)
    );
  }

  return filtered;
}

/**
 * ページネーション処理
 * @param events 企画の配列
 * @param page 現在のページ番号（1から開始）
 * @param perPage 1ページあたりの表示件数
 * @returns ページネーションされた企画の配列
 */
export function paginateEvents(events: Event[], page: number, perPage: number): Event[] {
  const startIndex = (page - 1) * perPage;
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
