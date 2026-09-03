import Link from "next/link";

import { festivalIntroContents, type FestivalIntroContent } from "@/data/about";
import { siteConfig } from "@/data/site";
import { localizeNavHref } from "@/i18n/localized-pathnames";
import { routing, type Locale } from "@/i18n/routing";

/**
 * 「世田谷祭とは」セクション — Aboutページの AboutHero と ChairpersonSection の間
 *
 * 第97回サイトには「世田谷祭とは何か」を説明するページが無く、この需要は
 * `about.setagayafes.org`（第95回時代の実行委員会サイト）と第96回サイトだけが
 * 受け止めていた。両者を検索結果から除外するにあたり、受け皿を先に用意する。
 *
 * サーバーコンポーネントとして書く。同ページの AboutHero / ChairpersonSection は
 * GSAP のクライアントコンポーネントだが、ここへ演出を足すと SplitText の行分割と
 * white-space の相互作用（ChairpersonSection の冒頭コメント）を再現することになり、
 * 本文をHTMLへ確実に出すという目的に対して割に合わない。
 *
 * 背景を bg-gray-50 にしているのは継ぎ目を消すため。AboutHero の上下マスクが
 * bg-gray-50、ChairpersonSection のルートが from-gray-50 の縦グラデーションなので、
 * 同色を挟むと境界が見えなくなる。
 */
export function FestivalIntroSection({ locale }: { locale: Locale }) {
  // `as const satisfies` はリテラル型へ絞るため、ここで注釈を付けて型を広げる。
  // そうしないと ja に無い任意プロパティ（festivalName 等）へアクセスできない。
  const content: FestivalIntroContent = festivalIntroContents[locale] ?? festivalIntroContents.ja;

  const venueName = content.venueName ?? siteConfig.venue;
  const venueAddress = content.venueAddress ?? siteConfig.address;

  const facts = [
    { label: content.factLabels.name, value: content.festivalName ?? siteConfig.name },
    { label: content.factLabels.date, value: formatFestivalDates(locale) },
    { label: content.factLabels.venue, value: `${venueName}\n${venueAddress}` },
    { label: content.factLabels.admission, value: content.admissionValue },
    {
      label: content.factLabels.organizer,
      value: content.organizerName ?? siteConfig.organization.currentName,
    },
  ];

  return (
    <section className="bg-gray-50 py-16 lg:py-24" aria-labelledby="festival-intro-heading">
      <div className="mx-auto max-w-3xl px-6 sm:px-8 lg:px-12">
        <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-700">
          {content.label}
        </p>

        <h2
          id="festival-intro-heading"
          className="mt-4 font-heading text-2xl font-bold text-gray-900 lg:text-3xl"
        >
          {content.heading}
        </h2>

        {/* 定義文。検索結果のスニペットへ抜かれることを想定して先頭に単独で置く */}
        <p className="mt-6 text-base font-bold leading-8 text-gray-900 lg:text-lg">
          {content.lead}
        </p>

        <div className="mt-5 space-y-4">
          {content.paragraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-gray-900/80 sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        <h3 className="mt-12 text-sm font-bold text-primary-700 sm:text-base">
          {content.factsHeading}
        </h3>
        <div className="mt-4 border-l-[3px] border-primary-600 pl-5 sm:pl-8">
          <dl className="space-y-3">
            {facts.map((fact) => (
              <div key={fact.label} className="sm:flex sm:gap-8">
                <dt className="w-32 shrink-0 break-keep text-sm font-bold leading-6 text-primary-700 sm:w-40 sm:text-base">
                  {fact.label}
                </dt>
                <dd className="whitespace-pre-line text-sm leading-7 text-gray-900 sm:text-base">
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <h3 className="mt-12 font-heading text-xl font-bold text-gray-900 lg:text-2xl">
          {content.committeeHeading}
        </h3>
        <div className="mt-5 space-y-4">
          {content.committeeParagraphs.map((paragraph) => (
            <p key={paragraph} className="text-sm leading-7 text-gray-900/80 sm:text-base">
              {paragraph}
            </p>
          ))}
        </div>

        <p className="mt-8 text-sm font-bold text-primary-700 sm:text-base">
          {content.departmentsLabel}
        </p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {content.departments.map((department) => (
            <li
              key={department}
              className="rounded-full bg-white px-3 py-1 text-xs text-gray-900/80 shadow-sm sm:text-sm"
            >
              {department}
            </li>
          ))}
        </ul>

        <nav className="mt-12" aria-label={content.linksHeading}>
          <p className="text-sm font-bold text-primary-700 sm:text-base">{content.linksHeading}</p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {content.links.map((link) => {
              const { href, hrefLang } = localizeNavHref(link.href, locale);
              return (
                <li key={link.href}>
                  <Link
                    href={href}
                    hrefLang={hrefLang}
                    className="text-sm text-primary underline underline-offset-4 hover:opacity-80 sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </section>
  );
}

/**
 * 会期の表示文字列を `siteConfig` から組み立てる
 *
 * 開催日を文言データ側へ書くと、`siteConfig.dates` と二重管理になり、
 * 4ロケール分だけ更新漏れの箇所が増える。ロケールごとの書式は Intl に任せる。
 */
function formatFestivalDates(locale: Locale): string {
  const start = new Date(`${siteConfig.dates.day1}T00:00:00+09:00`);
  const end = new Date(`${siteConfig.dates.day2}T00:00:00+09:00`);
  const sameYear = siteConfig.dates.day1.slice(0, 4) === siteConfig.dates.day2.slice(0, 4);

  const base = {
    month: "long",
    day: "numeric",
    weekday: "short",
    timeZone: "Asia/Tokyo",
  } as const;
  const withYear = new Intl.DateTimeFormat(intlLocale(locale), { year: "numeric", ...base });
  // 同じ年をもう一度書かない。「2026年10月31日(土) - 2026年11月1日(日)」は冗長。
  const endFormatter = sameYear ? new Intl.DateTimeFormat(intlLocale(locale), base) : withYear;

  return `${withYear.format(start)} - ${endFormatter.format(end)} / ${siteConfig.openTime}-${siteConfig.closeTime}`;
}

const INTL_LOCALES = {
  ja: "ja-JP",
  en: "en-US",
  zh: "zh-CN",
  ko: "ko-KR",
} as const satisfies Record<Locale, string>;

function intlLocale(locale: Locale): string {
  return INTL_LOCALES[locale] ?? INTL_LOCALES[routing.defaultLocale];
}
