import { getNewsList } from "@/lib/news";
import { CountdownNewsCard } from "@/components/countdown/CountdownNewsCard";
import type { News } from "@/types/news";

/**
 * カウントダウンページ用Newsセクション
 * ライトテーマ、横並び3列レイアウト
 * 最新3件を表示（3件未満の場合はプレースホルダーで埋める）
 */
export async function CountdownNewsSection() {
  const newsList = await getNewsList(3);

  // プレースホルダーを追加して必ず3件にする
  const displayItems: (News | null)[] = [...newsList];
  const placeholderCount = Math.max(0, 3 - newsList.length);

  for (let i = 0; i < placeholderCount; i++) {
    displayItems.push(null); // null = プレースホルダー
  }

  return (
    <section className="relative z-10 bg-white px-6 pt-12 pb-20 md:px-12 md:pt-16 lg:px-20 lg:pt-20">
      <div className="mx-auto max-w-7xl">
        {/* セクションヘッダー */}
        <div className="mb-10 text-left md:mb-12 lg:mb-16">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
            News
          </h2>
          <p className="mt-3 text-sm tracking-[0.05em] text-gray-700 md:text-base lg:text-lg">
            97回世田谷祭実行委員会からのお知らせを掲載します
          </p>
        </div>

        {/* カードリスト（横並び3列） */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {displayItems.map((item, index) => (
            <CountdownNewsCard key={item?.id || `placeholder-${index}`} news={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
