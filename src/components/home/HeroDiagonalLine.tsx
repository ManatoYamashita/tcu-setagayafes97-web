"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * 斜め線アニメーション
 * 左上から右下へ45度の白い線がstroke-widthを広げながら出現する
 */
export function HeroDiagonalLine() {
  const containerRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<SVGLineElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const line = lineRef.current;
    if (!container || !line) return;

    const { width, height } = container.getBoundingClientRect();
    // 45度の対角線: 左上(0,0)から、コンテナ対角線長を斜辺とする終点
    const diagonal = Math.sqrt(width * width + height * height);
    const cos45 = Math.cos(Math.PI / 4);
    const sin45 = Math.sin(Math.PI / 4);

    line.setAttribute("x2", String(diagonal * cos45));
    line.setAttribute("y2", String(diagonal * sin45));

    gsap.fromTo(
      line,
      { attr: { "stroke-width": 0 } },
      {
        attr: { "stroke-width": 300 },
        duration: 0.6,
        ease: "power2.out",
      }
    );
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-[1] pointer-events-none"
      aria-hidden="true"
    >
      <svg className="w-full h-full overflow-visible">
        <line ref={lineRef} x1="0" y1="0" x2="0" y2="0" stroke="white" strokeWidth="0" />
      </svg>
    </div>
  );
}
