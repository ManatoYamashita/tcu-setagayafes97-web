"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/use-scroll-reveal";

/**
 * 著名人企画の告知セクション（SpecialGuestSection）の入場モーション。
 *
 * 2つの演出を持つ。
 *
 * - テキスト側の stagger: 実装は `@/lib/use-scroll-reveal`。ここは属性名を宣言するだけ
 * - 写真のワイプ: 写真は画面の左端に付いているので、窓（clip-path）が左端から右へ開いて現れる。
 *   動かすのは窓だけで、写真そのものは動かさない
 *
 * マーカーは `<section>` の直下の先頭に置く前提。どちらの演出も `parentElement` を
 * スコープに取るため、トップページ（variant="hero"）でも /events（variant="sheet"）でも
 * 同じ構造で動く。
 *
 * ワイプは CSS の `clip-path: inset()` の右端だけを毎フレーム書き換える。
 * SSR の写真は clip-path を持たない（完成形）。窓を閉じるのは effect の中だけ。
 */
const SPECIAL_GUEST_MOTION: UseScrollRevealOptions = {
  // 写真は下のワイプが受け持つため、この属性を持つ要素は現在ない
  revealAttribute: "data-special-guest-reveal",
  staggerAttribute: "data-special-guest-stagger",
};

const WIPE_ATTRIBUTE = "data-special-guest-wipe";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function useWipeReveal() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = markerRef.current?.parentElement?.querySelector<HTMLElement>(
      `[${WIPE_ATTRIBUTE}]`
    );

    if (!target) return;

    // IMPORTANT: この判定より前で gsap に触れないこと。return すれば SSR の完成形が残る
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    // 完成形は clip-path なし（SSR と同じ状態）へ戻す
    const finalClipPath = "";
    const setProgress = (progress: number) => {
      target.style.clipPath = `inset(0 ${(1 - progress) * 100}% 0 0)`;
    };

    let disposed = false;
    const ctx = gsap.context(() => {}, target);

    // 動き出すまでは窓を閉じておく
    setProgress(0);

    const register = async () => {
      try {
        const { ScrollTrigger } = await import("gsap/ScrollTrigger");

        if (disposed) return;

        gsap.registerPlugin(ScrollTrigger);

        ctx.add(() => {
          const proxy = { progress: 0 };

          gsap.to(proxy, {
            progress: 1,
            duration: 1.1,
            ease: "power3.out",
            onUpdate: () => setProgress(proxy.progress),
            onComplete: () => {
              target.style.clipPath = finalClipPath;
            },
            scrollTrigger: { trigger: target, start: "top 80%", once: true },
          });
        });
      } catch {
        // チャンクの取得に失敗しても、写真が閉じたまま残らないようにする
        if (!disposed) target.style.clipPath = finalClipPath;
      }
    };

    void register();

    return () => {
      disposed = true;
      ctx.revert();
      target.style.clipPath = finalClipPath;
    };
  }, []);

  return markerRef;
}

export function SpecialGuestMotion() {
  const staggerMarkerRef = useScrollReveal(SPECIAL_GUEST_MOTION);
  const wipeMarkerRef = useWipeReveal();

  return (
    <>
      <span ref={staggerMarkerRef} hidden aria-hidden="true" />
      <span ref={wipeMarkerRef} hidden aria-hidden="true" />
    </>
  );
}
