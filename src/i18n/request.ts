import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "./routing";

/**
 * next-intl リクエスト設定
 *
 * 動的にロケールを取得し、対応する翻訳メッセージをロードする。
 *
 * メッセージは2つに分かれている。
 * - `messages/<locale>.json`        ページ本文。Provider 経由でのみ参照される
 * - `messages/chrome/<locale>.json` ヘッダー・フッターの文言
 *
 * chrome 側を分けているのは、Header/Footer がルートレイアウト直下にあり
 * NextIntlClientProvider の子孫ではないため、クライアントから静的 import で
 * 読む必要があるから。ページ本文まで含めるとバンドルが無駄に膨らむ。
 * @see src/i18n/chrome-messages.ts
 */
export default getRequestConfig(async ({ requestLocale }) => {
  // requestLocale から現在のロケールを取得
  let locale = await requestLocale;

  // ロケールが未設定または無効な場合はデフォルトを使用
  if (!locale || !routing.locales.includes(locale as Locale)) {
    locale = routing.defaultLocale;
  }

  const [page, chrome] = await Promise.all([
    import(`../messages/${locale}.json`),
    import(`../messages/chrome/${locale}.json`),
  ]);

  // 名前空間は互いに素である前提の浅いマージ。深いマージにすると衝突が
  // 静かに握り潰されるうえ、リクエストごとの再帰コストがかかる。
  // 衝突すると片方の名前空間が丸ごと消えるため、開発時に明示的に落とす。
  if (process.env.NODE_ENV !== "production") {
    const duplicated = Object.keys(chrome.default).filter((key) => key in page.default);

    if (duplicated.length > 0) {
      console.error(
        `[i18n] messages/ と messages/chrome/ で名前空間が重複しています: ${duplicated.join(", ")}`
      );
    }
  }

  return {
    locale,
    messages: { ...chrome.default, ...page.default },
  };
});
