/**
 * サイト基本情報
 * 年次更新時は主にこのファイルの edition, dates, name を更新する
 */
export const siteConfig = {
  // 年度情報（第X回）
  edition: 97,

  // サイト名称
  name: "第97回東京都市大学世田谷祭",
  shortName: "世田谷祭",

  // サイト説明
  description:
    "第97回東京都市大学世田谷祭の公式Webサイト。2026年10月31日・11月1日の開催情報、企画、タイムテーブル、キャンパスマップ、アクセス情報をご案内します。",

  // 開催日程
  dates: {
    day1: "2026-10-31",
    day2: "2026-11-01",
  },

  // 開催時間
  openTime: "10:00",
  closeTime: "19:30",

  // 会場情報
  venue: "東京都市大学 世田谷キャンパス",
  address: "〒158-8557 東京都世田谷区玉堤1-28-1",

  // テーマカラー（--color-primary-400 の実配信値）
  //
  // NOTE: 現在この値はどこからも読まれていない。`export const viewport` も
  // <meta name="theme-color"> も存在しないため、ブラウザへは配信されていない。
  // 実際に出す場合は @theme の primary-400 と手で同期させること。
  themeColor: "#bf73e3",

  // SNS
  sns: {
    twitter: "https://x.com/setagayafes_tcu",
    instagram: "https://www.instagram.com/setagayafes_sfa/",
    youtube: "https://www.youtube.com/@setagayafes",
  },

  // 主催組織（構造化データと発行者情報で共通利用）
  organization: {
    name: "東京都市大学 世田谷祭実行委員会",
    currentName: "第97回東京都市大学世田谷祭実行委員会",
  },

  // メタデータ
  metadata: {
    siteName: "第97回東京都市大学世田谷祭",
    searchSiteName: "世田谷祭",
    siteUrl: process.env.NEXT_PUBLIC_URL || "https://setagayafes.org",
    ogImage: "/ogp-v3.webp",
    searchThumbnail: "/images/brand/search-thumbnail-97.webp",
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
