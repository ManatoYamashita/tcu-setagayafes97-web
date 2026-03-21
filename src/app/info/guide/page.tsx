import type { Metadata } from "next";
import {
  Info,
  AlertTriangle,
  Heart,
  Cloud,
  Package,
  Baby,
  ShieldAlert,
  Check,
  X,
  MapPin,
  Clock,
  Mail,
  HelpCircle,
  Map,
} from "lucide-react";
import Link from "next/link";
import { guideConfig } from "@/data/guide";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

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

// 注意事項のカテゴリ別カラーマッピング
const precautionStyles = [
  { border: "border-l-blue-400", bg: "bg-blue-50" },
  { border: "border-l-gray-400", bg: "bg-gray-50" },
  { border: "border-l-green-400", bg: "bg-green-50" },
  { border: "border-l-amber-400", bg: "bg-amber-50" },
  { border: "border-l-red-400", bg: "bg-red-50" },
  { border: "border-l-purple-400", bg: "bg-purple-50" },
];

// ページ内ナビゲーション定義
const navItems = [
  { id: "admission", label: "入場案内" },
  { id: "precautions", label: "注意事項" },
  { id: "accessibility", label: "バリアフリー" },
  { id: "weather", label: "天候" },
  { id: "lost-and-found", label: "落とし物" },
  { id: "families", label: "お子様連れ" },
  { id: "emergency", label: "緊急時" },
];

/**
 * ご来場の方へページ
 */
