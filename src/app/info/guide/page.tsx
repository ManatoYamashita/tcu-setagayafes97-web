import type { Metadata } from "next";
import { Info, AlertTriangle, Heart, Cloud, Package, Baby, Plus } from "lucide-react";
import { guideConfig } from "@/data/guide";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "ご来場の方へ | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭のご来場に関する注意事項、バリアフリー情報、アクセス情報などをご確認いただけます。",
  openGraph: {
    title: "ご来場の方へ | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭のご来場に関する注意事項、バリアフリー情報、アクセス情報などをご確認いただけます。",
    type: "website",
  },
};

/**
 * ご来場の方へページ
 */
export default function GuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">ご来場の方へ</h1>
          <p className="text-center text-lg opacity-90">
            皆様に安全で快適にお過ごしいただくためのご案内
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 入場案内 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">入場案内</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">入場料</p>
                  <p className="text-xl font-bold text-primary">{guideConfig.admission.fee}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">開催時間</p>
                  <p className="text-xl font-bold text-gray-900">{guideConfig.admission.time}</p>
                </div>
              </div>
              <ul className="mt-4 space-y-2">
                {guideConfig.admission.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 来場時の注意事項 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">来場時の注意事項</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {guideConfig.precautions.map((item, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-bold text-gray-900">{item.category}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              ))}
            </div>
          </section>

          {/* バリアフリー情報 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Heart className="h-6 w-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900">バリアフリー情報</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">車椅子対応</p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.wheelchairAccessible ? "対応" : "非対応"}
                  </p>
                </div>
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">多目的トイレ</p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.multipurposeRestrooms ? "あり" : "なし"}
                  </p>
                </div>
                <div className="rounded-lg bg-pink-50 p-4 text-center">
                  <p className="mb-1 text-sm font-semibold text-gray-600">授乳室</p>
                  <p className="text-lg font-bold text-pink-600">
                    {guideConfig.accessibility.nursingRoom ? "あり" : "なし"}
                  </p>
                </div>
              </div>
              <div>
                <p className="mb-2 font-semibold text-gray-900">エレベーター設置棟:</p>
                <p className="text-gray-700">{guideConfig.accessibility.elevators.join("、")}</p>
              </div>
              <ul className="space-y-2">
                {guideConfig.accessibility.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-pink-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 天候による影響 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Cloud className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">天候による影響</h2>
            </div>
            <div className="space-y-3">
              <p className="text-lg font-semibold text-blue-600">
                {guideConfig.weatherInfo.rainPolicy}
              </p>
              <ul className="space-y-2">
                {guideConfig.weatherInfo.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 落とし物・忘れ物 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Package className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">落とし物・忘れ物</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-500">受付場所</p>
                  <p className="text-lg font-bold text-gray-900">
                    {guideConfig.lostAndFound.location}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500">受付時間</p>
                  <p className="text-lg font-bold text-gray-900">
                    {guideConfig.lostAndFound.hours}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.lostAndFound.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* お子様連れの方へ */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Baby className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">お子様連れの方へ</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-600">授乳室</p>
                  <p className="font-bold text-purple-600">
                    {guideConfig.forFamilies.nursingRoom ? "あり" : "なし"}
                  </p>
                </div>
                <div className="rounded-lg bg-purple-50 p-4">
                  <p className="mb-1 text-sm font-semibold text-gray-600">おむつ交換台</p>
                  <p className="font-bold text-purple-600">
                    {guideConfig.forFamilies.diaperChangingStation ? "あり" : "なし"}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.forFamilies.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          {/* 緊急時の対応 */}
          <section className="rounded-lg border border-red-200 bg-red-50 p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Plus className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">緊急時の対応</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-gray-600">救護室</p>
                  <p className="text-lg font-bold text-red-600">
                    {guideConfig.emergency.medicalRoom}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-600">緊急連絡先</p>
                  <p className="text-lg font-bold text-red-600">
                    {guideConfig.emergency.emergencyContact}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.emergency.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
