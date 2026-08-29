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
 * オープナーアニメーションコンポーネント（4フェーズ / 合計 約1.12秒）
 *
 * 1. 薄ピンク背景 + 白アイコン(favicon-white) フェードイン
 * 2. 濃い紫背景 + カラーアイコン(favicon) にクロスフェード
 * 3. Hero への合図(`opener-done`)と同時にカラーアイコンをフェードアウト
 * 4. 紫レイヤーがスライドアウト
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
  const iconWhiteRef = useRef<HTMLDivElement | null>(null);
  const iconColorRef = useRef<HTMLDivElement | null>(null);
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
      if (
        !containerRef.current ||
        !primaryLayerRef.current ||
        !iconWrapperRef.current ||
        !iconWhiteRef.current ||
        !iconColorRef.current
      )
        return;

      const ctx = gsap.context(() => {
        // 初期状態
        gsap.set(iconWrapperRef.current, { opacity: 0, scale: 0.7 });
        gsap.set(iconWhiteRef.current, { opacity: 1 });
        gsap.set(iconColorRef.current, { opacity: 0 });
        gsap.set(primaryLayerRef.current, { y: 0 });

        // メインタイムライン
        const tl = gsap.timeline({
          paused: false,
          onComplete: () => {
            clearTimeout(safetyTimeout);
            setShowOpener(false);
          },
        });

        // Phase 1: 白アイコンフェードイン
        tl.to(iconWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: OPENER_SEC.iconIn,
          ease: "power4.out",
          force3D: true,
        });

        // Phase 2: 白→カラー + 背景を濃い紫にクロスフェード
        tl.to(iconWhiteRef.current, {
          opacity: 0,
          duration: OPENER_SEC.crossFade,
          ease: "power2.inOut",
        });
        tl.to(
          iconColorRef.current,
          {
            opacity: 1,
            duration: OPENER_SEC.crossFade,
            ease: "power2.inOut",
          },
          "<"
        );
        tl.to(
          primaryLayerRef.current,
          {
            backgroundColor: "#7B2D8E",
            duration: OPENER_SEC.crossFade,
            ease: "power2.inOut",
          },
          "<"
        );

        // アイコンが去り始める瞬間 = Hero への合図。ここから先は末尾からの
        // 逆算をせず、すべてこのラベル基準の絶対指定で置く。
        tl.addLabel(HERO_CUE);

        // Phase 3: Heroアニメーション開始トリガー
        tl.call(
          () => {
            markOpenerDone();
            window.dispatchEvent(new CustomEvent("opener-done"));
          },
          [],
          HERO_CUE
        );

        // Phase 3: カラーアイコンフェードアウト
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

        // Phase 4: 紫レイヤースライドアウト
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
      {/* 紫レイヤー（初期: 薄ピンク → 濃い紫にフェード） */}
      <div
        ref={primaryLayerRef}
        style={{ backgroundColor: "#E8C8F0" }}
        className="fixed inset-0 z-[51] overflow-hidden flex items-center justify-center will-change-transform"
        aria-hidden="true"
      >
        {/* アイコンラッパー */}
        <div ref={iconWrapperRef} className="relative w-64 h-64 will-change-transform opacity-0">
          {/* 白アイコン（初期表示） */}
          <div ref={iconWhiteRef} className="absolute inset-0">
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
          {/* カラーアイコン（2番目） */}
          <div ref={iconColorRef} className="absolute inset-0 opacity-0">
            <Image
              src="/images/brand/favicon.webp"
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
    </div>
  );
}
