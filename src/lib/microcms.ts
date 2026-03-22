import { createClient } from "microcms-js-sdk";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN ?? "";
const apiKey = process.env.MICROCMS_API_KEY ?? "";

/**
 * microCMS の認証情報が設定されているか
 * CI等で未設定の場合、API呼び出しは空データを返す
 */
export const isMicrocmsConfigured = !!(serviceDomain && apiKey);

if (!isMicrocmsConfigured) {
  console.warn(
    "[microcms] MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。API呼び出しは空データを返します。"
  );
}

/**
 * microCMS クライアント
 */
export const client = createClient({
  serviceDomain: serviceDomain || "dummy",
  apiKey: apiKey || "dummy",
});

/**
 * microCMS のベース URL
 */
export const MICROCMS_BASE_URL = serviceDomain ? `https://${serviceDomain}.microcms.io` : "";
