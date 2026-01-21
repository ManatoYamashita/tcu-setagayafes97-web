import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getEventById, getEventsList } from "@/lib/events";
import { EventDetail } from "@/components/events/EventDetail";
import { RelatedEvents } from "@/components/events/RelatedEvents";

interface EventPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 静的パラメータ生成（generateStaticParams）
 * ビルド時に全企画ページを生成
 */
export async function generateStaticParams() {
  const events = await getEventsList(200);
  return events.map((event) => ({
    id: event.id,
  }));
}

/**
 * メタデータ生成（動的OGP）
 */
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    return {
      title: "企画が見つかりません | 東京都市大学 第97回 世田谷祭",
    };
  }

  return {
    title: `${event.title} | 東京都市大学 第97回 世田谷祭`,
    description: event.description,
    openGraph: {
      title: `${event.title} | 東京都市大学 第97回 世田谷祭`,
      description: event.description,
      type: "article",
      images: event.thumbnail
        ? [
            {
              url: event.thumbnail.url,
              width: event.thumbnail.width,
              height: event.thumbnail.height,
              alt: event.title,
            },
          ]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${event.title} | 東京都市大学 第97回 世田谷祭`,
      description: event.description,
      images: event.thumbnail ? [event.thumbnail.url] : undefined,
    },
  };
}

/**
 * 企画詳細ページ
 */
export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  const event = await getEventById(id);

  if (!event) {
    notFound();
  }

  // 構造化データ（JSON-LD）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
    location: {
      "@type": "Place",
      name: `${event.building} ${event.place}`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "世田谷区",
        addressRegion: "東京都",
        addressCountry: "JP",
      },
    },
    startDate: event.startTime
      ? `2026-${event.date === "day1" ? "10-31" : "11-01"}T${event.startTime}:00+09:00`
      : undefined,
    endDate: event.endTime
      ? `2026-${event.date === "day1" ? "10-31" : "11-01"}T${event.endTime}:00+09:00`
      : undefined,
    image: event.thumbnail?.url,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  };

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* パンくずリスト */}
        <nav className="border-b border-gray-200 bg-white py-4" aria-label="パンくずリスト">
          <div className="container mx-auto px-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-primary hover:underline">
                  トップ
                </Link>
              </li>
              <li>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li>
                <Link href="/events" className="hover:text-primary hover:underline">
                  企画を探す
                </Link>
              </li>
              <li>
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </li>
              <li className="font-semibold text-gray-900" aria-current="page">
                {event.title}
              </li>
            </ol>
          </div>
        </nav>

        {/* メインコンテンツ */}
        <div className="container mx-auto px-4 py-12">
          <div className="mx-auto max-w-4xl">
            <EventDetail event={event} />
          </div>

          {/* 戻るボタン */}
          <div className="mx-auto mt-12 max-w-4xl">
            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-primary hover:underline"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>企画一覧に戻る</span>
            </Link>
          </div>
        </div>

        {/* 関連企画 */}
        <RelatedEvents currentEvent={event} />
      </div>
    </>
  );
}
