import en from "@/messages/chrome/en.json";
import ja from "@/messages/chrome/ja.json";
import ko from "@/messages/chrome/ko.json";
import zh from "@/messages/chrome/zh.json";
import type { Locale } from "@/i18n/routing";

/**
 * ヘッダー・フッターの文言辞書
 *
 * Header / Footer は NextIntlClientProvider の子孫ではないため `useTranslations`
 * を呼べない。next-intl を経由せず素の TypeScript として引く。
 *
 * ページ本文（`src/messages/<locale>.json`）は含めない。全ページに出る Header の
 * バンドルへ約29KB を載せることになるうえ、多言語ページでは Provider の RSC
 * ペイロードと二重になる。
 *
 * @see src/i18n/request.ts — サーバー側では両者をマージして Provider へ渡す
 */
export type ChromeMessages = typeof ja;

export type NavigationLabelKey = keyof ChromeMessages["navigation"];

/** フッターのセクション見出しキー。copyright は見出しではないため除く */
export type FooterSectionKey = Exclude<keyof ChromeMessages["footer"], "copyright">;

/**
 * この型注釈が en / zh / ko のキー欠落をコンパイル時に落とす。
 * 余剰キーは検出しないため、完全一致は docs の検証スクリプトで担保する。
 */
const CHROME_MESSAGES: Record<Locale, ChromeMessages> = { ja, en, zh, ko };

export function getChromeMessages(locale: Locale): ChromeMessages {
  return CHROME_MESSAGES[locale] ?? CHROME_MESSAGES.ja;
}
