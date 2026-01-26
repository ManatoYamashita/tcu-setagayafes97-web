import type { Metadata } from "next";
import { HelpCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getFAQList } from "@/lib/informations";
import { Accordion } from "@/components/ui/Accordion";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import type { AccordionItem } from "@/types/accordion";

/**
 * 静的パラメータ生成
 */
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * メタデータ生成
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });

  return {
    title: t("meta.title"),
    description: t("meta.description"),
    openGraph: {
      title: t("meta.title"),
      description: t("meta.description"),
      type: "website",
      locale:
        locale === "ja" ? "ja_JP" : locale === "zh" ? "zh_CN" : locale === "ko" ? "ko_KR" : "en_US",
    },
  };
}

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * よくある質問（FAQ）ページ
 */
export default async function FAQPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("faq");

  // FAQ一覧を取得
  const faqList = await getFAQList();

  // AccordionItem形式に変換
  const accordionItems: AccordionItem[] = faqList.map((faq) => ({
    title: faq.title,
    content: faq.sponsorDescription || "",
    defaultOpen: false,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 言語切替（多言語対応ページのみ） */}
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <HelpCircle className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* FAQ件数表示 */}
          <div className="mb-6">
            <p className="text-sm text-gray-600">{t("count", { count: faqList.length })}</p>
          </div>

          {/* FAQ一覧 */}
          {faqList.length > 0 ? (
            <Accordion items={accordionItems} />
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-gray-500">{t("empty.title")}</p>
              <p className="mt-2 text-sm text-gray-400">
                {t("empty.prefix")}{" "}
                <a href="/about/contact" className="text-primary hover:underline">
                  {t("empty.contactLink")}
                </a>{" "}
                {t("empty.suffix")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
