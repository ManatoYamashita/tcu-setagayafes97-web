import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * お知らせの種類
 */
export type NewsType = "urgent" | "news" | "other";

/**
 * お知らせ（News API）
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
 * お知らせ一覧のレスポンス型
 */
export type NewsListResponse = MicroCMSListResponse<News>;
