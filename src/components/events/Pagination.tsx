"use client";

import { useRouter } from "next/navigation";
import { eventsHref, generatePageNumbers, type FilterParams } from "@/lib/filters";

interface PaginationProps {
  /** 現在のフィルター。ページを移動しても絞り込みを保つために要る */
  filters: FilterParams;
  currentPage: number;
  totalPages: number;
}

/**
 * ページネーションコンポーネント
 * URL Search Params で状態管理
 *
 * **現在のクエリは `useSearchParams()` ではなく props で受け取ります。** 理由は
 * `EventFilters` と同じで、`<Suspense>` の fallback に描かれても bailout しないためです（#156）。
 */
export function Pagination({ filters, currentPage, totalPages }: PaginationProps) {
  const router = useRouter();

  /**
   * ページ変更ハンドラー
   *
   * `page === 1` はクエリから落ちる（`eventsHref` の仕様）。
   */
  const handlePageChange = (page: number) => {
    router.push(eventsHref(filters, page));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ページが1ページしかない場合は表示しない
  if (totalPages <= 1) {
    return null;
  }

  const pageNumbers = generatePageNumbers(currentPage, totalPages);

  return (
    <nav className="flex items-center justify-center gap-2" aria-label="ページネーション">
      {/* 前へボタン */}
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition-all hoverable:hover:border-gray-400 hoverable:hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-gray-50"
        aria-label="前のページへ"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* ページ番号ボタン */}
      {pageNumbers.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => handlePageChange(pageNum)}
          className={`flex h-10 min-w-[2.5rem] items-center justify-center rounded-lg border px-3 font-medium transition-all focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
            currentPage === pageNum
              ? "border-primary-600 bg-primary-600 text-white"
              : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
          }`}
          aria-current={currentPage === pageNum ? "page" : undefined}
          aria-label={`ページ ${pageNum}`}
        >
          {pageNum}
        </button>
      ))}

      {/* 次へボタン */}
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-gray-50 text-gray-700 transition-all hoverable:hover:border-gray-400 hoverable:hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-gray-200 disabled:hover:bg-gray-50"
        aria-label="次のページへ"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
