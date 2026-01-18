/**
 * サイト基本情報
 * 年次更新時は主にこのファイルの edition, dates, name を更新する
 */
export const siteConfig = {
  // 年度情報（第X回）
  edition: 97,

  // サイト名称
  name: "東京都市大学 第97回 世田谷祭",
  shortName: "世田谷祭",

  // サイト説明
  description:
    "東京都市大学 世田谷キャンパスで開催される学園祭の公式Webサイト。企画情報、タイムテーブル、キャンパスマップ、アクセス情報などを掲載しています。",

  // 開催日程
  dates: {
    day1: "2026-10-31",
    day2: "2026-11-01",
  },

  // 開催時間
  openTime: "10:00",
  closeTime: "18:00",

  // 会場情報
  venue: "東京都市大学 世田谷キャンパス",
  address: "〒158-8557 東京都世田谷区玉堤1-28-1",

  // テーマカラー
  themeColor: "#CD79EE",

  // SNS
  sns: {
    twitter: "https://twitter.com/tcu_setagayafes",
    instagram: "https://instagram.com/tcu_setagayafes",
  },

  // メタデータ
  metadata: {
    siteName: "東京都市大学 第97回 世田谷祭",
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "https://setagayafes.tcu.ac.jp",
    ogImage: "/images/og-image.png",
  },

  // 想定来場者数
  expectedVisitors: 3000,

  // 公開予定日
  launchDate: "2026-02-28",
} as const;

/**
 * サイト設定の型定義
 */
export type SiteConfig = typeof siteConfig;
