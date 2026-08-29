"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { siteConfig } from "@/data/site";
import { cn } from "@/lib/utils";
import { HERO_ENTRANCE, OPENER_FAILSAFE_MS, shouldWaitForOpener } from "@/lib/motion";
import type { News, NewsType } from "@/types/news";

/**
 * 日付文字列(YYYY-MM-DD)から年・月・日・曜日を分解
 */
function getDateParts(dateStr: string) {
  const [year, month, day] = dateStr.split("-").map(Number);
  const dayOfWeekIndex = new Date(Date.UTC(year, month - 1, day)).getUTCDay();

  return {
    year,
    month,
    day: String(day).padStart(2, "0"),
    dayOfWeek: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeekIndex],
  };
}

const newsDateFormatter = new Intl.DateTimeFormat("ja-JP", {
  timeZone: "Asia/Tokyo",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

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
  const parts = Object.fromEntries(
    newsDateFormatter
      .formatToParts(new Date(dateStr))
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, part.value])
  );
  return `${parts.year}.${parts.month}.${parts.day}`;
}

interface HeroSectionProps {
  latestNews?: News | null;
}

/**
 * ヒーローセクション
 * 5レイヤー構成: 白背景 / 装飾テキスト / Three.js歯車（中央） / 左下日付 / 右下最新ニュース
 */
