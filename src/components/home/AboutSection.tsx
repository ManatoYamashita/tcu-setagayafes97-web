import Image from "next/image";
import Link from "next/link";

import { aboutConfig } from "@/data/about";

const { topSection } = aboutConfig;

/**
 * ABOUTセクション
 * 左に円形画像（歯車装飾付き）、右にテキストコンテンツの2カラムレイアウト
 */
export function AboutSection() {
  return (
    <section className="relative -mt-48 bg-secondary pt-72 pb-24 lg:pt-80 lg:pb-32 overflow-hidden">
      {/* 背景グラデーションblob */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute top-[10%] right-[0%] h-[40%] w-[35%] rounded-full bg-pink-300/30 blur-[100px]" />
        <div className="absolute top-[40%] -left-[5%] h-[35%] w-[30%] rounded-full bg-sky-300/25 blur-[90px]" />
        <div className="absolute bottom-[5%] right-[15%] h-[30%] w-[25%] rounded-full bg-white/20 blur-[80px]" />
      </div>

      <div className="mx-auto max-w-6xl px-8 sm:px-12 lg:px-20">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* 左: 円形画像 + 歯車装飾 */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-[300px] sm:max-w-[360px] lg:max-w-[420px]">
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
                src="/materials/geer1.webp"
                alt=""
                aria-hidden="true"
                className="absolute bottom-[2%] right-[2%] w-16 sm:w-20 lg:w-24 pointer-events-none select-none"
                loading="lazy"
                draggable={false}
              />
            </div>
          </div>

          {/* 右: テキストコンテンツ */}
          <div>
            {/* ラベル */}
            <p className="mb-4 text-xs uppercase tracking-widest text-gray-500">
              {topSection.label}
            </p>

            {/* 見出し */}
            <h2 className="mb-4 text-4xl font-bold text-primary-400 md:text-5xl lg:text-6xl">
              {topSection.heading}
            </h2>

            {/* タグライン */}
            <p className="mb-8 text-lg font-medium text-gray-700">{topSection.tagline}</p>

            {/* 本文 */}
            <div className="mb-10 space-y-4">
              {topSection.paragraphs.map((paragraph, i) => (
                <p key={i} className="leading-relaxed text-gray-600">
                  {paragraph}
                </p>
              ))}
            </div>

            {/* CTA */}
            <Link
              href={topSection.cta.href}
              className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-400 underline underline-offset-4 transition-opacity hover:opacity-70"
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
