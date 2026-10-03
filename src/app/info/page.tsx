import type { Metadata } from "next";
import { getNewsList } from "@/lib/news";
import { NewsContent } from "./NewsContent";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { createPageMetadata } from "@/lib/metadata";
import { getChromeMessages } from "@/i18n/chrome-messages";

/** 一覧の呼称はカタログ1箇所で決める。パンくず・戻るリンクと同じ値を使う */
const { newsList } = getChromeMessages("ja").navigation;

/**
 * メタデータ
 */
export const metadata: Metadata = createPageMetadata({
  title: newsList,
  description:
    "第97回東京都市大学世田谷祭のお知らせ一覧ページ。重要なお知らせやイベント情報をご確認いただけます。",
  pathname: "/info",
});

/**
 * ISR設定: 10分ごとに再検証
 */
export const revalidate = 600;

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
