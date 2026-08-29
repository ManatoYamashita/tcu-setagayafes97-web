"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import {
  markOpenerDone,
  OPENER_HERO_CUE_SEC,
  OPENER_SAFETY_MS,
  OPENER_SEC,
  OPENER_TOTAL_SEC,
} from "@/lib/motion";

/**
 * オープナーアニメーションコンポーネント（2フェーズ / 合計 約1.6秒）
 *
 * 1. 濃い紫背景 + 白アイコン(favicon-white) をフェードインし、そのまま見せる
 * 2. Hero への合図(`opener-done`)と同時にアイコンを消し、紫レイヤーを開く
 *
 * 各フェーズの尺は src/lib/motion.ts の OPENER_SEC に集約している。
 * 合図の位置は tl.duration() からの逆算ではなくラベルで表すこと。
 * 逆算はフェーズの尺を変えた瞬間に意味が壊れる。
 */

/** Hero へ入場開始を伝える位置。以降の tween はすべてこのラベル基準で置く。 */
const HERO_CUE = "heroCue";

export function Opener() {
  const [showOpener, setShowOpener] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const iconWrapperRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // モバイルではオープナーがLCP対象のヒーロー画像を覆い、低速回線で
    // 初期表示を約1〜2秒遅らせる。演出はデスクトップに残し、モバイルは
    // 本文をすぐ操作できる状態にする。
    if (
      window.matchMedia("(max-width: 767px)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      const hideOpener = window.setTimeout(() => {
        setShowOpener(false);
        markOpenerDone();
        window.dispatchEvent(new CustomEvent("opener-done"));
      }, 0);
      return () => window.clearTimeout(hideOpener);
    }

    const safetyTimeout = setTimeout(() => {
      setShowOpener(false);
      markOpenerDone();
      window.dispatchEvent(new CustomEvent("opener-done"));
    }, OPENER_SAFETY_MS);

    const startAnimation = () => {
      if (!containerRef.current || !primaryLayerRef.current || !iconWrapperRef.current) return;

      const ctx = gsap.context(() => {
        // 初期状態
        gsap.set(iconWrapperRef.current, { opacity: 0, scale: 0.7 });
        gsap.set(primaryLayerRef.current, { y: 0 });

        // メインタイムライン
        const tl = gsap.timeline({
          paused: false,
          onComplete: () => {
            clearTimeout(safetyTimeout);
            setShowOpener(false);
          },
        });

        // Phase 1: ロゴをフェードインし、そのまま見せる
        tl.to(iconWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: OPENER_SEC.iconIn,
          ease: "power4.out",
          force3D: true,
        });
        tl.to({}, { duration: OPENER_SEC.hold });

        // アイコンが去り始める瞬間 = Hero への合図。ここから先は末尾からの
        // 逆算をせず、すべてこのラベル基準の絶対指定で置く。
        tl.addLabel(HERO_CUE);

        // Heroアニメーション開始トリガー
        tl.call(
          () => {
            markOpenerDone();
            window.dispatchEvent(new CustomEvent("opener-done"));
          },
          [],
          HERO_CUE
        );

        // Phase 2: ロゴを消し、紫レイヤーを開く
        tl.to(
          iconWrapperRef.current,
          {
            opacity: 0,
            scale: 1.1,
            duration: OPENER_SEC.iconOut,
            ease: "power4.in",
          },
          HERO_CUE
        );

        tl.to(
          primaryLayerRef.current,
          {
            y: "100%",
            duration: OPENER_SEC.slideOut,
            ease: "power4.inOut",
          },
          `${HERO_CUE}+=${OPENER_SEC.slideDelay}`
        );

        if (process.env.NODE_ENV !== "production") {
          const actualTotal = Number(tl.duration().toFixed(3));
          const actualCue = Number((tl.labels[HERO_CUE] ?? -1).toFixed(3));
          if (
            Math.abs(actualTotal - OPENER_TOTAL_SEC) > 0.001 ||
            Math.abs(actualCue - OPENER_HERO_CUE_SEC) > 0.001
          ) {
            console.warn(
              `[Opener] タイムライン実測（合計 ${actualTotal}s / 合図 ${actualCue}s）が ` +
                `src/lib/motion.ts の定義（合計 ${OPENER_TOTAL_SEC}s / 合図 ${OPENER_HERO_CUE_SEC}s）` +
                "と一致しません。OPENER_SAFETY_MS と各ページの OPENER_FAILSAFE_MS がずれます。"
            );
          }
        }
      }, containerRef);

      ctxRef.current = ctx;
    };

    // 全画像・動画の load を待つと、オープナー自体が表示完了を数秒遅らせる。
    // useEffect 時点で参照は揃っているため、ハイドレーション直後に開始する。
    startAnimation();

    return () => {
      clearTimeout(safetyTimeout);
      ctxRef.current?.revert();
    };
  }, []);

  if (!showOpener) {
    return null;
  }

  return (
    <div ref={containerRef} className="opener-container" data-opener-active="true">
      {/* 紫レイヤー（最初から最後まで濃い紫のまま、最後に下へ抜ける） */}
      <div
        ref={primaryLayerRef}
        style={{ backgroundColor: "#7B2D8E" }}
        className="fixed inset-0 z-[51] overflow-hidden flex items-center justify-center will-change-transform"
        aria-hidden="true"
      >
        {/* アイコンラッパー */}
        <div ref={iconWrapperRef} className="relative w-64 h-64 will-change-transform opacity-0">
          <Image
            src="/images/brand/favicon-white.webp"
            alt="世田谷祭ロゴ"
            fill
            sizes="256px"
            loading="lazy"
            fetchPriority="low"
            quality={60}
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
