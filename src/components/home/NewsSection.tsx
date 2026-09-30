import type { News } from "@/types/news";
import { CircularText } from "@/components/ui/CircularText";
import { NewsSectionClientLoader } from "./NewsSectionClientLoader";

interface NewsSectionProps {
  newsList: News[];
}

/**
 * お知らせが0件のときは静的な案内だけを返す。
 * GSAP、ScrollTrigger、フィルタはデータがある場合にだけ必要になる。
 */
function NewsUnavailable() {
  return (
    <section className="deferred-section relative bg-secondary py-32">
      <CircularText
        text="· SETAGAYA FES 97th · SETAGAYA FES 97th "
        spinDuration={20}
        className="pointer-events-none absolute right-0 top-32 z-0 w-72 -translate-y-1/2 translate-x-1/2 text-primary-400/60 md:w-80 lg:w-96"
      />
      <div className="container mx-auto px-4">
        <div className="relative">
          <div className="relative z-10 rounded-3xl bg-white px-6 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
            <div className="mb-12 flex items-center justify-between">
              <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
            </div>
            <div className="text-center text-gray-900/60">現在、お知らせはありません。</div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsSection({ newsList }: NewsSectionProps) {
  if (newsList.length === 0) {
    return <NewsUnavailable />;
  }

  return <NewsSectionClientLoader newsList={newsList} />;
}
