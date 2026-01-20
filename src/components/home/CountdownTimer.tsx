"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/site";

type CountdownState = "before" | "during" | "after";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * カウントダウン状態を判定
 */
function getCountdownState(dates: { day1: string; day2: string }): CountdownState {
  const now = new Date();
  const day1Start = new Date(`${dates.day1}T${siteConfig.openTime}:00`);
  const day2End = new Date(`${dates.day2}T${siteConfig.closeTime}:00`);

  if (now < day1Start) return "before";
  if (now >= day1Start && now <= day2End) return "during";
  return "after";
}

/**
 * 残り時間を計算
 */
function calculateTimeLeft(targetDate: Date): TimeLeft {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/**
 * カウントダウンタイマーコンポーネント
 * 開催前/開催中/終了後の3状態を管理
 */
export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const state = getCountdownState(siteConfig.dates);

  useEffect(() => {
    setMounted(true);

    // 開催前以外はカウントダウン不要
    if (state !== "before") return;

    const targetDate = new Date(`${siteConfig.dates.day1}T${siteConfig.openTime}:00`);

    // 初期値設定
    setTimeLeft(calculateTimeLeft(targetDate));

    // 1秒ごとに更新
    const interval = setInterval(() => {
      const newTimeLeft = calculateTimeLeft(targetDate);
      setTimeLeft(newTimeLeft);

      // カウントダウン終了時にクリア
      if (
        newTimeLeft.days === 0 &&
        newTimeLeft.hours === 0 &&
        newTimeLeft.minutes === 0 &&
        newTimeLeft.seconds === 0
      ) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [state]);

  // SSR時の表示（ハイドレーションミス回避）
  if (!mounted) {
    return (
      <div className="animate-pulse bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="h-32 rounded-lg bg-gray-200"></div>
        </div>
      </div>
    );
  }

  // 開催中の表示
  if (state === "during") {
    return (
      <section className="bg-gradient-to-r from-primary to-purple-600 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <div className="mb-4">
            <svg
              className="mx-auto h-20 w-20 animate-pulse"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="mb-4 text-5xl font-bold drop-shadow-lg md:text-6xl">開催中！</h2>
          <p className="text-xl drop-shadow-md md:text-2xl">
            ただいま第{siteConfig.edition}回世田谷祭を開催しています
          </p>
          <p className="mt-4 text-lg opacity-90">
            {siteConfig.openTime} - {siteConfig.closeTime}
          </p>
        </div>
      </section>
    );
  }

  // 終了後の表示
  if (state === "after") {
    return (
      <section className="bg-gradient-to-r from-gray-700 to-gray-900 py-20">
        <div className="container mx-auto px-4 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold drop-shadow-lg md:text-5xl">
            ご来場ありがとうございました
          </h2>
          <p className="text-xl drop-shadow-md md:text-2xl">
            第{siteConfig.edition}回世田谷祭は終了しました
          </p>
          <p className="mt-6 text-lg opacity-90">また来年お会いしましょう</p>
        </div>
      </section>
    );
  }

  // 開催前のカウントダウン表示
  return (
    <section className="bg-gradient-to-r from-purple-600 via-primary to-pink-600 py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold text-white drop-shadow-lg md:text-5xl">
          開催まであと
        </h2>

        <div className="mx-auto flex max-w-4xl justify-center gap-4 md:gap-8">
          {/* 日 */}
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm md:h-32 md:w-32">
              <span className="text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
                {timeLeft.days.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-lg font-semibold uppercase text-white/90 drop-shadow md:text-xl">
              DAYS
            </span>
          </div>

          {/* 時 */}
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm md:h-32 md:w-32">
              <span className="text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
                {timeLeft.hours.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-lg font-semibold uppercase text-white/90 drop-shadow md:text-xl">
              HOURS
            </span>
          </div>

          {/* 分 */}
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm md:h-32 md:w-32">
              <span className="text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
                {timeLeft.minutes.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-lg font-semibold uppercase text-white/90 drop-shadow md:text-xl">
              MINUTES
            </span>
          </div>

          {/* 秒 */}
          <div className="flex flex-col items-center">
            <div className="mb-3 flex h-24 w-24 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm md:h-32 md:w-32">
              <span className="text-5xl font-bold text-white drop-shadow-lg md:text-6xl">
                {timeLeft.seconds.toString().padStart(2, "0")}
              </span>
            </div>
            <span className="text-lg font-semibold uppercase text-white/90 drop-shadow md:text-xl">
              SECONDS
            </span>
          </div>
        </div>

        <p className="mt-12 text-center text-xl text-white drop-shadow md:text-2xl">
          {siteConfig.dates.day1.replace(/-/g, ".")} - {siteConfig.dates.day2.replace(/-/g, ".")}
        </p>
      </div>
    </section>
  );
}
