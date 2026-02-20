import { HeroSection } from "@/components/home/HeroSection";
import { EventOverview } from "@/components/home/EventOverview";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SponsorBanner } from "@/components/home/SponsorBanner";

/**
 * トップページ
 * 第97回世田谷祭の公式Webサイト
 */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <EventOverview />
      <AboutSection />
      <NewsSection />
      <FeaturedEvents />
      <SponsorBanner />
    </main>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
