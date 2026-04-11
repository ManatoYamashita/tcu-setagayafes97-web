import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AboutHero } from "@/components/about/AboutHero";
import { ChairpersonSection } from "@/components/about/ChairpersonSection";
import { EventOverviewTable } from "@/components/about/EventOverviewTable";
import { SponsorBanner } from "@/components/home/SponsorBanner";

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
  const t = await getTranslations({ locale, namespace: "about" });

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
 * 委員会について（About）ページ
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-white">
      <AboutHero />

      {/* 委員長挨拶 */}
      <ChairpersonSection />

      {/* 開催概要 */}
      <EventOverviewTable />

      {/* 協賛企業 */}
      <SponsorBanner />
    </div>
  );
}
