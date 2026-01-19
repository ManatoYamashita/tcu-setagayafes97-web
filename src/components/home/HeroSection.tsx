import Image from "next/image";
import Link from "next/link";
import { siteConfig } from "@/data/site";
import { Button } from "@/components/ui/Button";

/**
 * ヒーローセクション
 * トップページのメインビジュアルとキャッチコピーを表示
 */
export function HeroSection() {
  return (
    <section className="relative h-screen w-full">
      {/* 背景画像 */}
      <div className="absolute inset-0">
        <Image
          src="/images/hero/main-visual.jpg"
          alt={`${siteConfig.name} メインビジュアル`}
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        {/* オーバーレイ */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 flex h-full items-center justify-center">
        <div className="container mx-auto px-4 text-center text-white">
          {/* ロゴ・タイトル */}
          <div className="mb-8 animate-fade-in">
            <h1 className="mb-4 text-5xl font-bold leading-tight drop-shadow-lg md:text-6xl lg:text-7xl">
              {siteConfig.shortName}
            </h1>
            <p className="mb-2 text-xl drop-shadow-md md:text-2xl">第{siteConfig.edition}回</p>
            <p className="text-lg drop-shadow-md md:text-xl">東京都市大学 世田谷キャンパス</p>
          </div>

          {/* 開催日時 */}
          <div className="mb-10 animate-fade-in-delay">
            <p className="mb-1 text-2xl font-semibold drop-shadow-lg md:text-3xl">
              {siteConfig.dates.day1.replace(/-/g, ".")} -{" "}
              {siteConfig.dates.day2.replace(/-/g, ".")}
            </p>
            <p className="text-lg drop-shadow-md md:text-xl">
              {siteConfig.openTime} - {siteConfig.closeTime}
            </p>
          </div>

          {/* CTAボタン */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/events">
              <Button variant="primary" size="lg">
                企画を探す
              </Button>
            </Link>
            <Link href="/info">
              <Button variant="outline" size="lg">
                お知らせ
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* スクロールインジケーター */}
      <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 animate-bounce">
        <div className="flex flex-col items-center text-white">
          <span className="mb-2 text-sm">SCROLL</span>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
