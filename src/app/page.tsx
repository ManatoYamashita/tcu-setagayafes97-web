import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { getLatestHeroNews, getNewsList } from "@/lib/news";
import { NEWS_VISIBLE } from "@/data/site";
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
      <div className="hero-about-bg">
        <HeroSection latestNews={heroNews} />
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
