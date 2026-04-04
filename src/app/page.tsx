import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { getLatestHeroNews } from "@/lib/news";
/**
 * トップページ
 * 第97回世田谷祭の公式Webサイト
 */
export default async function Home() {
  const heroNews = await getLatestHeroNews();

  return (
    <main className="overflow-x-clip">
      <div
        style={{ background: "linear-gradient(to top, var(--color-secondary) 40%, #ffffff 100%)" }}
      >
        <HeroSection latestNews={heroNews} />
        <AboutSection />
      </div>
      <NewsSection />
      <FeaturedEvents />
      <SponsorBanner />
    </main>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
