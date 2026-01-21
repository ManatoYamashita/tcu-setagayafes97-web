"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * 企画一覧ページのエラーページ
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">企画を探す</h1>
          <p className="text-center text-lg opacity-90">
            第97回 世田谷祭の企画を検索・閲覧できます
          </p>
        </div>
      </div>

      {/* エラーメッセージ */}
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
          <p className="mb-8 text-gray-600">
            企画一覧の読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={reset} variant="primary">
              再試行
            </Button>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-gray-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-gray-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
