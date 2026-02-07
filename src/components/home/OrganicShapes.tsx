"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export interface OrganicShapesProps {
  className?: string;
}

export function OrganicShapes({ className = "" }: OrganicShapesProps) {
  const shapeRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (!isDesktop) return;

    const ctx = gsap.context(() => {
      if (shapeRef.current) {
        // 微細な呼吸感アニメーション
        gsap.to(shapeRef.current, {
          scale: 1.02,
          duration: 6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          transformOrigin: "center center",
        });
      }
    });

    return () => ctx.revert();
  }, []);

  return (
    <svg
      className={`absolute inset-0 h-full w-full ${className}`}
      viewBox="0 0 1920 1080"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="purpleGradientMain" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#CD79EE" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#B967E0" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#9B4ECC" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* 左側40-50%を覆う大型有機的シェイプ */}
      <path
        ref={shapeRef}
        d="M-100,0
           Q100,150 200,200
           T400,350
           Q550,450 600,600
           T700,850
           Q650,950 600,1080
           L0,1080
           L0,0 Z"
        fill="url(#purpleGradientMain)"
        opacity="0.9"
      />
    </svg>
  );
}
