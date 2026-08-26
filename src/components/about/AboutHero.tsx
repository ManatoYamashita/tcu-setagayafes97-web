"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import { aboutConfig } from "@/data/about";

const Grainient = dynamic(() => import("@/components/ui/Grainient"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
  ),
});

/**
 * About ページ ヒーローセクション
 *
 * - Header高さを差し引いたフルビューポート
 * - 中央に透明バンド（Grainient背景が透けて見える）
 * - 上下マスクがGSAPで分離するアニメーション
 * - 右下にページタイトル + スクロールインジケーター
 */
export function AboutHero() {
  const { title, description, scrollIndicator } = aboutConfig.hero;

  const sectionRef = useRef<HTMLElement>(null);
  const upperMaskRef = useRef<HTMLDivElement>(null);
  const lowerMaskRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const descRef = useRef<HTMLParagraphElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Header背景色を上マスク(gray-50)と同色に
  useEffect(() => {
    document.documentElement.style.setProperty("--header-top-bg", "oklch(97% 0 0deg)");
    return () => {
      document.documentElement.style.removeProperty("--header-top-bg");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    const hasOpener = !!document.querySelector(".opener-container");

    const runEntrance = () => {
      if (!sectionRef.current || ctxRef.current) return;

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add(
          {
            isSmall: "(max-width: 767px)",
            isMedium: "(min-width: 768px) and (max-width: 1023px)",
            isLarge: "(min-width: 1024px)",
          },
          (context) => {
            const { isSmall, isMedium } = context.conditions!;
            // バンド高さの半分: sm=30px, md=40px, lg=50px
            const halfBand = isSmall ? 30 : isMedium ? 40 : 50;

            // 上下マスク: 最初は中央で密着（バンド見えない）→ 分離してバンド露出
            // 45%: Headerの高さ分を考慮し、視覚的な画面中央に合わせる
            if (upperMaskRef.current) {
              gsap.set(upperMaskRef.current, { bottom: "55%" });
              gsap.to(upperMaskRef.current, {
                bottom: `calc(55% + ${halfBand}px)`,
                duration: 0.8,
                ease: "power3.inOut",
              });
            }

            if (lowerMaskRef.current) {
              gsap.set(lowerMaskRef.current, { top: "45%" });
              gsap.to(lowerMaskRef.current, {
                top: `calc(45% + ${halfBand}px)`,
                duration: 0.8,
                ease: "power3.inOut",
              });
            }
          }
        );

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
      className="relative flex h-[calc(100svh-var(--header-height))] w-full items-center justify-center overflow-hidden"
    >
      {/* Layer 0: Grainient 背景 */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#F9F0FD"
          color2="#CD79EE"
          color3="#5227FF"
          timeSpeed={1}
          grainAmount={0.15}
          contrast={1.4}
          warpStrength={1.2}
          warpAmplitude={40.0}
          saturation={1.2}
        />
      </div>

      {/* Layer 1: 上マスク（gray-50で覆う） */}
      <div
        ref={upperMaskRef}
        className="absolute inset-x-0 top-0 z-[1] bg-gray-50"
        style={{ bottom: "55%" }}
      />

      {/* Layer 1: 下マスク（gray-50で覆う） */}
      <div
        ref={lowerMaskRef}
        className="absolute inset-x-0 bottom-0 z-[1] bg-gray-50"
        style={{ top: "45%" }}
      />

      {/* Layer 2: 右下テキストブロック — 「97」を主役にした縦積みレイアウト */}
      <div className="absolute bottom-20 right-6 z-10 text-right sm:bottom-16 sm:right-8 lg:bottom-20 lg:right-12">
        <p
          ref={descRef}
          className="mb-3 text-[10px] font-medium uppercase tracking-[0.3em] text-gray-400 sm:mb-4 sm:text-xs"
        >
          {description}
        </p>
        <h1 ref={titleRef} className="leading-tight" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="block text-2xl font-semibold tracking-[0.08em] text-gray-900 sm:text-3xl lg:text-4xl">
            第
            <span
              className="text-4xl font-bold bg-gradient-to-r from-purple-500 to-pink-400 bg-clip-text text-transparent tracking-tighter sm:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-kaisei-opti), serif" }}
            >
              97
            </span>
            <span className="ml-1 sm:ml-2">回</span>
          </span>
          <span className="block text-2xl font-semibold tracking-[0.08em] text-gray-900 sm:text-3xl lg:text-4xl">
            世田谷祭実行委員会
          </span>
        </h1>
      </div>

      {/* Layer 2: スクロールインジケーター */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 flex-col items-center gap-2 sm:flex"
        role="presentation"
        aria-label={scrollIndicator}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Scroll</span>
        <div className="relative h-10 w-px bg-gray-300">
          <div className="animate-scroll-line absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-gray-900" />
        </div>
      </div>
    </section>
  );
}
