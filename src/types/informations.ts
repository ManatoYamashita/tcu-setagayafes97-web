import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * 情報カテゴリ
 */
export type InformationCategory = "sponsor" | "faq" | "other";

/**
 * microCMSから返される生のInformation型
 * categoryフィールドが配列形式で返される可能性がある
 */
export interface RawInformation {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド（microCMSの生データ）
  category: string[] | string;
  title: string;

  // 協賛企業用フィールド
  sponsorName?: string;
  sponsorDescription?: string;
  logo?: MicroCMSImage;
  url?: string;
  priority?: number;

  // FAQ用フィールド
  question?: string;
  answer?: string;
}

/**
 * 汎用情報（Informations API）
 * 協賛企業、よくある質問など
 * アプリケーション内で使用する正規化された型
 */
export interface Information {
  id: string;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  revisedAt?: string;

  // カスタムフィールド
  category: InformationCategory;
  title: string;

  // 協賛企業用フィールド
  sponsorName?: string;
  sponsorDescription?: string;
  logo?: MicroCMSImage;
  url?: string;
  priority?: number; // 表示優先度（数値が大きいほど優先）

  // FAQ用フィールド
  question?: string;
  answer?: string;
}

/**
 * 汎用情報一覧のレスポンス型（microCMS生データ）
 */
export type RawInformationListResponse = MicroCMSListResponse<RawInformation>;

/**
 * 汎用情報一覧のレスポンス型（正規化済み）
 */
export type InformationListResponse = MicroCMSListResponse<Information>;
