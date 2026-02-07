import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SocialIcons } from "@/components/ui/SocialIcons";

/**
 * ヒーローセクション（参考サイト構造の完全再現）
 * - absolute/relative複合レイアウト
 * - viewport単位（70vw × 80vh デスクトップ、95vw × 65vh モバイル）
 * - 円形バッジ（128-256px、外側配置、参考サイト水準）
 * - テキスト左下寄り配置
 * - Header高さ考慮（min-h-[calc(100vh-4rem)] + pt-16）
 * - z-index標準化（Header: z-40 > Hero内最上位: z-30 > Hero内ベース: z-20/10）
 */
export function HeroSection() {
  return (
    <section className="w-full min-h-[calc(100vh-4rem)] pt-16 relative bg-accent-green overflow-hidden flex items-center justify-center">
      {/* テキストエリア（absolute、左下寄り、z-20） */}
      <div className="absolute left-0 top-0 w-full h-full flex items-end pb-20 lg:pb-24 xl:pb-28 z-20 pointer-events-none">
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

      {/* 画像エリア（absolute、右寄り、z-10） */}
      <div className="absolute right-0 sm:right-4 md:right-6 lg:right-8 xl:right-10 2xl:right-12 top-1/2 -translate-y-1/2 z-10">
        {/* 新規ラッパー追加 */}
        <div className="relative">
          <div className="relative w-[95vw] sm:w-[85vw] md:w-[78vw] lg:w-[72vw] xl:w-[70vw] h-[65vh] sm:h-[72vh] md:h-[75vh] lg:h-[78vh] xl:h-[80vh] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image
              src="/images/placeholder/p.jpeg"
              alt={`${siteConfig.name} メインビジュアル`}
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 78vw, (max-width: 1280px) 72vw, 70vw"
            />

            {/* 左上通知ラベル（z-40、内側維持） */}
            <div className="absolute top-6 left-6 sm:top-8 sm:left-8 bg-accent-yellow px-6 py-3 sm:px-8 sm:py-4 rounded shadow-lg max-w-[85%] sm:max-w-[60%] z-40">
              <p className="text-xs sm:text-sm font-bold text-dark-green leading-snug">
                第97回 世田谷祭は、たくさんの想いに支えられフィナーレを迎えました。
                <br className="hidden sm:block" />
                たくさんのご来場と応援、ありがとうございました！
              </p>
            </div>
          </div>

          {/* 円形バッジを外側に移動（z-30） */}
          <div className="absolute -top-6 -right-6 sm:-top-8 sm:-right-8 md:-top-10 md:-right-10 lg:-top-12 lg:-right-12 xl:-top-14 xl:-right-14 2xl:-top-16 2xl:-right-16 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-60 2xl:w-64 aspect-square rounded-full overflow-hidden shadow-2xl z-30">
            <Image
              src="/images/placeholder/p.jpeg"
              alt={`第${siteConfig.edition}回 世田谷祭`}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 128px, (max-width: 768px) 160px, (max-width: 1024px) 192px, (max-width: 1280px) 224px, (max-width: 1536px) 240px, 256px"
            />
          </div>
        </div>
      </div>

      {/* 下部中央: SCROLL TO EXPLORE（z-30） */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex flex-col items-center text-dark-green">
          <span className="mb-2 text-sm font-semibold uppercase tracking-widest">
            Scroll to Explore
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </div>

      {/* 下部右: SNSアイコン（z-30） */}
      <div className="absolute bottom-8 right-8 z-30">
        <SocialIcons layout="horizontal" size="md" showLabel className="text-dark-green" />
      </div>
    </section>
  );
}
