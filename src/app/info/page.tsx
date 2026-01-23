import type { Metadata } from "next";
import { getNewsList } from "@/lib/news";
import { NewsContent } from "./NewsContent";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "お知らせ一覧 | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭のお知らせ一覧ページ。重要なお知らせやイベント情報をご確認いただけます。",
  openGraph: {
    title: "お知らせ一覧 | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭のお知らせ一覧ページ。重要なお知らせやイベント情報をご確認いただけます。",
    type: "website",
  },
};

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * お知らせ一覧ページ
 * SSG + クライアントサイドフィルタリング
 */
export default async function InfoPage() {
  // 全お知らせを取得（最大100件）
  const newsList = await getNewsList(100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">お知らせ</h1>
          <p className="text-center text-lg opacity-90">
            第97回 世田谷祭に関する最新情報をお届けします
          </p>
        </div>
      </div>

      {/* お知らせ一覧コンテンツ */}
      <NewsContent initialNews={newsList} />
    </div>
  );
}
