import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Users, Target, Building2, ExternalLink } from "lucide-react";
import { aboutConfig } from "@/data/about";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "委員会について | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭 実行委員会について。委員長挨拶、理念・ビジョン、実行委員会の紹介をご覧いただけます。",
  openGraph: {
    title: "委員会について | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭 実行委員会について。委員長挨拶、理念・ビジョン、実行委員会の紹介をご覧いただけます。",
    type: "website",
  },
};

/**
 * 委員会について（About）ページ
 */
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Users className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">委員会について</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">世田谷祭実行委員会の理念とビジョン</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 委員長挨拶 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">委員長挨拶</h2>
            </div>

            {/* 委員長情報 */}
            <div className="mb-6 flex flex-col items-center gap-6 md:flex-row md:items-start">
              {/* 委員長画像 */}
              <div className="relative h-48 w-48 flex-shrink-0 overflow-hidden rounded-lg">
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                  <Users className="h-24 w-24 text-white opacity-50" />
                </div>
              </div>

              {/* 委員長プロフィール */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="mb-2 text-2xl font-bold text-gray-900">
                  {aboutConfig.chairpersonMessage.name}
                </h3>
                <p className="text-gray-600">{aboutConfig.chairpersonMessage.position}</p>
              </div>
            </div>

            {/* 挨拶文 */}
            <div className="prose prose-lg max-w-none">
              <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                {aboutConfig.chairpersonMessage.message}
              </p>
            </div>
          </section>

          {/* 理念・ビジョン */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Target className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">理念・ビジョン</h2>
            </div>

            {/* テーマ */}
            <div className="mb-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 p-8 text-center text-white">
              <p className="mb-2 text-sm font-semibold opacity-90">第97回 世田谷祭 テーマ</p>
              <h3 className="text-3xl font-bold md:text-4xl">{aboutConfig.vision.theme}</h3>
            </div>

            {/* 理念説明 */}
            <p className="mb-8 text-center text-lg text-gray-700">
              {aboutConfig.vision.description}
            </p>

            {/* 価値観 */}
            <div className="grid gap-6 md:grid-cols-2">
              {aboutConfig.vision.values.map((value, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-gray-200 bg-gray-50 p-6 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-3 text-4xl">{value.icon}</div>
                  <h4 className="mb-2 text-lg font-bold text-gray-900">{value.title}</h4>
                  <p className="text-sm text-gray-700">{value.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 実行委員会について */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Building2 className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">実行委員会について</h2>
            </div>

            {/* 基本情報 */}
            <div className="mb-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-600">設立</p>
                <p className="text-lg font-bold text-green-700">
                  {aboutConfig.committee.establishedYear}年
                </p>
              </div>
              <div className="rounded-lg bg-green-50 p-4">
                <p className="mb-1 text-sm font-semibold text-gray-600">実行委員数</p>
                <p className="text-lg font-bold text-green-700">
                  約{aboutConfig.committee.memberCount}名
                </p>
              </div>
            </div>

            {/* 説明 */}
            <p className="mb-6 text-gray-700">{aboutConfig.committee.description}</p>

            {/* 組織構成 */}
            <div>
              <h3 className="mb-4 text-lg font-bold text-gray-900">組織構成</h3>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {aboutConfig.committee.departments.map((dept, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-center"
                  >
                    <p className="font-semibold text-gray-900">{dept}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SNSリンク */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">公式SNSをフォロー</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {aboutConfig.social.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center gap-2 rounded-lg border-2 border-primary p-4 font-semibold text-primary transition-all hover:bg-primary hover:text-white"
                >
                  <span>{social.name}</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ))}
            </div>
          </section>

          {/* 関連リンク */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="mb-6 text-center text-2xl font-bold text-gray-900">関連ページ</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Link
                href="/about/sponsors"
                className="rounded-lg border-2 border-gray-300 p-4 text-center font-semibold text-gray-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                協賛企業一覧
              </Link>
              <Link
                href="/about/contact"
                className="rounded-lg border-2 border-gray-300 p-4 text-center font-semibold text-gray-700 transition-all hover:border-primary hover:bg-primary/5 hover:text-primary"
              >
                お問い合わせ
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
