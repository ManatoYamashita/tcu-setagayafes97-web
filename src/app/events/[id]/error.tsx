"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

/**
 * 企画詳細ページのエラーページ
 */
export default function EventDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EventDetailError]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* パンくずリスト */}
      <nav className="border-b border-gray-200 bg-white py-4">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-primary hover:underline">
                トップ
              </a>
            </li>
            <li>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <a href="/events" className="hover:text-primary hover:underline">
                企画を探す
              </a>
            </li>
          </ol>
        </div>
      </nav>

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
            企画詳細の読み込み中にエラーが発生しました。しばらく経ってから再度お試しください。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Button onClick={reset} variant="primary">
              再試行
            </Button>
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-gray-600 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-gray-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              企画一覧へ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
