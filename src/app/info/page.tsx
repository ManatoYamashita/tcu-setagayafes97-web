import type { Metadata } from "next";
import { getNewsList } from "@/lib/news";
import { NewsContent } from "./NewsContent";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { NEWS_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 * NEWS_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = NEWS_VISIBLE
  ? createPageMetadata({
      title: "お知らせ一覧",
      description:
        "東京都市大学 第97回 世田谷祭のお知らせ一覧ページ。重要なお知らせやイベント情報をご確認いただけます。",
      pathname: "/info",
    })
  : createPageMetadata({
      title: "お知らせ一覧",
      description:
        "東京都市大学 第97回 世田谷祭のお知らせは現在準備中です。公開までもうしばらくお待ちください。",
      pathname: "/info",
    });

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * お知らせ一覧ページ
 * SSG + クライアントサイドフィルタリング
 * NEWS_VISIBLE が false の間は準備中表示
 */
export default async function InfoPage() {
  if (!NEWS_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.info}>
        <ComingSoon
          title="お知らせは準備中です"
          description="第97回 世田谷祭に関するお知らせは現在準備中です。公開までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  // 全お知らせを取得（最大100件）
  const newsList = await getNewsList(100);

  return (
    <PageSheetLayout hero={pageHeroes.info}>
      {/* お知らせ一覧コンテンツ */}
      <NewsContent initialNews={newsList} />
    </PageSheetLayout>
  );
}
