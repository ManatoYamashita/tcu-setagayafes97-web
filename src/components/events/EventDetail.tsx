import Image from "next/image";
import type { Event } from "@/types/events";
import { Badge } from "@/components/ui/Badge";
import { SNSLinks } from "./SNSLinks";

interface EventDetailProps {
  event: Event;
}

/**
 * 企画詳細コンポーネント
 * 企画の詳細情報を表示
 */
export function EventDetail({ event }: EventDetailProps) {
  return (
    <div className="space-y-8">
      {/* サムネイル画像 */}
      {event.thumbnail && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-lg">
          <Image
            src={event.thumbnail.url}
            alt={event.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1000px"
            priority
          />
        </div>
      )}

      {/* タイトルセクション */}
      <div>
        {/* バッジ */}
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge variant={event.date} label={event.date} />
          <Badge variant={event.type} label={event.type} />
        </div>

        {/* タイトル */}
        <h1 className="mb-3 text-3xl font-bold text-gray-900 md:text-4xl">{event.title}</h1>

        {/* 主催団体 */}
        <p className="text-xl font-semibold text-primary">{event.organizer}</p>
      </div>

      {/* メタ情報 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">開催情報</h2>
        <dl className="space-y-3">
          {/* 開催日 */}
          <div className="flex items-start gap-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              開催日
            </dt>
            <dd className="text-sm text-gray-900">
              {event.date === "day1" && "1日目（10月31日）"}
              {event.date === "day2" && "2日目（11月1日）"}
              {event.date === "both" && "両日開催"}
              {event.date === "other" && "その他"}
            </dd>
          </div>

          {/* 開催時間 */}
          {event.startTime && event.endTime && (
            <div className="flex items-start gap-3">
              <dt className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <svg
                  className="h-5 w-5 text-primary"
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
                開催時間
              </dt>
              <dd className="text-sm text-gray-900">
                {event.startTime} 〜 {event.endTime}
              </dd>
            </div>
          )}

          {/* 場所 */}
          <div className="flex items-start gap-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg
                className="h-5 w-5 text-primary"
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
              場所
            </dt>
            <dd className="text-sm text-gray-900">
              {event.building} {event.place}
            </dd>
          </div>

          {/* 企画種別 */}
          <div className="flex items-start gap-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <svg
                className="h-5 w-5 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                />
              </svg>
              種別
            </dt>
            <dd className="text-sm text-gray-900">
              {event.type === "room" && "教室企画"}
              {event.type === "stage" && "ステージ企画"}
              {event.type === "special" && "スペシャル企画"}
              {event.type === "other" && "その他"}
            </dd>
          </div>
        </dl>
      </div>

      {/* 企画概要 */}
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-gray-900">企画概要</h2>
        <p className="whitespace-pre-wrap text-gray-700">{event.description}</p>
      </div>

      {/* 詳細説明（リッチテキスト） */}
      {event.content && (
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-bold text-gray-900">詳細</h2>
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </div>
      )}

      {/* SNSリンク */}
      <SNSLinks sns={event.sns} />
    </div>
  );
}
