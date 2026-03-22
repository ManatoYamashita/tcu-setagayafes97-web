"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { gsap } from "gsap";
import { siteConfig } from "@/data/site";
import { useCountdown } from "@/hooks/useCountdown";
import { LogoVideo } from "./LogoVideo";
import { cn } from "@/lib/utils";
import type { News, NewsType } from "@/types/news";

type DebugDisplayMode = "countdown" | "karakuri" | null;

const GearScene = dynamic(() => import("@/components/three/GearScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

/**
 * 日付文字列(YYYY-MM-DD)から年・月・日・曜日を分解
 */
function getDateParts(dateStr: string) {
  const date = new Date(dateStr);
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: String(date.getDate()).padStart(2, "0"),
    dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][date.getDay()],
  };
}

/**
 * 日付ブロック（参考画像スタイル: 月/日+曜日、斜線で区切り）
 */
function DateBlock({ dateStr }: { dateStr: string }) {
  const { month, day, dayOfWeek } = getDateParts(dateStr);

  return (
    <div className="flex items-center text-primary-400">
      <span className="text-5xl md:text-6xl lg:text-7xl font-serif italic leading-none -translate-y-1.5 md:-translate-y-2">
        {month}
      </span>
      <div className="relative mx-0.5 md:mx-1 flex items-center justify-center">
        <div className="w-px h-14 md:h-20 lg:h-24 bg-primary-400/60 rotate-[-25deg]" />
      </div>
      <span className="text-5xl md:text-6xl lg:text-7xl font-serif italic leading-none translate-y-1.5 md:translate-y-2">
        {day}
      </span>
      <span className="text-[10px] md:text-xs lg:text-sm tracking-wide font-sans self-end ml-0.5 mb-0.5 translate-y-1.5 md:translate-y-2">
        {dayOfWeek}
      </span>
    </div>
  );
}

function getNewsTypeLabel(type: NewsType): string {
  switch (type) {
    case "urgent":
      return "緊急";
    case "news":
      return "お知らせ";
    case "other":
      return "その他";
  }
}

