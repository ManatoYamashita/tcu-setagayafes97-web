import { Fragment } from "react";
import { AppImage } from "./AppImage";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { PageHeroData } from "@/data/page-heroes";

export type PageHeroSize = "default" | "compact";

interface PageHeroProps extends PageHeroData {
  /** 一覧・検索など、初期画面から操作へ早く到達させたいページ向け */
  size?: PageHeroSize;
}

/**
 * セクションページ共通ヒーローコンポーネント
 *
 * - default: 70svh高。ブランド訴求を優先する通常ページ向け
 * - compact: 52svh高（lg以上は50svh）。一覧・検索など操作を優先するページ向け
 * - 画像あり: 画像70vw右寄せ、テキスト左下オーバーレイ
 * - 画像なし: テキストセンター表示
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
  size = "default",
}: PageHeroProps) {
  const hasImage = !!imageSrc;
  const heightClass =
    size === "compact" ? "h-[52svh] min-h-[360px] lg:h-[50svh]" : "h-[70svh] min-h-[400px]";

  const renderedTitle = Array.isArray(title)
    ? title.map((line, i) => (
        <Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </Fragment>
      ))
    : title;

  return (
    <section
      className={`relative w-full overflow-hidden bg-secondary ${heightClass}`}
      data-page-hero
      data-page-hero-size={size}
    >
      {/* 画像レイヤー */}
      {hasImage && (
        <div
          className="page-hero-image-fade absolute inset-0 lg:inset-auto lg:right-0 lg:top-0 lg:h-full lg:w-[70vw]"
          data-page-hero-image
        >
          <AppImage
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
          <div className={hasImage ? "max-w-md lg:max-w-lg" : ""} data-page-hero-copy>
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
              <Link href={ctaHref} className="group mt-6 inline-flex items-center gap-4 lg:mt-8">
                {/*
                  この円の中身は ArrowRight アイコンだけで、文字を持たない。
                  白と primary-400（実配信 #bf73e3）の比は 3.10:1 で、通常テキストの
                  4.5:1 には届かないが、**非テキストコントラスト（WCAG 1.4.11）の
                  要求は 3:1** であり満たしている。ラベルは隣の <span> にあり、
                  そちらは text-gray-900 で地の上に置かれている。

                  #95 の規則は className の文字列しか見られず、中身がアイコンか
                  文字かを判別できない。ここだけ射程外であることを明示して外す。
                  **余裕は 0.10 しかないため、この円の色を薄くしてはいけない。**
                */}
                {/* eslint-disable-next-line no-restricted-syntax -- アイコンのみ。1.4.11 の 3:1 を満たす（上のコメント） */}
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-primary-500 bg-primary-400 text-white transition-colors group-hover:bg-primary-500 lg:h-16 lg:w-16">
                  <ArrowRight className="h-5 w-5 lg:h-6 lg:w-6" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold uppercase tracking-wider text-gray-900 lg:text-base">
                  {ctaLabel}
                </span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* バッジ（将来利用） */}
      {hasImage && badgeSrc && (
        <div className="absolute right-4 top-24 z-30 h-20 w-20 overflow-hidden rounded-full border-4 border-secondary shadow-lg lg:right-8 lg:top-28 lg:h-24 lg:w-24">
          <AppImage src={badgeSrc} alt={badgeAlt ?? ""} fill className="object-cover" />
        </div>
      )}
    </section>
  );
}
