"use client";

import { useState, useEffect } from "react";
import { siteConfig } from "@/data/site";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isFinished: boolean;
  formatted: string;
}

const INITIAL_STATE: CountdownState = {
  days: 0,
  hours: 0,
  minutes: 0,
  seconds: 0,
  isFinished: false,
  formatted: "",
};

/**
 * 開催日までのカウントダウンフック
 * JST (+09:00) を明示的に指定し、タイムゾーン依存を排除
 * ハイドレーションミスマッチ防止: マウント後に計算開始
 */
export function useCountdown(): CountdownState {
  const [state, setState] = useState<CountdownState>(INITIAL_STATE);

  useEffect(() => {
    // 目標日時: day1 の openTime (JST)
    const targetDate = new Date(`${siteConfig.dates.day1}T${siteConfig.openTime}:00+09:00`);

    function calc(): CountdownState {
      const now = Date.now();
      const diff = targetDate.getTime() - now;

      if (diff <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isFinished: true,
          formatted: "",
        };
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const dd = String(days).padStart(2, "0");
      const hh = String(hours).padStart(2, "0");
      const mm = String(minutes).padStart(2, "0");
      const ss = String(seconds).padStart(2, "0");

      return {
        days,
        hours,
        minutes,
        seconds,
        isFinished: false,
        formatted: `${dd}日 ${hh}:${mm}:${ss}`,
      };
    }

    // 初回即計算
    setState(calc());

    const id = setInterval(() => {
      const next = calc();
      setState(next);
      if (next.isFinished) clearInterval(id);
    }, 1000);

    return () => clearInterval(id);
  }, []);

  return state;
}
