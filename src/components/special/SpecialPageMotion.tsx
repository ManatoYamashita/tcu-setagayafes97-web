"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { OPENER_FAILSAFE_MS } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

type RevealVariant = "left" | "right" | "scale" | "up";

const revealOffsets: Record<RevealVariant, gsap.TweenVars> = {
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
  scale: { scale: 0.97, y: 18 },
  up: { y: 32 },
};

/**
 * 著名人企画LP専用の入場モーション。
 *
 * AccessPageMotion と同じく、非表示マーカーを1つ置いて data 属性だけをフックにする。
 * LP のセクションはすべて Server Component のため、この方式なら "use client" を
 * 広げずに演出を足せる。
 *
 * JavaScript無効時と prefers-reduced-motion 時は、静的な完成形をそのまま表示する
 * （入場はすべて gsap.from() なので、何も実行しなければ完成形になる）。
 *
 * AccessPageMotion からあえて変えている点が2つある。
 *
 * 1. ヒーローの背景写真は opacity を触らず scale だけを動かす。
 *    この写真は priority 付きで、ページの LCP 候補そのもの。
 *    docs/frontend/performance.md の「LCP 候補はサーバーHTMLから可視状態にする」に従う。
 *
 * 2. ヒーローの入場は `opener-done` を待つ。OpenerLoader は app/layout.tsx にあり
 *    全ページで動くため、待たないとオープナーが画面を覆っている間に演出が終わる。
 *    スクロールリビール側は待たずに登録する（待つとファーストビュー直下の
 *    セクションで発火を取りこぼす）。
 */
export function SpecialPageMotion() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    // マーカーはページ最上位のラッパー直下に置く前提。ヒーローと白いシートの
    // 両方を含む要素をスコープにする。
    const root = markerRef.current?.parentElement;

    if (!root || ctxRef.current) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const ctx = gsap.context(() => {
      const revealTargets = gsap.utils.toArray<HTMLElement>("[data-special-reveal]", root);

      revealTargets.forEach((target) => {
        const variant = (target.dataset.specialReveal || "up") as RevealVariant;

        gsap.from(target, {
          autoAlpha: 0,
          duration: variant === "scale" ? 0.85 : 0.72,
          ease: "power3.out",
          force3D: true,
          clearProps: "opacity,visibility,transform",
          ...revealOffsets[variant],
          scrollTrigger: {
            trigger: target,
            start: "top 86%",
            once: true,
          },
        });
      });

      const staggerGroups = gsap.utils.toArray<HTMLElement>("[data-special-stagger]", root);

      staggerGroups.forEach((group) => {
        const items = Array.from(group.children);

        if (items.length === 0) return;

        gsap.from(items, {
          autoAlpha: 0,
          y: 24,
          duration: 0.64,
          ease: "power3.out",
          stagger: 0.1,
          force3D: true,
          clearProps: "opacity,visibility,transform",
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            once: true,
          },
        });
      });
    }, root);

    ctxRef.current = ctx;

    let entranceStarted = false;

    /**
     * ヒーローと白いシートの入場。
     * オープナーの完了イベントとフェイルセーフの両方から呼ばれるため、多重実行を防ぐ。
     */
    const runEntrance = () => {
      if (entranceStarted || !ctxRef.current) return;
      entranceStarted = true;

      ctxRef.current.add(() => {
        const heroImage = root.querySelector<HTMLElement>("[data-special-hero-image] img");
        const heroOverlay = root.querySelector<HTMLElement>("[data-special-hero-overlay]");
        const heroCopy = root.querySelector<HTMLElement>("[data-special-hero-copy]");
        const heroCopyItems = heroCopy ? Array.from(heroCopy.children) : [];
        const sheet = root.querySelector<HTMLElement>("[data-special-sheet]");

        const entrance = gsap.timeline({
          defaults: { ease: "power3.out", force3D: true },
        });

        // 背景写真は LCP 候補。opacity / visibility には触れない。
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
      });
    };

    // 遅延ローダーの空フォールバックは、実体のオープナーとして扱わない。
    const hasOpener = !!document.querySelector("[data-opener-active]");
    let failsafeId: number | undefined;

    if (hasOpener) {
      window.addEventListener("opener-done", runEntrance);
      failsafeId = window.setTimeout(runEntrance, OPENER_FAILSAFE_MS);
    } else {
      runEntrance();
    }

    ScrollTrigger.refresh();

    return () => {
      window.removeEventListener("opener-done", runEntrance);
      if (failsafeId !== undefined) window.clearTimeout(failsafeId);
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
