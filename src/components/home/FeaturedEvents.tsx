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
    </section>
  );
}

export const revalidate = 3600;
