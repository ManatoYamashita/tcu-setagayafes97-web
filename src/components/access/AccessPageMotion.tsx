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
  const heroImage = root.querySelector<HTMLElement>("[data-page-hero-image]");
  const heroImageElement = heroImage?.querySelector("img");
  const heroCopy = root.querySelector<HTMLElement>("[data-page-hero-copy]");
  const heroCopyItems = heroCopy ? Array.from(heroCopy.children) : [];
  const pageSheet = root.querySelector<HTMLElement>("[data-page-sheet]");

  const entrance = gsap.timeline({
    defaults: { ease: "power3.out", force3D: true },
  });

  if (heroImage) {
    entrance.from(
      heroImage,
      {
        autoAlpha: 0,
        duration: 0.9,
        clearProps: "opacity,visibility,transform",
      },
      0
    );
  }

  if (heroImageElement) {
    entrance.from(
      heroImageElement,
      {
        scale: 1.08,
        duration: 1.35,
        clearProps: "transform",
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

  if (pageSheet) {
    entrance.from(
      pageSheet,
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
 * Accessページ専用の入場モーション。
 *
 * 演出の共通部分は `@/lib/use-scroll-reveal` にある。ここは対象の属性名、発火位置、
 * ヒーロー入場の組み立てを宣言するだけ。
 *
 * マーカーは PageSheetLayout の children に置かれるため、シートを1段昇って
 * ヒーローとシートの両方を含む要素をスコープにする。
 *
 * `data-access-reveal` は4バリアント（left / right / up / scale）すべてを実使用する
 * 唯一のページ。
 */
const ACCESS_MOTION: UseScrollRevealOptions = {
  revealAttribute: "data-access-reveal",
  staggerAttribute: "data-access-stagger",
  resolveRoot: (marker) => marker.closest<HTMLElement>("[data-page-sheet]")?.parentElement,
  revealStart: "top 86%",
  staggerStart: "top 84%",
  entrance: runEntrance,
  waitForOpener: true,
};

export function AccessPageMotion() {
  const markerRef = useScrollReveal(ACCESS_MOTION);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
