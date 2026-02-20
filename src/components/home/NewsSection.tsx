import Image from "next/image";
import Link from "next/link";
import { getNewsList } from "@/lib/news";

/**
 * お知らせセクション
 * 最新のお知らせ3件をカードグリッド形式で表示
 */
export async function NewsSection() {
  const newsList = await getNewsList(3);

  // データが取得できない場合の表示
  if (newsList.length === 0) {
    return (
      <section className="bg-primary py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
          </div>
          <div className="text-center text-white/60">現在、お知らせはありません。</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-primary py-32">
      <div className="container mx-auto px-4">
        {/* セクションタイトル */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
          <Link href="/info" className="flex items-center gap-2 text-white hover:text-white/80">
            <span className="font-semibold">もっと見る</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => (
            <Link key={news.id} href={`/info/${news.id}`} className="group block hover:opacity-80">
              {/* サムネイル */}
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-white/10 mb-4">
                {news.thumbnail ? (
                  <Image
                    src={news.thumbnail.url}
                    alt={news.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white/10">
                    <span className="text-sm text-white/50">No Image</span>
                  </div>
                )}
              </div>

              {/* 日付 */}
              <time className="text-xs text-white/50">
                {new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                })}
              </time>

              {/* タイトル */}
              <h3 className="mt-1 font-semibold text-white line-clamp-2">{news.title}</h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
