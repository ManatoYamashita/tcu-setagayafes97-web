"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { gsap } from "gsap";

/**
 * オープナーアニメーションコンポーネント
 *
 * ページ読み込み完了後に以下のアニメーションを実行:
 * 1. 2層レイヤー表示（下層: white、上層: primary）
 * 2. 中央にアイコン（favicon.ico, 256px）をゆっくりフェードイン
 * 3. アイコンにpulseアニメーション（scale: 1↔1.04, 1.5s周期）
 * 4. アイコンを拡大しながらフェードアウト
 * 5. 2層レイヤーを時間差（0.2s）で下にスライドして非表示
 *
 * power4イージングによる優雅で滑らかなアニメーション（合計約2秒）。
 * pulseアニメーションはGPUアクセラレーション（force3D）で最適化。
 */
export function Opener() {
  const [showOpener, setShowOpener] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const whiteLayerRef = useRef<HTMLDivElement | null>(null);
  const primaryLayerRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const ctxRef = useRef<gsap.Context | null>(null);
  const pulseTlRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    // サーバーサイドレンダリング時はスキップ
    if (typeof window === "undefined") return;

    // フェイルセーフ: アニメーション未完了時に強制非表示（通常2秒の約2.5倍）
    const safetyTimeout = setTimeout(() => {
      setShowOpener(false);
      window.dispatchEvent(new CustomEvent("opener-done"));
    }, 5000);

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
          paused: false,
          onComplete: () => {
            clearTimeout(safetyTimeout);
            setShowOpener(false);
          },
        });

        // Phase 1: アイコンフェードイン (0.5s) + pulse開始
        tl.to(iconRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.5,
          ease: "power4.out",
          onComplete: () => {
            pulseTl.play();
          },
        });

        // Phase 2: 待機 (0.3s) - pulse継続中
        tl.to({}, { duration: 0.3 });

        // Phase 3: アイコンフェードアウト (0.4s) - pulse継続中
        tl.to(iconRef.current, {
          opacity: 0,
          scale: 1.1,
          duration: 0.4,
          ease: "power4.in",
          onStart: () => {
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
            ease: "power4.out",
          },
          "-=1.1"
        );

        // レイヤースライド中にHeroアニメーション開始トリガー（完了0.4秒前）
        tl.call(
          () => {
            window.dispatchEvent(new CustomEvent("opener-done"));
          },
          [],
          tl.duration() - 0.4
        );
      }, containerRef);

      ctxRef.current = ctx;
    };

    // ページ読み込み完了後にアニメーション開始
    if (document.readyState === "complete") {
      startAnimation();
    } else {
      window.addEventListener("load", startAnimation);
    }

    // クリーンアップ
    return () => {
      clearTimeout(safetyTimeout);
      window.removeEventListener("load", startAnimation);
      pulseTlRef.current?.kill();
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
