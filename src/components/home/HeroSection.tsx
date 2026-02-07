import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SocialIcons } from "@/components/ui/SocialIcons";

/**
 * ヒーローセクション（参考サイト構造の完全再現）
 * - absolute/relative複合レイアウト
 * - viewport単位（60-62vw × 65-68vh）
 * - 拡大された円形バッジ（192-320px）
 * - テキスト左下寄り配置
 * - 5層z-index構造（z-50/40/30/20/10）
 */
export function HeroSection() {
  return (
    <section className="w-full min-h-screen relative bg-accent-green overflow-hidden flex items-center justify-center">
      {/* テキストエリア（absolute、左下寄り、z-30） */}
      <div className="absolute left-0 top-0 w-full h-full flex items-end pb-16 lg:pb-20 z-30 pointer-events-none">
        <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pointer-events-auto">
          <h2 className="text-white font-black tracking-tight leading-tight text-5xl lg:text-7xl xl:text-8xl drop-shadow-lg">
            さあ、
            <br />
            森からはじまる
            <br />
            未来へ
          </h2>

          <div className="flex items-center gap-4 mt-8">
            <a
              href="/events"
              aria-label="企画一覧を見る"
              className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
            >
              <ArrowRight className="w-6 h-6 text-primary" />
            </a>
            <span className="text-base text-white font-semibold uppercase tracking-wider">
              View More
            </span>
          </div>
        </div>
      </div>

      {/* 画像エリア（absolute、右寄り、z-20） */}
      <div className="absolute right-0 sm:right-4 lg:right-8 top-1/2 -translate-y-1/2 z-20">
        <div className="relative w-[90vw] sm:w-[60vw] lg:w-[62vw] h-[60vh] sm:h-[65vh] lg:h-[68vh] rounded-[3rem] overflow-hidden shadow-2xl">
          <Image
            src="/images/placeholder/p.jpeg"
            alt={`${siteConfig.name} メインビジュアル`}
            fill
            priority
            fetchPriority="high"
            className="object-cover"
            sizes="(max-width: 640px) 90vw, (max-width: 1024px) 60vw, 62vw"
          />

          {/* 左上通知ラベル（z-40） */}
          <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-accent-yellow px-6 py-3 sm:px-8 sm:py-4 rounded shadow-lg max-w-[85%] sm:max-w-[60%] z-40">
            <p className="text-xs sm:text-sm font-bold text-dark-green leading-snug">
              第97回 世田谷祭は、たくさんの想いに支えられフィナーレを迎えました。
              <br className="hidden sm:block" />
              たくさんのご来場と応援、ありがとうございました！
            </p>
          </div>

          {/* 右上バッジ（z-40） */}
          <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-16 md:-top-20 md:-right-20 lg:-top-24 lg:-right-24 w-48 sm:w-56 md:w-64 lg:w-72 xl:w-80 aspect-square rounded-full overflow-hidden shadow-2xl z-40">
            <Image
              src="/images/placeholder/p.jpeg"
              alt={`第${siteConfig.edition}回 世田谷祭`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 192px, (max-width: 768px) 224px, (max-width: 1024px) 256px, (max-width: 1280px) 288px, 320px"
            />
          </div>
        </div>
      </div>

      {/* 下部中央: SCROLL TO EXPLORE（z-50） */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex flex-col items-center text-dark-green">
          <span className="mb-2 text-sm font-semibold uppercase tracking-widest">
            Scroll to Explore
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </div>

      {/* 下部右: SNSアイコン（z-50） */}
      <div className="absolute bottom-8 right-8 z-50">
        <SocialIcons layout="horizontal" size="md" showLabel className="text-dark-green" />
      </div>
    </section>
  );
}
