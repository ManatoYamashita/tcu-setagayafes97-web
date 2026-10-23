import type { MicroCMSImage, MicroCMSListResponse } from "microcms-js-sdk";

/**
 * 情報カテゴリ
 *
 * microCMS の `category`（select）の `値 : ラベル` の値部分と一致させる。
 * ad = 広告掲載、thanks = Special Thanks（#476）。
 * ここに無い値は `other` に丸められ、どのページにも出ない。
 */
export const informationCategories = ["sponsor", "faq", "ad", "thanks", "other"] as const;

export type InformationCategory = (typeof informationCategories)[number];

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

  // 汎用フィールド
  description?: string;
  image?: MicroCMSImage;
  url?: string;
  priority?: number;
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

  // 汎用フィールド
  description?: string;
  image?: MicroCMSImage;
  url?: string;
  priority?: number;
}

/**
 * 汎用情報一覧のレスポンス型（microCMS生データ）
 */
export type RawInformationListResponse = MicroCMSListResponse<RawInformation>;

/**
 * 汎用情報一覧のレスポンス型（正規化済み）
 */
export type InformationListResponse = MicroCMSListResponse<Information>;
