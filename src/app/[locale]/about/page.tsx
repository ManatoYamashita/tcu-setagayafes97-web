import type { Metadata } from "next";
import { Target, Building2, ExternalLink } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { aboutConfig } from "@/data/about";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { AboutHero } from "@/components/about/AboutHero";
import { ChairpersonSection } from "@/components/about/ChairpersonSection";

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
    <div className="min-h-screen bg-white">
      <AboutHero />

      {/* 委員長挨拶 */}
      <ChairpersonSection />

      {/* 以降のセクション */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 理念・ビジョン */}
          <section className="rounded-lg border border-gray-200/20 bg-gray-50 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("vision.title")}</h2>
            </div>

            {/* テーマ */}
            <div className="mb-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 p-8 text-center text-gray-900">
              <p className="mb-2 text-sm font-semibold opacity-90">{t("vision.themeLabel")}</p>
              <h3 className="text-3xl font-bold md:text-4xl">{aboutConfig.vision.theme}</h3>
            </div>

            {/* 理念説明 */}
            <p className="mb-8 text-center text-lg text-gray-900/90">
              {aboutConfig.vision.description}
            </p>

            {/* 価値観 */}
            <div className="grid gap-6 md:grid-cols-2">
              {aboutConfig.vision.values.map((value, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200/20 bg-gray-50 p-6 transition-all hover:border-gray-200 hover:shadow-md"
                >
                  <div className="mb-3 text-4xl">{value.icon}</div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">{value.title}</h4>
                  <p className="text-sm text-gray-900/90">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 実行委員会について */}
          <section className="rounded-lg border border-gray-200/20 bg-gray-50 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("committee.title")}</h2>
            </div>

            {/* 基本情報 */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-green-500/10 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-900/80">
                  {t("committee.established")}
                </p>
                <p className="text-lg font-bold text-green-700">
                  {aboutConfig.committee.establishedYear}年
                </p>
              </div>
              <div className="rounded-lg bg-green-500/10 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-900/80">
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
            <p className="mb-6 text-gray-900/90">{aboutConfig.committee.description}</p>

            {/* 組織構成 */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">
                {t("committee.organization")}
              </h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {aboutConfig.committee.departments.map((dept, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200/20 bg-gray-50 p-3 text-center"
                  >
                    <p className="font-semibold text-gray-900">{dept}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SNSリンク */}
          <section className="rounded-lg border border-gray-200/20 bg-gray-50 p-6 shadow-sm md:p-8">
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
                  className="group flex items-center justify-center gap-2 rounded-lg border-2 border-gray-200/30 p-4 font-semibold text-gray-900 transition-all hover:bg-white hover:text-primary"
                >
                  <span>{social.name}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>

          {/* 関連リンク */}
          <section className="rounded-lg border border-gray-200/20 bg-gray-50 p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">
              {t("relatedPages.title")}
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/about/sponsors"
                className="rounded-lg border-2 border-gray-200/30 p-4 text-center font-semibold text-gray-900 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
              >
                {t("relatedPages.sponsors")}
              </Link>
              <Link
                href="/info/contact"
                className="rounded-lg border-2 border-gray-200/30 p-4 text-center font-semibold text-gray-900 transition-all hover:border-gray-200 hover:bg-gray-50 hover:text-gray-900"
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
