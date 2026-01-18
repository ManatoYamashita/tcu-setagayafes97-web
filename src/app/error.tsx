"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
      <p className="mb-8 text-gray-600">申し訳ございません。問題が発生しました。</p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-primary px-4 py-2 text-white hover:opacity-80"
      >
        再試行
      </button>
    </div>
  );
}
