"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/site";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * カウントダウンタイマーコンポーネント
 * siteConfigから開催日時を取得し、残り時間を表示
 * ダークテーマ、ガラスモーフィズムデザイン
 */
export function CountdownTimer() {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

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

  // クライアントサイドでのみレンダリング（Hydration対策）
  if (!isClient) {
    return (
      <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
            <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
              --
            </div>
            <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
              Days
            </div>
          </div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
            <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
              --
            </div>
            <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
              Hours
            </div>
          </div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
            <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
              --
            </div>
            <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
              Minutes
            </div>
          </div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
            <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
              --
            </div>
            <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
              Seconds
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8">
      {/* Days */}
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
          <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
            {String(timeLeft.days).padStart(2, "0")}
          </div>
          <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
            Days
          </div>
        </div>
      </div>

      {/* コロン区切り */}
      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>

      {/* Hours */}
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
          <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
            {String(timeLeft.hours).padStart(2, "0")}
          </div>
          <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
            Hours
          </div>
        </div>
      </div>

      {/* コロン区切り */}
      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>

      {/* Minutes */}
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
          <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
            {String(timeLeft.minutes).padStart(2, "0")}
          </div>
          <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
            Minutes
          </div>
        </div>
      </div>

      {/* コロン区切り */}
      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-white/40">:</div>

      {/* Seconds */}
      <div className="text-center">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 md:px-8 md:py-6 shadow-xl">
          <div className="text-5xl md:text-7xl lg:text-9xl font-bold text-white tabular-nums">
            {String(timeLeft.seconds).padStart(2, "0")}
          </div>
          <div className="text-xs md:text-sm lg:text-base text-white/70 mt-2 font-semibold uppercase tracking-wider">
            Seconds
          </div>
        </div>
      </div>
    </div>
  );
}
