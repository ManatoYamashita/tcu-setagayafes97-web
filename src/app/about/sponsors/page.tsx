import type { Metadata } from "next";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { SpecialThanksList } from "@/components/sponsors/SpecialThanksList";
import { SponsorList } from "@/components/sponsors/SponsorList";
import { pageHeroes } from "@/data/page-heroes";
import { sponsorsPageContent } from "@/data/sponsors";
import { getAdsList, getSpecialThanksList, getSponsorsList } from "@/lib/informations";
import { createPageMetadata } from "@/lib/metadata";
import { getChromeMessages } from "@/i18n/chrome-messages";

/** ページの呼称はカタログ1箇所で決める。フッターのリンク文言と同じ値を使う */
const { sponsors: sponsorsLabel } = getChromeMessages("ja").navigation;

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
 * 協賛の下に広告掲載・Special Thanks を並べる（#476）。0件の節は出さない。
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

        {ads.length > 0 && (
          <ListSection
            id="ad-list-heading"
            heading={sectionHeadings.ad}
            count={ads.length}
            countSuffix={countSuffix}
          >
            <SponsorList sponsors={ads} />
          </ListSection>
        )}

        {specialThanks.length > 0 && (
          <ListSection id="special-thanks-heading" heading={sectionHeadings.thanks}>
            <SpecialThanksList people={specialThanks} />
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
 * 一覧の節（見出し＋件数）。件数は企業・団体を数える節にだけ出す
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
