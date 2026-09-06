import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getEventsList } from "@/lib/events";
import {
  paginateEvents,
  getTotalPages,
  listBuildingOptions,
  DEFAULT_EVENT_FILTERS,
  EVENTS_PER_PAGE,
} from "@/lib/filters";
import { EventsContent } from "@/components/events/EventsContent";
import { EventsView } from "@/components/events/EventsView";
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
 * EVENTS_VISIBLE が false の間は準備中表示（著名人企画のセクションは下記のとおり残す）
 */
export default async function EventsPage() {
  /*
   * 著名人企画は EVENTS_VISIBLE ではなく SPECIAL_VISIBLE だけで解禁する。
   * 企画一覧が準備中でも、解禁済みの著名人企画には /events から到達できなければならない。
   * データ層（getSpecialEventById）も同じ理由で EVENTS_VISIBLE に依存しないため、
   * ここで組み立てておけば準備中・公開中のどちらの分岐でもそのまま置ける。
   *
   * ラッパーの余白だけが残らないよう、SPECIAL_VISIBLE で括ってから組み立てる
   * （SpecialGuestSection 自身も false なら null を返すが、それでは div が残る）。
   * 左右端は ComingSoon / EventsContent のルート（container mx-auto px-4）に合わせる。
   */
  const specialGuestSection = SPECIAL_VISIBLE ? (
    <div className="container mx-auto px-4 pb-12">
      <SpecialGuestSection variant="sheet" />
    </div>
  ) : null;

  if (!EVENTS_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.events}>
        <ComingSoon
          title="企画情報は準備中です"
          description="第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。"
        />
        {/* 準備中でも著名人企画だけは出す。上部の細いリンクは、ここでは一覧を挟まず
            すぐ下にこのセクションが来るため重複になるので付けない */}
        {specialGuestSection}
      </PageSheetLayout>
    );
  }

  // 全企画を取得（最大200件）
  const events = await getEventsList(200);

  // 建物の選択肢は全企画から導出する。ページ分割後の配列からは作れないので、
  // fallback と EventsContent の両方へ同じものを降ろす
  const buildingOptions = listBuildingOptions(events);

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

      {/*
        企画一覧コンテンツ

        EventsContent は useSearchParams() を使うため <Suspense> 境界が要る。
        境界が無いと、src/app/events/loading.tsx が代役を務めてしまい、
        ページ全体（ヒーローと白いシートを含む）がクライアントレンダリングへ落ちる。

        fallback はただのプレースホルダではなく「クエリ無しで来たときの完成形」である。
        bailout した境界の fallback はサーバーで描かれて静的HTMLに残るため、ここへ既定の
        ビューを置くと企画カードのリンクがHTMLに載り、/events がクロール経路として機能する。
        クエリ無しなら本描画と同一マークアップになるので、差し替わっても見た目は動かない。

        DEFAULT_EVENT_FILTERS は絞り込み無しなので filterEvents() は恒等写像になる。
        呼ばずに events をそのまま渡している。

        詳細は docs/frontend/static-html-and-search-params.md を参照。
      */}
      <Suspense
        fallback={
          <EventsView
            events={paginateEvents(events, 1, EVENTS_PER_PAGE)}
            filters={DEFAULT_EVENT_FILTERS}
            buildingOptions={buildingOptions}
            totalCount={events.length}
            currentPage={1}
            totalPages={getTotalPages(events.length, EVENTS_PER_PAGE)}
          />
        }
      >
        <EventsContent initialEvents={events} buildingOptions={buildingOptions} />
      </Suspense>

      {/* 一覧を見終えた来場者をもう一度 LP へ送る。上部の細いリンクとは粒度が違うので併存させる */}
      {specialGuestSection}
    </PageSheetLayout>
  );
}
