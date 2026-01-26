import type { Metadata } from "next";
import Image from "next/image";
import { Users, Target, Building2, ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { aboutConfig } from "@/data/about";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

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

  const t = await getTranslations("about");

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
            <Users className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 委員長挨拶 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">{t("chairperson.title")}</h2>
            </div>

            {/* 委員長情報 */}
            <div className="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* 委員長画像 */}
              <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                  <Users className="h-24 w-24 text-white opacity-50" />
                </div>
              </div>

              {/* 委員長プロフィール */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {aboutConfig.chairpersonMessage.name}
                </h3>
                <p className="text-gray-600">{aboutConfig.chairpersonMessage.position}</p>
              </div>
            </div>

            {/* 挨拶文 */}
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap leading-relaxed text-gray-700">
                {aboutConfig.chairpersonMessage.message}
              </p>
            </div>
          </section>

          {/* 理念・ビジョン */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("vision.title")}</h2>
            </div>

            {/* テーマ */}
            <div className="mb-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 p-8 text-center text-white">
              <p className="mb-2 text-sm font-semibold opacity-90">{t("vision.themeLabel")}</p>
              <h3 className="text-3xl font-bold md:text-4xl">{aboutConfig.vision.theme}</h3>
            </div>

            {/* 理念説明 */}
            <p className="mb-8 text-center text-lg text-gray-700">
              {aboutConfig.vision.description}
            </p>

            {/* 価値観 */}
            <div className="grid gap-6 md:grid-cols-2">
              {aboutConfig.vision.values.map((value, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-3 text-4xl">{value.icon}</div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">{value.title}</h4>
                  <p className="text-sm text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 実行委員会について */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("committee.title")}</h2>
            </div>

            {/* 基本情報 */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-600">
                  {t("committee.established")}
                </p>
                <p className="text-lg font-bold text-green-700">
                  {aboutConfig.committee.establishedYear}年
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-600">
                  {t("committee.memberCount")}
                </p>
                <p className="text-lg font-bold text-green-700">
                  {t("committee.about")}
                  {aboutConfig.committee.memberCount}
                  {t("committee.members")}
                </p>
              </div>
            </div>

            {/* 説明 */}
            <p className="mb-6 text-gray-700">{aboutConfig.committee.description}</p>

            {/* 組織構成 */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                {t("committee.organization")}
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {aboutConfig.committee.departments.map((dept, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center"
                  >
                    <p className="font-semibold text-gray-900">{dept}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SNSリンク */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              {t("social.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-3">
              {aboutConfig.social.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 rounded-lg border-2 border-primary p-4 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <span>{social.name}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>

          {/* 関連リンク */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              {t("relatedPages.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/about/sponsors"
                className="rounded-lg border-2 border-gray-300 p-4 text-center font-semibold text-gray-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {t("relatedPages.sponsors")}
              </Link>
              <Link
                href="/about/contact"
                className="rounded-lg border-2 border-gray-300 p-4 text-center font-semibold text-gray-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                {t("relatedPages.contact")}
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
