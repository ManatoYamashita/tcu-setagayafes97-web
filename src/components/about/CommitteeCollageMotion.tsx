"use client";

import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/use-scroll-reveal";

/**
 * 委員会の写真コラージュ（CommitteePhotoCollage）の入場モーション。
 *
 * 演出の実装は `@/lib/use-scroll-reveal` にある。ここは対象の属性名を宣言するだけ。
 * 列ごとに `data-committee-collage-stagger` を付けているため、列の中の写真が順に
 * 浮き上がる。列ごとに縦位置をずらしてあるので、発火も左 → 中央 → 右の順に自然にずれる。
 *
 * マーカーはコラージュのラッパー直下の先頭に置く前提（フックが `parentElement` を
 * スコープに取る）。
 */
const COMMITTEE_COLLAGE_MOTION: UseScrollRevealOptions = {
  revealAttribute: "data-committee-collage-reveal",
  staggerAttribute: "data-committee-collage-stagger",
};

export function CommitteeCollageMotion() {
  const markerRef = useScrollReveal(COMMITTEE_COLLAGE_MOTION);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
