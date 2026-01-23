"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // フィルタリング処理
  const filteredNews =
    activeFilter === "all" ? initialNews : initialNews.filter((news) => news.type === activeFilter);

  return (
    <div className="container mx-auto px-4 py-12">
      {/* フィルター */}
      <div className="mb-8 flex flex-wrap gap-3">
        <FilterButton
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
        <p className="text-sm text-gray-600">
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
          <p className="text-gray-500">該当するお知らせがありません</p>
        </div>
      )}
    </div>
  );
}

/**
 * フィルターボタンコンポーネント
 */
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}

function FilterButton({ label, isActive, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
        isActive
          ? "border-primary bg-primary text-white shadow-md"
          : "border-gray-300 bg-white text-gray-700 hover:border-primary hover:bg-primary/5"
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
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-primary hover:shadow-lg">
        {/* サムネイル */}
        {news.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={news.thumbnail.url}
              alt={news.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
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
            <time className="text-xs text-gray-500">{publishedDate}</time>
          </div>

          {/* タイトル */}
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-gray-900">{news.title}</h3>

          {/* 説明文 */}
          {news.description && (
            <p className="line-clamp-3 text-sm text-gray-600">{news.description}</p>
          )}
        </div>
      </article>
    </Link>
  );
}
