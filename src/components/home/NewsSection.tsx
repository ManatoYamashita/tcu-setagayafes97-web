import Link from "next/link";
import { getNewsList } from "@/lib/news";
import { Badge } from "@/components/ui/Badge";
import type { News } from "@/lib/news";

/**
 * お知らせセクション
 * 最新のお知らせ5件をリスト形式で表示
 */
export async function NewsSection() {
  const newsList = await getNewsList(5);

  // 新しいかどうかを判定（7日以内）
  const isNew = (news: News) => {
    const publishDate = new Date(news.publishedAt || news.createdAt);
    const now = new Date();
    const diffDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays <= 7;
  };

  // データが取得できない場合の表示
  if (newsList.length === 0) {
    return (
      <section className="bg-white py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 flex items-center justify-between">
            <h2 className="text-5xl font-bold md:text-6xl">お知らせ</h2>
          </div>
          <div className="text-center text-gray-500">現在、お知らせはありません。</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-white py-32">
      <div className="container mx-auto px-4">
        {/* セクションタイトル */}
        <div className="mb-12 flex items-center justify-between">
          <h2 className="text-5xl font-bold md:text-6xl">お知らせ</h2>
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

        {/* リスト形式の表示 */}
        <div className="space-y-4">
          {newsList.map((news) => (
            <Link
              key={news.id}
              href={`/info/${news.id}`}
              className="group flex items-center justify-between gap-6 rounded-2xl bg-white p-6 shadow transition-all hover:shadow-lg"
            >
              <div className="flex flex-1 items-center gap-4">
                {/* 日付 */}
                <time className="min-w-[120px] text-sm font-semibold text-gray-500">
                  {new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </time>

                {/* NEWバッジ */}
                {isNew(news) && <Badge variant="news" label="NEW" />}

                {/* タイトル */}
                <h3 className="flex-1 font-semibold text-gray-900 line-clamp-1">{news.title}</h3>
              </div>

              {/* 矢印アイコン */}
              <svg
                className="h-5 w-5 flex-shrink-0 text-gray-400 transition-transform group-hover:translate-x-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
