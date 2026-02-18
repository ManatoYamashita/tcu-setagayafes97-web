import { getNewsList } from "@/lib/news";
import { CountdownNewsCard } from "@/components/countdown/CountdownNewsCard";

/**
 * カウントダウンページ用Newsセクション
 * 最新3件を表示
 */
export async function CountdownNewsSection() {
  const newsList = await getNewsList(3);

  if (newsList.length === 0) {
    return null;
  }

  return (
    <section className="relative z-10 px-4 pb-20">
      <div className="mx-auto max-w-4xl">
        {/* セクションヘッダー */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold tracking-wider text-white md:text-3xl">NEWS</h2>
          <p className="mt-1 text-sm text-white/50">お知らせ</p>
        </div>

        {/* カードグリッド */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {newsList.map((news) => (
            <CountdownNewsCard key={news.id} news={news} />
          ))}
        </div>
      </div>
    </section>
  );
}
