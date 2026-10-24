import type { Metadata } from "next";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { AdBannerList } from "@/components/ads/AdBannerList";
import { SponsorList } from "@/components/sponsors/SponsorList";
import { pageHeroes } from "@/data/page-heroes";
import { sponsorsPageContent } from "@/data/sponsors";
import { getAdsList, getSpecialThanksList, getSponsorsList } from "@/lib/informations";
import { createPageMetadata } from "@/lib/metadata";
import { getChromeMessages } from "@/i18n/chrome-messages";

/** ページの呼称はカタログ1箇所で決める。フッターのリンク文言と同じ値を使う */
const { navigation, ads: adMessages } = getChromeMessages("ja");
const sponsorsLabel = navigation.sponsors;

/**
 * メタデータ
 */
export const metadata: Metadata = createPageMetadata({
  title: sponsorsLabel,
  description:
    "第97回東京都市大学世田谷祭を支援してくださる協賛企業・団体の皆様をご紹介します。心より感謝申し上げます。",
  pathname: "/about/sponsors",
});

/**
 * ISR設定: 10分ごとに再検証
 */
export const revalidate = 600;

/**
 * 協賛・協力の一覧ページ
 *
 * トップと /about の協賛バー（SponsorBanner）の CTA から遷移してくる。
 * 見出しはバーと同じ「協賛・協力」にそろえる。
 * 節の並びは 広告掲載 → 協賛企業 → スペシャルサンクス（#485）。0件の節は出さない。
 * 広告掲載は入稿画像の大きさのバナー（フッター上の広告欄と同じ `AdBannerList`）、
 * スペシャルサンクスは協賛企業と同じタイル（`SponsorList`）で出す。
 * 3つの取得は同じリクエストを共有する（`src/lib/informations.ts`）。
 */
export default async function SponsorsPage() {
  const [sponsors, ads, specialThanks] = await Promise.all([
    getSponsorsList(),
    getAdsList(),
    getSpecialThanksList(),
  ]);
  const { intro, countSuffix, sectionHeadings, emptyMessage } = sponsorsPageContent;
  const isEmpty = sponsors.length === 0 && ads.length === 0 && specialThanks.length === 0;

  return (
    <PageSheetLayout hero={pageHeroes.sponsors} heroSize="compact">
      <div className="mx-auto max-w-6xl py-4 md:py-8">
        {/* 謝辞 */}
        <div className="mx-auto max-w-3xl space-y-3 text-center leading-8 text-gray-700 md:text-lg md:leading-9">
          {intro.map((paragraph) => (
            <p key={paragraph} className="text-pretty [word-break:auto-phrase]">
              {paragraph}
            </p>
          ))}
        </div>

        {ads.length > 0 && (
          <ListSection id="ad-list-heading" heading={sectionHeadings.ad}>
            <AdBannerList ads={ads} newTabLabel={adMessages.newTab} />
          </ListSection>
        )}

        {sponsors.length > 0 && (
          <ListSection
            id="sponsor-list-heading"
            heading={sectionHeadings.sponsor}
            count={sponsors.length}
            countSuffix={countSuffix}
          >
            <SponsorList sponsors={sponsors} />
          </ListSection>
        )}

        {specialThanks.length > 0 && (
          <ListSection
            id="special-thanks-heading"
            heading={sectionHeadings.thanks}
            count={specialThanks.length}
            countSuffix={countSuffix}
          >
            <SponsorList sponsors={specialThanks} />
          </ListSection>
        )}

        {isEmpty && (
          <p className="mt-12 rounded-2xl bg-gray-50 p-12 text-center text-gray-600">
            {emptyMessage}
          </p>
        )}
      </div>
    </PageSheetLayout>
  );
}

/**
 * 一覧の節（見出し＋件数）。件数はタイルで並べる節（協賛企業・スペシャルサンクス）にだけ出す
 */
function ListSection({
  id,
  heading,
  count,
  countSuffix,
  children,
}: {
  id: string;
  heading: string;
  count?: number;
  countSuffix?: string;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="mt-12 md:mt-16">
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-gray-200 pb-3">
        <h2 id={id} className="text-2xl font-bold text-gray-900">
          {heading}
        </h2>
        {count !== undefined && (
          <p className="shrink-0 text-sm text-gray-600">
            <span className="font-semibold text-gray-900 tabular-nums">{count}</span>
            {countSuffix}
          </p>
        )}
      </div>
      {children}
    </section>
  );
}
