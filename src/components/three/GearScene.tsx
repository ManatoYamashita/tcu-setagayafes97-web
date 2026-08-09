"use client";

import { Canvas } from "@react-three/fiber";
import { Gear } from "./Gear";
import { useMediaQuery } from "./use-media-query";

/**
 * R3F Canvas + 3点照明
 * 背景透過、dpr制限でパフォーマンス最適化
 *
 * モーション軽減設定時は `frameloop="demand"` にしてレンダーループ自体を止める。
 * 歯車は静止画として1回だけ描画され、GPU とバッテリーを消費し続けない。
 */
export default function GearScene() {
  const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 8.0], fov: 45 }}
      frameloop={prefersReducedMotion ? "demand" : "always"}
      /*
       * pointerEvents: "inherit" が必須。R3F の Canvas はルート div へ
       * インラインで pointer-events: auto を書く（eventSource 未指定時の既定）。
       * CSS 仕様上、祖先の pointer-events: none は子孫の auto で復活するため、
       * これを放置すると呼び出し側の Tailwind 指定（FeaturedEvents の
       * pointer-events-none / md:pointer-events-auto）が全ブレークポイントで
       * 無効になる。style は R3F 側の既定より後に spread されるので上書きできる。
       */
      style={{ width: "100%", height: "100%", pointerEvents: "inherit" }}
    >
      {/* メインライト（やや上方、強度下げ） */}
      <directionalLight position={[3, 5, 6]} intensity={0.95} color="#ffffff" />
      {/* フィルライト（左下、ラベンダー系） */}
      <directionalLight position={[-4, -1, 4]} intensity={0.5} color="#F0C8D8" />
      {/* バックライト（背面、紫寄り） */}
      <directionalLight position={[0, 0, -5]} intensity={0.3} color="#E0A0C0" />
      {/* 環境光（シャドウを柔らかく） */}
      <ambientLight intensity={0.55} />

      <Gear scale={1.15} />
    </Canvas>
  );
}
