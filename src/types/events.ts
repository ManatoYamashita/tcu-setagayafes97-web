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
 * 企画（Events API）
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
 * 企画一覧のレスポンス型
 */
export type EventListResponse = MicroCMSListResponse<Event>;
