import Link from "next/link";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * 企画詳細ページの404ページ
 *
 * エラーページ（`error.tsx`）と同じく `PageSheetLayout` の白いシートに載せる。
 * 以前の濃紫グラデーションの上では、本文が 3.4〜3.6:1、「404」の数字（primary-700）が
 * 1.75:1 しかなかった（#149。2026-09-23 に本番の画素で実測）。
 * スキップリンクの遷移先 `<main id="content">` は `PageSheetLayout` が出す。
 */
export default function EventDetailNotFound() {
  return (
    <PageSheetLayout hero={pageHeroes.events}>
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 text-6xl font-bold text-primary-700">404</div>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">企画が見つかりません</h2>
          <p className="mb-8 text-gray-700">
            お探しの企画は存在しないか、削除された可能性があります。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-[color,background-color,border-color,box-shadow] duration-200 hoverable:hover:bg-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
            >
              企画一覧へ戻る
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-6 py-3 text-base font-semibold text-gray-700 shadow-md transition-[color,background-color,border-color,box-shadow] duration-200 hoverable:hover:border-gray-400 hoverable:hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </PageSheetLayout>
  );
}
