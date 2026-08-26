"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

/**
 * オープナーアニメーションコンポーネント
 *
 * 1. 薄ピンク背景 + 白アイコン(favicon-white) フェードイン + pulse
 * 2. 濃い紫背景 + カラーアイコン(favicon) にクロスフェード
 * 3. カラーアイコンフェードアウト
 * 4. 紫レイヤーがスライドアウト
 */
export function Opener() {
  const [showOpener, setShowOpener] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const iconWrapperRef = useRef<HTMLDivElement | null>(null);
  const iconWhiteRef = useRef<HTMLDivElement | null>(null);
  const iconColorRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const pulseTlRef = useRef<gsap.core.Timeline | null>(null);

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
        window.dispatchEvent(new CustomEvent("opener-done"));
      }, 0);
      return () => window.clearTimeout(hideOpener);
    }

    const safetyTimeout = setTimeout(() => {
      setShowOpener(false);
      window.dispatchEvent(new CustomEvent("opener-done"));
    }, 6000);

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

        // pulseアニメーション（ラッパーに適用）
        const pulseTl = gsap.timeline({
          repeat: -1,
          yoyo: true,
          paused: true,
        });

        pulseTl.to(iconWrapperRef.current, {
          scale: 1.04,
          duration: 1.5,
          ease: "sine.inOut",
          force3D: true,
        });

        pulseTlRef.current = pulseTl;

        // メインタイムライン
        const tl = gsap.timeline({
          paused: false,
          onComplete: () => {
            clearTimeout(safetyTimeout);
            setShowOpener(false);
          },
        });

        // Phase 1: 白アイコンフェードイン (0.3s)
        tl.to(iconWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.3,
          ease: "power4.out",
          onComplete: () => {
            pulseTl.play();
          },
        });

        // Phase 2: 待機 (0.2s)
        tl.to({}, { duration: 0.2 });

        // Phase 3: 白→カラー + 背景を濃い紫にクロスフェード (0.4s)
        tl.to(iconWhiteRef.current, {
          opacity: 0,
          duration: 0.4,
          ease: "power2.inOut",
        });
        tl.to(
          iconColorRef.current,
          {
            opacity: 1,
            duration: 0.4,
            ease: "power2.inOut",
          },
          "<"
        );
        tl.to(
          primaryLayerRef.current,
          {
            backgroundColor: "#7B2D8E",
            duration: 0.4,
            ease: "power2.inOut",
          },
          "<"
        );

        // Phase 4: 待機 (0.2s)
        tl.to({}, { duration: 0.2 });

        // Phase 5: カラーアイコンフェードアウト (0.3s)
        tl.to(iconWrapperRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.3,
          ease: "power4.in",
          onStart: () => {
            pulseTl.kill();
          },
        });

        // Phase 6: 紫レイヤースライドアウト (0.8s)
        tl.to(
          primaryLayerRef.current,
          {
            y: "100%",
            duration: 1.2,
            ease: "power4.inOut",
          },
          "-=0.2"
        );

        // Heroアニメーション開始トリガー（スライドアウト開始直前）
        tl.call(
          () => {
            window.dispatchEvent(new CustomEvent("opener-done"));
          },
          [],
          tl.duration() - 1.4
        );
      }, containerRef);

      ctxRef.current = ctx;
    };

    // 全画像・動画の load を待つと、オープナー自体が表示完了を数秒遅らせる。
    // useEffect 時点で参照は揃っているため、ハイドレーション直後に開始する。
    startAnimation();

    return () => {
      clearTimeout(safetyTimeout);
      pulseTlRef.current?.kill();
      ctxRef.current?.revert();
    };
  }, []);

  if (!showOpener) {
    return null;
  }

  return (
    <div ref={containerRef} className="opener-container">
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
