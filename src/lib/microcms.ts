import { createClient } from "microcms-js-sdk";

// 環境変数の検証
if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error("MICROCMS_SERVICE_DOMAIN is required");
}

if (!process.env.MICROCMS_API_KEY) {
  throw new Error("MICROCMS_API_KEY is required");
}

/**
 * microCMS クライアント
 */
export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.MICROCMS_API_KEY,
});

/**
 * microCMS のベース URL
 */
export const MICROCMS_BASE_URL = `https://${process.env.MICROCMS_SERVICE_DOMAIN}.microcms.io`;
