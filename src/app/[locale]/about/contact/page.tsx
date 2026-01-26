import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactForm } from "./ContactForm";
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
  const t = await getTranslations({ locale, namespace: "contact" });

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
 * お問い合わせページ
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

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
            <Mail className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* お問い合わせ種別説明 */}
        <section className="mx-auto mb-12 max-w-4xl">
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Mail className="h-5 w-5 text-blue-500" />
                <h3 className="font-bold text-gray-900">{t("types.general.title")}</h3>
              </div>
              <p className="text-sm text-gray-700">{t("types.general.description")}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-500" />
                <h3 className="font-bold text-gray-900">{t("types.media.title")}</h3>
              </div>
              <p className="text-sm text-gray-700">{t("types.media.description")}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-orange-500" />
                <h3 className="font-bold text-gray-900">{t("types.lostFound.title")}</h3>
              </div>
              <p className="text-sm text-gray-700">{t("types.lostFound.description")}</p>
            </div>
          </div>
        </section>

        {/* お問い合わせフォーム */}
        <section className="mx-auto mb-12 max-w-4xl rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">{t("form.title")}</h2>
          <ContactForm />
        </section>

        {/* よくある質問へのリンク */}
        <section className="mx-auto max-w-4xl rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-start gap-3">
            <Mail className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="font-semibold text-blue-900">{t("beforeContact.title")}</p>
              <p className="mt-1 text-sm text-blue-700">
                {t("beforeContact.prefix")}{" "}
                <a href="/info/faq" className="underline hover:text-blue-900">
                  {t("beforeContact.faqLink")}
                </a>{" "}
                {t("beforeContact.suffix")}
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
