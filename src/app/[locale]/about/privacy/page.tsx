import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { FactList } from "@/components/ui/FactList";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { privacyPolicyShared, resolvePrivacyPolicy } from "@/data/privacy";
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
  const t = await getTranslations({ locale, namespace: "privacy" });

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/about/privacy",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
}

/** 本文リンクの共通スタイル。min-h-11 でタップ領域を 44px 確保する */
const textLinkClassName =
  "inline-flex min-h-11 items-center font-semibold text-gray-900 underline decoration-gray-400 underline-offset-4 hoverable:hover:text-primary-700 hoverable:hover:decoration-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

/**
 * 見出し付きの節
 */
function PolicySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="mb-5 text-2xl font-bold text-gray-900">{title}</h2>
      <div className="space-y-5 leading-8 text-gray-700">{children}</div>
    </section>
  );
}

/**
 * 箇条書き
 */
function PolicyList({ items }: { items: readonly string[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5 marker:text-gray-400">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

/** `Intl` へ渡す BCP 47 タグ。ロケールごとの日付表記に使う */
const INTL_LOCALES = {
  ja: "ja-JP",
  en: "en-US",
  zh: "zh-CN",
  ko: "ko-KR",
} as const satisfies Record<Locale, string>;

/** ISO 形式の日付を、ロケール別の表記へ整形する（UTC 基準でタイムゾーンによるずれを防ぐ） */
function formatPolicyDate(isoDate: string, locale: Locale): string {
  return new Intl.DateTimeFormat(INTL_LOCALES[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(isoDate));
}

/**
 * プライバシーポリシーページ
 */
export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("privacy");

  /**
   * ヒーローは他セクションページと共通の PageHero を使用する。
   * 画像と英字サブラベルは pageHeroes を継承し、見出し・説明のみロケール別文言で上書きする。
   */
  const hero: PageHeroData = {
    ...pageHeroes.privacy,
    title: t("title"),
    description: t("subtitle"),
  };

  const policy = resolvePrivacyPolicy(locale as Locale);
  const { thirdParty, cookies } = policy;

  return (
    <PageSheetLayout hero={hero}>
      <div className="mx-auto max-w-3xl space-y-14 sm:space-y-16">
        <PolicySection title={t("sections.basicInfo")}>
          <p>{policy.intro.replace("{organization}", policy.organizationName)}</p>
          <FactList
            items={[
              {
                label: t("lastUpdated"),
                value: formatPolicyDate(privacyPolicyShared.updateDate, locale as Locale),
              },
            ]}
          />
        </PolicySection>

        <PolicySection title={t("sections.purposes")}>
          <p>{policy.purposesLead}</p>
          <PolicyList items={policy.purposes} />
        </PolicySection>

        <PolicySection title={t("sections.collectedInfo")}>
          <p>{policy.collectedInfoLead}</p>
          <PolicyList items={policy.collectedInfo} />
        </PolicySection>

        <PolicySection title={t("sections.security")}>
          <p>{policy.securityDescription}</p>
        </PolicySection>

        <PolicySection title={t("sections.thirdParty")}>
          <p className="font-bold text-gray-900">{thirdParty.policy}</p>
          <div>
            <p>{t("except")}</p>
            <PolicyList items={thirdParty.exceptions} />
          </div>

          {/*
            外部サービスへ実際に送信しているもの。
            「原則として提供しない」の例外を具体的に書く欄で、送信先が増えたら
            src/data/privacy.ts の externalServices へ足す（4言語すべて）
          */}
          {thirdParty.externalServices.map((service) => (
            <div key={service.provider} className="border-l-[3px] border-primary-600 pl-5 sm:pl-8">
              <p className="font-bold text-gray-900">{service.purpose}</p>
              <p className="text-sm text-gray-600">{service.provider}</p>
              <p className="mt-1">{service.sent}</p>
            </div>
          ))}
        </PolicySection>

        <PolicySection title={t("sections.cookies")}>
          <p>{cookies.description}</p>
          <FactList items={[{ label: t("usedTools"), value: cookies.analytics }]} />
          <div>
            <p>{cookies.optOut}</p>
            <a
              href={privacyPolicyShared.optOutUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={textLinkClassName}
            >
              {t("analyticsOptOut")}
              <span className="sr-only">{t("opensInNewTab")}</span>
            </a>
          </div>
        </PolicySection>

        <PolicySection title={t("sections.contactWindow")}>
          <div>
            <p>{policy.contactDescription}</p>
            <Link href={privacyPolicyShared.contactUrl} className={textLinkClassName}>
              {t("toContactForm")}
            </Link>
          </div>
        </PolicySection>

        <PolicySection title={t("sections.disclaimer")}>
          <PolicyList items={policy.disclaimer} />
        </PolicySection>

        <PolicySection title={t("sections.copyright")}>
          <p>{policy.copyrightDescription}</p>
          <p className="text-sm text-gray-600">
            Copyright © {privacyPolicyShared.copyrightYear} {policy.copyrightHolder}. All Rights
            Reserved.
          </p>
        </PolicySection>
      </div>
    </PageSheetLayout>
  );
}
