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

  /*
   * スキップリンク（Header）の遷移先。Header は全ルートで描画されるため、この画面にも
   * 「本文へスキップ」が出る。main を出さないと押しても遷移先が無く、次の Tab が
   * ヘッダー先頭へ戻ってしまう（docs/frontend/landmarks-and-skip-link.md）。
   */
  return (
    <main
      id="content"
      tabIndex={-1}
      className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4 py-24 focus-visible:outline-none"
    >
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
    </main>
  );
}
