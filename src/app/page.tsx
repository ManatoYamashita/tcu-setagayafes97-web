import { HeroSection } from "@/components/home/HeroSection";
import { EventOverview } from "@/components/home/EventOverview";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { StartupAnimation } from "@/components/home/StartupAnimation";
import { ScrollAnimation } from "@/components/animation/ScrollAnimation";
import { HeroDiagonalLine } from "@/components/home/HeroDiagonalLine";

/**
 * トップページ
 * 第97回世田谷祭の公式Webサイト
 */
export default function Home() {
  return (
    <>
      {/* 起動アニメーション（初回訪問時のみ） */}
      <StartupAnimation />

      {/* メインコンテンツ */}
      <ScrollAnimation>
        <main className="bg-primary relative">
          {/* 背景レイヤー: 白い斜め帯（z-[1]） */}
          <HeroDiagonalLine />

          {/* コンテンツレイヤー（z-[2]） */}
          <div className="relative z-[2]">
            {/* ヒーローセクション */}
            <HeroSection />

            {/* お知らせ（スクロールアニメーション適用） */}
            <div data-scroll>
              <NewsSection />
            </div>

            {/* 開催概要（スクロールアニメーション適用） */}
            <div data-scroll>
              <EventOverview />
            </div>

            {/* ABOUT（スクロールアニメーション適用） */}
            <div data-scroll>
              <AboutSection />
            </div>

            {/* おすすめ企画（スクロールアニメーション適用） */}
            <div data-scroll>
              <FeaturedEvents />
            </div>

            {/* 協賛企業（スクロールアニメーション適用） */}
            <div data-scroll>
              <SponsorBanner />
            </div>
          </div>
        </main>
      </ScrollAnimation>
    </>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
