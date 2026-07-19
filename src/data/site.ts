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
    facebook: "https://facebook.com/tcu.setagayafes",
  },

  // メタデータ
  metadata: {
    siteName: "東京都市大学 第97回 世田谷祭",
    siteUrl: process.env.NEXT_PUBLIC_URL || "https://setagayafes.tcu.ac.jp",
    ogImage: "/ogp.webp",
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

/**
 * 企画（イベント）情報の公開フラグ
 * 環境変数 NEXT_PUBLIC_EVENTS_VISIBLE を "true" に設定して再デプロイすると公開される
 * （Vercel の環境変数 or .env.local。ビルド時に評価されるため変更には再ビルドが必要）。
 * 未設定・"true" 以外はすべて非公開（安全側デフォルト）。
 * false の間は /events・/timetable・トップのおすすめ企画・企画詳細ページ・
 * サイトマップの企画詳細URLがすべて非公開（準備中表示 / 404）になり、
 * microCMS への企画系フェッチも行われない。
 */
export const EVENTS_VISIBLE: boolean = process.env.NEXT_PUBLIC_EVENTS_VISIBLE === "true";

/**
 * お知らせ一覧ページ（/info）の公開フラグ
 * 環境変数 NEXT_PUBLIC_NEWS_VISIBLE を "true" に設定して再デプロイすると公開される
 * （Vercel の環境変数 or .env.local。ビルド時に評価されるため変更には再ビルドが必要）。
 * 未設定・"true" 以外はすべて非公開（安全側デフォルト）。
 * false の間は /info 一覧のみ準備中表示になる。
 * ※ トップの News セクション・お知らせ詳細（/info/[id]）・サイトマップの
 *   お知らせURLは意図的な部分公開のため、このフラグの影響を受けない。
 */
export const NEWS_VISIBLE: boolean = process.env.NEXT_PUBLIC_NEWS_VISIBLE === "true";
