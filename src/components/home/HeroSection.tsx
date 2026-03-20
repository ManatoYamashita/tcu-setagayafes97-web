"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { MobileMenu } from "@/components/layout/MobileMenu";

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
      <span className="text-5xl md:text-6xl lg:text-7xl font-serif italic leading-none">
        {month}
      </span>
      <div className="relative mx-0.5 md:mx-1 flex items-center justify-center">
        <div className="w-px h-14 md:h-20 lg:h-24 bg-primary-400/60 rotate-[-25deg]" />
      </div>
      <span className="text-5xl md:text-6xl lg:text-7xl font-serif italic leading-none">{day}</span>
      <span className="text-[10px] md:text-xs lg:text-sm tracking-wide font-sans self-end ml-0.5 mb-0.5">
        {dayOfWeek}
      </span>
    </div>
  );
}

/**
 * ヒーローセクション
 * 5レイヤー構成: 白背景 / 装飾テキスト / Three.js歯車（中央） / 左下日付 / 右下テキスト+CTA
 */
const heroNavItems = [
  { label: "EVENTS", href: "/events" },
  { label: "TIMETABLE", href: "/timetable" },
  { label: "MAP", href: "/map" },
  { label: "INFO", href: "/info" },
] as const;

export function HeroSection() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
            className="text-sm font-medium tracking-widest text-gray-700 hover:text-primary-400 transition-colors"
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* [z-40] 左上 ハンバーガー（モバイル） */}
      <button
        className="absolute top-6 left-6 z-40 rounded-lg p-2 hover:bg-gray-900/10 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 md:hidden"
        onClick={() => setIsMobileMenuOpen(true)}
        aria-label="メニューを開く"
      >
        <Menu className="h-6 w-6 text-gray-900" />
      </button>

      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      {/* [z-10] 装飾テキスト "TOKYO CITY UNIVERSITY" */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none select-none"
        aria-hidden="true"
      >
        <span className="text-[8vw] font-black tracking-widest text-gray-200 whitespace-nowrap leading-none">
          TOKYO CITY UNIVERSITY
        </span>
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
      </div>

      {/* [z-30] 右下 テキスト+CTAボタン */}
      <div className="absolute right-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 max-w-sm">
        <p className="text-sm md:text-base text-gray-600 line-clamp-2 mb-4">
          {siteConfig.description}
        </p>
        <Link
          href="/events"
          className="inline-block bg-gray-900 text-white text-sm md:text-base font-medium px-6 py-3 rounded-full hover:bg-gray-800 transition-colors"
        >
          企画を探す
        </Link>
      </div>
    </section>
  );
}
