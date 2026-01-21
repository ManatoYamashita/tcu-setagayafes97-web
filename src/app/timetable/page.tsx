import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { filterStageEvents } from "@/lib/timetable";
import { TimetableContent } from "@/components/timetable/TimetableContent";

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
  // 全企画を取得（最大200件）
  const allEvents = await getEventsList(200);

  // ステージ企画のみを抽出
  const stageEvents = filterStageEvents(allEvents);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">タイムテーブル</h1>
          <p className="text-center text-lg opacity-90">
            第97回 世田谷祭のステージ企画スケジュール
          </p>
        </div>
      </div>

      {/* タイムテーブルコンテンツ */}
      <TimetableContent initialEvents={stageEvents} />
    </div>
  );
}
