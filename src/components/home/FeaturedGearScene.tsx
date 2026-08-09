"use client";

import dynamic from "next/dynamic";

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
  return (
    <div className="w-full h-full">
      <GearScene />
    </div>
  );
}
