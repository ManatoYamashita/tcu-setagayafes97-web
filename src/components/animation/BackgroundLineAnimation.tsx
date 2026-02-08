"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * 背景ラインアニメーション
 * ページ読み込みごとに、紫背景に白い45度ラインが0→画面全体に広がるアニメーションを表示
 */
export function BackgroundLineAnimation() {
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    if (lineRef.current) {
      const timeline = gsap.timeline({ delay: 0.3 });

      timeline.fromTo(
        lineRef.current,
        {
          strokeDasharray: 2000,
          strokeDashoffset: 2000,
        },
        {
          strokeDashoffset: 0,
          duration: 1.5,
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
          y1="100"
          x2="100"
          y2="0"
          stroke="white"
          strokeWidth="48"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
    </div>
  );
}
