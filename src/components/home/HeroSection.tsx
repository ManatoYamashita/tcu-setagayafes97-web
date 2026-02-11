import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { BackgroundLineAnimation } from "@/components/animation/BackgroundLineAnimation";

/**
 * ヒーローセクション（100svh基準レイアウト）
 * - セクション2層構造: ファーストビュー（100svh - Header高さ）+ 追加領域（Scroll/SNS）
 * - 紫背景＋白ラインアニメーションが全体を覆う
 * - viewport単位（82vw × 82vh デスクトップ、95vw × 65vh モバイル）※参考サイト水準
 * - 円形バッジ（128-256px、外側配置、参考サイト水準）
 * - テキスト左下寄り配置
 * - 画像: ファーストビュー底辺から1rem配置
 * - Scroll/SNS: ファーストビューの下、同じ紫背景＋白ライン上に配置
 * - z-index標準化（Header: z-40 > Hero内最上位: z-40 > Hero内ベース: z-30 > 画像: z-20 > コンテンツ親: z-10 > 背景: z-0）
 */
export function HeroSection() {
  return (
    <section className="relative w-full">
      {/* 背景ラインアニメーション（HeroSection全体をカバー） */}
      <BackgroundLineAnimation />

      {/* コンテンツ親要素（ファーストビュー＋Scroll/SNS全体） */}
      <div className="relative z-10">
        {/* ファーストビュー領域（100svh - Header高さ） */}
        <div className="relative h-[calc(100svh-5rem)] overflow-hidden flex items-center justify-center">
          {/* テキストエリア（absolute、左下寄り、z-30） */}
          <div className="absolute left-0 top-0 w-full h-full flex items-end pb-12 lg:pb-16 xl:pb-20 z-30 pointer-events-none">
            <div className="max-w-7xl mx-auto w-full px-6 lg:px-8 pointer-events-auto">
              <h2 className="text-dark-green font-bold tracking-tight leading-tight text-4xl lg:text-5xl xl:text-6xl">
                さあ、
                <br />
                森からはじまる
                <br />
                未来へ
              </h2>

              <div className="flex items-center gap-4 mt-6">
                <a
                  href="/events"
                  aria-label="企画一覧を見る"
                  className="w-16 h-16 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                >
                  <ArrowRight className="w-6 h-6 text-primary" />
                </a>
                <span className="text-base text-dark-green font-semibold uppercase tracking-wider">
                  View More
                </span>
              </div>
            </div>
          </div>

          {/* 画像エリア（absolute、右寄り、bottom-[1rem]配置、z-20） */}
          <div className="absolute right-0 sm:right-4 md:right-6 lg:right-8 xl:right-10 2xl:right-12 bottom-[1rem] z-20">
            {/* 新規ラッパー追加 */}
            <div className="relative">
              <div className="relative w-[95vw] sm:w-[85vw] md:w-[82vw] lg:w-[82vw] xl:w-[82vw] h-[65vh] sm:h-[72vh] md:h-[78vh] lg:h-[80vh] xl:h-[82vh] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/placeholder/p.jpeg"
                  alt={`${siteConfig.name} メインビジュアル`}
                  fill
                  priority
                  fetchPriority="high"
                  className="object-cover"
                  sizes="(max-width: 640px) 95vw, (max-width: 768px) 85vw, (max-width: 1024px) 82vw, 82vw"
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

              {/* 円形バッジを外側に移動（z-40）
                  サイズとオフセット（25%はみ出し統一）:
                  128px → -32px (-top-8/-right-8)
                  160px → -40px (-top-10/-right-10)
                  192px → -48px (-top-12/-right-12)
                  224px → -56px (-top-14/-right-14)
                  240px → -60px (Tailwind -top-14 で近似、理想は-top-15)
                  256px → -64px (-top-16/-right-16) */}
              <div className="absolute -top-8 -right-8 sm:-top-10 sm:-right-10 md:-top-12 md:-right-12 lg:-top-14 lg:-right-14 xl:-top-14 xl:-right-14 2xl:-top-16 2xl:-right-16 w-32 sm:w-40 md:w-48 lg:w-56 xl:w-60 2xl:w-64 aspect-square rounded-full overflow-hidden shadow-2xl z-40">
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
        </div>

        {/* 追加領域（Scroll/SNS、ファーストビュー以降、紫＋白ライン背景） */}
        <div className="relative py-12 lg:py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto px-6 lg:px-8">
            {/* 左カラム（空、デスクトップのみ） */}
            <div className="hidden md:block"></div>

            {/* 中央カラム: SCROLL TO EXPLORE */}
            <div className="flex flex-col items-center text-white">
              <span className="mb-2 text-sm font-semibold uppercase tracking-widest">
                Scroll to Explore
              </span>
              <ChevronDown className="h-6 w-6 animate-bounce" />
            </div>

            {/* 右カラム: OFFICIAL SNS */}
            <div className="flex justify-center md:justify-end text-white">
              <SocialIcons layout="horizontal" size="md" showLabel className="text-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
