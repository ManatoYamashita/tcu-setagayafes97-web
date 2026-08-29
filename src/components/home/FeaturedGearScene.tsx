"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
 * loading fallback は置かない。
 *
 * この歯車は `aria-hidden` の背景装飾であり、読み込み中であることを利用者へ伝える必要がない。
 * 以前はスピナー（`animate-spin`）を出していたが、globals.css のモーション軽減ブロックが
 * `animate-spin` を対象にしていないため、モーション軽減設定でも装飾のために回り続けていた。
 * `GearScene` 側の `frameloop="demand"` はチャンクのロード後にしか効かず、その手前を守れない。
 *
 * クライアントチャンクは 860K（brotli 185K）で全チャンク中最大のため、低速回線では
 * fallback が数秒表示される。何も出さないのが装飾として正しい。
 */
const GearScene = dynamic(() => import("@/components/three/GearScene"), {
  ssr: false,
  loading: () => null,
});

export function FeaturedGearScene() {
  // モバイルでは歯車は装飾で、チルト操作も無効にしている。
  // ここで描画を止めることで、R3F/Three.js の大きなチャンクを
  // モバイルの初期ロードへ含めない。
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");
    const sync = () => setIsDesktop(mediaQuery.matches);

    sync();
    mediaQuery.addEventListener("change", sync);
    return () => mediaQuery.removeEventListener("change", sync);
  }, []);

  if (!isDesktop) {
    return null;
  }

  return (
    <div className="w-full h-full">
      <GearScene />
    </div>
  );
}
