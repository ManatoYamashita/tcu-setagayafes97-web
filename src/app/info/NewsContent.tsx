"use client";

import { useRef, useState, type Ref } from "react";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import type { News } from "@/types/news";
import { Badge } from "@/components/ui/Badge";

interface NewsContentProps {
  initialNews: News[];
}

type NewsFilter = "all" | "urgent" | "news" | "other";

/**
 * お知らせ一覧コンテンツ
 * クライアントサイドでフィルタリング処理
 */
export function NewsContent({ initialNews }: NewsContentProps) {
  const [activeFilter, setActiveFilter] = useState<NewsFilter>("all");
  // 空状態の「すべて表示」ボタンは押すと消えるため、フォーカスの戻り先として使う
  const allFilterRef = useRef<HTMLButtonElement>(null);

  // フィルタリング処理
  const filteredNews =
    activeFilter === "all" ? initialNews : initialNews.filter((news) => news.type === activeFilter);

  return (
    /*
      外枠の余白は PageSheetLayout が持つ。ここで container や px を足すと二重になり、
      モバイル幅で一覧が痩せる
    */
    <div>
      {/* フィルター */}
      <div className="mb-8 flex flex-wrap gap-3">
        <FilterButton
          ref={allFilterRef}
          label="すべて"
          isActive={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          count={initialNews.length}
        />
        <FilterButton
          label="重要"
          isActive={activeFilter === "urgent"}
          onClick={() => setActiveFilter("urgent")}
          count={initialNews.filter((n) => n.type === "urgent").length}
        />
        <FilterButton
          label="お知らせ"
          isActive={activeFilter === "news"}
          onClick={() => setActiveFilter("news")}
          count={initialNews.filter((n) => n.type === "news").length}
        />
        <FilterButton
          label="その他"
          isActive={activeFilter === "other"}
          onClick={() => setActiveFilter("other")}
          count={initialNews.filter((n) => n.type === "other").length}
        />
      </div>

      {/* 検索結果件数 */}
      <div className="mb-6">
        {/* 絞り込みの結果を読み上げる。/events の件数表示（EventsView）と同じ形 */}
        <p className="text-sm text-gray-900/80" role="status" aria-live="polite">
          <span className="font-semibold text-gray-900">{filteredNews.length}</span>{" "}
          件のお知らせが見つかりました
        </p>
      </div>

      {/* お知らせ一覧 */}
      {filteredNews.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredNews.map((news) => (
            <NewsCard key={news.id} news={news} />
          ))}
        </div>
      ) : (
        <div className="py-16 text-center">
          <p className="text-gray-900/60">この種別のお知らせはまだありません</p>
          {/* 件数0の絞り込みも押せるため、行き止まりにしないよう出口を置く */}
          <button
            type="button"
            onClick={() => {
              setActiveFilter("all");
              allFilterRef.current?.focus();
            }}
            className="mt-4 inline-flex min-h-11 items-center rounded-full border border-gray-200 bg-gray-50 px-5 py-2 text-sm font-semibold text-gray-700 transition-colors hoverable:hover:border-gray-400 hoverable:hover:bg-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
          >
            すべてのお知らせを見る
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * フィルターボタンコンポーネント
 */
interface FilterButtonProps {
  ref?: Ref<HTMLButtonElement>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}

function FilterButton({ ref, label, isActive, onClick, count }: FilterButtonProps) {
  return (
    <button
      ref={ref}
      type="button"
      // 選択状態を色だけでなく支援技術にも伝える（FAQContent・EventFilterFields と同じ）
      aria-pressed={isActive}
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
        isActive
          ? "border-primary-600 bg-primary-600 text-white shadow-md"
          : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
      }`}
    >
      {label} <span className="ml-1 opacity-75">({count})</span>
    </button>
  );
}

/**
 * お知らせカードコンポーネント
 */
interface NewsCardProps {
  news: News;
}

function NewsCard({ news }: NewsCardProps) {
  // 公開日をフォーマット
  const publishedDate = new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Link href={`/info/${news.id}`} className="group block h-full">
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-[color,background-color,border-color,box-shadow] hoverable:hover:border-gray-400 hoverable:hover:shadow-lg">
        {/* サムネイル */}
        {news.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden">
            <AppImage
              src={news.thumbnail.url}
              // リンク名は見出しが担う。題名を alt に入れると同じ語が2回読み上げられる
              alt=""
              fill
              className="object-cover transition-transform duration-300 motion-safe:group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />
          </div>
        )}

        <div className="p-6">
          {/* バッジと公開日 */}
          <div className="mb-3 flex items-center justify-between">
            <Badge
              variant={news.type}
              label={news.type === "urgent" ? "重要" : news.type === "news" ? "お知らせ" : "その他"}
            />
            <time
              dateTime={news.publishedAt || news.createdAt}
              className="text-xs text-gray-900/60"
            >
              {publishedDate}
            </time>
          </div>

          {/* タイトル */}
          {/* ページの h1 の直下なので h2。見た目はクラスで決める */}
          <h2 className="mb-2 line-clamp-2 text-lg font-bold text-balance [word-break:auto-phrase] text-gray-900">
            {news.title}
          </h2>

          {/* 説明文 */}
          {news.description && (
            <p className="line-clamp-3 text-sm text-gray-900/80">{news.description}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
