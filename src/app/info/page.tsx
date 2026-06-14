import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "お知らせ一覧 | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭のお知らせは現在準備中です。公開までもうしばらくお待ちください。",
  openGraph: {
    title: "お知らせ一覧 | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭のお知らせは現在準備中です。公開までもうしばらくお待ちください。",
    type: "website",
  },
};

/**
 * お知らせ一覧ページ（準備中）
 */
export default function InfoPage() {
  return (
    <PageSheetLayout hero={pageHeroes.info}>
      <ComingSoon
        title="お知らせは準備中です"
        description="第97回 世田谷祭に関するお知らせは現在準備中です。公開までもうしばらくお待ちください。"
      />
    </PageSheetLayout>
  );
}
