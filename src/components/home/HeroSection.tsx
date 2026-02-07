import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SocialIcons } from "@/components/ui/SocialIcons";

/**
 * ヒーローセクション（シンプルなオーバーラップデザイン）
 * - 固定サイズ中心、absolute配置を最小限に
 * - 保守性とシンプルさを最優先
 */
export function HeroSection() {
  return (
    <section className="w-full min-h-screen relative bg-accent-green overflow-hidden flex items-center justify-center px-6 py-20">
      <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* テキストエリア */}
        <div className="lg:col-span-5 z-10">
          <h2 className="text-white font-black tracking-tight leading-tight text-5xl lg:text-7xl drop-shadow-lg">
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

        {/* 画像エリア */}
        <div className="lg:col-span-7 relative">
          <div className="relative w-full max-w-4xl mx-auto aspect-[4/3] rounded-[3rem] overflow-hidden shadow-2xl">
            <Image
              src="/images/placeholder/p.jpeg"
              alt={`${siteConfig.name} メインビジュアル`}
              fill
              priority
              fetchPriority="high"
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 800px"
            />

            {/* 左上通知ラベル */}
            <div className="absolute top-6 left-6 bg-accent-yellow px-6 py-3 rounded shadow-lg max-w-[85%]">
              <p className="text-sm font-bold text-dark-green leading-snug">
                第97回 世田谷祭 開催決定！
              </p>
            </div>

            {/* 右上バッジ */}
            <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full overflow-hidden shadow-2xl">
              <Image
                src="/images/placeholder/p.jpeg"
                alt={`第${siteConfig.edition}回 世田谷祭`}
                fill
                className="object-cover"
                sizes="160px"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 下部中央: SCROLL TO EXPLORE */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
        <div className="flex flex-col items-center text-dark-green">
          <span className="mb-2 text-sm font-semibold uppercase tracking-widest">
            Scroll to Explore
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </div>

      {/* 下部右: SNSアイコン */}
      <div className="absolute bottom-8 right-8">
        <SocialIcons layout="horizontal" size="md" showLabel className="text-dark-green" />
      </div>
    </section>
  );
}
