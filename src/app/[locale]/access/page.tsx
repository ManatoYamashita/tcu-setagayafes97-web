import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { AccessPageView } from "@/components/access/AccessPageContent";
import { accessPageContents } from "@/data/access";
import { routing, type Locale } from "@/i18n/routing";
import { createPageMetadata } from "@/lib/metadata";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "access" });

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/access",
    locale: locale as Locale,
    localized: true,
  });
}

export default async function AccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: localeParam } = await params;
  const locale = localeParam as Locale;
  setRequestLocale(locale);

  const content = accessPageContents[locale] ?? accessPageContents.ja;

  return <AccessPageView content={content} locale={locale} />;
}
