"use client";

import { useState, useEffect } from "react";

/**
 * 起動アニメーションコンポーネント
 * 初回訪問時のみWebM動画を再生
 */
export function StartupAnimation() {
  // 起動アニメーションは動画ファイルが用意されるまで無効化
  const isEnabled = false;
  const [show, setShow] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // sessionStorage のアクセスを try-catch で囲む
    try {
      const hasVisited = sessionStorage.getItem("setagayafes97_visited");

      if (!hasVisited && isEnabled) {
        setShow(true);
        sessionStorage.setItem("setagayafes97_visited", "true");
      }
    } catch (error) {
      // sessionStorage が使えない環境ではスキップ
      console.warn("SessionStorage not available:", error);
    }
  }, []);

  /**
   * アニメーション終了ハンドラー
   * フェードアウト後にコンポーネントを非表示
   */
  const handleAnimationEnd = () => {
    setFadeOut(true);
    // フェードアウトアニメーション完了後に非表示
    setTimeout(() => {
      setShow(false);
    }, 500);
  };

  /**
   * エラーハンドラー
   * 動画読み込みエラー時は即座に非表示
   */
  const handleError = () => {
    console.warn("Startup animation video failed to load");
    setShow(false);
  };

  // 表示しない場合は何も表示しない
  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 動画 */}
      <video
        src="/videos/startup.webm"
        autoPlay
        muted
        playsInline
        onEnded={handleAnimationEnd}
        onError={handleError}
        className="max-h-screen max-w-full"
      />

      {/* スキップボタン（5秒後に表示） */}
      <button
        onClick={handleAnimationEnd}
        className="absolute bottom-8 right-8 rounded-lg bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/30"
        aria-label="アニメーションをスキップ"
      >
        スキップ
      </button>
    </div>
  );
}
