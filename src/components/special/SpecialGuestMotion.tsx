"use client";

import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/use-scroll-reveal";

/**
 * 著名人企画の告知セクション（SpecialGuestSection）の入場モーション。
 *
 * 演出の実装は `@/lib/use-scroll-reveal` にある。ここは対象の属性名と
 * バリアントを宣言するだけ。
 *
 * マーカーは `<section>` の直下の先頭に置く前提。フックが `parentElement` を
 * スコープに取るため、トップページ（variant="hero"）でも /events（variant="sheet"）でも
 * 同じ構造で動く。
 *
 * IMPORTANT: `data-special-guest-reveal` は**値を持たない**属性として宣言されている
 * （SpecialGuestSection.tsx）。属性値が空のときフックは `defaultVariant` へ落ちるので、
 * ここで `"scale"` を指定しないと `up`（y: 32）になり演出が変わる。
 * `scale` の実体は `{ scale: 0.97, y: 18 }` + duration 0.85 で、移行前の値と一致する。
 */
const SPECIAL_GUEST_MOTION: UseScrollRevealOptions = {
  revealAttribute: "data-special-guest-reveal",
  staggerAttribute: "data-special-guest-stagger",
  defaultVariant: "scale",
};

export function SpecialGuestMotion() {
  const markerRef = useScrollReveal(SPECIAL_GUEST_MOTION);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
