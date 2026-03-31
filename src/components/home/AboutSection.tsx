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
    <section
      className="relative -mt-48 pt-72 pb-24 lg:pt-80 lg:pb-32 overflow-hidden"
      style={{
        background: "linear-gradient(to bottom, transparent 0%, var(--color-secondary) 380px)",
      }}
    >
      {/* 背景グラデーションblob（ピンク系グロウ） */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div
          className="animate-blob absolute top-[10%] right-[0%] h-[50%] w-[45%] rounded-full"
          style={{
            background: "radial-gradient(circle at center, rgba(255,140,200,0.4), transparent 70%)",
            animation: "blob-drift-2 20s ease-in-out infinite",
          }}
        />
        <div
          className="animate-blob absolute top-[40%] -left-[5%] h-[45%] w-[40%] rounded-full"
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
