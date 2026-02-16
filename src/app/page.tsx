import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { CountdownTimer } from "@/components/countdown/CountdownTimer";
import { CountdownNewsSection } from "@/components/countdown/CountdownNewsSection";

export const metadata: Metadata = {
  title: `Coming Soon | ${siteConfig.name}`,
  description: `${siteConfig.name}の公式Webサイトは近日公開予定です。`,
};

export const revalidate = 3600;

/**
 * カウントダウン専用トップページ（改訂版）
 * Bold Minimalism - シンプルな青グラデーション背景
 */
export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* 背景: Pure White */}
      <div className="fixed inset-0 z-0 bg-white" />

      {/* Hero Section - カウントダウンエリア */}
      <section className="relative z-10 flex min-h-screen flex-col justify-between px-6 pt-16 pb-0 md:px-12 md:pt-20 lg:px-20 lg:pt-24">
        {/* 上部: タイトルエリア */}
        <div className="relative z-10">
          <div className="max-w-4xl">
            <p className="text-sm font-medium tracking-[0.15em] text-gray-600 md:text-base lg:text-lg">
              東京都市大学
            </p>
            <h1 className="mt-2 font-bold text-gray-900 text-4xl md:text-5xl lg:text-6xl">
              第{siteConfig.edition}回世田谷祭
            </h1>
            <p className="mt-4 text-base font-medium tracking-[0.1em] text-gray-700 md:text-lg lg:text-xl">
              {siteConfig.dates.day1.substring(5).replace("-", "月")}日 -{" "}
              {siteConfig.dates.day2.substring(5).replace("-", "月")}日
            </p>
          </div>
        </div>

        {/* 中央: カウントダウンタイマー */}
        <div className="relative z-10 flex items-center justify-center py-12 md:py-16 lg:py-20">
          <CountdownTimer />
        </div>
      </section>

      {/* News Section */}
      <CountdownNewsSection />
    </main>
  );
}
