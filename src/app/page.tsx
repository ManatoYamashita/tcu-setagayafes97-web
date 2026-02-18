import type { Metadata } from "next";
import { siteConfig } from "@/data/site";
import { CountdownTimer } from "@/components/countdown/CountdownTimer";
import { CountdownNewsSection } from "@/components/countdown/CountdownNewsSection";
import { SocialIcons } from "@/components/ui/SocialIcons";
import { GradientBlindsBackground } from "@/components/background/GradientBlindsBackground";

export const metadata: Metadata = {
  title: siteConfig.name,
  description: siteConfig.description,
};

export const revalidate = 3600;

/**
 * トップページ（HOME）
 * カウントダウン・開催概要・News を表示
 */
export default function Home() {
  return (
    <div className="relative overflow-hidden bg-[#1a0a2e]">
      {/* 背景: Gradient Blinds */}
      <GradientBlindsBackground />

      {/* Hero Section */}
      <section className="relative z-10 flex min-h-[calc(100vh-var(--header-height))] flex-col items-center justify-center px-4 py-20">
        {/* サイトタイトル */}
        <div className="relative z-10 mb-12 text-center">
          <p className="mb-2 text-sm font-semibold tracking-widest text-white/60 md:text-base">
            第{siteConfig.edition}回
          </p>
          <h1 className="text-3xl font-bold text-white md:text-5xl">{siteConfig.shortName}</h1>
          <p className="mt-2 text-sm text-[#CD79EE] md:text-base">東京都市大学 世田谷キャンパス</p>
        </div>

        {/* カウントダウンタイマー */}
        <div className="relative z-10 w-full max-w-4xl">
          <CountdownTimer />
        </div>

        {/* 開催情報 */}
        <div className="relative z-10 mt-12 text-center">
          <div className="space-y-2 text-sm text-white/80 md:text-base">
            <p>
              <span className="font-semibold text-white">日程</span>
              <span className="mx-2 text-white/40">|</span>
              {siteConfig.dates.day1} 〜 {siteConfig.dates.day2}
            </p>
            <p>
              <span className="font-semibold text-white">時間</span>
              <span className="mx-2 text-white/40">|</span>
              {siteConfig.openTime} 〜 {siteConfig.closeTime}
            </p>
            <p>
              <span className="font-semibold text-white">会場</span>
              <span className="mx-2 text-white/40">|</span>
              {siteConfig.venue}
            </p>
          </div>
        </div>

        {/* SNS アイコン */}
        <div className="relative z-10 mt-10">
          <SocialIcons layout="horizontal" size="lg" className="text-white/60" />
        </div>
      </section>

      {/* News Section */}
      <CountdownNewsSection />
    </div>
  );
}
