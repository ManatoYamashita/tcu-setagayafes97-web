import Link from "next/link";
import Image from "next/image";
import { getNewsList } from "@/lib/news";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * お知らせセクション
 * 最新のお知らせ3件を表示
 */
export async function NewsSection() {
  const newsList = await getNewsList(3);

  // データが取得できない場合の表示
  if (newsList.length === 0) {
    return (
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-4xl font-bold">お知らせ</h2>
          </div>
          <div className="text-center text-gray-500">現在、お知らせはありません。</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-4xl font-bold">お知らせ</h2>
          <Link
            href="/info"
            className="flex items-center gap-2 text-primary transition-colors hover:text-primary/80"
          >
            <span className="font-semibold">もっと見る</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {newsList.map((news) => (
            <Card key={news.id} href={`/info/${news.id}`} variant="default">
              <article className="h-full">
                {/* サムネイル */}
                {news.thumbnail && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={news.thumbnail.url}
                      alt={news.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 400px"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* バッジ・日付 */}
                  <div className="mb-3 flex flex-wrap items-center gap-2">
                    <Badge variant={news.type} label={news.type.toUpperCase()} />
                    <time className="text-sm text-gray-500">
                      {new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                      })}
                    </time>
                  </div>

                  {/* タイトル */}
                  <h3 className="mb-2 line-clamp-2 text-lg font-semibold text-gray-900">
                    {news.title}
                  </h3>

                  {/* 説明文 */}
                  <p className="line-clamp-3 text-sm text-gray-600">{news.description}</p>
                </div>
              </article>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