export default function GuidePage() {
  return (
    <PageSheetLayout hero={pageHeroes.guide}>
      <div className="mx-auto max-w-4xl space-y-16">
        {/* ページ内ナビゲーション */}
        <nav aria-label="ページ内ナビゲーション" className="overflow-x-auto">
          <div className="flex gap-2 pb-2">
            {navItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="flex-shrink-0 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>

        {/* 入場案内 (Tier 1) */}
        <section id="admission" className="scroll-mt-24">
          <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-primary-100 p-8 shadow-md">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                <Info className="h-5 w-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">入場案内</h2>
            </div>
            <div className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl bg-white/70 p-5 text-center backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold text-gray-500">入場料</p>
                  <p className="text-4xl font-bold text-primary">{guideConfig.admission.fee}</p>
                </div>
                <div className="rounded-xl bg-white/70 p-5 text-center backdrop-blur-sm">
                  <p className="mb-1 text-sm font-semibold text-gray-500">開催時間</p>
                  <p className="text-2xl font-bold text-gray-900">{guideConfig.admission.time}</p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.admission.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 来場時の注意事項 (Tier 3) */}
        <section id="precautions" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">来場時の注意事項</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {guideConfig.precautions.map((item, index) => {
              const style = precautionStyles[index] || precautionStyles[0];
              return (
                <div
                  key={index}
                  className={`rounded-xl border-l-4 ${style.border} ${style.bg} p-5 shadow-sm transition-all hover:shadow-md`}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{item.icon}</span>
                    <h3 className="font-bold text-gray-900">{item.category}</h3>
                  </div>
                  <p className="text-sm text-gray-700">{item.content}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* バリアフリー情報 (Tier 4) */}
        <section id="accessibility" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
              <Heart className="h-5 w-5 text-pink-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">バリアフリー情報</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${guideConfig.accessibility.wheelchairAccessible ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {guideConfig.accessibility.wheelchairAccessible ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">車椅子対応</p>
                    <p className="font-bold text-pink-600">
                      {guideConfig.accessibility.wheelchairAccessible ? "対応" : "非対応"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${guideConfig.accessibility.multipurposeRestrooms ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {guideConfig.accessibility.multipurposeRestrooms ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">多目的トイレ</p>
                    <p className="font-bold text-pink-600">
                      {guideConfig.accessibility.multipurposeRestrooms ? "あり" : "なし"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${guideConfig.accessibility.nursingRoom ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {guideConfig.accessibility.nursingRoom ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">授乳室</p>
                    <p className="font-bold text-pink-600">
                      {guideConfig.accessibility.nursingRoom ? "あり" : "なし"}
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <p className="mb-3 font-semibold text-gray-900">エレベーター設置棟</p>
                <div className="flex flex-wrap gap-2">
                  {guideConfig.accessibility.elevators.map((elevator) => (
                    <span
                      key={elevator}
                      className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-700"
                    >
                      {elevator}
                    </span>
                  ))}
                </div>
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
          </div>
        </section>

        {/* 天候による影響 (Tier 4) */}
        <section id="weather" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
              <Cloud className="h-5 w-5 text-blue-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">天候による影響</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div>
                <span className="inline-block rounded-full bg-blue-500 px-5 py-2 text-sm font-bold text-white">
                  {guideConfig.weatherInfo.rainPolicy}
                </span>
              </div>
              <ul className="space-y-2">
                {guideConfig.weatherInfo.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-gray-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 落とし物・忘れ物 (Tier 4) */}
        <section id="lost-and-found" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
              <Package className="h-5 w-5 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">落とし物・忘れ物</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <MapPin className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">受付場所</p>
                    <p className="font-bold text-gray-900">{guideConfig.lostAndFound.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100">
                    <Clock className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-500">受付時間</p>
                    <p className="font-bold text-gray-900">{guideConfig.lostAndFound.hours}</p>
                  </div>
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
          </div>
        </section>

        {/* お子様連れの方へ (Tier 4) */}
        <section id="families" className="scroll-mt-24">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
              <Baby className="h-5 w-5 text-purple-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">お子様連れの方へ</h2>
          </div>
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${guideConfig.forFamilies.nursingRoom ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {guideConfig.forFamilies.nursingRoom ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">授乳室</p>
                    <p className="font-bold text-purple-600">
                      {guideConfig.forFamilies.nursingRoom ? "あり" : "なし"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${guideConfig.forFamilies.diaperChangingStation ? "bg-green-100" : "bg-gray-200"}`}
                  >
                    {guideConfig.forFamilies.diaperChangingStation ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <X className="h-4 w-4 text-gray-400" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600">おむつ交換台</p>
                    <p className="font-bold text-purple-600">
                      {guideConfig.forFamilies.diaperChangingStation ? "あり" : "なし"}
                    </p>
                  </div>
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
          </div>
        </section>

        {/* 緊急時の対応 (Tier 2) */}
        <section id="emergency" className="scroll-mt-24">
          <div className="rounded-2xl bg-gradient-to-br from-red-600 to-red-700 p-6 shadow-lg md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <ShieldAlert className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">緊急時の対応</h2>
            </div>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-red-100">救護室</p>
                  <p className="text-lg font-bold text-white">
                    {guideConfig.emergency.medicalRoom}
                  </p>
                </div>
                <div className="rounded-xl bg-white/15 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-red-100">緊急連絡先</p>
                  <p className="text-lg font-bold text-white">
                    {guideConfig.emergency.emergencyContact}
                  </p>
                </div>
              </div>
              <ul className="space-y-2">
                {guideConfig.emergency.notes.map((note, index) => (
                  <li key={index} className="flex items-start gap-2 text-red-100">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-white"></span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 関連ページリンク */}
        <div className="mt-16 border-t border-gray-100 pt-10">
          <h3 className="mb-6 text-lg font-bold text-gray-900">関連ページ</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/map"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <Map className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">キャンパスマップ</p>
                <p className="text-sm text-gray-500">会場案内を見る</p>
              </div>
            </Link>
            <Link
              href="/about/contact"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <Mail className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">お問い合わせ</p>
                <p className="text-sm text-gray-500">ご質問・ご相談はこちら</p>
              </div>
            </Link>
            <Link
              href="/info/faq"
              className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-all hover:border-primary-300 hover:shadow-md"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-50 transition-colors group-hover:bg-primary-100">
                <HelpCircle className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">よくある質問</p>
                <p className="text-sm text-gray-500">FAQを確認する</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </PageSheetLayout>
  );
}
