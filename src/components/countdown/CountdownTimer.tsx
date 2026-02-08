"use client";

import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

interface CountdownTimerProps {
  targetDate: string; // ISO 8601 format (e.g., "2026-10-31T00:00:00")
}

/**
 * カウントダウンタイマーコンポーネント
 * 指定された日時までの残り時間を表示
 */
export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

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
      <div className="flex items-center justify-center gap-4 md:gap-8">
        <div className="text-center">
          <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE]">--</div>
          <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">DAYS</div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE]">--</div>
          <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">HOURS</div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE]">--</div>
          <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">MINUTES</div>
        </div>
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>
        <div className="text-center">
          <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE]">--</div>
          <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2">SECONDS</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4 md:gap-8">
      {/* Days */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE] tabular-nums">
          {String(timeLeft.days).padStart(2, "0")}
        </div>
        <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2 font-medium">DAYS</div>
      </div>

      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>

      {/* Hours */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE] tabular-nums">
          {String(timeLeft.hours).padStart(2, "0")}
        </div>
        <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2 font-medium">HOURS</div>
      </div>

      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>

      {/* Minutes */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE] tabular-nums">
          {String(timeLeft.minutes).padStart(2, "0")}
        </div>
        <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2 font-medium">
          MINUTES
        </div>
      </div>

      <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-gray-400">:</div>

      {/* Seconds */}
      <div className="text-center">
        <div className="text-4xl md:text-6xl lg:text-8xl font-bold text-[#CD79EE] tabular-nums">
          {String(timeLeft.seconds).padStart(2, "0")}
        </div>
        <div className="text-sm md:text-base lg:text-lg text-gray-600 mt-2 font-medium">
          SECONDS
        </div>
      </div>
    </div>
  );
}
