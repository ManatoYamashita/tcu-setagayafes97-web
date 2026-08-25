import type { Metadata } from "next";
import {
  Info,
  AlertTriangle,
  Heart,
  Cloud,
  Package,
  Baby,
  ShieldAlert,
  Check,
  X,
  MapPin,
  Clock,
  Mail,
  HelpCircle,
  Map,
} from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { guideConfig, type PrecautionId } from "@/data/guide";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/metadata";

/**
 * 注意事項のカテゴリ別カラー
 *
 * 配色は表現であり翻訳対象ではないため、データ層（src/data/guide.ts）ではなく
 * ページ側に置く。`satisfies` で PrecautionId の網羅性を強制しているため、
 * 注意事項を増減するとビルドが失敗して追従漏れに気づける。
 * Tailwind の JIT がクラスを検出できるよう、値は必ず完全なリテラルで書くこと。
 */
const precautionStyles = {
  parking: { border: "border-l-blue-400", bg: "bg-blue-50" },
  smoking: { border: "border-l-gray-400", bg: "bg-gray-50" },
  trash: { border: "border-l-green-400", bg: "bg-green-50" },
  pets: { border: "border-l-amber-400", bg: "bg-amber-50" },
  hazardous: { border: "border-l-red-400", bg: "bg-red-50" },
  photos: { border: "border-l-purple-400", bg: "bg-purple-50" },
} satisfies Record<PrecautionId, { border: string; bg: string }>;

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

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/info/guide",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
}

/**
 * 設備の有無を示すステータスカード
 * バリアフリー情報とお子様連れ向け情報で繰り返し使うため、ページ内でまとめている。
 */
function StatusCard({
  label,
  value,
  enabled,
  valueClassName,
}: {
  label: string;
  value: string;
  enabled: boolean;
  valueClassName: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
      <div
        className={`flex h-8 w-8 items-center justify-center rounded-full ${enabled ? "bg-green-100" : "bg-gray-200"}`}
      >
        {enabled ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <X className="h-4 w-4 text-gray-400" />
        )}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-600">{label}</p>
        <p className={`font-bold ${valueClassName}`}>{value}</p>
      </div>
    </div>
  );
}

/**
 * ご来場の方へページ
 */
