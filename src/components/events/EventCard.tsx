import Link from "next/link";
import Image from "next/image";
import type { Event } from "@/types/events";
import { Badge } from "@/components/ui/Badge";

interface EventCardProps {
  event: Event;
  variant?: "default" | "featured";
}

/**
 * 企画カードコンポーネント
 * 企画一覧・おすすめ企画で使用
 */
export function EventCard({ event, variant = "default" }: EventCardProps) {
  return (
    <Link href={`/events/${event.id}`} className="group block h-full">
      <article className="h-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all hover:border-primary hover:shadow-lg">
        {/* サムネイル */}
        {event.thumbnail && (
          <div className="relative aspect-video w-full overflow-hidden">
            <Image
              src={event.thumbnail.url}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
            />
          </div>
        )}

        <div className="p-6">
          {/* バッジ */}
          <div className="mb-3 flex flex-wrap gap-2">
            <Badge variant={event.date} label={event.date} />
            <Badge variant={event.type} label={event.type} />
          </div>

          {/* タイトル */}
          <h3
            className={`mb-2 line-clamp-2 font-bold text-gray-900 ${
              variant === "featured" ? "text-xl" : "text-lg"
            }`}
          >
            {event.title}
          </h3>

          {/* 主催団体 */}
          <p className="mb-3 text-sm font-semibold text-primary">{event.organizer}</p>

          {/* 説明文 */}
          <p className="mb-4 line-clamp-3 text-sm text-gray-600">{event.description}</p>

          {/* メタ情報 */}
          <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs text-gray-500">
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
              <span>
                {event.building} {event.place}
              </span>
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
