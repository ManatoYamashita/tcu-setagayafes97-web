import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/data/site";

/**
 * ヒーローセクション
 * - シンプルな2カラムレイアウト（テキスト左下 / 画像右）
 * - ノイズ要素（通知ラベル・バッジ・PixelBlast・SNSアイコン）を除去
 */
export function HeroSection() {
  return (
    <section className="w-full min-h-[calc(100vh-5rem)] pt-20 relative bg-white overflow-hidden flex items-center justify-center">
      {/* テキストエリア（absolute、左下寄り、z-20） */}
      <div className="absolute left-0 top-0 w-full h-full flex items-end pb-12 lg:pb-16 xl:pb-20 z-20 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pointer-events-auto">
          <h2 className="text-dark-green font-bold tracking-tight leading-tight text-4xl lg:text-5xl xl:text-6xl">
            世田谷祭
            <br />
            世界を動かす
            <br />
            からくり
          </h2>

          <div className="flex items-center gap-4 mt-6">
            <a
              href="/events"
              aria-label="企画一覧を見る"
              className="w-16 h-16 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-primary"
            >
              <ArrowRight className="w-6 h-6 text-primary" />
            </a>
            <span className="text-base text-dark-green font-semibold uppercase tracking-wider">
              View More
            </span>
          </div>
        </div>
      </div>

      {/* 画像エリア（absolute、右寄り、z-10） */}
      <div className="absolute right-0 sm:right-4 md:right-6 lg:right-8 xl:right-10 2xl:right-12 top-1/2 -translate-y-1/2 z-10">
        <div className="w-[95vw] sm:w-[85vw] md:w-[82vw] lg:w-[82vw] xl:w-[82vw] h-[65vh] sm:h-[72vh] md:h-[78vh] lg:h-[80vh] xl:h-[82vh] rounded-2xl overflow-hidden">
          <Image
            src="/images/placeholder/p.jpeg"
            alt={`${siteConfig.name} メインビジュアル`}
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 82vw, 82vw"
          />
        </div>
      </div>
    </section>
  );
}
