import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * お知らせの種類
 */
export type NewsType = "urgent" | "news" | "other";

/**
 * microCMSから返される生のNews型
 * typeフィールドが配列形式で返される可能性がある
 */
export interface RawNews {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド（microCMSの生データ）
  type: string[] | string;
  title: string;
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
}

/**
 * お知らせ（News API）
 * アプリケーション内で使用する正規化された型
 */
export interface News {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド
  type: NewsType;
  title: string;
  thumbnail?: MicroCMSImage;
  description: string;
  content: string;
}

/**
 * お知らせ一覧のレスポンス型（microCMS生データ）
 */
export type RawNewsListResponse = MicroCMSListResponse<RawNews>;

/**
 * お知らせ一覧のレスポンス型（正規化済み）
 */
export type NewsListResponse = MicroCMSListResponse<News>;
