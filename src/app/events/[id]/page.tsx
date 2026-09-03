import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getEventById, getEventsList } from "@/lib/events";
import { SPECIAL_VISIBLE } from "@/data/site";
import { EventDetail } from "@/components/events/EventDetail";
import { RelatedEvents } from "@/components/events/RelatedEvents";
import { createPageMetadata } from "@/lib/metadata";
import { createBreadcrumbStructuredData, serializeJsonLd } from "@/lib/structured-data";
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
  // 著名人企画の正規URLは /special/[id]。ここでは生成しない（重複URLを作らない）
  return events
    .filter((event) => event.type !== "special")
    .map((event) => ({
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
    return createPageMetadata({
      title: "企画が見つかりません",
      description: "お探しの企画は見つかりませんでした。",
      pathname: `/events/${id}`,
      // 実在しないIDでも200が返るため、canonical を出さず noindex にする（詳細は createPageMetadata）。
      noindex: true,
    });
  }

  return createPageMetadata({
    title: event.title,
    description: event.description,
    pathname: `/events/${id}`,
    type: "article",
    image: event.thumbnail
      ? {
          url: event.thumbnail.url,
          width: event.thumbnail.width,
          height: event.thumbnail.height,
          alt: event.title,
        }
      : undefined,
  });
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

  // 著名人企画は /special/[id] が正規URL。既出のURLから来た場合に備えて誘導する
  if (event.type === "special") {
    if (!SPECIAL_VISIBLE) {
      notFound();
    }
    redirect(`/special/${event.id}`);
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />

      {/*
        パンくずの構造化データ。この直下の nav に視覚的なパンくずが実在するため
        宣言してよい（画面に無い階層を宣言するとガイドライン違反になる）。
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(
            createBreadcrumbStructuredData([
              { name: "トップ", pathname: "/" },
              { name: "企画を探す", pathname: "/events" },
              { name: event.title },
            ])
          ),
        }}
      />

      <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary">
        {/* パンくずリスト */}
        <nav className="border-b border-gray-200/20 bg-white/10 py-4" aria-label="パンくずリスト">
          <div className="container mx-auto px-4">
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-900/80">
              <li>
                <Link href="/" className="hover:text-gray-900 hover:underline">
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
                <Link href="/events" className="hover:text-gray-900 hover:underline">
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
              className="inline-flex items-center gap-2 text-primary-700 hover:underline"
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
