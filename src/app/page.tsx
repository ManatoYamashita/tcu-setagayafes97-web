import { HeroSection } from "@/components/home/HeroSection";
import { CountdownTimer } from "@/components/home/CountdownTimer";
import { EventOverview } from "@/components/home/EventOverview";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { StartupAnimation } from "@/components/home/StartupAnimation";
import { ScrollAnimation } from "@/components/animation/ScrollAnimation";

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
        <main>
          {/* ヒーローセクション */}
          <HeroSection />

          {/* カウントダウンタイマー（スクロールアニメーション適用） */}
          <div data-scroll>
            <CountdownTimer />
          </div>

          {/* 開催概要（スクロールアニメーション適用） */}
          <div data-scroll>
            <EventOverview />
          </div>

          {/* お知らせ（スクロールアニメーション適用） */}
          <div data-scroll>
            <NewsSection />
          </div>

          {/* おすすめ企画（スクロールアニメーション適用） */}
          <div data-scroll>
            <FeaturedEvents />
          </div>

          {/* 協賛企業（スクロールアニメーション適用） */}
          <div data-scroll>
            <SponsorBanner />
          </div>
        </main>
      </ScrollAnimation>
    </>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
