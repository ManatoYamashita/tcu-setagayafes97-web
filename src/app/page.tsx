import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SpecialGuestSection } from "@/components/special/SpecialGuestSection";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { getLatestHeroNews, getNewsList } from "@/lib/news";
import { NEWS_VISIBLE, siteConfig } from "@/data/site";
import { createHomeStructuredData, serializeJsonLd } from "@/lib/structured-data";

const homeStructuredData = createHomeStructuredData();

// ABOUT はヒーローの下にあるため、HTMLはSSRしつつクライアントJSを初期チャンクから分離する。
const AboutSection = dynamic(() =>
  import("@/components/home/AboutSection").then((module) => module.AboutSection)
);

/**
 * トップページ
 * 第97回世田谷祭の公式Webサイト
 */
export default async function Home() {
  const [heroNews, newsList] = NEWS_VISIBLE
    ? await Promise.all([getLatestHeroNews(), getNewsList(8)])
    : [null, []];

  return (
    <main className="overflow-x-clip">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(homeStructuredData),
        }}
      />
      <div className="hero-about-bg">
        <HeroSection latestNews={heroNews} />
        {/* 著名人企画はチケット販売と直結する導線なので Hero の直後に置く。
            背景は持たせず、Hero と ABOUT を包む .hero-about-bg のグラデーションを透かす */}
        <SpecialGuestSection />
        <AboutSection />
      </div>
      <NewsSection newsList={newsList} isVisible={NEWS_VISIBLE} />
      <FeaturedEvents />
      <SponsorBanner />
    </main>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
