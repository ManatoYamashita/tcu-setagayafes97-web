import type { Metadata } from "next";
import { getFAQList } from "@/lib/informations";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { FAQContent } from "./FAQContent";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "よくある質問（FAQ） | 東京都市大学 第97回 世田谷祭",
  description: "東京都市大学 第97回 世田谷祭に関するよくある質問と回答をご確認いただけます。",
  openGraph: {
    title: "よくある質問（FAQ） | 東京都市大学 第97回 世田谷祭",
    description: "東京都市大学 第97回 世田谷祭に関するよくある質問と回答をご確認いただけます。",
    type: "website",
  },
};

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * よくある質問（FAQ）ページ
 */
export default async function FAQPage() {
  const faqList = await getFAQList();

  return (
    <PageSheetLayout hero={pageHeroes.faq}>
      <FAQContent initialFAQ={faqList} />
    </PageSheetLayout>
  );
}
