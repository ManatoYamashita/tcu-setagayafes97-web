"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * ScrollTrigger のチャンクを取りに行く距離。
 *
 * AboutSection は `-35%` で「セクションが画面に入ってから」読みに行くが、それだと
 * ScrollTrigger を作った時点で既に `top 80%` を通過済みになり、トリガーが即発火して
 * 演出の開始位置が IntersectionObserver 側の境界で決まってしまう。
 * ここでは SponsorLogoLoopLoader と同じ先読みの向き（正のマージン）にして、
 * セクションが近づいた時点でチャンクを用意し、実際の発火は DESIGN.md の基準である
 * `top 80%` に任せる。
 */
const PRELOAD_ROOT_MARGIN = "600px 0px";

/**
 * 著名人企画の告知セクション（SpecialGuestSection）の入場モーション。
 *
 * SpecialPageMotion / AccessPageMotion と同じく、非表示のマーカーを1つ置いて
 * data 属性だけをフックにします。SpecialGuestSection は async Server Component なので、
 * この方式なら "use client" をセクション本体へ広げずに演出を足せます。
 *
 * マーカーは `<section>` の直下の先頭に置く前提です。`parentElement` をスコープに取るため、
 * トップページ（variant="hero"）でも /events（variant="sheet"）でも同じ構造で動きます。
 *
 * JavaScript 無効時と prefers-reduced-motion 時は、静的な完成形をそのまま表示します
 * （入場はすべて gsap.from() なので、何も実行しなければ完成形になります）。
 * AboutSection のように className へ opacity-0 を直書きする方式は採りません。
 * あの方式は JS が動かないと要素が永久に不可視のまま残ります。
 *
 * ScrollTrigger は動的 import で初期チャンクから外します。このセクションは
 * トップページに乗るため、docs/frontend/performance.md の方針に合わせています
 * （SpecialPageMotion が静的 import なのは、あちらが下層ページ専用で予算が違うためです）。
 */
export function SpecialGuestMotion() {
  const markerRef = useRef<HTMLSpanElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const root = markerRef.current?.parentElement;

    if (!root || ctxRef.current) return;
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    let disposed = false;

    const startAnimation = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (disposed || ctxRef.current) return;

      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        // DESIGN.md の共通基準。各 tween へはスプレッドしたコピーを渡す
        const scrollTriggerBase = {
          start: "top 80%",
          once: true,
        };

        // 画像。スケールと位置だけを動かし、写真そのものは最初から見えている
        const revealTargets = gsap.utils.toArray<HTMLElement>("[data-special-guest-reveal]", root);

        revealTargets.forEach((target) => {
          gsap.from(target, {
            autoAlpha: 0,
            scale: 0.97,
            y: 18,
            duration: 0.85,
            ease: "power3.out",
            force3D: true,
            clearProps: "opacity,visibility,transform",
            scrollTrigger: { ...scrollTriggerBase, trigger: target },
          });
        });

        // テキスト列。直下の子（見出し → 明細 → CTA）を順に出す
        const staggerGroups = gsap.utils.toArray<HTMLElement>("[data-special-guest-stagger]", root);

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
            scrollTrigger: { ...scrollTriggerBase, trigger: group },
          });
        });
      }, root);

      ctxRef.current = ctx;

      // /events 側のセクションは content-visibility: auto を持つ。画面外では
      // contain-intrinsic-size の推定値が要素高になるため、実寸が確定した時点で
      // トリガー位置を測り直す。
      ScrollTrigger.refresh();
    };

    if (!("IntersectionObserver" in window)) {
      void startAnimation();

      return () => {
        disposed = true;
        ctxRef.current?.revert();
        ctxRef.current = null;
      };
    }

    // 既にスクロールで通り過ぎている場合は待たずに実行する
    if (root.getBoundingClientRect().bottom <= 0) {
      void startAnimation();

      return () => {
        disposed = true;
        ctxRef.current?.revert();
        ctxRef.current = null;
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        void startAnimation();
      },
      { rootMargin: PRELOAD_ROOT_MARGIN }
    );

    observer.observe(root);

    return () => {
      disposed = true;
      observer.disconnect();
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return <span ref={markerRef} hidden aria-hidden="true" />;
}
