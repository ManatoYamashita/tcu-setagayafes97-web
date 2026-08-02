import { Fragment } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PageHeroData } from "@/data/page-heroes";

/**
 * セクションページ共通ヒーローコンポーネント
 *
 * - 画像あり: 70svh高、画像70vw右寄せ、テキスト左下オーバーレイ
 * - 画像なし: 70svh高、テキストセンター表示
 * - Server Component（"use client" 不要）
 */
export function PageHero({
  title,
  subtitle,
  description,
  imageSrc,
  imageAlt,
  badgeSrc,
  badgeAlt,
  ctaHref,
  ctaLabel = "View More",
}: PageHeroData) {
  const hasImage = !!imageSrc;

  const renderedTitle = Array.isArray(title)
    ? title.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))
    : title;

  return (
    <section className="relative h-[70svh] min-h-[400px] w-full overflow-hidden bg-secondary">
      {/* 画像レイヤー */}
      {hasImage && (
        <div className="page-hero-image-fade absolute inset-0 lg:inset-auto lg:right-0 lg:top-0 lg:h-full lg:w-[70vw]">
          <Image
            src={imageSrc}
            alt={imageAlt ?? ""}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 70vw"
            priority
          />
        </div>
      )}

      {/* グラデーションオーバーレイ（テキスト可読性確保）
          モバイルは下→上、lg以上は左→右。方向の切り替えは page-hero-overlay 側のメディアクエリで完結する */}
      {hasImage && (
        <div
          className="page-hero-overlay pointer-events-none absolute inset-0 z-10"
          aria-hidden="true"
        />
      )}

      {/* テキストレイヤー */}
      <div
        className={
          hasImage
            ? "relative z-20 flex h-full items-end pb-8 lg:pb-16"
            : "relative z-20 flex h-full items-center justify-center text-center"
        }
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={hasImage ? "max-w-md lg:max-w-lg" : ""}>
            {subtitle && (
              <span className="mb-3 inline-block text-sm font-semibold uppercase tracking-widest text-gray-600 lg:mb-4">
                {subtitle}
              </span>
            )}
            <h1 className="text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:text-4xl lg:text-5xl xl:text-6xl">
              {renderedTitle}
            </h1>
            {description && (
              <p className="mt-3 text-base text-gray-900/90 lg:mt-4 lg:text-lg">{description}</p>
            )}
            {ctaHref && (
              <div className="mt-6 flex items-center gap-4 lg:mt-8">
                <Link
                  href={ctaHref}
                  aria-label={ctaLabel}
                  className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-500 bg-primary-400 text-white transition-colors hover:bg-primary-500 lg:h-16 lg:w-16"
                >
                  <ArrowRight className="h-5 w-5 lg:h-6 lg:w-6" />
                </Link>
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 lg:text-base">
                  {ctaLabel}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* バッジ（将来利用） */}
      {hasImage && badgeSrc && (
        <div className="absolute right-4 top-24 z-30 h-20 w-20 overflow-hidden rounded-full border-4 border-secondary shadow-lg lg:right-8 lg:top-28 lg:h-24 lg:w-24">
          <Image src={badgeSrc} alt={badgeAlt ?? ""} fill className="object-cover" />
        </div>
      )}
    </section>
  );
}
