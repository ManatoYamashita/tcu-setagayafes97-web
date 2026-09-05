import Image from "next/image";
import type { Event } from "@/types/events";
import { Badge } from "@/components/ui/Badge";
import { SNSLinks } from "./SNSLinks";

interface EventDetailProps {
  event: Event;
}

interface EventFactProps {
  label: string;
  value: string;
}

const dateLabels: Record<Event["date"], string> = {
  day1: "1日目（10月31日）",
  day2: "2日目（11月1日）",
  both: "両日開催",
  other: "その他",
};

const dateBadgeLabels: Record<Event["date"], string> = {
  day1: "1日目",
  day2: "2日目",
  both: "両日",
  other: "その他",
};

const typeLabels: Record<Event["type"], string> = {
  room: "教室企画",
  stage: "ステージ企画",
  special: "スペシャル企画",
  other: "その他",
};

const SQUARE_IMAGE_TOLERANCE = 0.05;

function EventFact({ label, value }: EventFactProps) {
  return (
    <div className="border-t border-gray-200 pt-4 first:border-t-0 first:pt-0 sm:border-t-0 sm:pt-0">
      <dt className="text-sm font-semibold text-gray-600">{label}</dt>
      <dd className="mt-1 text-base font-semibold leading-relaxed text-gray-900">{value}</dd>
    </div>
  );
}

/**
 * 企画詳細コンポーネント
 * 企画の主役である画像・タイトルと、来場に必要な情報を優先して表示する。
 */
export function EventDetail({ event }: EventDetailProps) {
  const venue = [event.building, event.place].filter(Boolean).join(" ") || "会場未定";
  const thumbnailWidth = event.thumbnail?.width ?? 0;
  const thumbnailHeight = event.thumbnail?.height ?? 0;
  const isIconThumbnail =
    event.thumbnail !== undefined &&
    thumbnailWidth > 0 &&
    thumbnailHeight > 0 &&
    Math.abs(thumbnailWidth - thumbnailHeight) / Math.max(thumbnailWidth, thumbnailHeight) <=
      SQUARE_IMAGE_TOLERANCE;
  const time =
    event.startTime && event.endTime
      ? `${event.startTime} 〜 ${event.endTime}`
      : event.startTime
        ? `${event.startTime}〜`
        : "時間未定";

  return (
    <article className="space-y-12">
      {/* 企画ヘッダー */}
      <div
        className={`grid ${isIconThumbnail ? "gap-4 lg:items-center" : "gap-8 lg:items-start"} lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:gap-12`}
      >
        {event.thumbnail && (
          <div
            className={`event-detail-entrance-media relative overflow-hidden ${isIconThumbnail ? "flex h-72 items-center justify-center rounded-2xl sm:h-80 lg:h-96 lg:justify-start" : "-mx-4 -mt-10 aspect-[4/3] rounded-t-2xl rounded-b-none sm:-mx-6 sm:aspect-[16/9] lg:mx-0 lg:mt-0 lg:aspect-[4/3] lg:rounded-b-2xl"}`}
          >
            {isIconThumbnail ? (
              <div className="relative h-36 w-36 sm:h-44 sm:w-44 lg:h-52 lg:w-52">
                <Image
                  src={event.thumbnail.url}
                  alt={event.title}
                  fill
                  className="object-contain"
                  sizes="(min-width: 64rem) 208px, (min-width: 40rem) 176px, 144px"
                  priority
                />
              </div>
            ) : (
              <Image
                src={event.thumbnail.url}
                alt={event.title}
                fill
                className="object-cover object-center"
                sizes="(min-width: 84rem) 668px, (min-width: 64rem) 50vw, 100vw"
                priority
              />
            )}
          </div>
        )}

        <header
          className={`event-detail-entrance-copy ${event.thumbnail ? "lg:py-6" : "lg:col-span-2 lg:py-6"}`}
        >
          <div className="flex flex-wrap gap-2">
            <Badge variant={event.date} label={dateBadgeLabels[event.date]} tone="soft" />
            <Badge
              variant={event.type}
              label={
                event.type === "room"
                  ? "教室"
                  : event.type === "stage"
                    ? "ステージ"
                    : typeLabels[event.type]
              }
              tone="soft"
            />
          </div>

          <h1 className="mt-5 text-3xl font-bold leading-[1.2] tracking-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>

          {event.organizer && (
            <div className="mt-6 border-t border-gray-200 pt-5">
              <p className="text-xs font-semibold text-gray-600">主催</p>
              <p className="mt-1 text-base font-semibold text-gray-900">{event.organizer}</p>
            </div>
          )}
        </header>
      </div>

      {/* 開催情報 */}
      <section
        aria-labelledby="event-information-heading"
        className="event-detail-entrance-section border-y border-gray-200 py-8"
      >
        <h2
          id="event-information-heading"
          className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
        >
          開催情報
        </h2>

        <dl className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          <EventFact label="開催日" value={dateLabels[event.date]} />
          <EventFact label="開催時間" value={time} />
          <EventFact label="会場" value={venue} />
          <EventFact label="企画種別" value={typeLabels[event.type]} />
        </dl>
      </section>

      {/* 企画概要 */}
      <section
        aria-labelledby="event-summary-heading"
        className="event-detail-entrance-section max-w-3xl"
      >
        <h2
          id="event-summary-heading"
          className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
        >
          企画概要
        </h2>
        <p className="mt-5 whitespace-pre-wrap text-base leading-8 text-gray-700">
          {event.description}
        </p>
      </section>

      {/* 詳細説明（リッチテキスト） */}
      {event.content && (
        <section
          aria-labelledby="event-content-heading"
          className="event-detail-entrance-section max-w-3xl border-t border-gray-200 pt-8"
        >
          <h2
            id="event-content-heading"
            className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl"
          >
            詳細
          </h2>
          <div
            className="mt-5 text-base leading-8 text-gray-700 [&_a]:font-semibold [&_a]:text-primary-700 [&_a]:underline [&_h2]:mt-8 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-bold [&_h3]:mt-6 [&_h3]:font-serif [&_h3]:text-xl [&_h3]:font-bold [&_li]:ml-5 [&_li]:list-disc [&_ol]:space-y-2 [&_p+p]:mt-4 [&_ul]:space-y-2"
            dangerouslySetInnerHTML={{ __html: event.content }}
          />
        </section>
      )}

      {/* SNSリンク */}
      <SNSLinks sns={event.sns} />
    </article>
  );
}
