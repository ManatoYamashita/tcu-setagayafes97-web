"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * 背景ラインアニメーション
 * ページ読み込みごとに、紫背景に白いラインが太さ0→200pxに拡大するアニメーションを表示
 * 角度: 左上→右下（-45度）
 */
export function BackgroundLineAnimation() {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (lineRef.current) {
      const timeline = gsap.timeline({ delay: 0.2 });

      timeline.fromTo(
        lineRef.current,
        {
          strokeWidth: 0,
        },
        {
          strokeWidth: 600,
          duration: 0.8,
          ease: "power2.out",
        }
      );
    }
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="absolute inset-0 bg-primary" />

      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        viewBox="0 0 100 100"
      >
        <line
          ref={lineRef}
          x1="0"
          y1="0"
          x2="100"
          y2="100"
          stroke="white"
          strokeWidth="0"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
