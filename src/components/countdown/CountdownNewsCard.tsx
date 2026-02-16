import Image from "next/image";
import Link from "next/link";
import type { News, NewsType } from "@/types/news";
import { cn } from "@/lib/utils";

interface CountdownNewsCardProps {
  news: News | null; // null を許容（プレースホルダー）
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
 * カウントダウンページ用ライトテーマNewsカード
 * プレースホルダー対応（news = null の場合）
 */
export function CountdownNewsCard({ news, className }: CountdownNewsCardProps) {
  // プレースホルダーの場合
  if (!news) {
    return (
      <div
        className={cn(
          "block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm",
          className
        )}
      >
        {/* 画像エリア（グレーアウト） */}
        <div className="relative aspect-[21/9] overflow-hidden bg-gray-200">
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-medium text-gray-400">Coming Soon...</p>
          </div>
        </div>

        {/* コンテンツエリア */}
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-400 line-clamp-2 md:text-xl">準備中</h3>
          <div className="mt-3 flex items-center gap-2 text-xs text-gray-300">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-400">
              <span className="h-1.5 w-1.5 rounded-full bg-gray-300" />
              お知らせ
            </span>
          </div>
        </div>
      </div>
    );
  }

  // 既存のニュースカード（ライトテーマに変更）
  const imageUrl = news.thumbnail?.url || "/images/placeholder/p.jpeg";

  return (
    <Link
      href={`/info/${news.id}`}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:scale-[1.01] hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10",
        className
      )}
    >
      {/* 画像エリア */}
      <div className="relative aspect-[21/9] overflow-hidden">
        <Image
          src={imageUrl}
          alt={news.title}
          fill
          className="object-cover transition-all duration-500 group-hover:scale-105 group-hover:brightness-110"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* urgentバッジ */}
        {news.type === "urgent" && (
          <div className="absolute left-4 top-4 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white">
            重要
          </div>
        )}
      </div>

      {/* コンテンツエリア */}
      <div className="p-6">
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 md:text-xl">{news.title}</h3>
        <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
          {/* typeバッジ */}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-700">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {getTypeLabel(news.type)}
          </span>
          <span className="text-gray-400">|</span>
          <span>{new Date(news.publishedAt || news.createdAt).toLocaleDateString("ja-JP")}</span>
        </div>
      </div>
    </Link>
  );
}
