import type { Metadata } from "next";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { FactList } from "@/components/ui/FactList";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { privacyPolicyConfig } from "@/data/privacy";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
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

  const { info, thirdParty, cookies, contact, copyright } = privacyPolicyConfig;

  return (
    <PageSheetLayout hero={hero}>
      <div className="mx-auto max-w-3xl space-y-14 sm:space-y-16">
        <PolicySection title={t("sections.basicInfo")}>
          <p>
            {info.organizationName}
            （以下「当委員会」）は、お客様の個人情報保護の重要性について認識し、個人情報の保護に関する法律（個人情報保護法）を遵守すると共に、以下のプライバシーポリシーに従って、個人情報を適切に取り扱います。
          </p>
          <FactList items={[{ label: t("lastUpdated"), value: info.updateDate }]} />
        </PolicySection>

        <PolicySection title={t("sections.purposes")}>
          <p>当委員会は、お客様からお預かりした個人情報を以下の目的で利用いたします。</p>
          <PolicyList items={privacyPolicyConfig.purposes} />
        </PolicySection>

        <PolicySection title={t("sections.collectedInfo")}>
          <p>当サイトでは、以下の情報を収集する場合があります。</p>
          <PolicyList items={privacyPolicyConfig.collectedInfo} />
        </PolicySection>

        <PolicySection title={t("sections.security")}>
          <p>{privacyPolicyConfig.security.description}</p>
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
            src/data/privacy.ts の externalServices へ足す
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
              href={cookies.optOutUrl}
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
            <p>{contact.description}</p>
            <Link href={contact.url} className={textLinkClassName}>
              {t("toContactForm")}
            </Link>
          </div>
        </PolicySection>

        <PolicySection title={t("sections.disclaimer")}>
          <PolicyList items={privacyPolicyConfig.disclaimer} />
        </PolicySection>

        <PolicySection title={t("sections.copyright")}>
          <p>{copyright.description}</p>
          <p className="text-sm text-gray-600">
            Copyright © {copyright.year} {copyright.holder}. All Rights Reserved.
          </p>
        </PolicySection>
      </div>
    </PageSheetLayout>
  );
}
