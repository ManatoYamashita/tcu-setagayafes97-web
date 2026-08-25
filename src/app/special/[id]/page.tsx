import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpecialEventById, getSpecialEvents } from "@/lib/events";
import { SpecialHero } from "@/components/special/SpecialHero";
import { SpecialSchedule } from "@/components/special/SpecialSchedule";
import { SpecialProfile } from "@/components/special/SpecialProfile";
import { GoodsTable } from "@/components/special/GoodsTable";
import { TicketTable } from "@/components/special/TicketTable";
import { NoticeList } from "@/components/special/NoticeList";
import { SNSLinks } from "@/components/events/SNSLinks";
import { siteConfig, SPECIAL_GOODS_VISIBLE, SPECIAL_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

interface SpecialPageProps {
  params: Promise<{ id: string }>;
}

/**
 * ISR設定: 開発中は変更反映を早めるため10分ごとに再検証
 */
export const revalidate = 600;

/**
 * 静的パラメータ生成
 * SPECIAL_VISIBLE が false の間は空配列（URLを先行露出させない）
 */
export async function generateStaticParams() {
  const events = await getSpecialEvents();
  return events.map((event) => ({ id: event.id }));
}

/**
 * メタデータ生成（動的OGP）
 * SNSでの拡散が期待される導線のため、アーティスト写真をOGP画像に使う
 */
export async function generateMetadata({ params }: SpecialPageProps): Promise<Metadata> {
  const { id } = await params;
  const event = await getSpecialEventById(id);

  if (!event) {
    return createPageMetadata({
      title: "ページが見つかりません",
      description: "お探しのページは見つかりませんでした。",
      pathname: `/special/${id}`,
    });
  }

  return createPageMetadata({
    title: event.title,
    description: event.description,
    pathname: `/special/${id}`,
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
 * 「¥2,300（税込）」のような表記から数値部分だけを取り出す
 * 構造化データの price は数値表現が求められるため
 * @returns 数字が取れない場合は undefined
 */
function parsePriceValue(price?: string): string | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[^\d]/g, "");
  return digits.length > 0 ? digits : undefined;
}

/**
 * 著名人企画LP
 *
 * データは events API（type = special）に置きつつ、URL と公開制御だけを
 * /events から独立させています。著名人の発表は一般企画一覧より先行することがあり、
 * /events/[id] に統合すると「一覧は準備中なのに詳細だけ見える」不整合が生じるためです。
 */
export default async function SpecialDetailPage({ params }: SpecialPageProps) {
  if (!SPECIAL_VISIBLE) {
    notFound();
  }

  const { id } = await params;
  const event = await getSpecialEventById(id);

  if (!event) {
    notFound();
  }

  const special = event.special;
  const eventDateIso = event.date === "day2" ? siteConfig.dates.day2 : siteConfig.dates.day1;

  // 構造化データ（JSON-LD）
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "MusicEvent",
    name: event.title,
    description: event.description,
    organizer: {
      "@type": "Organization",
      name: event.organizer,
    },
    location: {
      "@type": "Place",
      name: [event.building, event.place].filter(Boolean).join(" "),
      address: {
        "@type": "PostalAddress",
        streetAddress: siteConfig.address,
        addressLocality: "世田谷区",
        addressRegion: "東京都",
        addressCountry: "JP",
      },
    },
    startDate: event.startTime ? `${eventDateIso}T${event.startTime}:00+09:00` : eventDateIso,
    endDate: event.endTime ? `${eventDateIso}T${event.endTime}:00+09:00` : undefined,
    doorTime: special?.openTime,
    image: event.thumbnail?.url,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    offers: special?.tickets?.map((ticket) => ({
      "@type": "Offer",
      name: ticket.name,
      price: parsePriceValue(ticket.price),
      priceCurrency: "JPY",
      url: ticket.buttonUrl,
      availability: "https://schema.org/InStock",
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen bg-secondary">
        <SpecialHero
          title={event.title}
          organizer={event.organizer}
          logo={special?.logo}
          photo={event.thumbnail}
        />

        <div className="relative z-10 -mt-6 mx-4 min-h-[50vh] rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* パンくずリスト */}
            <nav aria-label="パンくずリスト" className="mb-4">
              <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-900/60">
                <li>
                  <Link href="/" className="hover:text-gray-900 hover:underline">
                    トップ
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/special" className="hover:text-gray-900 hover:underline">
                    著名人企画
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li aria-current="page" className="text-gray-900">
                  {event.title}
                </li>
              </ol>
            </nav>

            <div className="divide-y divide-gray-200">
              <SpecialProfile content={event.content} photos={special?.photos} />

              <SpecialSchedule
                date={event.date}
                openTime={special?.openTime}
                startTime={event.startTime}
                endTime={event.endTime}
                building={event.building}
                place={event.place}
              />

              {SPECIAL_GOODS_VISIBLE && (
                <GoodsTable goods={special?.goods} note={special?.goodsNote} />
              )}

              <TicketTable tickets={special?.tickets} note={special?.ticketNote} />

              <NoticeList notices={special?.notices} />
            </div>

            {event.sns && (
              <div className="pt-8">
                <SNSLinks sns={event.sns} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
