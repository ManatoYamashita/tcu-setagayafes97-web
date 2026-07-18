import type { Metadata } from "next";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * メタデータ
 */
export const metadata: Metadata = {
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
 * 企画一覧ページ（準備中）
 */
export default function EventsPage() {
  return (
    <PageSheetLayout hero={pageHeroes.events}>
      <ComingSoon
        title="企画情報は準備中です"
        description="第97回 世田谷祭の企画情報は現在準備中です。公開までもうしばらくお待ちください。"
      />
    </PageSheetLayout>
  );
}
