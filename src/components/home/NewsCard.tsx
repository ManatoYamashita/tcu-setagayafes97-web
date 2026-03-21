import Image from "next/image";
import Link from "next/link";
import type { News, NewsType } from "@/types/news";
import { cn } from "@/lib/utils";

interface NewsCardProps {
  news: News;
  variant?: "large" | "default";
  className?: string;
}

function getTypeLabel(type: NewsType): string {
  switch (type) {
    case "urgent":
      return "重要";
    case "news":
      return "お知らせ";
    case "other":
      return "その他";
  }
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}.${m}.${day}`;
}

function isNew(news: News): boolean {
  const publishDate = new Date(news.publishedAt || news.createdAt);
  const now = new Date();
  const diffDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
}

export function NewsCard({ news, variant = "default", className }: NewsCardProps) {
  const imageUrl = news.thumbnail?.url || "/images/placeholder/pastel-castle.webp";
  const dateStr = formatDate(news.publishedAt || news.createdAt);

  return (
    <Link
      href={`/info/${news.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
        className
      )}
    >
      {/* 画像エリア */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={
            variant === "large"
              ? "(max-width: 1024px) 100vw, 50vw"
              : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          }
        />
        {/* 日付オーバーレイ */}
        <time
          dateTime={news.publishedAt || news.createdAt}
          className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
        >
          {dateStr}
        </time>
        {/* NEWバッジ */}
        {isNew(news) && (
          <span className="absolute top-3 left-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-xs font-bold text-white">
            NEW
          </span>
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="p-4">
        {/* タイトル */}
        <h3
          className={cn(
            "mb-2 font-semibold leading-snug text-gray-900 line-clamp-2",
            variant === "large" ? "text-lg" : "text-base"
          )}
        >
          {news.title}
        </h3>

        {/* タグ */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-500">#{getTypeLabel(news.type)}</span>
        </div>
      </div>
    </Link>
  );
}
