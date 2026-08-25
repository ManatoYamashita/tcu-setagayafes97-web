"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

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
 * Accessページ専用の入場モーション。
 *
 * PageSheetLayout内に非表示マーカーとして置き、data属性だけをフックにしてGSAPを適用する。
 * JavaScript無効時とprefers-reduced-motion時は、静的な完成形をそのまま表示する。
 */
export function AccessPageMotion() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    const pageSheet = markerRef.current?.closest<HTMLElement>("[data-page-sheet]");
    const root = pageSheet?.parentElement;

    if (!root || ctxRef.current) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const ctx = gsap.context(() => {
      const heroImage = root.querySelector<HTMLElement>("[data-page-hero-image]");
      const heroImageElement = heroImage?.querySelector("img");
      const heroCopy = root.querySelector<HTMLElement>("[data-page-hero-copy]");
      const heroCopyItems = heroCopy ? Array.from(heroCopy.children) : [];

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

      const revealTargets = gsap.utils.toArray<HTMLElement>("[data-access-reveal]", root);

      revealTargets.forEach((target) => {
        const variant = (target.dataset.accessReveal || "up") as RevealVariant;

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

      const staggerGroups = gsap.utils.toArray<HTMLElement>("[data-access-stagger]", root);

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
    ScrollTrigger.refresh();

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
