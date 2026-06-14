import type { Metadata } from "next";
import { MapPin, Train, Bus } from "lucide-react";
import { accessConfig } from "@/data/access";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "アクセス | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 世田谷キャンパスへのアクセス情報。キャンパスマップ、最寄り駅からのルート、バス案内、駐車場・駐輪場情報をご確認いただけます。",
  openGraph: {
    title: "アクセス | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 世田谷キャンパスへのアクセス情報。キャンパスマップ、最寄り駅からのルート、バス案内、駐車場・駐輪場情報をご確認いただけます。",
    type: "website",
  },
};

/**
 * アクセスページ（キャンパスマップ + 交通アクセス統合）
 */
export default function AccessPage() {
  const trainInfo = accessConfig.publicTransport.find((t) => t.type === "電車");
  const busInfo = accessConfig.publicTransport.find((t) => t.type === "バス");

  return (
    <PageSheetLayout hero={pageHeroes.access}>
      {/* キャンパスマップ（準備中） */}
      <ComingSoon
        title="キャンパスマップは準備中です"
        description="第97回 世田谷祭のキャンパスマップは現在準備中です。公開までもうしばらくお待ちください。"
      />

      {/* 交通アクセスセクション */}
      <div className="container mx-auto space-y-8 px-4 py-12">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <MapPin className="h-6 w-6 text-primary" />
          交通アクセス
        </h2>

        {/* Google Maps埋め込み */}
        <section className="overflow-hidden rounded-lg border border-gray-200/20 bg-white/10 shadow-sm">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3244.0968953087473!2d139.63361431525804!3d35.60891598021282!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x6018f4e3b3b3b3b3%3A0x3b3b3b3b3b3b3b3b!2z5p2x5Lqs6YO95biC5aSn5a2mIOS4lueUsOiwt-OCrOODqeOCueOCreODo-ODs-ODkeOCuQ!5e0!3m2!1sja!2sjp!4v1234567890123!5m2!1sja!2sjp"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="東京都市大学 世田谷キャンパス 地図"
          ></iframe>
        </section>

        {/* 住所 */}
        <section className="rounded-lg border border-gray-200/20 bg-white/10 p-6 shadow-sm md:p-8">
          <div className="mb-4 flex items-center gap-3">
            <MapPin className="h-6 w-6 text-primary" />
            <h3 className="text-2xl font-bold text-gray-900">所在地</h3>
          </div>
          <p className="text-lg text-gray-900/90">{accessConfig.address}</p>
          <p className="mt-2 text-sm text-gray-900/80">TEL: {accessConfig.phone}</p>
        </section>

        {/* 電車アクセス */}
        {trainInfo && (
          <section className="rounded-lg border border-gray-200/20 bg-white/10 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Train className="h-6 w-6 text-blue-500" />
              <h3 className="text-2xl font-bold text-gray-900">電車でお越しの方</h3>
            </div>
            <div className="space-y-6">
              {trainInfo.routes.map((route, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200/20 bg-white/10 p-5 transition-all hover:border-gray-200/40 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-600">{route.line}</p>
                      <p className="text-xl font-bold text-gray-900">{route.station}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-blue-600">徒歩 {route.walkTime}分</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900/90">{route.description}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-gray-900/80">
              ※ 混雑状況により、所要時間が異なる場合があります。
            </p>
          </section>
        )}

        {/* バスアクセス */}
        {busInfo && (
          <section className="rounded-lg border border-gray-200/20 bg-white/10 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Bus className="h-6 w-6 text-green-500" />
              <h3 className="text-2xl font-bold text-gray-900">バスでお越しの方</h3>
            </div>
            <div className="space-y-6">
              {busInfo.routes.map((route, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200/20 bg-white/10 p-5 transition-all hover:border-gray-200/40 hover:shadow-md"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-green-600">{route.line}</p>
                      <p className="text-xl font-bold text-gray-900">
                        {route.from} → {route.stop}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">徒歩 {route.walkTime}分</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-900/90">{route.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* 駐車場・駐輪場、アクセスに関するご注意（準備中） */}
      <ComingSoon
        title="駐車場・駐輪場、アクセスに関するご注意は準備中です"
        description="駐車場・駐輪場のご案内およびアクセスに関するご注意事項は現在準備中です。公開までもうしばらくお待ちください。"
      />
    </PageSheetLayout>
  );
}
