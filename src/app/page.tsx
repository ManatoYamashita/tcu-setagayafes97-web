import dynamic from "next/dynamic";
import { HeroSection } from "@/components/home/HeroSection";
import { NewsSection } from "@/components/home/NewsSection";
import { FeaturedEvents } from "@/components/home/FeaturedEvents";
import { SpecialGuestSection } from "@/components/special/SpecialGuestSection";
import { getLatestHeroNews, getNewsList } from "@/lib/news";
import { siteConfig } from "@/data/site";
import { createHomeStructuredData, serializeJsonLd } from "@/lib/structured-data";

const homeStructuredData = createHomeStructuredData();

// ABOUT はヒーローの下にあるため、HTMLはSSRしつつクライアントJSを初期チャンクから分離する。
const AboutSection = dynamic(() =>
  import("@/components/home/AboutSection").then((module) => module.AboutSection)
);

/**
 * トップページ
 * 第97回東京都市大学世田谷祭の公式Webサイト
 */
export default async function Home() {
  const [heroNews, newsList] = await Promise.all([getLatestHeroNews(), getNewsList(8)]);

  /*
   * main をページの先頭要素にしないこと。Next.js はサイト内遷移の最後にページの先頭要素へ
   * focus() を呼ぶため、main が先頭だと main の上端が sticky Header の裏へ潜る（#429。
   * docs/frontend/landmarks-and-skip-link.md「ページの先頭要素を main にしない」）。
   */
  return (
    <div>
      <main id="content" tabIndex={-1} className="overflow-x-clip focus-visible:outline-none">
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
        <NewsSection newsList={newsList} />
        <FeaturedEvents />
      </main>
    </div>
  );
}

/**
 * ISR設定: 10分ごとに再検証。
 *
 * Route Segment Config が有効なのは page / layout / route の3種のみである。
 * このページが描画するコンポーネント側に `export const revalidate` を書いても
 * Next.js は読み取らないため、配下のデータ取得はすべてこの値で再検証される。
 */
export const revalidate = 600;
