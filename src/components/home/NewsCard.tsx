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

/** カテゴリアイコン（type に応じた SVG） */
function CategoryIcon({ type, size = 16 }: { type: NewsType; size?: number }) {
  const className = cn("shrink-0", type === "urgent" ? "text-red-500" : "text-gray-500");

  switch (type) {
    case "urgent":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
    case "news":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M4 22h16a2 2 0 002-2V4a2 2 0 00-2-2H8a2 2 0 00-2 2v16a2 2 0 01-2 2zm0 0a2 2 0 01-2-2v-9c0-1.1.9-2 2-2h2" />
          <line x1="10" y1="6" x2="18" y2="6" />
          <line x1="10" y1="10" x2="18" y2="10" />
          <line x1="10" y1="14" x2="14" y2="14" />
        </svg>
      );
    case "other":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className={className}
        >
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
  }
}

export function NewsCard({ news, variant = "default", className }: NewsCardProps) {
  const imageUrl = news.thumbnail?.url || "/images/photos/setagayafe97-image.webp";
  const dateStr = formatDate(news.publishedAt || news.createdAt);
  const isLarge = variant === "large";

  return (
    <Link
      href={`/info/${news.id}`}
      className={cn("group block transition-colors duration-300", className)}
    >
      {/* 画像エリア */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-lg border-2 border-gray-200 transition-colors duration-300 group-hover:border-primary-400">
        <Image
          src={imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes={isLarge ? "(max-width: 1024px) 100vw, 50vw" : "(max-width: 1024px) 50vw, 25vw"}
        />
        {/* NEWバッジ */}
        {isNew(news) && (
          <span className="absolute right-2 top-2 rounded bg-gray-900 px-2 py-0.5 text-[10px] font-bold tracking-wider text-white">
            NEW!
          </span>
        )}
      </div>

      {/* カテゴリ + 日付 */}
      <div
        className={cn(
          "mt-3 flex items-center gap-2 font-sans",
          isLarge ? "text-sm text-gray-600" : "text-xs text-gray-500"
        )}
      >
        <CategoryIcon type={news.type} size={isLarge ? 16 : 14} />
        <span>{getTypeLabel(news.type)}</span>
        {isLarge && (
          <>
            <span className="text-gray-300">|</span>
            <time dateTime={news.publishedAt || news.createdAt}>{dateStr}</time>
          </>
        )}
      </div>

      {/* タイトル */}
      <h3
        className={cn(
          "font-sans font-bold leading-snug text-gray-900 line-clamp-2 transition-colors duration-300 group-hover:text-primary-400",
          isLarge ? "mt-2 text-base sm:text-lg" : "mt-1.5 text-sm"
        )}
      >
        <span className="decoration-primary-400 underline-offset-2 group-hover:underline">
          {news.title}
        </span>
      </h3>

      {/* Featured: タグ表示 / Regular: 日付表示 */}
      {isLarge ? (
        <div className="mt-2 flex flex-wrap gap-2 font-sans text-sm text-gray-400">
          <span>#{getTypeLabel(news.type)}</span>
        </div>
      ) : (
        <time
          dateTime={news.publishedAt || news.createdAt}
          className="mt-1.5 block font-sans text-xs text-gray-400"
        >
          {dateStr}
        </time>
      )}
    </Link>
  );
}
