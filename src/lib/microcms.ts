import { createClient } from "microcms-js-sdk";

// モックデータモードのチェック
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

// モックデータモードでない場合のみ環境変数を検証
if (!USE_MOCK_DATA) {
  if (!process.env.MICROCMS_SERVICE_DOMAIN) {
    throw new Error("MICROCMS_SERVICE_DOMAIN is required");
  }

  if (!process.env.MICROCMS_API_KEY) {
    throw new Error("MICROCMS_API_KEY is required");
  }
}

/**
 * microCMS クライアント
 * モックデータモードの場合はダミーの値を使用
 */
export const client = USE_MOCK_DATA
  ? createClient({
      serviceDomain: "dummy",
      apiKey: "dummy",
    })
  : createClient({
      serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
      apiKey: process.env.MICROCMS_API_KEY!,
    });

/**
 * microCMS のベース URL
 */
export const MICROCMS_BASE_URL = USE_MOCK_DATA
  ? "https://dummy.microcms.io"
  : `https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io`;
