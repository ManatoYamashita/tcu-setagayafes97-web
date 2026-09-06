"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * 企画一覧ページのエラーページ
 *
 * 本体（`page.tsx`）と同じ `PageSheetLayout` を使う。以前は濃紫グラデーションの
 * ヘッダーを個別に手書きしており、本体の白いシートへ切り替わる瞬間に見た目が
 * 飛んでいた上、その濃色背景に text-gray-900 を直置きしていたためコントラストも
 * 不足していた。白いシートへ揃えることでどちらも解消する。
 */
export default function EventsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EventsError]", error);
  }, [error]);

  return (
    <PageSheetLayout hero={pageHeroes.events}>
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <svg
            className="mx-auto mb-6 h-16 w-16 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h2 className="mb-4 text-2xl font-bold text-gray-900">エラーが発生しました</h2>
          <p className="mb-8 text-gray-700">
            企画一覧の読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              onClick={reset}
              variant="primary"
              className="bg-primary-600 text-white hoverable:hover:bg-primary-700"
            >
              再試行
            </Button>
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
