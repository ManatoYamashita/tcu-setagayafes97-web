import type { Metadata } from "next";
import { MapPin, Train, Bus, Car, Bike } from "lucide-react";
import { accessConfig } from "@/data/access";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "交通アクセス | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 世田谷キャンパスへの交通アクセス情報。最寄り駅からのルート、バス案内、駐車場・駐輪場情報をご確認いただけます。",
  openGraph: {
    title: "交通アクセス | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 世田谷キャンパスへの交通アクセス情報。最寄り駅からのルート、バス案内、駐車場・駐輪場情報をご確認いただけます。",
    type: "website",
  },
};

/**
 * 交通アクセスページ
 */
export default function AccessPage() {
  // 電車とバスの情報を分離
  const trainInfo = accessConfig.publicTransport.find((t) => t.type === "電車");
  const busInfo = accessConfig.publicTransport.find((t) => t.type === "バス");

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <MapPin className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">交通アクセス</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">
            東京都市大学 世田谷キャンパスへのアクセス
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-5xl space-y-8">
          {/* Google Maps埋め込み */}
          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
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
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">所在地</h2>
            </div>
            <p className="text-lg text-gray-700">{accessConfig.address}</p>
            <p className="mt-2 text-sm text-gray-600">TEL: {accessConfig.phone}</p>
          </section>

          {/* 電車アクセス */}
          {trainInfo && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Train className="h-6 w-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">電車でお越しの方</h2>
              </div>
              <div className="space-y-6">
                {trainInfo.routes.map((route, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-blue-100 bg-blue-50 p-5 transition-all hover:border-blue-300 hover:shadow-md"
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
                    <p className="text-sm text-gray-700">{route.description}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm text-gray-600">
                ※ 混雑状況により、所要時間が異なる場合があります。
              </p>
            </section>
          )}

          {/* バスアクセス */}
          {busInfo && (
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
              <div className="mb-6 flex items-center gap-3">
                <Bus className="h-6 w-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">バスでお越しの方</h2>
              </div>
              <div className="space-y-6">
                {busInfo.routes.map((route, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-green-100 bg-green-50 p-5 transition-all hover:border-green-300 hover:shadow-md"
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
                    <p className="text-sm text-gray-700">{route.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 駐車場・駐輪場情報 */}
          <div className="grid gap-6 md:grid-cols-2">
            {/* 駐車場 */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Car className="h-6 w-6 text-red-500" />
                <h2 className="text-xl font-bold text-gray-900">駐車場</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500">利用可否</p>
                  <p className="text-lg font-bold text-red-600">
                    {accessConfig.car.parkingAvailable ? "利用可" : "利用不可"}
                  </p>
                </div>
                <div className="rounded-lg bg-red-50 p-4">
                  <p className="text-sm text-red-700">{accessConfig.car.note}</p>
                </div>
              </div>
            </section>

            {/* 駐輪場 */}
            <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center gap-3">
                <Bike className="h-6 w-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">駐輪場</h2>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500">利用可否</p>
                  <p className="text-lg font-bold text-purple-600">
                    {accessConfig.bicycle.parkingAvailable ? "利用可" : "利用不可"}
                  </p>
                </div>
                {accessConfig.bicycle.parkingAvailable && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-500">収容台数</p>
                        <p className="font-bold text-gray-900">
                          約 {accessConfig.bicycle.capacity}台
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-500">場所</p>
                        <p className="font-bold text-gray-900">{accessConfig.bicycle.location}</p>
                      </div>
                    </div>
                    <div className="rounded-lg bg-purple-50 p-4">
                      <p className="text-sm text-purple-700">{accessConfig.bicycle.note}</p>
                    </div>
                  </>
                )}
              </div>
            </section>
          </div>

          {/* 補足情報 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-4 text-xl font-bold text-gray-900">アクセスに関するご注意</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  世田谷祭当日は多くの来場者が見込まれます。時間に余裕を持ってお越しください。
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>最寄り駅からのルートは、案内看板を設置しております。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>ご不明な点がございましたら、正門の総合案内所までお問い合わせください。</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
