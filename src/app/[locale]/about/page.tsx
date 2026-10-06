import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { AboutHero } from "@/components/about/AboutHero";
import { FestivalIntroSection } from "@/components/about/FestivalIntroSection";
import { ChairpersonSection } from "@/components/about/ChairpersonSection";
import { EventOverviewTable } from "@/components/about/EventOverviewTable";
import { type Locale } from "@/i18n/routing";
import { aboutPageContents } from "@/data/about";
import { createPageMetadata } from "@/lib/metadata";
import { createAboutStructuredData, serializeJsonLd } from "@/lib/structured-data";

/**
 * 再検証間隔（Webhook 障害時のフォールバック）
 *
 * 共通 RootLayout の Footer 直前に SponsorBanner が描画され、microCMS の
 * `informations` を読む。主系は Webhook によるオンデマンド再検証
 * （`src/app/api/revalidate/route.ts`）で、こちらは通知を取りこぼしたときの保険である。
 *
 * SponsorBanner のデータ取得にも `revalidate = 600` を設定しているが、ページ側も
 * 同じ間隔を保ち、Webhook の通知漏れ後にこのルートが更新されるようにする。
 */
export const revalidate = 600;

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

  return createPageMetadata({
    title: t("meta.title"),
    description: t("meta.description"),
    pathname: "/about",
    locale: locale as "ja" | "en" | "zh" | "ko",
    localized: true,
  });
}

/**
 * 委員会について（About）ページ
 */
export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const content = aboutPageContents[locale as Locale];

  /*
   * スキップリンク（Header）の遷移先。このページは AboutHero が PageHero ではないため
   * PageSheetLayout を使っておらず、main を自前で出す必要がある。
   */
  return (
    <main
      id="content"
      tabIndex={-1}
      className="min-h-screen bg-secondary focus-visible:outline-none"
    >
      {/*
        Organization と Event はトップページと同じ @id を使う。Google は同一 @id の
        ノードを結合するため、重複ではなくエンティティの補強になる。
      */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: serializeJsonLd(createAboutStructuredData(locale as Locale)),
        }}
      />

      {/*
        GSAP を使う AboutHero と ChairpersonSection は、locale を含む key で言語ごとに作り直す。
        GSAP（SplitText / ScrollTrigger）がマウント時に一度だけ DOM を組み替えるため、
        言語切替で同じインスタンスを使い回すと翻訳前の分割済み DOM が残る。
        key は兄弟の間で一意でなければならないので、セクション名を接頭辞に付ける（#417）。
      */}
      <AboutHero key={`hero-${locale}`} content={content.hero} />

      {/* 世田谷祭とは */}
      {/*
        AboutHero と ChairpersonSection の間に置く。AboutHero の上下マスクが
        bg-gray-50、ChairpersonSection のルートが from-gray-50 の縦グラデーション
        なので、同色のセクションを挟むと継ぎ目が見えない。
      */}
      <FestivalIntroSection locale={locale as Locale} />

      {/* 委員長挨拶 */}
      {/*
        シートの外側に置くこと。ChairpersonSection は overflow-hidden と
        絶対配置の装飾要素を持つため、白シートの内側に入れると rounded-t-3xl の
        角が欠ける。
      */}
      <ChairpersonSection
        key={`chairperson-${locale}`}
        theme={content.theme}
        message={content.message}
      />

      {/* 開催概要 */}
      {/*
        他セクションページの PageSheetLayout と同じ白シート表現。
        AboutHero は PageHero ではなく独自のヒーローのため、シート部分のみを
        インラインで再現している。
      */}
      <div className="relative z-10 -mt-6 mx-4 rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
        <EventOverviewTable content={content.overview} />
      </div>
    </main>
  );
}
