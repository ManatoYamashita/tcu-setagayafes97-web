import type { Metadata } from "next";
import { Info, AlertTriangle, Heart, Cloud, Package, Baby, Plus } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { guideConfig } from "@/data/guide";
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
  const t = await getTranslations({ locale, namespace: "guide" });

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
 * ご来場の方へページ
 */
export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guide");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* 言語切替（多言語対応ページのみ） */}
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">{t("title")}</h1>
          <p className="text-center text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 入場案内 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.admission")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">{t("labels.admissionFee")}</p>
                  <p className="text-xl font-bold text-primary">{guideConfig.admission.fee}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">{t("labels.openingHours")}</p>
                  <p className="text-xl font-bold text-gray-900">{guideConfig.admission.time}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {guideConfig.admission.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 来場時の注意事項 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.precautions")}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {guideConfig.precautions.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-bold text-gray-900">{item.category}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* バリアフリー情報 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.accessibility")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">
                    {t("labels.wheelchair")}
                  </p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.wheelchairAccessible
                      ? t("labels.available")
                      : t("labels.notAvailable")}
                  </p>
                </div>
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">
                    {t("labels.multipurposeRestroom")}
                  </p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.multipurposeRestrooms
                      ? t("labels.exists")
                      : t("labels.notExists")}
                  </p>
                </div>
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">
                    {t("labels.nursingRoom")}
                  </p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.nursingRoom
                      ? t("labels.exists")
                      : t("labels.notExists")}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold text-gray-900">{t("labels.elevatorsIn")}:</p>
                <p className="text-gray-700">{guideConfig.accessibility.elevators.join("、")}</p>
              </div>
              <ul className="space-y-2">
                {guideConfig.accessibility.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 天候による影響 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Cloud className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.weather")}</h2>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-blue-600">
                {guideConfig.weatherInfo.rainPolicy}
              </p>
              <ul className="space-y-2">
                {guideConfig.weatherInfo.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 落とし物・忘れ物 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Package className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.lostFound")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {t("labels.lostFoundLocation")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {guideConfig.lostAndFound.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    {t("labels.lostFoundHours")}
                  </p>
                  <p className="text-lg font-bold text-gray-900">
                    {guideConfig.lostAndFound.hours}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.lostAndFound.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* お子様連れの方へ */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Baby className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.families")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-600">
                    {t("labels.nursingRoom")}
                  </p>
                  <p className="font-bold text-purple-600">
                    {guideConfig.forFamilies.nursingRoom
                      ? t("labels.exists")
                      : t("labels.notExists")}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-600">
                    {t("labels.diaperChanging")}
                  </p>
                  <p className="font-bold text-purple-600">
                    {guideConfig.forFamilies.diaperChangingStation
                      ? t("labels.exists")
                      : t("labels.notExists")}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.forFamilies.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 緊急時の対応 */}
          <section className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Plus className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.emergency")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-600">{t("labels.medicalRoom")}</p>
                  <p className="text-lg font-bold text-red-600">
                    {guideConfig.emergency.medicalRoom}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">
                    {t("labels.emergencyContact")}
                  </p>
                  <p className="text-lg font-bold text-red-600">
                    {guideConfig.emergency.emergencyContact}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.emergency.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
