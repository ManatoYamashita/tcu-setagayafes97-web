"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { aboutConfig } from "@/data/about";

/**
 * About ページ ヒーローセクション — ミニマルデザイン
 *
 * - 100svh フルビューポート、オフホワイト背景
 * - 中央にブランドカラー（primary）の水平バンド
 * - 右下にページタイトル + スクロールインジケーター
 * - GSAP エントランスアニメーション（Opener 連携対応）
 */
export function AboutHero() {
  const { title, description, scrollIndicator } = aboutConfig.hero;

  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    const hasOpener = !!document.querySelector(".opener-container");

    const runEntrance = () => {
      if (!sectionRef.current || ctxRef.current) return;

      const ctx = gsap.context(() => {
        // 中央ライン: scaleX 0 → 1
        if (lineRef.current) {
          gsap.set(lineRef.current, { scaleX: 0 });
          gsap.to(lineRef.current, {
            scaleX: 1,
            duration: 0.8,
            ease: "power3.inOut",
          });
        }

        // タイトル・description: フェードイン + 上昇
        const textTargets = [descRef.current, titleRef.current].filter(Boolean) as HTMLElement[];
        gsap.set(textTargets, { opacity: 0, y: 20 });
        gsap.to(textTargets, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.4,
        });

        // スクロールインジケーター: フェードイン
        if (scrollRef.current) {
          gsap.set(scrollRef.current, { opacity: 0 });
          gsap.to(scrollRef.current, {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: 1.0,
          });
        }
      }, sectionRef);

      ctxRef.current = ctx;
    };

    if (!hasOpener) {
      runEntrance();
    } else {
      window.addEventListener("opener-done", runEntrance);
      const failsafe = setTimeout(runEntrance, 5000);

      return () => {
        window.removeEventListener("opener-done", runEntrance);
        clearTimeout(failsafe);
        ctxRef.current?.revert();
        ctxRef.current = null;
      };
    }

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[100svh] w-full items-center justify-center overflow-hidden bg-gray-50"
    >
      {/* 中央水平バンド */}
      <div className="absolute left-0 top-1/2 w-full -translate-y-1/2">
        <div
          ref={lineRef}
          className="h-[60px] w-full origin-center bg-primary sm:h-[60px] md:h-20 lg:h-[100px]"
        />
      </div>

      {/* 右下テキストブロック */}
      <div className="absolute bottom-16 right-6 z-10 text-right sm:bottom-20 sm:right-8 lg:bottom-24 lg:right-12">
        <p ref={descRef} className="mb-2 text-xs tracking-widest text-gray-400 sm:text-sm">
          {description}
        </p>
        <h1
          ref={titleRef}
          className="text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl xl:text-8xl"
        >
          {title}
        </h1>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-6 right-6 z-10 sm:right-8 lg:right-12">
        <span ref={scrollRef} className="text-[10px] tracking-widest text-gray-400">
          {scrollIndicator}
        </span>
      </div>
    </section>
  );
}
