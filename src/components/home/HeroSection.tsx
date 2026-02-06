import Image from "next/image";
import { ArrowRight, ChevronDown } from "lucide-react";
import { siteConfig } from "@/data/site";
import { SocialIcons } from "@/components/ui/SocialIcons";

/**
 * ヒーローセクション（2026年基準のモダン実装）
 * - Tailwind CSS v4: OKLCHカラー空間
 * - Container Queries: cqw単位でレスポンシブ設計
 * - next/image最適化: priority + fetchPriority="high"
 */
export function HeroSection() {
  return (
    <section className="w-full min-h-screen relative flex flex-col items-center justify-center bg-accent-green">
      {/* メインビジュアルカード */}
      <div
        className="w-[94vw] max-w-7xl aspect-[4/5] md:aspect-[16/9] relative rounded-[3.5rem] overflow-hidden shadow-2xl"
        style={{ containerType: "inline-size" }}
      >
        {/* 背景画像 */}
        <Image
          src="/images/placeholder/p.jpeg"
          alt={`${siteConfig.name} メインビジュアル`}
          fill
          priority
          fetchPriority="high"
          className="object-cover"
          sizes="(max-width: 768px) 94vw, 1280px"
        />

        {/* 左上通知ラベル */}
        <div className="absolute top-[5cqw] left-[5cqw] bg-accent-yellow p-[1.5cqw] rounded-sm shadow-lg z-20">
          <p className="text-[2cqw] md:text-[1.5cqw] font-bold text-dark-green">NEW EVENT</p>
        </div>

        {/* 右上バッジ (Circle Badge) */}
        <div className="absolute -top-[8cqw] -right-[8cqw] w-[20cqw] aspect-square rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center z-10 shadow-2xl">
          <div className="text-center text-white">
            <p className="text-[2.5cqw] md:text-[2cqw] font-semibold">第{siteConfig.edition}回</p>
            <p className="text-[1.5cqw] md:text-[1.2cqw] mt-[0.5cqw]">世田谷祭</p>
          </div>
        </div>

        {/* 左下コピーエリア */}
        <div className="absolute bottom-[6cqw] left-[6cqw] z-20">
          <h2
            className="text-[8cqw] md:text-[6cqw] font-black leading-[1.1] text-white"
            style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.3)" }}
          >
            さあ
            <br />
            世田谷祭から
            <br />
            始めよう
          </h2>
          <div className="flex items-center gap-[2cqw] mt-[2cqw]">
            <a
              href="/events"
              className="w-[10cqw] md:w-[8cqw] aspect-square rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
            >
              <ArrowRight className="w-[4cqw] md:w-[3cqw] h-[4cqw] md:h-[3cqw] text-primary" />
            </a>
            <span className="text-[1.5cqw] md:text-[1.2cqw] text-white font-semibold uppercase tracking-wider">
              View More
            </span>
          </div>
        </div>
      </div>

      {/* 下部中央: SCROLL TO EXPLORE インジケーター */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
        <div className="flex flex-col items-center text-dark-green">
          <span className="mb-2 text-sm font-semibold uppercase tracking-widest">
            Scroll to Explore
          </span>
          <ChevronDown className="h-6 w-6 animate-bounce" />
        </div>
      </div>

      {/* 下部右: SNSアイコン */}
      <div className="absolute bottom-8 right-8 z-30 md:right-16">
        <SocialIcons layout="horizontal" size="md" showLabel className="text-dark-green" />
      </div>
    </section>
  );
}