export default async function GuidePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("guide");
  const tNav = await getTranslations("navigation");

  /**
   * ヒーローは他セクションページと共通の PageHero を使用する。
   * 画像と英字サブラベルは pageHeroes を継承し、見出し・説明のみロケール別文言で上書きする。
   */
  const hero: PageHeroData = {
    ...pageHeroes.guide,
    title: t("title"),
    description: t("subtitle"),
  };

  // id は各 <section> のアンカーと対応する。翻訳キーはリテラルで書き、動的生成しない。
  const navItems = [
    { id: "admission", label: t("nav.admission") },
    { id: "precautions", label: t("nav.precautions") },
    { id: "accessibility", label: t("nav.accessibility") },
    { id: "weather", label: t("nav.weather") },
    { id: "lost-and-found", label: t("nav.lostFound") },
    { id: "families", label: t("nav.families") },
    { id: "emergency", label: t("nav.emergency") },
  ];

  return (
    <PageSheetLayout hero={hero}>
      <div className="mx-auto max-w-4xl space-y-16">
        {/* ページ内ナビゲーション */}
        <nav aria-label={t("nav.label")} className="overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* 入場案内 (Tier 1) */}
        <section id="admission" className="scroll-mt-24">
          <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-100 p-8 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">{t("sections.admission")}</h2>
            </div>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-white/70 p-5 text-center backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold text-gray-500">
                    {t("labels.admissionFee")}
                  </p>
                  <p className="text-4xl font-bold text-primary">{guideConfig.admission.fee}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-5 text-center backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold text-gray-500">
                    {t("labels.openingHours")}
                  </p>
                  <p className="text-2xl font-bold text-gray-900">{guideConfig.admission.time}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.admission.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 来場時の注意事項 (Tier 3) */}
        <section id="precautions" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("sections.precautions")}</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {guideConfig.precautions.map((item) => {
              const style = precautionStyles[item.id];
              return (
                <div
                  key={item.id}
                  className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-5 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span aria-hidden="true" className="text-2xl">
                      {item.icon}
                    </span>
                    <h3 className="font-bold text-gray-900">{item.category}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* バリアフリー情報 (Tier 4) */}
        <section id="accessibility" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("sections.accessibility")}</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <StatusCard
                  label={t("labels.wheelchair")}
                  enabled={guideConfig.accessibility.wheelchairAccessible}
                  value={
                    guideConfig.accessibility.wheelchairAccessible
                      ? t("labels.available")
                      : t("labels.notAvailable")
                  }
                  valueClassName="text-pink-600"
                />
                <StatusCard
                  label={t("labels.multipurposeRestroom")}
                  enabled={guideConfig.accessibility.multipurposeRestrooms}
                  value={
                    guideConfig.accessibility.multipurposeRestrooms
                      ? t("labels.exists")
                      : t("labels.notExists")
                  }
                  valueClassName="text-pink-600"
                />
                <StatusCard
                  label={t("labels.nursingRoom")}
                  enabled={guideConfig.accessibility.nursingRoom}
                  value={
                    guideConfig.accessibility.nursingRoom
                      ? t("labels.exists")
                      : t("labels.notExists")
                  }
                  valueClassName="text-pink-600"
                />
              </div>
              <div>
                <p className="mb-3 font-semibold text-gray-900">{t("labels.elevatorsIn")}</p>
                <div className="flex flex-wrap gap-2">
                  {guideConfig.accessibility.elevators.map((elevator) => (
                    <span
                      key={elevator}
                      className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700"
                    >
                      {elevator}
                    </span>
                  ))}
                </div>
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
          </div>
        </section>

        {/* 天候による影響 (Tier 4) */}
        <section id="weather" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Cloud className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("sections.weather")}</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="inline-block rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white">
                  {guideConfig.weatherInfo.rainPolicy}
                </span>
              </div>
              <ul className="space-y-2">
                {guideConfig.weatherInfo.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 落とし物・忘れ物 (Tier 4) */}
        <section id="lost-and-found" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("sections.lostFound")}</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("labels.lostFoundLocation")}
                    </p>
                    <p className="font-bold text-gray-900">{guideConfig.lostAndFound.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">
                      {t("labels.lostFoundHours")}
                    </p>
                    <p className="font-bold text-gray-900">{guideConfig.lostAndFound.hours}</p>
                  </div>
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
          </div>
        </section>

        {/* お子様連れの方へ (Tier 4) */}
        <section id="families" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Baby className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">{t("sections.families")}</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <StatusCard
                  label={t("labels.nursingRoom")}
                  enabled={guideConfig.forFamilies.nursingRoom}
                  value={
                    guideConfig.forFamilies.nursingRoom ? t("labels.exists") : t("labels.notExists")
                  }
                  valueClassName="text-purple-600"
                />
                <StatusCard
                  label={t("labels.diaperChanging")}
                  enabled={guideConfig.forFamilies.diaperChangingStation}
                  value={
                    guideConfig.forFamilies.diaperChangingStation
                      ? t("labels.exists")
                      : t("labels.notExists")
                  }
                  valueClassName="text-purple-600"
                />
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
          </div>
        </section>

        {/* 緊急時の対応 (Tier 2) */}
        <section id="emergency" className="scroll-mt-24">
          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-lg md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">{t("sections.emergency")}</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-red-100">{t("labels.medicalRoom")}</p>
                  <p className="text-lg font-bold text-white">
                    {guideConfig.emergency.medicalRoom}
                  </p>
                </div>
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-red-100">
                    {t("labels.emergencyContact")}
                  </p>
                  <p className="text-lg font-bold text-white">
                    {guideConfig.emergency.emergencyContact}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.emergency.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 関連ページリンク */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h2 className="mb-6 text-lg font-bold text-gray-900">{t("relatedPages.title")}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/access"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{tNav("access")}</p>
                <p className="text-sm text-gray-500">{t("relatedPages.accessDescription")}</p>
              </div>
            </Link>
            <Link
              href="/info/contact"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{tNav("contact")}</p>
                <p className="text-sm text-gray-500">{t("relatedPages.contactDescription")}</p>
              </div>
            </Link>
            <Link
              href="/info/faq"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{tNav("faq")}</p>
                <p className="text-sm text-gray-500">{t("relatedPages.faqDescription")}</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </PageSheetLayout>
  );
}
