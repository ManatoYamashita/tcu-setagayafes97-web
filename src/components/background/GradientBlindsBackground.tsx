"use client";

import dynamic from "next/dynamic";

const GradientBlinds = dynamic(
  () => import("@/components/background/GradientBlinds").then((mod) => mod.GradientBlinds),
  { ssr: false }
);

/**
 * GradientBlinds の背景ラッパー
 * SSR をスキップし、クライアントサイドのみで WebGL を描画する
 */
export function GradientBlindsBackground() {
  return (
    <div className="absolute inset-0 z-0">
      <GradientBlinds
        gradientColors={["#1a0a2e", "#CD79EE", "#5227FF"]}
        angle={25}
        noise={0.3}
        blindCount={16}
        blindMinWidth={60}
        spotlightRadius={0.5}
        spotlightSoftness={1}
        spotlightOpacity={1}
        mouseDampening={0.15}
        shineDirection="left"
        mixBlendMode="lighten"
      />
    </div>
  );
}
