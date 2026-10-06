"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

import { gearClipPath } from "@/lib/gear-profile";
import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/use-scroll-reveal";

/**
 * 著名人企画の告知セクション（SpecialGuestSection）の入場モーション。
 *
 * 2つの演出を持つ。
 *
 * - テキスト側の stagger: 実装は `@/lib/use-scroll-reveal`。ここは属性名を宣言するだけ
 * - 写真の歯車リビール: 歯車形の窓が中心から回転しながら広がり、写真が現れる。
 *   回すのは窓（clip-path）だけで、写真そのものは回さない
 *
 * マーカーは `<section>` の直下の先頭に置く前提。どちらの演出も `parentElement` を
 * スコープに取るため、トップページ（variant="hero"）でも /events（variant="sheet"）でも
 * 同じ構造で動く。
 *
 * 歯車リビールは CSS の `clip-path: polygon()` を毎フレーム書き換える。点の数は
 * scale や回転によらず一定（gearClipPath）なので形が飛ばない。SVG の clipPath を
 * transform で動かす方式は、Safari で再描画が追従しないことがあるため使わない。
 */
const SPECIAL_GUEST_MOTION: UseScrollRevealOptions = {
  // 写真は下の歯車リビールが受け持つため、この属性を持つ要素は現在ない
  revealAttribute: "data-special-guest-reveal",
  staggerAttribute: "data-special-guest-stagger",
};

const GEAR_ATTRIBUTE = "data-special-guest-gear";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
/** 窓が広がりきるまでに回す角度（度）。負の値は反時計回りから戻る向き */
const GEAR_REVEAL_ROTATION_DEG = -90;

function useGearReveal() {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const target = markerRef.current?.parentElement?.querySelector<HTMLElement>(
      `[${GEAR_ATTRIBUTE}]`
    );

    if (!target) return;

    // IMPORTANT: この判定より前で gsap に触れないこと。return すれば SSR の完成形が残る
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const finalClipPath = gearClipPath();
    const setProgress = (progress: number) => {
      target.style.clipPath = gearClipPath({
        scale: progress,
        rotationDeg: GEAR_REVEAL_ROTATION_DEG * (1 - progress),
      });
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
  const gearMarkerRef = useGearReveal();

  return (
    <>
      <span ref={staggerMarkerRef} hidden aria-hidden="true" />
      <span ref={gearMarkerRef} hidden aria-hidden="true" />
    </>
  );
}
