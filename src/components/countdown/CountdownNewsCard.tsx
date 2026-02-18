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
 */
export function CountdownNewsCard({ news, className }: CountdownNewsCardProps) {
  const imageUrl = news.thumbnail?.url || "/images/placeholder/p.jpeg";

  return (
    <Link href={`/info/${news.id}`} className={cn("block overflow-hidden", className)}>
      {/* 画像エリア */}
      <div className="relative aspect-[16/10] overflow-hidden">
        <Image
          src={imageUrl}
          alt={news.title}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* urgentバッジ */}
        {news.type === "urgent" && (
          <span className="absolute top-3 left-3 bg-red-500 px-3 py-1 text-xs font-bold text-white">
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
