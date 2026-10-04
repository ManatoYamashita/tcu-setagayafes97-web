import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { FactList } from "@/components/ui/FactList";
import { guideFlags, resolveGuide } from "@/data/guide";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
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
 * 補足事項の箇条書き
 */
function GuideNotes({ notes }: { notes: readonly string[] }) {
  return (
    <ul className="mt-6 list-disc space-y-1.5 pl-5 text-sm leading-7 text-gray-700 marker:text-gray-400 sm:text-base">
      {notes.map((note) => (
        <li key={note}>{note}</li>
      ))}
    </ul>
  );
}

/**
 * 見出し付きの節
 * scroll-mt はページ内ナビから飛んだ際に固定ヘッダーの下へ見出しを隠さないためのもの。
 */
function GuideSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-heading`} className="scroll-mt-24">
      <h2 id={`${id}-heading`} className="mb-6 text-2xl font-bold text-gray-900">
        {title}
      </h2>
      {children}
    </section>
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

  const guide = resolveGuide(locale as Locale);
  const { accessibility, forFamilies } = guideFlags;
  const existence = (value: boolean) => (value ? t("labels.exists") : t("labels.notExists"));

  const relatedPages = [
    { href: "/access", title: tNav("access"), description: t("relatedPages.accessDescription") },
    {
      href: "/info/contact",
      title: tNav("contact"),
      description: t("relatedPages.contactDescription"),
    },
    { href: "/info/faq", title: tNav("faq"), description: t("relatedPages.faqDescription") },
  ] as const;

  return (
    <PageSheetLayout hero={hero}>
      <div className="mx-auto max-w-3xl space-y-14 sm:space-y-16">
        {/* ページ内ナビゲーション。横スクロールにすると後半の項目が画面外へ隠れるため折り返す */}
        <nav aria-label={t("nav.label")}>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="inline-flex min-h-11 items-center text-sm font-semibold text-gray-700 underline decoration-gray-400 underline-offset-4 hoverable:hover:text-primary-700 hoverable:hover:decoration-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <GuideSection id="admission" title={t("sections.admission")}>
          <FactList
            items={[
              { label: t("labels.admissionFee"), value: guide.admission.fee },
              { label: t("labels.openingHours"), value: guide.admission.time },
            ]}
          />
          <GuideNotes notes={guide.admission.notes} />
        </GuideSection>

        <GuideSection id="precautions" title={t("sections.precautions")}>
          <FactList
            items={guide.precautions.map((item) => ({
              label: item.category,
              value: item.content,
            }))}
          />
        </GuideSection>

        <GuideSection id="accessibility" title={t("sections.accessibility")}>
          <FactList
            items={[
              {
                label: t("labels.wheelchair"),
                value: accessibility.wheelchairAccessible
                  ? t("labels.available")
                  : t("labels.notAvailable"),
              },
              {
                label: t("labels.multipurposeRestroom"),
                value: existence(accessibility.multipurposeRestrooms),
              },
              { label: t("labels.nursingRoom"), value: existence(accessibility.nursingRoom) },
              { label: t("labels.elevatorsIn"), value: guide.accessibility.elevators },
            ]}
          />
          <GuideNotes notes={guide.accessibility.notes} />
        </GuideSection>

        <GuideSection id="weather" title={t("sections.weather")}>
          <p className="text-lg font-bold text-gray-900">{guide.weatherInfo.rainPolicy}</p>
          <GuideNotes notes={guide.weatherInfo.notes} />
        </GuideSection>

        <GuideSection id="lost-and-found" title={t("sections.lostFound")}>
          <FactList
            items={[
              { label: t("labels.lostFoundLocation"), value: guide.lostAndFound.location },
              { label: t("labels.lostFoundHours"), value: guide.lostAndFound.hours },
            ]}
          />
          <GuideNotes notes={guide.lostAndFound.notes} />
        </GuideSection>

        <GuideSection id="families" title={t("sections.families")}>
          <FactList
            items={[
              { label: t("labels.nursingRoom"), value: existence(forFamilies.nursingRoom) },
              {
                label: t("labels.diaperChanging"),
                value: existence(forFamilies.diaperChangingStation),
              },
            ]}
          />
          <GuideNotes notes={guide.forFamilies.notes} />
        </GuideSection>

        <GuideSection id="emergency" title={t("sections.emergency")}>
          <FactList
            tone="alert"
            items={[
              { label: t("labels.medicalRoom"), value: guide.emergency.medicalRoom },
              {
                label: t("labels.emergencyContact"),
                value: guide.emergency.emergencyContact,
              },
            ]}
          />
          <GuideNotes notes={guide.emergency.notes} />
        </GuideSection>

        {/* 関連ページリンク */}
        <nav aria-labelledby="related-pages-heading" className="border-t border-gray-200 pt-10">
          <h2 id="related-pages-heading" className="mb-4 text-lg font-bold text-gray-900">
            {t("relatedPages.title")}
          </h2>
          <ul className="grid gap-4 sm:grid-cols-3">
            {relatedPages.map((page) => (
              <li key={page.href}>
                <Link
                  href={page.href}
                  className="inline-flex min-h-11 items-center font-semibold text-gray-900 underline decoration-gray-400 underline-offset-4 hoverable:hover:text-primary-700 hoverable:hover:decoration-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
                >
                  {page.title}
                </Link>
                <p className="text-sm leading-6 text-gray-600">{page.description}</p>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </PageSheetLayout>
  );
}
