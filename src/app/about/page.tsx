import type { Metadata } from "next";
import { AboutHero } from "@/components/about/AboutHero";
import { EventOverviewTable } from "@/components/about/EventOverviewTable";
import { SponsorBanner } from "@/components/home/SponsorBanner";

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
    <div className="min-h-screen bg-secondary">
      <AboutHero />
      {/* 開催概要 */}
      <div className="relative z-10 -mt-6 mx-4 rounded-t-3xl bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
        <EventOverviewTable />
      </div>
      {/* 協賛企業 */}
      <SponsorBanner />
    </div>
  );
}
