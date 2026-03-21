import type { Metadata } from "next";
import { getNewsList } from "@/lib/news";
import { NewsContent } from "./NewsContent";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

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
    <PageSheetLayout hero={pageHeroes.info}>
      {/* お知らせ一覧コンテンツ */}
      <NewsContent initialNews={newsList} />
    </PageSheetLayout>
  );
}
