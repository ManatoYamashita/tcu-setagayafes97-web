import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { EventsContent } from "@/components/events/EventsContent";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { isDataPublished } from "@/lib/publish";
import { ComingSoon } from "@/components/ui/ComingSoon";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "企画を探す | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
  openGraph: {
    title: "企画を探す | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
    type: "website",
  },
};

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 企画一覧ページ
 * SSG + クライアントサイドフィルタリング
 */
export default async function EventsPage() {
  if (!isDataPublished) {
    return (
      <PageSheetLayout hero={pageHeroes.events}>
        <ComingSoon />
      </PageSheetLayout>
    );
  }

  // 全企画を取得（最大200件）
  const events = await getEventsList(200);

  return (
    <PageSheetLayout hero={pageHeroes.events}>
      {/* 企画一覧コンテンツ */}
      <EventsContent initialEvents={events} />
    </PageSheetLayout>
  );
}
