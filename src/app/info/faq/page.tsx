import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { getFAQList } from "@/lib/informations";
import { Accordion } from "@/components/ui/Accordion";
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
    content: faq.sponsorDescription || "", // sponsorDescriptionフィールドを回答として使用
    defaultOpen: false,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">よくある質問</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">
            第97回 世田谷祭に関するよくある質問と回答
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* FAQ件数表示 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{faqList.length}</span>{" "}
              件の質問があります
            </p>
          </div>

          {/* FAQ一覧 */}
          {faqList.length > 0 ? (
            <Accordion items={accordionItems} />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
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
      </div>
    </div>
  );
}
