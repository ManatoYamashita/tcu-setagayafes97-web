"use client";

import { useRef, useEffect } from "react";
import Image from "next/image";
import gsap from "gsap";

/**
 * ヒーローセクション
 * - 薄紫背景 + 紙質感ノイズテクスチャ
 * - 左右カラフルギアボーダー（プレースホルダー）
 * - 中央ギアエンブレム + テキスト
 * - GSAPアニメーション
 */
export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion) {
        // アニメーション削減モード: 即座に最終状態へ
        gsap.set(".hero-gear-left, .hero-gear-right", { opacity: 1, x: 0 });
        gsap.set(".hero-emblem", { opacity: 1, scale: 1 });
        gsap.set(".hero-number", { opacity: 1, y: 0 });
        gsap.set(".hero-title", { opacity: 1, y: 0 });
        gsap.set(".hero-subtitle", { opacity: 1, y: 0 });
        return;
      }

      // 初期状態
      gsap.set(".hero-gear-left", { opacity: 0, x: -80 });
      gsap.set(".hero-gear-right", { opacity: 0, x: 80 });
      gsap.set(".hero-emblem", { opacity: 0, scale: 0.85 });
      gsap.set(".hero-number", { opacity: 0, y: 20 });
      gsap.set(".hero-title", { opacity: 0, y: 30 });
      gsap.set(".hero-subtitle", { opacity: 0, y: 20 });

      const tl = gsap.timeline({ delay: 0.2 });

      // 左右ギアボーダーがスライドイン
      tl.to(".hero-gear-left", { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 0);
      tl.to(".hero-gear-right", { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, 0);

      // エンブレムがフェードイン + スケール
      tl.to(".hero-emblem", { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.4)" }, 0.2);

      // 「第97回」テキスト
      tl.to(".hero-number", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.4);

      // 「世田谷祭」テキスト
      tl.to(".hero-title", { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }, 0.55);

      // サブテキスト
      tl.to(".hero-subtitle", { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.7);
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="hero-noise relative w-full min-h-[calc(100dvh-var(--header-height))] overflow-hidden flex items-center justify-center bg-page-bg"
    >
      {/* 左ギアボーダー（プレースホルダー） */}
      <div
        className="hero-gear-left absolute left-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 lg:w-32 z-10"
        aria-hidden="true"
      >
        <GearBorder side="left" />
      </div>

      {/* 右ギアボーダー（プレースホルダー） */}
      <div
        className="hero-gear-right absolute right-0 top-0 bottom-0 w-12 sm:w-16 md:w-24 lg:w-32 z-10"
        aria-hidden="true"
      >
        <GearBorder side="right" />
      </div>

      {/* 背景の薄いギア装飾 */}
      <BackgroundGears />

      {/* 中央コンテンツ */}
      <div className="relative z-20 flex flex-col items-center text-center px-4">
        {/* ギアエンブレム */}
        <div
          className="hero-emblem mb-6 md:mb-8"
          role="img"
          aria-label="第97回 世田谷祭 エンブレム"
        >
          <Image
            src="/brands/icon-blue-outline.svg"
            alt=""
            width={140}
            height={198}
            className="w-[140px] sm:w-[160px] md:w-[200px] lg:w-[260px] h-auto opacity-40"
            style={{
              filter:
                "brightness(0) saturate(100%) invert(40%) sepia(30%) saturate(1500%) hue-rotate(230deg) brightness(90%)",
            }}
            priority
          />
        </div>

        {/* 「第97回」テキスト */}
        <p
          className="hero-number font-bold text-2xl sm:text-3xl md:text-4xl mb-2 md:mb-3 hero-text-shadow-sm tracking-wider"
          style={{ color: "oklch(92% 0.08 90deg)" }}
        >
          第97回
        </p>

        {/* 「世田谷祭」テキスト */}
        <h1
          className="hero-title font-display font-bold text-5xl sm:text-6xl md:text-7xl lg:text-8xl hero-text-shadow leading-tight"
          style={{
            color: "oklch(92% 0.08 90deg)",
            fontFamily: "var(--font-kaisei-opti), serif",
          }}
        >
          世田谷祭
        </h1>

        {/* サブテキスト */}
        <p
          className="hero-subtitle mt-4 md:mt-6 text-sm sm:text-base md:text-lg tracking-[0.2em] font-medium"
          style={{ color: "oklch(85% 0.06 314deg)" }}
        >
          TOKYO CITY UNIVERSITY SETAGAYA FESTIVAL
        </p>
      </div>
    </section>
  );
}

/**
 * 左右のカラフルギアボーダー（プレースホルダー）
 * 画像が提供されたら差し替え可能
 */
function GearBorder({ side }: { side: "left" | "right" }) {
  // 虹色グラデーションのカラフルな丸い要素を縦に並べる
  const colors = [
    "oklch(70% 0.2 350deg)", // ピンク
    "oklch(65% 0.2 25deg)", // 赤
    "oklch(75% 0.18 60deg)", // オレンジ
    "oklch(85% 0.18 95deg)", // 黄
    "oklch(75% 0.18 145deg)", // 緑
    "oklch(65% 0.15 240deg)", // 青
    "oklch(65% 0.18 300deg)", // 紫
  ];

  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-1 sm:gap-1.5 md:gap-2 py-4">
      {Array.from({ length: 14 }).map((_, i) => {
        const color = colors[i % colors.length];
        const isGearTooth = i % 2 === 0;
        return (
          <div
            key={i}
            className="flex-shrink-0 rounded-full transition-all"
            style={{
              backgroundColor: color,
              width: isGearTooth ? "100%" : "70%",
              height: isGearTooth ? "clamp(16px, 4vw, 48px)" : "clamp(10px, 2.5vw, 28px)",
              opacity: 0.7,
              transform:
                side === "right" && !isGearTooth
                  ? "translateX(-15%)"
                  : side === "left" && !isGearTooth
                    ? "translateX(15%)"
                    : "none",
            }}
          />
        );
      })}
    </div>
  );
}

/**
 * 背景の薄いギア装飾（opacity低）
 */
function BackgroundGears() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* 大きなギア要素 - 左上 */}
      <div
        className="absolute -left-20 -top-20 w-80 h-80 rounded-full border-[8px] opacity-[0.06]"
        style={{ borderColor: "oklch(60% 0.14 314deg)" }}
      />
      {/* 中程度のギア要素 - 右下 */}
      <div
        className="absolute -right-16 -bottom-16 w-64 h-64 rounded-full border-[6px] opacity-[0.05]"
        style={{ borderColor: "oklch(60% 0.14 314deg)" }}
      />
      {/* 小さなギア要素 - 中央上 */}
      <div
        className="absolute left-1/3 top-1/4 w-32 h-32 rounded-full border-[4px] opacity-[0.04]"
        style={{ borderColor: "oklch(60% 0.14 314deg)" }}
      />
    </div>
  );
}
