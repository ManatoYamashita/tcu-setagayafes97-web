import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { EventsContent } from "@/components/events/EventsContent";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { EVENTS_VISIBLE } from "@/data/site";

/**
 * メタデータ
 * EVENTS_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = EVENTS_VISIBLE
  ? {
      title: "企画を探す | 東京都市大学 第97回 世田谷祭",
      description:
        "東京都市大学 第97回 世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
      openGraph: {
        title: "企画を探す | 東京都市大学 第97回 世田谷祭",
        description:
          "東京都市大学 第97回 世田谷祭の企画一覧ページ。教室企画、ステージ企画、スペシャル企画など、様々な企画を検索・閲覧できます。",
        type: "website",
      },
    }
  : {
      title: "企画を探す | 東京都市大学 第97回 世田谷祭",
      description:
        "東京都市大学 第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。",
      openGraph: {
        title: "企画を探す | 東京都市大学 第97回 世田谷祭",
        description:
          "東京都市大学 第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。",
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
      {/* 企画一覧コンテンツ */}
      <EventsContent initialEvents={events} />
    </PageSheetLayout>
  );
}
