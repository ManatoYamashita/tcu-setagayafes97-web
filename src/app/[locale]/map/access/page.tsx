import type { Metadata } from "next";
import { MapPin, Train, Bus, Car, Bike } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { accessConfig } from "@/data/access";
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
  const t = await getTranslations({ locale, namespace: "access" });

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
 * 交通アクセスページ
 */
export default async function AccessPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("access");

  // 電車とバスの情報を分離
  const trainInfo = accessConfig.publicTransport.find((t) => t.type === "電車");
  const busInfo = accessConfig.publicTransport.find((t) => t.type === "バス");

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary">
      {/* 言語切替（多言語対応ページのみ） */}
      <div className="fixed right-4 top-4 z-50">
        <LanguageSwitcher />
      </div>

      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <MapPin className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">{t("title")}</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">{t("subtitle")}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Google Maps埋め込み */}
          <section className="overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-sm">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3244.0968953087473!2d139.63361431525804!3d35.60891598021282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f4e3b3b3b3b3%3A0x3b3b3b3b3b3b3b3b!2z5p2x5Lqs6YO95biC5aSn5a2mIOS4lueUsOiwt-OCrOODqeOCueOCreODo-ODs-ODkeOCuQ!5e0!3m2!1sja!2sjp!4v1234567890123!5m2!1sja!2sjp"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Tokyo City University Setagaya Campus Map"
            ></iframe>
          </section>

          {/* 住所 */}
          <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary-light" />
              <h2 className="text-2xl font-bold text-white">{t("sections.address")}</h2>
            </div>
            <p className="text-lg text-white/90">{accessConfig.address}</p>
            <p className="mt-2 text-sm text-white/80">TEL: {accessConfig.phone}</p>
          </section>

          {/* 電車アクセス */}
          {trainInfo && (
            <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Train className="h-6 w-6 text-blue-400" />
                <h2 className="text-2xl font-bold text-white">{t("sections.byTrain")}</h2>
              </div>
              <div className="space-y-6">
                {trainInfo.routes.map((route, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-blue-400/30 bg-blue-500/10 p-5 transition-all hover:border-blue-400/50 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-400">{route.line}</p>
                        <p className="text-xl font-bold text-white">{route.station}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-blue-400">
                          {t("labels.walkTime", { minutes: route.walkTime })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/90">{route.description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-white/80">※ {t("notes.trainNote")}</p>
            </section>
          )}

          {/* バスアクセス */}
          {busInfo && (
            <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Bus className="h-6 w-6 text-green-400" />
                <h2 className="text-2xl font-bold text-white">{t("sections.byBus")}</h2>
              </div>
              <div className="space-y-6">
                {busInfo.routes.map((route, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-green-400/30 bg-green-500/10 p-5 transition-all hover:border-green-400/50 hover:shadow-md"
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-green-400">{route.line}</p>
                        <p className="text-xl font-bold text-white">
                          {route.from} → {route.stop}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-green-400">
                          {t("labels.walkTime", { minutes: route.walkTime })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-white/90">{route.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 駐車場・駐輪場情報 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 駐車場 */}
            <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Car className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-bold text-white">{t("sections.parking")}</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white/60">{t("labels.available")}</p>
                  <p className="text-lg font-bold text-red-400">
                    {accessConfig.car.parkingAvailable
                      ? t("labels.available")
                      : t("labels.notAvailable")}
                  </p>
                </div>
                <div className="rounded-lg bg-red-500/10 p-4">
                  <p className="text-sm text-red-300">{accessConfig.car.note}</p>
                </div>
              </div>
            </section>

            {/* 駐輪場 */}
            <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Bike className="h-6 w-6 text-purple-300" />
                <h2 className="text-xl font-bold text-white">{t("sections.bicycle")}</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-white/60">{t("labels.available")}</p>
                  <p className="text-lg font-bold text-purple-300">
                    {accessConfig.bicycle.parkingAvailable
                      ? t("labels.available")
                      : t("labels.notAvailable")}
                  </p>
                </div>
                {accessConfig.bicycle.parkingAvailable && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white/60">
                          {t("labels.capacity")}
                        </p>
                        <p className="font-bold text-white">
                          {t("labels.about")} {accessConfig.bicycle.capacity}
                          {t("labels.units")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white/60">
                          {t("labels.location")}
                        </p>
                        <p className="font-bold text-white">{accessConfig.bicycle.location}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-purple-500/10 p-4">
                      <p className="text-sm text-purple-300">{accessConfig.bicycle.note}</p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* 補足情報 */}
          <section className="rounded-lg border border-white/20 bg-white/10 p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-white">{t("sections.notes")}</h2>
            <ul className="space-y-2 text-sm text-white/90">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>{t("notes.crowded")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>{t("notes.signs")}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>{t("notes.inquiry")}</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
