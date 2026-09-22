import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { ContactForm, type ContactTypeOption } from "./ContactForm";
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
  const t = await getTranslations({ locale, namespace: "contact" });

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/info/contact",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
}

/**
 * お問い合わせページ
 */
export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");

  /**
   * ヒーローは他セクションページと共通の PageHero を使用する。
   * 画像と英字サブラベルは pageHeroes を継承し、見出し・説明のみロケール別文言で上書きする。
   */
  const hero: PageHeroData = {
    ...pageHeroes.contact,
    title: t("title"),
    description: t("subtitle"),
  };

  /**
   * 種別の選択肢
   *
   * 以前はこの3件を「説明カード」として描いたうえで、フォーム側の `<select>` に
   * 同じ3件をもう一度並べていた。来場者は同じ選択を2度読むことになり、
   * カードのほうは押しても何も起きない飾りだった。
   *
   * 現在はカードが選択そのものを担う。翻訳はサーバー側で解決してから渡す
   * （`ContactForm` はクライアントコンポーネントであり、next-intl のサーバー API を呼べない）。
   * 並び順は `contactTypes` と揃えること。
   */
  const typeOptions: ContactTypeOption[] = [
    {
      value: "general",
      title: t("types.general.title"),
      description: t("types.general.description"),
    },
    {
      value: "media",
      title: t("types.media.title"),
      description: t("types.media.description"),
    },
    {
      value: "lost-and-found",
      title: t("types.lostFound.title"),
      description: t("types.lostFound.description"),
    },
  ];

  return (
    <PageSheetLayout hero={hero}>
      <div className="mx-auto max-w-4xl space-y-10 pb-6">
        {/*
          FAQ への導線。文言が「お問い合わせの前に」と言っている以上、
          フォームより前に置かないと意味が通らない（以前は最下部にあった）。
          ここは本題ではないので、囲みを持たせず1行の地の文として置く。
        */}
        <p className="text-sm leading-relaxed text-gray-600">
          {t("beforeContact.prefix")}{" "}
          <Link
            href="/info/faq"
            className="font-semibold text-primary-600 underline underline-offset-4 hoverable:hover:no-underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            {t("beforeContact.faqLink")}
          </Link>{" "}
          {t("beforeContact.suffix")}
        </p>

        <ContactForm typeOptions={typeOptions} />
      </div>
    </PageSheetLayout>
  );
}
