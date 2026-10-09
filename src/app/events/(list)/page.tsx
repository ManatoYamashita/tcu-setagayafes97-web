import { Suspense } from "react";
import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import {
  resolveVisibleCount,
  listBuildingOptions,
  DEFAULT_EVENT_FILTERS,
  EVENTS_PER_PAGE,
} from "@/lib/filters";
import { EventsContent } from "@/components/events/EventsContent";
import { EventsView } from "@/components/events/EventsView";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { SpecialEventBanner } from "@/components/special/SpecialEventBanner";
import { SpecialGuestSection } from "@/components/special/SpecialGuestSection";
import { pageHeroes } from "@/data/page-heroes";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 */
export const metadata: Metadata = createPageMetadata({
  title: "企画を探す",
  description:
    "第97回東京都市大学世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
  pathname: "/events",
});

/**
 * ISR設定: 10分ごとに再検証
 */
export const revalidate = 600;

/**
 * 企画一覧ページ
 * SSG + クライアントサイドフィルタリング
 */
export default async function EventsPage() {
  const specialGuestSection = (
    <div className="container mx-auto px-4 pb-12">
      <SpecialGuestSection variant="sheet" />
    </div>
  );

  // 全企画を取得（最大200件）
  const events = await getEventsList(200);

  // 建物の選択肢（fallback 用）。fallback は定義上クエリ無し（DEFAULT_EVENT_FILTERS）なので
  // 選択中の建物を持たない。本描画側は選択値を知っている EventsContent が自分で作る
  const fallbackBuildingOptions = listBuildingOptions(events);

  return (
    <PageSheetLayout hero={pageHeroes.events}>
      <SpecialEventBanner />

      {/*
        企画一覧コンテンツ

        EventsContent は useSearchParams() を使うため <Suspense> 境界が要る。
        境界が無いと、src/app/events/(list)/loading.tsx が代役を務めてしまい、
        ページ全体（ヒーローと白いシートを含む）がクライアントレンダリングへ落ちる。

        fallback はただのプレースホルダではなく「クエリ無しで来たときの完成形」である。
        bailout した境界の fallback はサーバーで描かれて静的HTMLに残るため、ここへ既定の
        ビューを置くと企画カードのリンクがHTMLに載り、/events がクロール経路として機能する。
        構造は本描画と同じだが、**並び順は一致しない。** 本描画は来場者ごとにシャッフルする
        （#409。EventsContent / useShuffleSeed）。fallback はシードを持たないサーバーで描かれるため
        microCMS の順（公開日の新しい順）のまま残る。差し替わるときに先頭のカードが入れ替わる。

        DEFAULT_EVENT_FILTERS は絞り込み無しなので filterEvents() は恒等写像になる。
        呼ばずに events をそのまま渡している。**全件を渡すが、静的HTMLへ描かれるのは
        先頭1ページ分だけである**（EventInfiniteList が visibleCount で slice する）。
        配列の参照は EventsContent の initialEvents と同一なので、Flight ペイロードにも
        重複して載らない。

        詳細は docs/frontend/static-html-and-search-params.md を参照。
      */}
      <Suspense
        fallback={
          <EventsView
            events={events}
            filters={DEFAULT_EVENT_FILTERS}
            buildingOptions={fallbackBuildingOptions}
            initialVisibleCount={resolveVisibleCount(1, EVENTS_PER_PAGE, events.length)}
            step={EVENTS_PER_PAGE}
          />
        }
      >
        <EventsContent initialEvents={events} />
      </Suspense>

      {/* 一覧を見終えた来場者をもう一度 LP へ送る。上部の細いリンクとは粒度が違うので併存させる */}
      {specialGuestSection}
    </PageSheetLayout>
  );
}
