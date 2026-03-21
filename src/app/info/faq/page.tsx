import type { Metadata } from "next";
import { getFAQList } from "@/lib/informations";
import { Accordion } from "@/components/ui/Accordion";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import type { AccordionItem } from "@/types/accordion";

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
  // FAQ一覧を取得
  const faqList = await getFAQList();

  // AccordionItem形式に変換
  const accordionItems: AccordionItem[] = faqList.map((faq) => ({
    title: faq.title,
    content: faq.description || "",
    defaultOpen: false,
  }));

  return (
    <PageSheetLayout hero={pageHeroes.faq}>
      <div className="mx-auto max-w-4xl">
        {/* FAQ件数表示 */}
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-900">{faqList.length}</span> 件の質問があります
          </p>
        </div>

        {/* FAQ一覧 */}
        {faqList.length > 0 ? (
          <Accordion items={accordionItems} />
        ) : (
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center shadow-sm">
            <p className="text-gray-500">現在、FAQは準備中です。</p>
            <p className="mt-2 text-sm text-gray-400">
              ご不明な点がございましたら、
              <a href="/about/contact" className="text-primary hover:underline">
                お問い合わせフォーム
              </a>
              よりお問い合わせください。
            </p>
          </div>
        )}
      </div>
    </PageSheetLayout>
  );
}
