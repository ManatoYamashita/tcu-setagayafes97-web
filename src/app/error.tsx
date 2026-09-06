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
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24">
      <h2 className="mb-4 text-2xl font-bold">エラーが発生しました</h2>
      <p className="mb-8 text-gray-900/80">
        ページの読み込みに失敗しました。しばらく経ってから再度お試しください。
      </p>
      <button
        onClick={() => reset()}
        className="rounded-md bg-white px-4 py-2 text-primary hover:opacity-80"
      >
        再試行
      </button>
    </div>
  );
}
