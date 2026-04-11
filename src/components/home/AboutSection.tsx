"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import { aboutConfig } from "@/data/about";

gsap.registerPlugin(ScrollTrigger);

const { topSection } = aboutConfig;

/**
 * ABOUTセクション
 * 左に円形画像（歯車装飾付き）、右にテキストコンテンツの2カラムレイアウト
 * スクロールトリガーによるエントランスアニメーション付き
 */
export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const gearRef = useRef<HTMLImageElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const paragraphsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    const ctx = gsap.context(() => {
      const scrollTriggerBase = {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
      };

      // 画像: スケールアップ + フェードイン
      if (imageWrapperRef.current) {
        gsap.set(imageWrapperRef.current, { opacity: 0, scale: 0.85 });
        gsap.to(imageWrapperRef.current, {
          opacity: 1,
          scale: 1,
          duration: 0.8,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: scrollTriggerBase,
        });
      }

      // 歯車: 回転 + フェードイン（遅延）
      if (gearRef.current) {
        gsap.set(gearRef.current, { opacity: 0, rotation: -45 });
        gsap.to(gearRef.current, {
          opacity: 1,
          rotation: 0,
          duration: 0.9,
          ease: "power3.out",
          force3D: true,
          delay: 0.3,
          scrollTrigger: { ...scrollTriggerBase },
        });
      }

      // テキスト要素: スタガーでフェードイン + スライドアップ
      const textTargets = [
        labelRef.current,
        headingRef.current,
        taglineRef.current,
        paragraphsRef.current,
        ctaRef.current,
      ].filter(Boolean) as HTMLElement[];

      gsap.set(textTargets, { opacity: 0, y: 30 });
      gsap.to(textTargets, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power4.out",
        stagger: 0.12,
        force3D: true,
        scrollTrigger: { ...scrollTriggerBase },
      });
    }, sectionRef);

    ctxRef.current = ctx;

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-0 -mt-48 pt-72 pb-40 lg:pt-80 lg:pb-52 overflow-visible"
    >
      {/* z-0: 背景グラデーションblob（ピンク系グロウ） */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div
          className="animate-blob absolute top-[10%] right-[5%] md:right-[0%] h-[50%] w-[45%] rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255,140,200,0.4), transparent 70%)",
            animation: "blob-drift-2 20s ease-in-out infinite",
          }}
        />
        <div
          className="animate-blob absolute top-[40%] left-[0%] md:-left-[5%] h-[45%] w-[40%] rounded-full"
          style={{
            background:
              "radial-gradient(circle at center, rgba(255,160,210,0.35), transparent 70%)",
            animation: "blob-drift-1 24s ease-in-out infinite",
            animationDelay: "-8s",
          }}
        />
        <div
          className="animate-blob absolute bottom-[5%] right-[15%] h-[40%] w-[35%] rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255,180,220,0.4), transparent 70%)",
            animation: "blob-drift-2 18s ease-in-out infinite",
            animationDelay: "-11s",
          }}
        />
      </div>

      <div className="relative z-20 mx-auto max-w-6xl px-8 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 左: 円形画像 + 歯車装飾 */}
          <div className="flex justify-center">
            <div
              ref={imageWrapperRef}
              className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] will-change-transform opacity-0"
            >
              {/* メイン円形画像 */}
              <div className="relative aspect-square overflow-hidden rounded-full">
                <Image
                  src={topSection.image.src}
                  alt={topSection.image.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 300px, (max-width: 1024px) 360px, 420px"
                />
              </div>

              {/* 歯車装飾: 右下に1個 */}
              <img
                ref={gearRef}
                src="/materials/geer1.webp"
                alt=""
                aria-hidden="true"
                className="absolute bottom-[2%] right-[2%] w-16 sm:w-20 lg:w-24 pointer-events-none select-none will-change-transform opacity-0"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>

          {/* 右: テキストコンテンツ */}
          <div>
            {/* ラベル */}
            <p
              ref={labelRef}
              className="mb-4 text-xs uppercase tracking-widest text-white/60 opacity-0"
            >
              {topSection.label}
            </p>

            {/* 見出し */}
            <h2
              ref={headingRef}
              className="mb-4 text-4xl font-bold text-white md:text-5xl lg:text-6xl opacity-0"
            >
              {topSection.heading}
            </h2>

            {/* タグライン */}
            <p ref={taglineRef} className="mb-8 text-lg font-medium text-white/80 opacity-0">
              {topSection.tagline}
            </p>

            {/* 本文 */}
            <div ref={paragraphsRef} className="mb-10 space-y-4 opacity-0">
              {topSection.paragraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-white/70">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA */}
            <Link
              ref={ctaRef}
              href={topSection.cta.href}
              className="group inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary/85 hover:shadow-lg opacity-0"
            >
              {topSection.cta.label}
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
