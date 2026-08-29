import type { Metadata } from "next";
import Link from "next/link";
import { getEventsList } from "@/lib/events";
import { EventsContent } from "@/components/events/EventsContent";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { SpecialGuestSection } from "@/components/special/SpecialGuestSection";
import { pageHeroes } from "@/data/page-heroes";
import { EVENTS_VISIBLE, SPECIAL_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 * EVENTS_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = EVENTS_VISIBLE
  ? createPageMetadata({
      title: "企画を探す",
      description:
        "東京都市大学 第97回 世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
      pathname: "/events",
    })
  : createPageMetadata({
      title: "企画を探す",
      description:
        "東京都市大学 第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。",
      pathname: "/events",
    });

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 企画一覧ページ
 * SSG + クライアントサイドフィルタリング
 * EVENTS_VISIBLE が false の間は準備中表示
 */
export default async function EventsPage() {
  if (!EVENTS_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.events}>
        <ComingSoon
          title="企画情報は準備中です"
          description="第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  // 全企画を取得（最大200件）
  const events = await getEventsList(200);

  return (
    <PageSheetLayout hero={pageHeroes.events}>
      {/* 著名人企画への導線。解禁前（SPECIAL_VISIBLE=false）は出さない */}
      {SPECIAL_VISIBLE && (
        <Link
          href="/special"
          className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 px-5 py-4 transition-colors hover:bg-primary/10 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
        >
          <span>
            <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Special
            </span>
            <span className="block font-bold text-gray-900">著名人企画</span>
          </span>
          <svg
            className="h-5 w-5 shrink-0 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}

      {/* 企画一覧コンテンツ */}
      <EventsContent initialEvents={events} />

      {/* 一覧を見終えた来場者をもう一度 LP へ送る。上部の細いリンクとは粒度が違うので併存させる。
          左右端は EventsContent のルート（container mx-auto px-4）に合わせる */}
      <div className="container mx-auto px-4 pb-12">
        <SpecialGuestSection variant="card" />
      </div>
    </PageSheetLayout>
  );
}
