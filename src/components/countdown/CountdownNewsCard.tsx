import Image from "next/image";
import Link from "next/link";
import type { News, NewsType } from "@/types/news";
import { cn } from "@/lib/utils";

interface CountdownNewsCardProps {
  news: News;
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

/**
 * カウントダウンページ用ダークテーマNewsカード
 * グラスモーフィズムスタイル
 */
export function CountdownNewsCard({ news, className }: CountdownNewsCardProps) {
  const imageUrl = news.thumbnail?.url || "/images/placeholder/p.jpeg";

  return (
    <Link
      href={`/info/${news.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/15",
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
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* urgentバッジ */}
        {news.type === "urgent" && (
          <span className="absolute top-3 left-3 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            重要
          </span>
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="p-4">
        <h3 className="mb-2 text-base font-semibold leading-snug text-white line-clamp-2">
          {news.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-white/40">#{getTypeLabel(news.type)}</span>
        </div>
      </div>
    </Link>
  );
}