function formatNewsDate(dateStr?: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

interface HeroSectionProps {
  latestNews?: News | null;
}

/**
 * ヒーローセクション
 * 5レイヤー構成: 白背景 / 装飾テキスト / Three.js歯車（中央） / 左下日付 / 右下最新ニュース
 */
const heroNavItems = [
  { label: "企画を探す", href: "/events" },
  { label: "タイムテーブル", href: "/timetable" },
  { label: "マップ", href: "/map" },
  { label: "インフォメーション", href: "/info" },
] as const;

export function HeroSection({ latestNews }: HeroSectionProps) {
  const { formatted, isFinished } = useCountdown();
  const [debugMode, setDebugMode] = useState<DebugDisplayMode>(null);

  // --- Entrance animation refs ---
  const sectionRef = useRef<HTMLElement>(null);
  const decorTextRef = useRef<HTMLDivElement>(null);
  const logoVideoRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const dateBlockRef = useRef<HTMLDivElement>(null);
  const newsBlockRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // --- Entrance animation ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    // Openerが稼働中かどうかをDOM存在で判定
    const hasOpener = !!document.querySelector(".opener-container");

    const runEntrance = () => {
      if (!sectionRef.current || ctxRef.current) return;

      const ctx = gsap.context(() => {
        // メイン要素を出現順に収集（null除外）
        const mainTargets = [
          decorTextRef.current,
          logoVideoRef.current,
          gearRef.current,
          dateBlockRef.current,
          newsBlockRef.current,
        ].filter(Boolean) as HTMLElement[];

        gsap.set(mainTargets, { opacity: 0, y: 30 });

        // ナビ: コンテナのopacityを解除し、子要素を個別制御
        if (navRef.current) {
          gsap.set(navRef.current, { opacity: 1 });
          const navItems = navRef.current.querySelectorAll("a");
          gsap.set(navItems, { opacity: 0, x: -15 });
        }

        const tl = gsap.timeline();

        // メイン要素: stagger 0.12s で順次出現
        tl.to(
          mainTargets,
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power4.out",
            stagger: 0.12,
            force3D: true,
          },
          0
        );

        // ナビリンク: stagger 0.08s、メイン要素の途中から開始
        if (navRef.current) {
          const navItems = navRef.current.querySelectorAll("a");
          if (navItems.length > 0) {
            tl.to(
              navItems,
              {
                opacity: 1,
                x: 0,
                duration: 0.5,
                ease: "power3.out",
                stagger: 0.08,
                force3D: true,
              },
              0.5
            );
          }
        }
      }, sectionRef);

      ctxRef.current = ctx;
    };

    if (!hasOpener) {
      // Opener完了済み/不在 → 即座にアニメーション実行
      runEntrance();
    } else {
      // Opener稼働中 → イベント待機 + フェイルセーフ
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

  // 表示判定: デバッグモード優先、なければ実カウントダウン状態
  const showKarakuri = debugMode === "karakuri" || (debugMode === null && isFinished);
  const showCountdown = debugMode === "countdown" || (debugMode === null && !isFinished);

  const cycleDebug = () => {
    setDebugMode((prev) => {
      if (prev === null) return "countdown";
      if (prev === "countdown") return "karakuri";
      return null;
    });
  };

  const debugLabel =
    debugMode === null ? "自動" : debugMode === "countdown" ? "Countdown" : "KARAKURI";

  return (
    <section
      ref={sectionRef}
      id="hero-section"
      className="w-full min-h-screen -mt-20 relative bg-white overflow-hidden flex items-center justify-center"
    >
      {/* SEO用 隠しh1 */}
      <h1 className="sr-only">東京都市大学 第97回 世田谷祭</h1>

      {/* [z-40] 左上 独自ナビ（デスクトップ） */}
      <nav
        ref={navRef}
        className="absolute top-8 left-8 z-40 hidden md:flex flex-col gap-3 will-change-transform opacity-0"
        aria-label="ヒーローナビゲーション"
      >
        {heroNavItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-sm font-medium tracking-wider text-gray-700 hover:text-primary-400 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* [z-10] 装飾テキスト: カウントダウン or KARAKURI */}
      <div
        ref={decorTextRef}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none will-change-transform opacity-0"
        aria-hidden="true"
      >
        {showKarakuri ? (
          <span className="text-[12vw] font-display-mincho font-extrabold tracking-tight text-gray-200 whitespace-nowrap leading-none">
            KARAKURI
          </span>
        ) : showCountdown && formatted ? (
          <span className="text-[12vw] font-display-mincho font-extrabold tracking-tight text-gray-200 whitespace-nowrap leading-none tabular-nums">
            {formatted}
          </span>
        ) : (
          <span className="text-[12vw] font-display-mincho font-extrabold tracking-tight text-gray-200 whitespace-nowrap leading-none">
            &nbsp;
          </span>
        )}
      </div>

      {/* デバッグトグル（開発環境のみ） */}
      {process.env.NODE_ENV === "development" && (
        <button
          type="button"
          onClick={cycleDebug}
          className="absolute top-4 right-4 z-50 bg-black/50 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
        >
          {debugLabel}
        </button>
      )}

      {/* [z-5] ロゴ動画（背景として歯車・テキストより奥） */}
      <div
        ref={logoVideoRef}
        className="absolute top-[10%] left-1/2 -translate-x-1/2 z-[5] pointer-events-none will-change-transform opacity-0"
        aria-hidden="true"
      >
        <LogoVideo className="w-[45vw] md:w-[20vw]" waitForOpener />
      </div>

      {/* [z-20] Three.js歯車（中央配置） */}
      <div
        ref={gearRef}
        className="relative z-20 w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh] will-change-transform opacity-0"
      >
        <GearScene />
      </div>

      {/* [z-30] 左下 日付表示 */}
      <div
        ref={dateBlockRef}
        className="absolute left-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 will-change-transform opacity-0"
        aria-label={`開催日: ${siteConfig.dates.day1} - ${siteConfig.dates.day2}`}
      >
        <p className="text-sm md:text-base font-serif italic tracking-[0.3em] text-primary-400 mb-2 md:mb-3">
          {getDateParts(siteConfig.dates.day1).year}
        </p>
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <DateBlock dateStr={siteConfig.dates.day1} />
          <DateBlock dateStr={siteConfig.dates.day2} />
        </div>
        <p className="text-xs md:text-sm tracking-[0.2em] text-primary-400/80 mt-2 md:mt-3">
          {siteConfig.openTime} - {siteConfig.closeTime}
        </p>
        {/* モバイル用CTA（md以上では非表示） */}
        <Link
          href="/events"
          className="inline-block bg-primary-400 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-primary-500 transition-colors mt-4 md:hidden"
        >
          企画を探す
        </Link>
      </div>

      {/* [z-30] 右下 最新ニュース（デスクトップのみ） */}
      {latestNews && (
        <div
          ref={newsBlockRef}
          className="absolute right-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 max-w-sm hidden md:block will-change-transform opacity-0"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                latestNews.type === "urgent"
                  ? "bg-red-500 text-white"
                  : "bg-primary-400/15 text-primary-400"
              )}
            >
              {getNewsTypeLabel(latestNews.type)}
            </span>
            <span className="text-xs text-gray-400">{formatNewsDate(latestNews.publishedAt)}</span>
          </div>
          <p className="text-sm md:text-base text-gray-700 font-medium line-clamp-2 mb-3">
            {latestNews.title}
          </p>
          <Link
            href={`/info/${latestNews.id}`}
            className="text-sm text-primary-400 hover:text-primary-500 transition-colors font-medium"
          >
            詳しく見る →
          </Link>
        </div>
      )}
    </section>
  );
}
