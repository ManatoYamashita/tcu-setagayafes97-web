import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { filterStageEvents } from "@/lib/timetable";
import { TimetableContent } from "@/components/timetable/TimetableContent";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { isDataPublished } from "@/lib/publish";
import { ComingSoon } from "@/components/ui/ComingSoon";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "タイムテーブル | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭のタイムテーブルページ。ステージ企画の開催時刻を確認できます。",
  openGraph: {
    title: "タイムテーブル | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭のタイムテーブルページ。ステージ企画の開催時刻を確認できます。",
    type: "website",
  },
};

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * タイムテーブルページ
 * SSG + クライアントサイドフィルタリング
 */
export default async function TimetablePage() {
  if (!isDataPublished) {
    return (
      <PageSheetLayout hero={pageHeroes.timetable}>
        <ComingSoon />
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
