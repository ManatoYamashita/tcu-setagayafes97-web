import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

/**
 * next-intl リクエスト設定
 *
 * 動的にロケールを取得し、対応する翻訳メッセージをロードする
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale から現在のロケールを取得
  let locale = await requestLocale;

  // ロケールが未設定または無効な場合はデフォルトを使用
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
