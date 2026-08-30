import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AboutHero } from "@/components/about/AboutHero";
import { ChairpersonSection } from "@/components/about/ChairpersonSection";
import { EventOverviewTable } from "@/components/about/EventOverviewTable";
import { SponsorBanner } from "@/components/home/SponsorBanner";
import { createPageMetadata } from "@/lib/metadata";

/**
 * 再検証間隔（Webhook 障害時のフォールバック）
 *
 * このページは末尾で `<SponsorBanner />` を描画しており、その中で microCMS の
 * `informations` を読んでいる。主系は Webhook によるオンデマンド再検証
 * （`src/app/api/revalidate/route.ts`）で、こちらは通知を取りこぼしたときの保険である。
 *
 * **この宣言を外すと新規協賛が永久に反映されなくなる。**
 * 宣言が無い間、`/{ja,en,zh,ko}/about` は `initialRevalidateSeconds: false` であり、
 * 同じ `informations` を `revalidate = 3600` で描画している `/about/sponsors` と
 * 食い違っていた。値を揃えてある。
 */
export const revalidate = 3600;

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

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/about",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
}

/**
 * 委員会について（About）ページ
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="min-h-screen bg-secondary">
      <AboutHero />

      {/* 委員長挨拶 */}
      {/*
        シートの外側に置くこと。ChairpersonSection は overflow-hidden と
        絶対配置の装飾要素を持つため、白シートの内側に入れると rounded-t-3xl の
        角が欠ける。
      */}
      <ChairpersonSection />

      {/* 開催概要 */}
      {/*
        他セクションページの PageSheetLayout と同じ白シート表現。
        AboutHero は PageHero ではなく独自のヒーローのため、シート部分のみを
        インラインで再現している。
      */}
      <div className="relative z-10 -mt-6 mx-4 rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
        <EventOverviewTable />
      </div>

      {/* 協賛企業 */}
      <SponsorBanner />
    </div>
  );
}
