"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { gsap } from "gsap";
import type { News } from "@/types/news";
import { CircularText } from "@/components/ui/CircularText";
import { NewsFilter } from "./NewsFilter";

interface NewsSectionProps {
  newsList: News[];
}

/**
 * お知らせセクション
 * 白シート + Type絞り込みタブ + 2段グリッド（Featured 2件 + Regular）+ 歯車装飾
 * ScrollTriggerによるエントランスアニメーション付き
 */
export function NewsSectionInteractive({ newsList }: NewsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);
  const whiteSheetRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const gear1Ref = useRef<HTMLImageElement>(null);
  const gear2Ref = useRef<HTMLImageElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;
    const section = sectionRef.current;
    if (!section) return;

    let disposed = false;

    const startAnimation = async () => {
      // NEWS is below the initial viewport. Defer the ScrollTrigger bundle and
      // its layout reads until the section is close to entering the viewport.
      const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReduced) {
        // reduced-motion: 全要素を即座に表示
        if (heroImageRef.current) {
          heroImageRef.current.style.clipPath = "none";
        }

        const targets = [
          whiteSheetRef.current,
          ctaRef.current,
          gear1Ref.current,
          gear2Ref.current,
        ].filter(Boolean) as HTMLElement[];

        targets.forEach((el) => {
          el.style.opacity = "1";
          el.style.transform = "none";
        });

        const cards = sectionRef.current?.querySelectorAll(".news-card");
        cards?.forEach((el) => {
          (el as HTMLElement).style.opacity = "1";
          (el as HTMLElement).style.transform = "none";
        });
        return;
      }

      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (disposed || ctxRef.current) return;
      gsap.registerPlugin(ScrollTrigger);

      const ctx = gsap.context(() => {
        const scrollTriggerBase = {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        };

        // 1. 背景画像: clipPathリヴィール（左→右）+ スケールダウン
        if (heroImageRef.current) {
          gsap.set(heroImageRef.current, {
            clipPath: "inset(0% 100% 0% 0%)",
            opacity: 1,
          });
          gsap.set(heroImageRef.current.querySelector("img"), {
            scale: 1.3,
          });

          const revealTl = gsap.timeline({
            scrollTrigger: scrollTriggerBase,
          });

          revealTl.to(heroImageRef.current, {
            clipPath: "inset(0% 0% 0% 0%)",
            duration: 1.2,
            ease: "power4.inOut",
            force3D: true,
          });
          revealTl.to(
            heroImageRef.current.querySelector("img"),
            {
              scale: 1,
              duration: 1.4,
              ease: "power3.out",
              force3D: true,
            },
            0.15
          );
        }

        // 2. 白シート: スライドアップ + フェードイン
        if (whiteSheetRef.current) {
          gsap.set(whiteSheetRef.current, { opacity: 0, y: 40 });
          gsap.to(whiteSheetRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power4.out",
            force3D: true,
            scrollTrigger: { ...scrollTriggerBase },
          });
        }

        // 3. ヘッダー + タブ: staggerスライドアップ
        const headerTargets = sectionRef.current?.querySelectorAll(".news-header, .news-tabs");
        if (headerTargets && headerTargets.length > 0) {
          gsap.set(headerTargets, { opacity: 0, y: 30 });
          gsap.to(headerTargets, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power4.out",
            stagger: 0.12,
            force3D: true,
            delay: 0.15,
            scrollTrigger: { ...scrollTriggerBase },
          });
        }

        // 4. カード群: staggerスライドアップ
        const cards = sectionRef.current?.querySelectorAll(".news-card");
        if (cards && cards.length > 0) {
          gsap.set(cards, { opacity: 0, y: 30 });
          gsap.to(cards, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            stagger: 0.1,
            force3D: true,
            delay: 0.4,
            scrollTrigger: {
              ...scrollTriggerBase,
              onEnter: () => {
                // アニメーション完了後にinline styleをクリア（フィルター切替対応）
                setTimeout(
                  () => {
                    cards.forEach((card) => {
                      gsap.set(card, { clearProps: "all" });
                    });
                  },
                  600 + cards.length * 100 + 400
                );
              },
            },
          });
        }

        // 5. CTAボタン: スライドアップ + フェードイン
        if (ctaRef.current) {
          gsap.set(ctaRef.current, { opacity: 0, y: 20 });
          gsap.to(ctaRef.current, {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: "power3.out",
            delay: 0.6,
            force3D: true,
            scrollTrigger: { ...scrollTriggerBase },
          });
        }

        // 6. 歯車装飾: 回転 + フェードイン（AboutSectionパターン）
        const gears = [gear1Ref.current, gear2Ref.current].filter(Boolean) as HTMLElement[];
        if (gears.length > 0) {
          gsap.set(gears, { opacity: 0, rotation: -45 });
          gsap.to(gears, {
            opacity: 1,
            rotation: 0,
            duration: 0.9,
            ease: "power3.out",
            force3D: true,
            delay: 0.3,
            stagger: 0.15,
            scrollTrigger: { ...scrollTriggerBase },
          });
        }
      }, sectionRef);

      ctxRef.current = ctx;
    };

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
      !("IntersectionObserver" in window)
    ) {
      void startAnimation();
      return () => {
        disposed = true;
        ctxRef.current?.revert();
        ctxRef.current = null;
      };
    }

    const observeTarget = heroImageRef.current ?? section;
    if (observeTarget.getBoundingClientRect().bottom <= 0) {
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
      { rootMargin: "0px 0px -20% 0px" }
    );
    observer.observe(observeTarget);

    return () => {
      disposed = true;
      observer.disconnect();
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <section ref={sectionRef} className="relative bg-secondary">
      {/* 背景画像: 画面幅いっぱい */}
      <div
        ref={heroImageRef}
        className="relative h-[40vh] w-full overflow-hidden will-change-transform sm:h-[50vh] md:h-[60vh]"
        style={{ clipPath: "inset(0% 100% 0% 0%)" }}
      >
        <Image
          src="/images/photos/tcu-7.webp"
          alt="キャンパス風景"
          fill
          className="object-cover will-change-transform"
          style={{ transform: "scale(1.3)" }}
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
      </div>

      {/* CircularText装飾 */}
      <CircularText
        text="· SETAGAYA FES 97th · SETAGAYA FES 97th "
        spinDuration={20}
        className="pointer-events-none absolute right-0 top-32 z-0 w-72 -translate-y-1/2 translate-x-1/2 text-primary-400/60 md:w-80 lg:w-96"
      />

      {/* 白シートエリア: 画像に重なるように上にオフセット */}
      <div className="relative z-10 -mt-20 pb-32 sm:-mt-28 md:-mt-36">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* 白シート */}
            <div
              ref={whiteSheetRef}
              className="relative z-10 rounded-3xl bg-white px-6 py-12 opacity-0 shadow-xl will-change-transform sm:px-10 md:px-12 md:py-16 lg:px-16"
            >
              {/* タブ絞り込み + ニュース一覧（2カラム） */}
              <NewsFilter
                newsList={newsList}
                header={
                  <div className="news-header">
                    <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
                    <Link
                      href="/info"
                      className="mt-4 inline-flex items-center gap-2 font-semibold text-gray-900 transition-opacity hover:opacity-60"
                    >
                      <span>NEWS ALL</span>
                      <svg
                        className="h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17 8l4 4m0 0l-4 4m4-4H3"
                        />
                      </svg>
                    </Link>
                  </div>
                }
              />

              {/* CTA: お知らせ一覧へ */}
              <div
                ref={ctaRef}
                className="mt-10 flex justify-center opacity-0 will-change-transform"
              >
                <Link
                  href="/info"
                  className="group inline-flex items-center gap-3 rounded-full border-2 border-gray-900 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
                >
                  <span>お知らせ一覧を見る</span>
                  <svg
                    className="h-5 w-5 transition-transform group-hover:translate-x-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </Link>
              </div>
            </div>

            {/* 歯車装飾: 右下（複数歯車） */}
            <Image
              ref={gear1Ref}
              src="/materials/geers.webp"
              alt=""
              aria-hidden="true"
              width={500}
              height={500}
              sizes="(max-width: 767px) 112px, (max-width: 1023px) 160px, 192px"
              className="pointer-events-none absolute -bottom-8 right-8 z-20 w-28 select-none opacity-0 will-change-transform md:w-40 lg:w-48"
              draggable={false}
            />

            {/* 歯車装飾: 左下（単体歯車） */}
            <Image
              ref={gear2Ref}
              src="/materials/geer1.webp"
              alt=""
              aria-hidden="true"
              width={500}
              height={500}
              sizes="(max-width: 767px) 56px, (max-width: 1023px) 80px, 96px"
              className="pointer-events-none absolute -bottom-6 left-12 z-20 w-14 select-none opacity-0 will-change-transform md:w-20 lg:w-24"
              draggable={false}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
