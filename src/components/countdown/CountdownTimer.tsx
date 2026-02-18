"use client";

import { Fragment, useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { siteConfig } from "@/data/site";

type CountdownState = "before" | "during" | "after";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

// 開催開始/終了日時（静的値のためコンポーネント外で算出）
const startDate = new Date(`${siteConfig.dates.day1}T${siteConfig.openTime}:00`);
const endDate = new Date(`${siteConfig.dates.day2}T${siteConfig.closeTime}:00`);

function calculateTimeLeft(): { state: CountdownState; timeLeft: TimeLeft } {
  const now = new Date();

  if (now >= endDate) {
    return { state: "after", timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 } };
  }

  if (now >= startDate) {
    return { state: "during", timeLeft: { days: 0, hours: 0, minutes: 0, seconds: 0 } };
  }

  const diff = startDate.getTime() - now.getTime();
  return {
    state: "before",
    timeLeft: {
      days: Math.floor(diff / (1000 * 60 * 60 * 24)),
      hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((diff / (1000 * 60)) % 60),
      seconds: Math.floor((diff / 1000) % 60),
    },
  };
}

/**
 * カウントダウンタイマーコンポーネント
 * 開催日時までのカウントダウンを表示し、開催中/終了後の状態も管理する
 */
export function CountdownTimer() {
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CountdownState>("before");
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const prevTimeRef = useRef<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const digitRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // 初回マウント時のアニメーション
  useEffect(() => {
    setMounted(true);
    const result = calculateTimeLeft();
    setState(result.state);
    setTimeLeft(result.timeLeft);
    prevTimeRef.current = result.timeLeft;
  }, []);

  // GSAP: マウント時のフェードインアニメーション
  useEffect(() => {
    if (!mounted || !containerRef.current) return;

    const units = containerRef.current.querySelectorAll("[data-unit]");
    gsap.fromTo(
      units,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.15,
        ease: "power2.out",
      }
    );
  }, [mounted, state]);

  // 1秒ごとの更新
  useEffect(() => {
    if (!mounted) return;

    const interval = setInterval(() => {
      const result = calculateTimeLeft();
      const prev = prevTimeRef.current;

      // 数字変更時のスライドアニメーション
      const keys: (keyof TimeLeft)[] = ["days", "hours", "minutes", "seconds"];
      keys.forEach((key, i) => {
        if (prev[key] !== result.timeLeft[key] && digitRefs.current[i]) {
          gsap.fromTo(
            digitRefs.current[i],
            { y: -8, opacity: 0.4 },
            { y: 0, opacity: 1, duration: 0.3, ease: "power2.out" }
          );
        }
      });

      prevTimeRef.current = result.timeLeft;
      setState(result.state);
      setTimeLeft(result.timeLeft);
    }, 1000);

    return () => clearInterval(interval);
  }, [mounted]);

  // SSR/CSR 整合性のためマウント前は骨格のみ
  if (!mounted) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    );
  }

  // 開催中
  if (state === "during") {
    return (
      <div ref={containerRef} className="text-center">
        <div data-unit>
          <p className="text-2xl font-bold text-white md:text-4xl">開催中！</p>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            {siteConfig.dates.day1} 〜 {siteConfig.dates.day2}
          </p>
        </div>
      </div>
    );
  }

  // 終了後
  if (state === "after") {
    return (
      <div ref={containerRef} className="text-center">
        <div data-unit>
          <p className="text-xl font-bold text-white md:text-3xl">ご来場ありがとうございました</p>
          <p className="mt-2 text-sm text-white/70 md:text-base">
            第{siteConfig.edition}回 世田谷祭は終了しました
          </p>
        </div>
      </div>
    );
  }

  // カウントダウン表示
  const units = [
    { key: "days", value: timeLeft.days, label: "日" },
    { key: "hours", value: timeLeft.hours, label: "時間" },
    { key: "minutes", value: timeLeft.minutes, label: "分" },
    { key: "seconds", value: timeLeft.seconds, label: "秒" },
  ] as const;

  return (
    <div ref={containerRef} className="flex items-center justify-center gap-2 md:gap-4">
      {units.map((unit, i) => (
        <Fragment key={unit.key}>
          <div data-unit className="flex flex-col items-center">
            <span
              ref={(el) => {
                digitRefs.current[i] = el;
              }}
              className="text-7xl font-bold tabular-nums text-white md:text-9xl"
            >
              {String(unit.value).padStart(2, "0")}
            </span>
            <span className="mt-2 text-sm font-medium tracking-wide text-white/50 md:text-lg">
              {unit.label}
            </span>
          </div>
          {i < units.length - 1 && (
            <span className="self-start pt-3 text-5xl font-light text-white/30 md:pt-5 md:text-7xl">
              :
            </span>
          )}
        </Fragment>
      ))}
    </div>
  );
}
