import type { Metadata } from "next";
import { ExternalLink } from "lucide-react";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { AppImage } from "@/components/ui/AppImage";
import { pageHeroes } from "@/data/page-heroes";
import { sponsorsPageContent } from "@/data/sponsors";
import { getSponsorsList } from "@/lib/informations";
import { createPageMetadata } from "@/lib/metadata";
import { groupSponsorsForList } from "@/lib/sponsor-list";
import { getChromeMessages } from "@/i18n/chrome-messages";
import type { Information } from "@/types/informations";

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
 */
export default async function SponsorsPage() {
  const sponsors = await getSponsorsList();
  const { intro, countSuffix, emptyMessage } = sponsorsPageContent;
  const { detailed, nameOnly } = groupSponsorsForList(sponsors);

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

        {sponsors.length > 0 ? (
          <section aria-labelledby="sponsor-list-heading" className="mt-12 md:mt-16">
            <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-gray-200 pb-3">
              <h2 id="sponsor-list-heading" className="text-2xl font-bold text-gray-900">
                協賛・協力一覧
              </h2>
              <p className="shrink-0 text-sm text-gray-600">
                <span className="font-semibold text-gray-900 tabular-nums">{sponsors.length}</span>
                {countSuffix}
              </p>
            </div>
            {detailed.length > 0 && (
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {detailed.map((sponsor) => (
                  <li key={sponsor.id}>
                    <SponsorCard sponsor={sponsor} />
                  </li>
                ))}
              </ul>
            )}
            {nameOnly.length > 0 && (
              <ul
                className={`grid grid-cols-2 gap-3 lg:grid-cols-4 ${detailed.length > 0 ? "mt-6" : ""}`}
              >
                {nameOnly.map((sponsor) => (
                  <li
                    key={sponsor.id}
                    className="flex min-h-20 items-center justify-center rounded-xl bg-gray-50 px-3 py-4 md:min-h-24"
                  >
                    <h3 className="text-center text-sm font-bold min-w-0 text-balance [overflow-wrap:anywhere] [word-break:auto-phrase] text-gray-900 md:text-base">
                      {sponsor.title}
                    </h3>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <p className="mt-12 rounded-2xl bg-gray-50 p-12 text-center text-gray-600">
            {emptyMessage}
          </p>
        )}
      </div>
    </PageSheetLayout>
  );
}

/**
 * 協賛カード（画像・説明・URL のいずれかを持つ協賛）
 *
 * 画像の無い協賛はロゴ枠の中へ社名を置き、画像ありのカードと高さをそろえる（#332）。
 * 社名しか持たない協賛はここへ来ない（`groupSponsorsForList` がタイル側へ振り分ける）。
 */
function SponsorCard({ sponsor }: { sponsor: Information }) {
  const hasImage = Boolean(sponsor.image?.url);

  const content = (
    <>
      {sponsor.image?.url ? (
        <div className="relative aspect-video w-full overflow-hidden bg-gray-50">
          <AppImage
            src={sponsor.image.url}
            alt={sponsor.title}
            fill
            className="object-contain p-6 transition-transform duration-300 motion-safe:group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
          />
        </div>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center bg-gray-50 p-6">
          <h3 className="text-center text-lg font-bold min-w-0 text-balance [overflow-wrap:anywhere] [word-break:auto-phrase] text-gray-900">
            {sponsor.title}
          </h3>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-2 p-5">
        {/* 画像の無い協賛はロゴ枠に社名を出しているので重ねない */}
        {hasImage && <h3 className="text-lg font-bold text-gray-900">{sponsor.title}</h3>}
        {sponsor.description && (
          <p className="line-clamp-3 text-sm leading-6 text-gray-600">{sponsor.description}</p>
        )}
        {sponsor.url && (
          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-primary-700">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            <span className="hoverable:group-hover:underline">
              {sponsorsPageContent.websiteLabel}
            </span>
            <span className="sr-only">（新しいタブで開きます）</span>
          </span>
        )}
      </div>
    </>
  );

  const cardClassName =
    "flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white";

  if (sponsor.url) {
    return (
      <a
        href={sponsor.url}
        target="_blank"
        rel="noopener noreferrer"
        className={`group ${cardClassName} transition-[border-color,box-shadow] hoverable:hover:border-primary-300 hoverable:hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600`}
      >
        {content}
      </a>
    );
  }

  return <div className={cardClassName}>{content}</div>;
}
