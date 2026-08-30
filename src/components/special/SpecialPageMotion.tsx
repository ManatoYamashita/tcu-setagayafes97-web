"use client";

import { gsap } from "gsap";

import {
  useScrollReveal,
  type ScrollRevealScope,
  type UseScrollRevealOptions,
} from "@/lib/use-scroll-reveal";

/**
 * ヒーローと白いシートの入場。
 *
 * ScrollTrigger は使わない。フックはこれを動的 import の外（同期パス）で呼ぶため、
 * ここに ScrollTrigger を持ち込むと `opener-done` の後にチャンク取得のぶんだけ
 * 演出が遅れる。
 */
const runEntrance = ({ root }: ScrollRevealScope) => {
  const heroImage = root.querySelector<HTMLElement>("[data-special-hero-image] img");
  const heroOverlay = root.querySelector<HTMLElement>("[data-special-hero-overlay]");
  const heroCopy = root.querySelector<HTMLElement>("[data-special-hero-copy]");
  const heroCopyItems = heroCopy ? Array.from(heroCopy.children) : [];
  const sheet = root.querySelector<HTMLElement>("[data-special-sheet]");

  const entrance = gsap.timeline({
    defaults: { ease: "power3.out", force3D: true },
  });

  // 背景写真は LCP 候補。opacity / visibility には触れない。
  // docs/frontend/performance.md の「LCP 候補はサーバーHTMLから可視状態にする」に従う。
  if (heroImage) {
    entrance.from(
      heroImage,
      {
        scale: 1.06,
        duration: 1.35,
        clearProps: "transform",
      },
      0
    );
  }

  if (heroOverlay) {
    entrance.from(
      heroOverlay,
      {
        autoAlpha: 0,
        duration: 0.9,
        clearProps: "opacity,visibility",
      },
      0
    );
  }

  if (heroCopyItems.length > 0) {
    entrance.from(
      heroCopyItems,
      {
        autoAlpha: 0,
        y: 28,
        duration: 0.75,
        stagger: 0.1,
        clearProps: "opacity,visibility,transform",
      },
      0.18
    );
  }

  if (sheet) {
    entrance.from(
      sheet,
      {
        y: 48,
        duration: 0.9,
        clearProps: "transform",
      },
      0.48
    );
  }
};

/**
 * 著名人企画LP専用の入場モーション。
 *
 * 演出の共通部分は `@/lib/use-scroll-reveal` にある。ここは対象の属性名、発火位置、
 * ヒーロー入場の組み立てを宣言するだけ。
 *
 * マーカーはページ最上位のラッパー直下に置く前提。ヒーローと白いシートの
 * 両方を含む要素がスコープになる。
 *
 * ヒーロー入場だけ `opener-done` を待つ（`waitForOpener`）。OpenerLoader は
 * app/layout.tsx にあり全ページで動くため、待たないとオープナーが画面を覆っている
 * 間に演出が終わる。**スクロールリビール側はフックが待たずに登録する**
 * （待つとファーストビュー直下のセクションで発火を取りこぼす）。
 */
const SPECIAL_PAGE_MOTION: UseScrollRevealOptions = {
  revealAttribute: "data-special-reveal",
  staggerAttribute: "data-special-stagger",
  revealStart: "top 86%",
  staggerStart: "top 84%",
  entrance: runEntrance,
  waitForOpener: true,
};

export function SpecialPageMotion() {
  const markerRef = useScrollReveal(SPECIAL_PAGE_MOTION);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
