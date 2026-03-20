import { HeroSection } from "@/components/home/HeroSection";
import { AboutSection } from "@/components/home/AboutSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
/**
 * トップページ
 * 第97回世田谷祭の公式Webサイト
 */
export default function Home() {
  return (
    <main>
      <HeroSection />
      <AboutSection />
      <NewsSection />
      <FeaturedEvents />
    </main>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
