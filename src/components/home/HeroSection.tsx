"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
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
      id="hero-section"
      className="w-full min-h-screen -mt-20 relative bg-white overflow-hidden flex items-center justify-center"
    >
      {/* SEO用 隠しh1 */}
      <h1 className="sr-only">東京都市大学 第97回 世田谷祭</h1>

      {/* [z-40] 左上 独自ナビ（デスクトップ） */}
      <nav
        className="absolute top-8 left-8 z-40 hidden md:flex flex-col gap-3"
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
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none"
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
        className="absolute top-[10%] left-1/2 -translate-x-1/2 z-[5] pointer-events-none"
        aria-hidden="true"
      >
        <LogoVideo className="w-[45vw] md:w-[20vw]" waitForOpener />
      </div>

      {/* [z-20] Three.js歯車（中央配置） */}
      <div className="relative z-20 w-[90vw] sm:w-[85vw] md:w-[80vw] lg:w-[75vw] xl:w-[70vw] h-[60vh] sm:h-[65vh] md:h-[70vh] lg:h-[75vh] xl:h-[80vh]">
        <GearScene />
      </div>

      {/* [z-30] 左下 日付表示 */}
      <div
        className="absolute left-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16"
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
        <div className="absolute right-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 max-w-sm hidden md:block">
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
