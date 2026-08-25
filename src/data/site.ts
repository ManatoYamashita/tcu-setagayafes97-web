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
  closeTime: "19:30",

  // 会場情報
  venue: "東京都市大学 世田谷キャンパス",
  address: "〒158-8557 東京都世田谷区玉堤1-28-1",

  // テーマカラー
  themeColor: "#CD79EE",

  // SNS
  sns: {
    twitter: "https://x.com/setagayafes_tcu?s=11",
    instagram: "https://www.instagram.com/setagayafes_sfa?igsh=bWpzYWpqOGozZ3Nr&utm_source=qr",
    youtube: "https://youtube.com/@setagayafes?si=WvB8ya5RrqvHg0Vj",
  },

  // メタデータ
  metadata: {
    siteName: "東京都市大学 第97回 世田谷祭",
    siteUrl: process.env.NEXT_PUBLIC_URL || "https://setagayafes.org",
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
 * お知らせ情報の公開フラグ
 * 環境変数 NEXT_PUBLIC_NEWS_VISIBLE を "true" に設定して再デプロイすると公開される
 * （Vercel の環境変数 or .env.local。ビルド時に評価されるため変更には再ビルドが必要）。
 * 未設定・"true" 以外はすべて非公開（安全側デフォルト）。
 * false の間は /info・トップの News セクション・お知らせ詳細ページ・
 * サイトマップのお知らせ詳細URLがすべて非公開（準備中表示 / 404）になり、
 * microCMS へのお知らせ系フェッチも行われない。
 */
export const NEWS_VISIBLE: boolean = process.env.NEXT_PUBLIC_NEWS_VISIBLE === "true";

/**
 * 著名人企画（type = special）の公開フラグ
 * 環境変数 NEXT_PUBLIC_SPECIAL_VISIBLE を "true" に設定して再デプロイすると公開される。
 * 未設定・"true" 以外はすべて非公開（安全側デフォルト）。
 *
 * EVENTS_VISIBLE とは独立して評価される。著名人の発表はチケット販売と紐づき、
 * 一般企画一覧の公開より先行することがあるため、両者を別のフラグにしている。
 *
 * | EVENTS_VISIBLE | SPECIAL_VISIBLE | 挙動                                          |
 * | -------------- | --------------- | --------------------------------------------- |
 * | false          | false           | すべて準備中                                  |
 * | false          | true            | /special のみ公開。/events・/timetable は準備中 |
 * | true           | false           | /events・/timetable は公開。type=special は除外 |
 * | true           | true            | すべて公開                                    |
 *
 * IMPORTANT: 著名人は解禁日が契約で決まっていることが多く、URL の先行露出が事故になる。
 * microCMS 側を下書きにするだけで済ませず、必ずこのフラグでも塞ぐこと。
 */
export const SPECIAL_VISIBLE: boolean = process.env.NEXT_PUBLIC_SPECIAL_VISIBLE === "true";

/**
 * 著名人企画の物販表示フラグ
 * 環境変数 NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE を "true" に設定した場合のみ、
 * /special/[id] の物販情報を表示する。未設定・それ以外は非表示。
 * SPECIAL_VISIBLE とは独立しており、プロフィール・出演情報・チケット等は維持する。
 */
export const SPECIAL_GOODS_VISIBLE: boolean =
  process.env.NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE === "true";
