import { isLocalizedPathname } from "./localized-pathnames";
import { routing, type Locale } from "./routing";

/**
 * ヘッダー・フッターのリンクをどの言語版へ向けるかを決める
 *
 * 言語の出典は URL だけなので（`localeCookie: false`）、日本語専用ページの URL からは
 * 来場者が選んだ言語が分からない。そこから先のリンクがすべて日本語版になり、
 * 多言語版がある `/access` へ戻っても日本語のままになる（#441）。
 * そこで、外国語を選んだ来場者が日本語専用ページにいる間だけ、記憶した言語を使う。
 *
 * - URL が外国語 → URL の言語（記憶より URL を優先する）
 * - 多言語版がある日本語ページ（`/access` など） → 日本語。日本語を選んだ結果としてここにいる
 * - 日本語専用ページ（`/events` など） → 記憶した言語。記憶が無ければ日本語
 */
export function resolveNavLinkLocale(
  urlLocale: Locale,
  pathname: string,
  preferredLocale: Locale | null
): Locale {
  if (urlLocale !== routing.defaultLocale) return urlLocale;
  if (isLocalizedPathname(pathname)) return routing.defaultLocale;
  return preferredLocale ?? routing.defaultLocale;
}

/**
 * 現在地から、記憶をどう更新するかを決める
 *
 * - `Locale`: その言語を記憶する（外国語のページにいる）
 * - `null`: 記憶を消す（多言語版がある日本語ページにいる＝日本語を選んでいる）
 * - `undefined`: 何もしない（日本語専用ページ。来場者の選択とは無関係に日本語で出ている）
 */
export function nextPreferredLocale(
  urlLocale: Locale,
  pathname: string
): Locale | null | undefined {
  if (urlLocale !== routing.defaultLocale) return urlLocale;
  if (isLocalizedPathname(pathname)) return null;
  return undefined;
}
