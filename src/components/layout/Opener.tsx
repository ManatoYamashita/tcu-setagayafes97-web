"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

/**
 * オープナーアニメーションコンポーネント
 *
 * ページ読み込み完了後に以下のアニメーションを実行:
 * 1. 2層レイヤー表示（下層: white、上層: primary）
 * 2. 中央にアイコン（favicon.webp, 256px）をゆっくりフェードイン
 * 3. アイコンにpulseアニメーション（scale: 1↔1.04, 1.5s周期）
 * 4. アイコンを拡大しながらフェードアウト
 * 5. 2層レイヤーを時間差（0.2s）で下にスライドして非表示
 *
 * power4イージングによる優雅で滑らかなアニメーション（合計4.5秒）。
 * pulseアニメーションはGPUアクセラレーション（force3D）で最適化。
 */
export function Opener() {
  const [showOpener, setShowOpener] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const whiteLayerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const pulseTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // サーバーサイドレンダリング時はスキップ
    if (typeof window === "undefined") return;

    // オープナーを表示状態に設定
    setShowOpener(true);

    // ページ読み込み完了を待機
    const startAnimation = () => {
      if (
        !containerRef.current ||
        !whiteLayerRef.current ||
        !primaryLayerRef.current ||
        !iconRef.current
      )
        return;

      // GSAP Context でクリーンアップを簡潔に管理
      const ctx = gsap.context(() => {
        // 初期状態設定（2層レイヤー + アイコン）
        gsap.set(iconRef.current, { opacity: 0, scale: 0.7 });
        gsap.set(whiteLayerRef.current, { y: 0 });
        gsap.set(primaryLayerRef.current, { y: 0 });

        // pulseアニメーション（別タイムラインで管理）
        const pulseTl = gsap.timeline({
          repeat: -1, // 無限ループ
          yoyo: true, // 往復（1.0 → 1.04 → 1.0）
          paused: true, // 初期は停止
        });

        pulseTl.to(iconRef.current, {
          scale: 1.04, // 控えめな拡大
          duration: 1.5, // 1.5秒で拡大
          ease: "sine.inOut", // 滑らかなイージング
          force3D: true, // GPUアクセラレーション
        });

        // pulseタイムラインをrefに保存（クリーンアップ用）
        pulseTlRef.current = pulseTl;

        // メインタイムライン作成
        const tl = gsap.timeline({
          paused: false, // 自動再生
          onComplete: () => {
            // アニメーション完了後、オープナーを非表示
            setShowOpener(false);
          },
        });

        // Phase 1: アイコンフェードイン (1.0s) + pulse開始
        tl.to(iconRef.current, {
          opacity: 1,
          scale: 1,
          duration: 1.0,
          ease: "power4.out",
          onComplete: () => {
            // フェードイン完了後、pulseを開始
            pulseTl.play();
          },
        });

        // Phase 2: 待機 (1.5s) - pulse継続中
        tl.to({}, { duration: 1.5 });

        // Phase 3: アイコンフェードアウト (0.8s) - pulse継続中
        tl.to(iconRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.8,
          ease: "power4.in",
          onStart: () => {
            // フェードアウト開始時にpulseを停止
            pulseTl.kill();
          },
        });

        // Phase 4-1: 上層（primary）下スライド (1.2s, -0.2s overlap)
        tl.to(
          primaryLayerRef.current,
          {
            y: "100%",
            duration: 1.2,
            ease: "power4.inOut",
          },
          "-=0.2"
        );

        // Phase 4-2: 下層（white）下スライド (1.3s, 0.2s遅延)
        tl.to(
          whiteLayerRef.current,
          {
            y: "100%",
            duration: 1.3,
            ease: "power4.out", // 下層はやや軽めのイージング
          },
          "-=1.1" // primaryスライドの0.2秒後に開始
        );
      }, containerRef);

      ctxRef.current = ctx;
    };

    // ページ読み込み完了後にアニメーション開始
    if (document.readyState === "complete") {
      startAnimation();
    } else {
      const onLoad = () => startAnimation();
      window.addEventListener("load", onLoad);
      return () => {
        window.removeEventListener("load", onLoad);
        pulseTlRef.current?.kill(); // pulseタイムライン停止
        ctxRef.current?.revert(); // GSAPクリーンアップ
      };
    }

    // クリーンアップ
    return () => {
      pulseTlRef.current?.kill(); // pulseタイムライン停止
      ctxRef.current?.revert();
    };
  }, []);

  // 非表示状態の場合は何もレンダリングしない（DOM cleanup）
  if (!showOpener) {
    return null;
  }

  return (
    <div ref={containerRef} className="opener-container">
      {/* 下層レイヤー（white背景） - 後から退場 */}
      <div
        ref={whiteLayerRef}
        className="fixed inset-0 z-50 bg-white overflow-hidden will-change-transform"
        aria-hidden="true"
      />

      {/* 上層レイヤー（primary背景） - 先に退場 */}
      <div
        ref={primaryLayerRef}
        className="fixed inset-0 z-[51] bg-primary-400 overflow-hidden flex items-center justify-center will-change-transform"
        aria-hidden="true"
      >
        {/* 中央アイコン（256px） */}
        <div ref={iconRef} className="relative w-64 h-64 will-change-transform opacity-0">
          <Image
            src="/favicon.webp"
            alt="世田谷祭ロゴ"
            fill
            priority
            sizes="256px"
            className="object-contain"
          />
        </div>
      </div>
    </div>
  );
}
