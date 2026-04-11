import { getFeaturedEvents } from "@/lib/events";
import { FeaturedCarousel } from "./FeaturedCarousel";
// import { FeaturedGearScene } from "./FeaturedGearScene";

/**
 * おすすめ企画セクション
 * 左: 縦書きタイトル+ナビ / 右: 横スクロールカルーセル
 */
export async function FeaturedEvents() {
  const events = await getFeaturedEvents();
  const featured = events.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-secondary py-24 lg:py-32">
      {/* メインコンテンツ */}
      <div className="relative z-10 mx-auto max-w-7xl pl-4 sm:pl-8 md:pl-12 lg:pl-16">
        <FeaturedCarousel events={featured} />
      </div>

      {/* 波型装飾（下部） */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0" aria-hidden="true">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="block w-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0 60C240 100 480 20 720 60C960 100 1200 20 1440 60V120H0V60Z"
            fill="white"
            fillOpacity="0.3"
          />
          <path
            d="M0 80C300 110 600 50 900 80C1100 100 1300 60 1440 80V120H0V80Z"
            fill="white"
            fillOpacity="0.2"
          />
        </svg>
      </div>
    </section>
  );
}

export const revalidate = 3600;
