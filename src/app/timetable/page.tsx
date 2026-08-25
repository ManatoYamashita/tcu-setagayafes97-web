import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { filterStageEvents } from "@/lib/timetable";
import { TimetableContent } from "@/components/timetable/TimetableContent";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { EVENTS_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 * EVENTS_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = EVENTS_VISIBLE
  ? createPageMetadata({
      title: "タイムテーブル",
      description:
        "東京都市大学 第97回 世田谷祭のタイムテーブルページ。ステージ企画の開催時刻を確認できます。",
      pathname: "/timetable",
    })
  : createPageMetadata({
      title: "タイムテーブル",
      description:
        "東京都市大学 第97回 世田谷祭のタイムテーブルは現在準備中です。公開までもうしばらくお待ちください。",
      pathname: "/timetable",
    });

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * タイムテーブルページ
 * SSG + クライアントサイドフィルタリング
 * EVENTS_VISIBLE が false の間は準備中表示
 */
export default async function TimetablePage() {
  if (!EVENTS_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.timetable}>
        <ComingSoon
          title="タイムテーブルは準備中です"
          description="第97回 世田谷祭のタイムテーブルは現在準備中です。公開までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  // 全企画を取得（最大200件）
  const allEvents = await getEventsList(200);

  // ステージ企画のみを抽出
  const stageEvents = filterStageEvents(allEvents);

  return (
    <PageSheetLayout hero={pageHeroes.timetable}>
      {/* タイムテーブルコンテンツ */}
      <TimetableContent initialEvents={stageEvents} />
    </PageSheetLayout>
  );
}
