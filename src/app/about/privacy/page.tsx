import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Info, Lock, Users, Cookie, Mail, FileText, Copyright } from "lucide-react";
import { privacyPolicyConfig } from "@/data/privacy";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "プライバシーポリシー | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭における個人情報保護方針、利用目的、セキュリティ対策などをご確認いただけます。",
  openGraph: {
    title: "プライバシーポリシー | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭における個人情報保護方針、利用目的、セキュリティ対策などをご確認いただけます。",
    type: "website",
  },
};

/**
 * プライバシーポリシーページ
 */
export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <Shield className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">プライバシーポリシー</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">個人情報保護方針</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-12">
          {/* 基本情報 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-900">基本情報</h2>
            </div>
            <div className="space-y-3">
              <p className="text-gray-700">
                {privacyPolicyConfig.info.organizationName}
                （以下「当委員会」）は、お客様の個人情報保護の重要性について認識し、個人情報の保護に関する法律（個人情報保護法）を遵守すると共に、以下のプライバシーポリシーに従って、個人情報を適切に取り扱います。
              </p>
              <div className="mt-4 rounded-lg bg-gray-50 p-4">
                <p className="text-sm font-semibold text-gray-600">最終更新日</p>
                <p className="text-lg font-bold text-gray-900">
                  {privacyPolicyConfig.info.updateDate}
                </p>
              </div>
            </div>
          </section>

          {/* 個人情報の利用目的 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <FileText className="h-6 w-6 text-blue-500" />
              <h2 className="text-2xl font-bold text-gray-900">個人情報の利用目的</h2>
            </div>
            <p className="mb-4 text-gray-700">
              当委員会は、お客様からお預かりした個人情報を以下の目的で利用いたします。
            </p>
            <ul className="space-y-2">
              {privacyPolicyConfig.purposes.map((purpose, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></span>
                  <span>{purpose}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 収集する情報 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">収集する情報</h2>
            </div>
            <p className="mb-4 text-gray-700">当サイトでは、以下の情報を収集する場合があります。</p>
            <div className="grid gap-3 md:grid-cols-2">
              {privacyPolicyConfig.collectedInfo.map((info, index) => (
                <div
                  key={index}
                  className="rounded-lg border border-green-100 bg-green-50 p-4 text-gray-700"
                >
                  {info}
                </div>
              ))}
            </div>
          </section>

          {/* セキュリティ */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Lock className="h-6 w-6 text-orange-500" />
              <h2 className="text-2xl font-bold text-gray-900">セキュリティ</h2>
            </div>
            <p className="text-gray-700">{privacyPolicyConfig.security.description}</p>
          </section>

          {/* 第三者提供 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Users className="h-6 w-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-900">第三者への提供</h2>
            </div>
            <p className="mb-4 font-semibold text-gray-900">
              {privacyPolicyConfig.thirdParty.policy}
            </p>
            <p className="mb-2 text-sm text-gray-700">ただし、以下の場合を除きます。</p>
            <ul className="space-y-2">
              {privacyPolicyConfig.thirdParty.exceptions.map((exception, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-purple-500"></span>
                  <span>{exception}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Cookie・アクセス解析 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Cookie className="h-6 w-6 text-amber-500" />
              <h2 className="text-2xl font-bold text-gray-900">Cookie・アクセス解析</h2>
            </div>
            <div className="space-y-4">
              <p className="text-gray-700">{privacyPolicyConfig.cookies.description}</p>
              <div className="rounded-lg bg-amber-50 p-4">
                <p className="mb-2 text-sm font-semibold text-gray-700">使用ツール</p>
                <p className="font-bold text-amber-700">{privacyPolicyConfig.cookies.analytics}</p>
              </div>
              <div>
                <p className="mb-2 text-sm text-gray-700">{privacyPolicyConfig.cookies.optOut}</p>
                <a
                  href={privacyPolicyConfig.cookies.optOutUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  Google Analytics オプトアウトページ
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </section>

          {/* お問い合わせ窓口 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Mail className="h-6 w-6 text-pink-500" />
              <h2 className="text-2xl font-bold text-gray-900">お問い合わせ窓口</h2>
            </div>
            <p className="mb-4 text-gray-700">{privacyPolicyConfig.contact.description}</p>
            <Link
              href={privacyPolicyConfig.contact.url}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg"
            >
              <Mail className="h-5 w-5" />
              <span>お問い合わせフォームへ</span>
            </Link>
          </section>

          {/* 免責事項 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Info className="h-6 w-6 text-red-500" />
              <h2 className="text-2xl font-bold text-gray-900">免責事項</h2>
            </div>
            <ul className="space-y-2">
              {privacyPolicyConfig.disclaimer.map((item, index) => (
                <li key={index} className="flex items-start gap-2 text-gray-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-red-500"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* 著作権 */}
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm md:p-8">
            <div className="mb-6 flex items-center gap-3">
              <Copyright className="h-6 w-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">著作権</h2>
            </div>
            <p className="mb-4 text-gray-700">{privacyPolicyConfig.copyright.description}</p>
            <p className="text-sm text-gray-600">
              Copyright © {privacyPolicyConfig.copyright.year}{" "}
              {privacyPolicyConfig.copyright.holder}. All Rights Reserved.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
