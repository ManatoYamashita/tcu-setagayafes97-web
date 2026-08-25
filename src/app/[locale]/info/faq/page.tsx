import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { routing } from "@/i18n/routing";
import { getFAQList } from "@/lib/informations";
import { FAQContent } from "./FAQContent";
import { createPageMetadata } from "@/lib/metadata";

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

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/info/faq",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
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

  /**
   * ヒーローは他セクションページと共通の PageHero を使用する。
   * 画像と英字サブラベルは pageHeroes を継承し、見出し・説明のみロケール別文言で上書きする。
   */
  const hero: PageHeroData = {
    ...pageHeroes.faq,
    title: t("title"),
    description: t("subtitle"),
  };

  return (
    <PageSheetLayout hero={hero}>
      <FAQContent initialFAQ={faqList} />
    </PageSheetLayout>
  );
}
