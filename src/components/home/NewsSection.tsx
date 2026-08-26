import type { News } from "@/types/news";
import { CircularText } from "@/components/ui/CircularText";
import { NewsSectionClientLoader } from "./NewsSectionClientLoader";

interface NewsSectionProps {
  newsList: News[];
  isVisible: boolean;
}

/**
 * 非公開時はニュース用のクライアント実装を読み込まず、静的な案内だけを返す。
 * GSAP、ScrollTrigger、フィルタは公開データがある場合にだけ必要になる。
 */
function NewsUnavailable({ isVisible }: { isVisible: boolean }) {
  return (
    <section className="relative bg-secondary py-32">
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
            <div className="text-center text-gray-900/60">
              {isVisible
                ? "現在、お知らせはありません。"
                : "現在、お知らせは準備中です。公開までもうしばらくお待ちください。"}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function NewsSection({ newsList, isVisible }: NewsSectionProps) {
  if (!isVisible || newsList.length === 0) {
    return <NewsUnavailable isVisible={isVisible} />;
  }

  return <NewsSectionClientLoader newsList={newsList} />;
}
