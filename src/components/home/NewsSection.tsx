import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getNewsList } from "@/lib/news";
import { NewsCard } from "@/components/home/NewsCard";

/**
 * お知らせセクション
 * 紫背景 + 白セミモーダルの二層構造
 * デスクトップ: 左25%見出し / 右75%カードグリッド
 */
export async function NewsSection() {
  const newsList = await getNewsList(8);

  if (newsList.length === 0) {
    return (
      <section className="pt-6 px-6 pb-0 md:pt-24">
        <div className="rounded-t-3xl bg-white px-4 py-16 sm:px-6 md:py-20 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-12">
              <h2 className="text-5xl font-bold tracking-tight md:text-6xl">NEWS</h2>
            </div>
            <div className="text-center text-gray-500">現在、お知らせはありません。</div>
          </div>
        </div>
      </section>
    );
  }

  const largeCards = newsList.slice(0, 2);
  const defaultCards = newsList.slice(2);

  return (
    <section className="pt-6 px-6 pb-0 md:pt-24">
      <div className="rounded-t-3xl bg-white px-4 py-16 sm:px-6 md:py-20 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* デスクトップ: 左見出し + 右カードグリッド */}
          <div className="hidden lg:grid lg:grid-cols-[280px_1fr] lg:gap-10">
            {/* 左カラム: 見出し + リンク */}
            <div className="flex flex-col justify-between lg:justify-start lg:gap-6 py-2">
              <h2 className="text-5xl font-bold tracking-tight xl:text-6xl">NEWS</h2>
              <Link
                href="/info"
                className="flex items-center gap-3 transition-opacity hover:opacity-70"
              >
                <span className="text-sm font-semibold tracking-wider">NEWS ALL</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
              </Link>
            </div>

            {/* 右カラム: カードグリッド */}
            <div className="space-y-6">
              {/* 上段: largeカード 2枚 */}
              <div className="grid grid-cols-2 gap-6">
                {largeCards.map((news) => (
                  <NewsCard key={news.id} news={news} variant="large" />
                ))}
              </div>

              {/* 下段: defaultカード 3列 */}
              {defaultCards.length > 0 && (
                <div className="grid grid-cols-3 gap-6">
                  {defaultCards.map((news) => (
                    <NewsCard key={news.id} news={news} variant="default" />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* タブレット・モバイル */}
          <div className="lg:hidden">
            {/* 見出し + ボタン */}
            <div className="mb-8 flex items-end justify-between">
              <h2 className="text-5xl font-bold tracking-tight md:text-6xl">NEWS</h2>
              <Link
                href="/info"
                className="flex items-center gap-3 transition-opacity hover:opacity-70"
              >
                <span className="text-sm font-semibold tracking-wider">NEWS ALL</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900">
                  <ArrowRight className="h-4 w-4 text-white" />
                </span>
              </Link>
            </div>

            {/* Largeカード */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              {largeCards.map((news) => (
                <NewsCard key={news.id} news={news} variant="large" />
              ))}
            </div>

            {/* Defaultカード（最大4件表示） */}
            {defaultCards.length > 0 && (
              <div className="mt-6 grid grid-cols-2 gap-4 md:gap-6">
                {defaultCards.map((news, index) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    variant="default"
                    className={index >= 4 ? "hidden" : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
