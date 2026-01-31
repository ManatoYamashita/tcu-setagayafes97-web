import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * 開催日
 */
export type EventDate = "day1" | "day2" | "both" | "other";

/**
 * 企画種別
 */
export type EventType = "room" | "stage" | "special" | "other";

/**
 * SNS情報
 */
export interface SNSLinks {
  twitter?: string;
  instagram?: string;
  website?: string;
}

/**
 * microCMSから返される生のEvent型
 * dateとtypeフィールドが配列形式で返される可能性がある
 */
export interface RawEvent {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド（microCMSの生データ）
  date: string[] | string;
  type: string[] | string;
  place: string;
  building: string;
  title: string;
  organizer: string;
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
  startTime?: string;
  endTime?: string;
  sns?: string; // microCMSでは単一の文字列で返される可能性がある
}

/**
 * 企画（Events API）
 * アプリケーション内で使用する正規化された型
 */
export interface Event {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド
  date: EventDate;
  type: EventType;
  place: string; // 場所（教室番号等）
  building: string; // 建物名
  title: string;
  organizer: string; // 主催団体名
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
  startTime?: string; // 開始時刻（HH:mm形式）
  endTime?: string; // 終了時刻（HH:mm形式）
  sns?: SNSLinks;
}

/**
 * 企画一覧のレスポンス型（microCMS生データ）
 */
export type RawEventListResponse = MicroCMSListResponse<RawEvent>;

/**
 * 企画一覧のレスポンス型（正規化済み）
 */
export type EventListResponse = MicroCMSListResponse<Event>;
