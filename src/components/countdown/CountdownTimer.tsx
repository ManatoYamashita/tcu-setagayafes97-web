"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { siteConfig } from "@/data/site";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * カウントダウンタイマーコンポーネント（改訂版）
 * 数字とラベルを一体化したBold Minimalismデザイン
 * 例: "00日00時間00分"
 */
export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // 目標日時: siteConfigから取得（2026-10-31T10:00:00+09:00形式）
  const targetDate = `${siteConfig.dates.day1}T${siteConfig.openTime}:00+09:00`;

  useEffect(() => {
    setIsClient(true);

    const calculateTimeLeft = (): TimeLeft => {
      const difference = +new Date(targetDate) - +new Date();

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }

      return {
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      };
    };

    // 初回計算
    setTimeLeft(calculateTimeLeft());

    // 1秒ごとに更新
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  // GSAPアニメーション: fade-in with scale
  useEffect(() => {
    if (isClient && containerRef.current) {
      gsap.from(containerRef.current.querySelectorAll(".countdown-unit"), {
        opacity: 0,
        scale: 0.9,
        y: 30,
        duration: 1,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.3,
      });
    }
  }, [isClient]);

  // クライアントサイドでのみレンダリング（Hydration対策）
  if (!isClient) {
    return (
      <div className="flex flex-wrap items-baseline justify-center gap-1 px-4 md:gap-2 lg:gap-3">
        <span className="countdown-unit inline-flex items-baseline font-bold text-white">
          <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">00</span>
          <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">日</span>
        </span>
        <span className="countdown-unit inline-flex items-baseline font-bold text-white">
          <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">00</span>
          <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">時間</span>
        </span>
        <span className="countdown-unit inline-flex items-baseline font-bold text-white">
          <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">00</span>
          <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">分</span>
        </span>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex flex-wrap items-baseline justify-center gap-1 px-4 md:gap-2 lg:gap-3"
    >
      {/* 日 */}
      <span className="countdown-unit inline-flex items-baseline font-bold text-white">
        <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">
          {String(timeLeft.days).padStart(2, "0")}
        </span>
        <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">日</span>
      </span>

      {/* 時間 */}
      <span className="countdown-unit inline-flex items-baseline font-bold text-white">
        <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">
          {String(timeLeft.hours).padStart(2, "0")}
        </span>
        <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">時間</span>
      </span>

      {/* 分 */}
      <span className="countdown-unit inline-flex items-baseline font-bold text-white">
        <span className="tabular-nums text-6xl md:text-8xl lg:text-9xl">
          {String(timeLeft.minutes).padStart(2, "0")}
        </span>
        <span className="ml-1 text-3xl md:ml-2 md:text-5xl lg:ml-3 lg:text-6xl">分</span>
      </span>
    </div>
  );
}