export function HeroSection({ latestNews }: HeroSectionProps) {
  // --- Entrance animation refs ---
  const sectionRef = useRef<HTMLElement>(null);
  const h1Ref = useRef<HTMLHeadingElement>(null);
  const dateBlockRef = useRef<HTMLDivElement>(null);
  const newsBlockRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // --- Entrance animation ---
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    // オープナーが走る環境かをメディアクエリで判定する。DOM の
    // [data-opener-active] を見る方式は、Opener が dynamic(ssr:false) のため
    // このエフェクトより後にしかマウントされず、初回表示では常に「居ない」と
    // 誤判定していた。結果、入場が覆いの裏で終わっていた。
    //
    // ただし合図を待つのは「まだ撃たれていない」ときだけにする。このエフェクトは
    // データ取得を挟んだストリーミングの後に走るため、オープナーより1秒以上
    // 遅れることがあり、ワンショットの opener-done を取りこぼしうる。
    const waitForOpener = shouldWaitForOpener();

    const runEntrance = () => {
      if (!sectionRef.current || ctxRef.current) return;

      const ctx = gsap.context(() => {
        // メイン要素を出現順に収集（null除外）
        // LCP画像は初期HTMLから表示し、タイトルなどの補助要素だけを演出する。
        const mainTargets = [h1Ref.current, dateBlockRef.current, newsBlockRef.current].filter(
          Boolean
        ) as HTMLElement[];

        // 先に inline で不可視にしてから CSS のフェイルセーフを外す。
        // 順序が逆だと、クラスを外した瞬間に opacity が 1 に戻って一瞬ちらつく。
        gsap.set(mainTargets, { opacity: 0, y: 30 });
        mainTargets.forEach((el) => el.classList.remove("hero-entrance-target"));

        const tl = gsap.timeline();

        // メイン要素: HERO_ENTRANCE.stagger で順次出現
        tl.to(
          mainTargets,
          {
            opacity: 1,
            y: 0,
            duration: HERO_ENTRANCE.duration,
            ease: HERO_ENTRANCE.ease,
            stagger: HERO_ENTRANCE.stagger,
            force3D: true,
          },
          0
        );
      }, sectionRef);

      ctxRef.current = ctx;
    };

    if (!waitForOpener) {
      // Opener完了済み/不在 → 即座にアニメーション実行
      runEntrance();
    } else {
      // Opener稼働中 → イベント待機 + フェイルセーフ
      window.addEventListener("opener-done", runEntrance);
      const failsafe = setTimeout(runEntrance, OPENER_FAILSAFE_MS);

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
      id="hero-section"
      className="w-full h-[calc(100svh-var(--header-height))] relative z-10 overflow-hidden flex items-center justify-center pb-16 md:pb-20 lg:pb-24"
    >
      {/* [z-20] ロゴ画像（中央配置） */}
      <div className="relative z-20 flex w-full max-w-[75vw] -translate-y-10 items-center justify-center sm:max-w-[50vw] sm:-translate-y-6 md:max-w-[35vw] md:translate-y-0 lg:max-w-[30vw]">
        <Image
          src="/images/brand/favicon-outline.webp"
          alt="世田谷祭のアイコン"
          width={500}
          height={500}
          sizes="(max-width: 639px) 75vw, (max-width: 767px) 50vw, (max-width: 1023px) 35vw, 30vw"
          fetchPriority="high"
          quality={40}
          className="h-auto w-full animate-spin-slow"
          priority
        />
      </div>

      {/* [z-30] h1 タイトル（2行アーチ型・アイコンの上に重なる） */}
      <h1
        ref={h1Ref}
        className="absolute z-30 w-[85vw] sm:w-[70vw] md:w-[55vw] lg:w-[50vw] will-change-transform hero-entrance-target -translate-y-10 sm:-translate-y-6 md:translate-y-0"
      >
        <svg
          viewBox="0 0 600 280"
          className="w-full h-auto overflow-visible"
          role="img"
          aria-label="第97回世田谷祭"
        >
          <defs>
            <path id="hero-arch-top" d="M 80,50 Q 300,25 520,50" fill="none" />
            <path id="hero-arch-bottom" d="M 20,165 Q 300,125 580,165" fill="none" />
            <filter id="hero-text-shadow">
              <feDropShadow
                dx="0"
                dy="3"
                stdDeviation="4"
                floodColor="#1e3a5f"
                floodOpacity="0.35"
              />
            </filter>
          </defs>
          {/*
            第97回（上段・小さめ）

            letterSpacing / strokeWidth は書体に追随させる値であり、独立に決められない。
            見出しは Dela Gothic One（極太のディスプレイ書体）で、字画も字面も明朝より太い。
            前任の Kaisei Opti 700 に合わせた負の字間と太い縁取りをそのまま当てると、
            隣り合う字がくっつき、「祭」「谷」の内部の白が紺の縁取りに埋まって潰れる。
            現在の負の字間は、ロゴとしての密度を優先して意図的に詰めた値である。
            「谷」と「祭」は縁取りが接触して境界が1本に融合するが、Dela の字形は
            輪郭が明快なため判別は保てる（実描画で4段階を比較して決定）。
            strokeWidth をこれ以上太くすると、その融合部が塊になって潰れる。
            書体を差し替える場合は、この2値も実描画で見直すこと。
          */}
          <text
            className="font-hero-display"
            fontSize="56"
            letterSpacing="-3"
            fill="#f7edd0"
            stroke="#1e3a5f"
            strokeWidth="3"
            paintOrder="stroke fill"
            filter="url(#hero-text-shadow)"
          >
            <textPath href="#hero-arch-top" startOffset="50%" textAnchor="middle">
              第97回
            </textPath>
          </text>
          {/* 世田谷祭（下段・大きく） */}
          <text
            className="font-hero-display"
            fontSize="120"
            letterSpacing="-6"
            fill="#f7edd0"
            stroke="#1e3a5f"
            strokeWidth="4"
            paintOrder="stroke fill"
            filter="url(#hero-text-shadow)"
          >
            <textPath href="#hero-arch-bottom" startOffset="50%" textAnchor="middle">
              世田谷祭
            </textPath>
          </text>
        </svg>
      </h1>

      {/* [z-30] 左下 日付表示 */}
      <div
        ref={dateBlockRef}
        className="absolute left-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 will-change-transform hero-entrance-target"
        aria-label={`開催日: ${siteConfig.dates.day1} - ${siteConfig.dates.day2}`}
      >
        <p className="text-sm md:text-base font-serif italic tracking-[0.3em] text-primary-400 mb-2 md:mb-3">
          {getDateParts(siteConfig.dates.day1).year}
        </p>
        <div className="flex items-center gap-4 md:gap-6 lg:gap-8">
          <DateBlock dateStr={siteConfig.dates.day1} />
          <DateBlock dateStr={siteConfig.dates.day2} />
        </div>
        <p className="text-xs md:text-sm tracking-[0.2em] text-primary-400/70 mt-2 md:mt-3">
          {siteConfig.openTime} - {siteConfig.closeTime}
        </p>
        {/* モバイル用CTA（md以上では非表示） */}
        <Link
          href="/events"
          prefetch={false}
          className="inline-block bg-primary-600 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-primary-700 transition-colors mt-4 md:hidden"
        >
          企画を探す
        </Link>
      </div>

      {/* [z-30] 右下 最新ニュース（デスクトップのみ） */}
      {latestNews && (
        <div
          ref={newsBlockRef}
          className="absolute right-0 bottom-0 z-30 px-6 lg:px-8 pb-12 lg:pb-16 max-w-sm hidden md:block will-change-transform hero-entrance-target"
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded",
                latestNews.type === "urgent" ? "bg-red-500 text-white" : "bg-gray-200 text-gray-700"
              )}
            >
              {getNewsTypeLabel(latestNews.type)}
            </span>
            <span className="text-xs text-gray-500">{formatNewsDate(latestNews.publishedAt)}</span>
          </div>
          <p className="text-sm md:text-base text-gray-700 font-medium line-clamp-2 mb-3">
            {latestNews.title}
          </p>
          <Link
            href={`/info/${latestNews.id}`}
            prefetch={false}
            className="text-sm text-gray-700 hover:text-gray-500 transition-colors font-medium"
          >
            詳しく見る →
          </Link>
        </div>
      )}
    </section>
  );
}
