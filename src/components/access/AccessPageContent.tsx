import {
  ArrowUpRight,
  Bike,
  Car,
  Clock3,
  ExternalLink,
  Map,
  Navigation,
  Phone,
  Route,
  TriangleAlert,
} from "lucide-react";
import { AccessDirectionsTabs } from "@/components/access/AccessDirectionsTabs";
import { AccessRouteMedia } from "@/components/access/AccessRouteMedia";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import {
  accessConfig,
  accessPageContent,
  type AccessPageContent,
  resolveBusRoutes,
  resolveTrainRoutes,
} from "@/data/access";
import { pageHeroes, type PageHeroData } from "@/data/page-heroes";
import type { Locale } from "@/i18n/routing";

const linkClassName =
  "inline-flex min-h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

interface AccessPageContentProps {
  content?: AccessPageContent;
  locale?: Locale;
}

export function AccessPageView({
  content = accessPageContent,
  locale = "ja",
}: AccessPageContentProps) {
  /**
   * ヒーローは他セクションページと共通の PageHero を使用する。
   * 画像とサブラベルは pageHeroes を継承し、見出し・説明のみロケール別文言で上書きする。
   */
  const hero: PageHeroData = {
    ...pageHeroes.access,
    title: content.introduction.title,
    description: content.introduction.description,
  };

  return (
    <PageSheetLayout hero={hero}>
      <div className="space-y-16 pb-8 sm:space-y-20">
        <section
          aria-labelledby="location-heading"
          className="grid overflow-hidden border-y border-gray-200 bg-white lg:grid-cols-[minmax(0,1.55fr)_minmax(19rem,0.65fr)]"
        >
          <div className="min-h-80 bg-gray-100 lg:min-h-[31rem]">
            <iframe
              src={accessConfig.googleMapsEmbedUrl}
              className="h-full min-h-80 w-full border-0 lg:min-h-[31rem]"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={content.location.mapTitle}
            />
          </div>

          <div className="p-6 sm:p-8 lg:px-10 lg:py-12">
            <h2 id="location-heading" className="text-2xl font-bold text-gray-900">
              {content.location.title}
            </h2>
            <p className="mt-8 text-lg font-bold leading-8 text-gray-900">
              {content.location.venue}
            </p>
            <address className="mt-2 not-italic leading-7 text-gray-700">
              {accessConfig.address}
            </address>
            <a
              href={`tel:${accessConfig.phone.replaceAll("-", "")}`}
              className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700 underline decoration-gray-400 underline-offset-4 hover:text-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
            >
              <Phone aria-hidden="true" className="h-4 w-4" />
              {content.location.phoneLabel} {accessConfig.phone}
            </a>

            {/* 所在地パネルは lg 以上で狭い右カラムになるため、ラベルを折り返さない CTA は1列で並べる */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              <a
                href={accessConfig.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} border border-primary-600 bg-primary-600 text-white hover:bg-white hover:text-primary-600`}
              >
                <Navigation aria-hidden="true" className="h-4 w-4" />
                {content.introduction.mapLinkLabel}
                <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <a
                href={accessConfig.officialAccessUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`${linkClassName} border border-gray-200 bg-white text-gray-900 hover:border-primary-400 hover:bg-primary-50`}
              >
                {content.introduction.officialLinkLabel}
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
              </a>
            </div>

            <p className="mt-10 border-t border-gray-200 pt-5 text-sm leading-6 text-gray-600">
              {content.location.mapCaption}
            </p>
          </div>
        </section>

        <section aria-labelledby="directions-heading">
          <div className="mb-10 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.55fr)] lg:items-end">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary-700">
                {content.directions.label}
              </p>
              <h2
                id="directions-heading"
                className="text-balance text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl"
              >
                {content.directions.title}
              </h2>
            </div>
            <p className="text-pretty leading-7 text-gray-700">{content.directions.description}</p>
          </div>

          {/* 経路の全体像を示す路線図イラスト（装飾）。素材と同じ16:9でトリミングを避ける */}
          <div className="relative mx-auto mb-10 aspect-video w-full max-w-3xl overflow-hidden bg-gray-100">
            <AccessRouteMedia />
          </div>

          <AccessDirectionsTabs
            content={content.directions}
            venue={content.location.venue}
            trainRoutes={resolveTrainRoutes(locale)}
            busRoutes={resolveBusRoutes(locale)}
          />

          <p className="mt-6 flex items-start gap-2 text-sm leading-6 text-gray-600">
            <TriangleAlert aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
            {content.directions.congestionNote}
          </p>
        </section>

        <section
          aria-labelledby="visit-notes-heading"
          className="rounded-3xl bg-gray-900 px-6 py-10 text-white sm:px-8 lg:px-10"
        >
          <div className="mb-8 max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-primary-200">
              {content.visitNotes.label}
            </p>
            <h2 id="visit-notes-heading" className="text-3xl font-bold tracking-tight">
              {content.visitNotes.title}
            </h2>
          </div>

          <ul className="grid gap-4 md:grid-cols-3" role="list">
            {content.visitNotes.items.map((item, index) => {
              const Icon = index === 0 ? Car : index === 1 ? Bike : Clock3;

              return (
                <li key={item.title} className="rounded-2xl border border-white/15 bg-white/5 p-5">
                  <Icon aria-hidden="true" className="h-6 w-6 text-primary-200" />
                  <h3 className="mt-5 font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-gray-200">{item.description}</p>
                </li>
              );
            })}
          </ul>
        </section>

        <section
          aria-labelledby="campus-map-heading"
          className="grid gap-6 rounded-3xl border border-primary-200 bg-primary-50 p-6 sm:p-8 md:grid-cols-[auto_minmax(0,1fr)_auto] md:items-center"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-700 shadow-sm">
            <Map aria-hidden="true" className="h-7 w-7" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary-700">
              {content.campusMap.label}
            </p>
            <h2
              id="campus-map-heading"
              className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl"
            >
              {content.campusMap.title}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-700 sm:text-base">
              {content.campusMap.description}
            </p>
          </div>
          <Route aria-hidden="true" className="hidden h-8 w-8 text-primary-300 md:block" />
        </section>
      </div>
    </PageSheetLayout>
  );
}
