"use client";

import { useState } from "react";
import type { News, NewsType } from "@/types/news";
import { NewsCard } from "./NewsCard";
import { cn } from "@/lib/utils";

const filterTabs: { label: string; value: NewsType | "all" }[] = [
  { label: "すべて", value: "all" },
  { label: "重要", value: "urgent" },
  { label: "お知らせ", value: "news" },
  { label: "その他", value: "other" },
];

interface NewsFilterProps {
  newsList: News[];
}

export function NewsFilter({ newsList }: NewsFilterProps) {
  const [activeFilter, setActiveFilter] = useState<NewsType | "all">("all");

  const filtered =
    activeFilter === "all" ? newsList : newsList.filter((n) => n.type === activeFilter);

  const featured = filtered.slice(0, 2);
  const regular = filtered.slice(2);

  return (
    <>
      {/* フィルタータブ */}
      <div className="mb-8 flex flex-wrap gap-2">
        {filterTabs.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveFilter(tab.value)}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-medium transition-colors",
              activeFilter === tab.value
                ? "bg-primary-400 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ニュース一覧 */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-gray-900/60">該当するお知らせはありません。</div>
      ) : (
        <>
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
        </>
      )}
    </>
  );
}
