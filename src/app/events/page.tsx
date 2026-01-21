import type { Metadata } from "next";
import { getEventsList } from "@/lib/events";
import { EventsContent } from "@/components/events/EventsContent";

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
  // 全企画を取得（最大200件）
  const events = await getEventsList(200);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">企画を探す</h1>
          <p className="text-center text-lg opacity-90">
            第97回 世田谷祭の企画を検索・閲覧できます
          </p>
        </div>
      </div>

      {/* 企画一覧コンテンツ */}
      <EventsContent initialEvents={events} />
    </div>
  );
}
