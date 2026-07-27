import {
  Bike,
  Bus,
  Car,
  Clock3,
  Map,
  MapPin,
  Phone,
  Route,
  Train,
  TriangleAlert,
} from "lucide-react";
import { AccessHero } from "@/components/access/AccessHero";
import { accessConfig, accessPageContent, type AccessPageContent } from "@/data/access";

interface AccessPageContentProps {
  content?: AccessPageContent;
}

export function AccessPageView({ content = accessPageContent }: AccessPageContentProps) {
  const trainInfo = accessConfig.publicTransport.find((item) => item.type === "電車");
  const busInfo = accessConfig.publicTransport.find((item) => item.type === "バス");

  return (
    <div className="min-h-screen bg-secondary">
      <AccessHero content={content} />
      <div className="relative z-10 -mt-6 mx-4 rounded-t-3xl bg-white px-5 py-12 shadow-sm sm:mx-8 sm:px-8 sm:py-16 lg:mx-auto lg:max-w-[90rem] lg:px-12 lg:py-20">
        <div className="mx-auto max-w-6xl space-y-20 pb-8 sm:space-y-24">
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
                className="mt-6 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-gray-700 underline decoration-gray-300 underline-offset-4 hover:text-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
              >
                <Phone aria-hidden="true" className="h-4 w-4" />
                {content.location.phoneLabel} {accessConfig.phone}
              </a>
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
              <p className="text-pretty leading-7 text-gray-700">
                {content.directions.description}
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.35fr)]">
              {trainInfo && (
                <article className="relative overflow-hidden rounded-3xl bg-primary-700 p-6 text-white shadow-sm sm:p-8">
                  <div
                    aria-hidden="true"
                    className="absolute -right-16 -top-16 h-48 w-48 rounded-full border-[2rem] border-white/10"
                  />
                  <div className="relative">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-primary-700">
                        <Train aria-hidden="true" className="h-6 w-6" />
                      </div>
                      <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-bold tracking-wide">
                        {content.directions.recommended}
                      </span>
                    </div>

                    <h3 className="mt-10 text-2xl font-bold">{content.directions.trainTitle}</h3>
                    <ol className="mt-7 space-y-5">
                      {trainInfo.routes.map((route) => (
                        <li key={route.station} className="rounded-2xl bg-white p-5 text-gray-900">
                          <p className="text-sm font-semibold text-primary-700">{route.line}</p>
                          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
                            <p className="text-2xl font-bold">{route.station}</p>
                            <p className="flex items-center gap-2 text-sm font-bold text-gray-700">
                              <Clock3 aria-hidden="true" className="h-4 w-4 text-primary-700" />
                              {content.directions.walkTimeLabel} {route.walkTime}
                              {content.directions.minuteUnit}
                            </p>
                          </div>
                          <div className="my-4 flex items-center gap-3" aria-hidden="true">
                            <span className="h-2 w-2 rounded-full bg-primary-500" />
                            <span className="h-px flex-1 border-t border-dashed border-primary-300" />
                            <MapPin className="h-4 w-4 text-primary-700" />
                          </div>
                          <p className="text-sm leading-6 text-gray-600">{route.description}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                </article>
              )}

              {busInfo && (
                <article className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-800">
                      <Bus aria-hidden="true" className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500">
                        Alternative route
                      </p>
                      <h3 className="mt-1 text-2xl font-bold text-gray-900">
                        {content.directions.busTitle}
                      </h3>
                    </div>
                  </div>

                  <ol className="mt-7 divide-y divide-gray-200">
                    {busInfo.routes.map((route) => (
                      <li
                        key={`${route.from}-${route.stop}`}
                        className="grid gap-4 py-6 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                      >
                        <div>
                          <p className="text-sm font-bold text-amber-800">{route.line}</p>
                          <p className="mt-2 text-lg font-bold text-gray-900">
                            {route.from}
                            <span aria-hidden="true" className="mx-2 text-gray-400">
                              →
                            </span>
                            <span className="sr-only">から</span>
                            {route.stop}
                          </p>
                          <p className="mt-2 text-sm leading-6 text-gray-600">
                            {route.description}
                          </p>
                        </div>
                        <dl className="flex gap-2 sm:flex-col">
                          <div className="rounded-full bg-gray-100 px-3 py-2 text-center text-xs font-bold text-gray-700">
                            <dt className="sr-only">{content.directions.rideTimeLabel}</dt>
                            <dd>
                              {content.directions.rideTimeLabel} {route.rideTime}
                              {content.directions.minuteUnit}
                            </dd>
                          </div>
                          <div className="rounded-full bg-amber-100 px-3 py-2 text-center text-xs font-bold text-amber-900">
                            <dt className="sr-only">{content.directions.walkTimeLabel}</dt>
                            <dd>
                              {content.directions.walkTimeLabel} {route.walkTime}
                              {content.directions.minuteUnit}
                            </dd>
                          </div>
                        </dl>
                      </li>
                    ))}
                  </ol>
                </article>
              )}
            </div>

            <p className="mt-5 flex items-start gap-2 text-sm leading-6 text-gray-600">
              <TriangleAlert
                aria-hidden="true"
                className="mt-0.5 h-4 w-4 shrink-0 text-amber-700"
              />
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
                  <li
                    key={item.title}
                    className="rounded-2xl border border-white/15 bg-white/5 p-5"
                  >
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
      </div>
    </div>
  );
}
