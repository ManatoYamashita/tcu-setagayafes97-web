"use client";

import type { ReactNode } from "react";
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
  header?: ReactNode;
}

export function NewsFilter({ newsList, header }: NewsFilterProps) {
  const [activeFilter, setActiveFilter] = useState<NewsType | "all">("all");

  const filtered =
    activeFilter === "all" ? newsList : newsList.filter((n) => n.type === activeFilter);

  const featured = filtered.slice(0, 2);
  const regular = filtered.slice(2);

  return (
    <div className="flex flex-col lg:flex-row lg:gap-12">
      {/* 左カラム: ヘッダー + フィルタータブ */}
      <div className="mb-8 lg:mb-0 lg:w-52 lg:shrink-0">
        <div className="lg:sticky lg:top-32">
          {header}

          {/* フィルタータブ */}
          <div className="mt-6 flex flex-wrap gap-2 lg:mt-8 lg:flex-col lg:gap-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveFilter(tab.value)}
                className={cn(
                  "rounded-full px-5 py-2 text-sm font-medium transition-colors lg:rounded-lg lg:px-3 lg:py-2 lg:text-left",
                  activeFilter === tab.value
                    ? "bg-primary-400 text-white lg:bg-primary-400/10 lg:font-semibold lg:text-primary-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 lg:bg-transparent lg:text-gray-500 lg:hover:bg-gray-50 lg:hover:text-gray-900"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 右カラム: ニュース一覧 */}
      <div className="min-w-0 flex-1">
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
              <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 lg:gap-6">
                {regular.map((news) => (
                  <NewsCard key={news.id} news={news} variant="default" />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
