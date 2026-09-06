import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types/events";
import { Badge } from "@/components/ui/Badge";
import { CircleImage } from "@/components/ui/CircleImage";

interface EventCardProps {
  event: Event;
  variant?: "default" | "featured" | "compact";
}

const dateLabels: Record<Event["date"], string> = {
  day1: "1日目",
  day2: "2日目",
  both: "両日",
  other: "その他",
};

const typeLabels: Record<Event["type"], string> = {
  room: "教室",
  stage: "ステージ",
  special: "スペシャル",
  other: "その他",
};

/**
 * 企画カードコンポーネント
 * 企画一覧・おすすめ企画で使用
 */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  // 著名人企画は専用LP（/special/[id]）が正規URL。/events/[id] は生成されない
  const href = event.type === "special" ? `/special/${event.id}` : `/events/${event.id}`;
  const isCompact = variant === "compact";
  const venue = [event.building, event.place].filter(Boolean).join(" ") || "会場未定";

  return (
    <Link href={href} className="group block h-full">
      <article
        className={`h-full overflow-hidden border border-gray-200 bg-white transition-[border-color,box-shadow] hover:border-primary-300 hover:shadow-sm ${isCompact ? "flex items-start rounded-lg" : "rounded-xl"}`}
      >
        {/* 円形サムネイル */}
        {event.thumbnail && (
          <div className={isCompact ? "shrink-0 p-4" : "flex justify-center p-6"}>
            <CircleImage
              src={event.thumbnail.url}
              alt={event.title}
              // xl(160px)だと、xl:グリッドの4カラム時にカード幅(約195px)から
              // p-6の余白(48px)を引いた残り(約147px)より大きく、
              // flexが円を横方向だけ縮めて楕円になる。lg(128px)なら収まる。
              size={isCompact ? "md" : "lg"}
            />
          </div>
        )}

        <div
          className={`flex min-w-0 flex-1 flex-col ${isCompact && event.thumbnail ? "p-4 pl-0" : isCompact ? "p-4" : "p-6 pt-0"}`}
        >
          {/* バッジ */}
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={event.date} label={dateLabels[event.date]} tone="soft" />
            <Badge variant={event.type} label={typeLabels[event.type]} tone="soft" />
          </div>

          {/* タイトル */}
          <h3
            className={`mb-2 line-clamp-2 font-bold text-gray-900 ${
              variant === "featured" ? "text-xl" : isCompact ? "text-base" : "text-lg"
            }`}
          >
            {event.title}
          </h3>

          {/* 主催団体 */}
          <p
            className={`font-semibold text-primary-700 ${isCompact ? "mb-2 text-xs" : "mb-3 text-sm"}`}
          >
            {event.organizer}
          </p>

          {/* 説明文 */}
          <p
            className={`${isCompact ? "mb-2 line-clamp-2 text-xs leading-5" : "mb-4 line-clamp-3 text-sm"} text-gray-900/80`}
          >
            {event.description}
          </p>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-gray-200 pt-3 text-xs text-gray-600">
            {/* 場所 */}
            <div className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
              </svg>
              <span>{venue}</span>
            </div>

            {/* 開催時間 */}
            {event.startTime && event.endTime && (
              <div className="flex items-center gap-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span>
                  {event.startTime} - {event.endTime}
                </span>
              </div>
            )}
          </div>
        </div>
      </article>
    </Link>
  );
}
