import Link from "next/link";
import { getNewsList } from "@/lib/news";
import { NewsCard } from "./NewsCard";

/**
 * お知らせセクション
 * 白シート + 2段グリッド（Featured 2件 + Regular）+ 歯車装飾
 */
export async function NewsSection() {
  const newsList = await getNewsList(8);

  // データが取得できない場合の表示
  if (newsList.length === 0) {
    return (
      <section className="bg-secondary py-32">
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="rounded-3xl bg-white px-6 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
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

  const featured = newsList.slice(0, 2);
  const regular = newsList.slice(2);

  return (
    <section className="bg-secondary py-32">
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* 白シート */}
          <div className="rounded-3xl bg-white px-6 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
            {/* セクションヘッダー */}
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
              <Link
                href="/info"
                className="flex items-center gap-2 font-semibold text-gray-900 transition-opacity hover:opacity-60"
              >
                <span>NEWS ALL</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* Featured: 上位2件を大きく */}
            <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2">
              {featured.map((news) => (
                <NewsCard key={news.id} news={news} variant="large" />
              ))}
            </div>

            {/* Regular: 残りを小さく */}
            {regular.length > 0 && (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {regular.map((news) => (
                  <NewsCard key={news.id} news={news} variant="default" />
                ))}
              </div>
            )}
          </div>

          {/* 歯車装飾: 右下（複数歯車） */}
          <img
            src="/materials/geers.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 right-8 w-28 select-none md:w-40 lg:w-48"
            loading="lazy"
            draggable={false}
          />

          {/* 歯車装飾: 左下（単体歯車） */}
          <img
            src="/materials/geer1.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 left-12 w-14 select-none md:w-20 lg:w-24"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
