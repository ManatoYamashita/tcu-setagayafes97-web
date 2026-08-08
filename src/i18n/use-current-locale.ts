"use client";

import { usePathname } from "next/navigation";
import { splitLocalePrefix } from "@/i18n/localized-pathnames";
import type { Locale } from "@/i18n/routing";

/**
 * NextIntlClientProvider の外でロケールを解決する。
 *
 * next-intl の `useLocale` / `useTranslations` / `@/i18n/navigation` の `Link` は
 * 使えない。Header / Footer はルートレイアウト直下にあり、Provider を提供する
 * `[locale]/layout.tsx` の子孫ではないため、内部で `useLocale()` を呼ぶそれらの
 * API は実行時に例外を投げる。
 *
 * ルートレイアウトで `headers()` からロケールを読む案は採れない。呼んだ時点で
 * サイト全体が動的レンダリングへ落ちる（実測済み）。
 * @see docs/frontend/i18n-page-structure.md
 *
 * IMPORTANT: このファイルは `localized-pathnames.ts` とは別にしてある。
 * 同ファイルは `src/proxy.ts`（Edge ランタイム）が import しており、
 * `"use client"` と React 依存を持ち込むとミドルウェアのバンドルが壊れる。
 */
export function useCurrentLocale(): { locale: Locale; pathname: string } {
  // 静的生成時は "/ja/about"、ハイドレーション後は "/about" が渡る。
  // splitLocalePrefix を通さないと href が "/ja/..." で焼き付き、
  // クライアントとの不一致でハイドレーションエラーになる。
  return splitLocalePrefix(usePathname());
}
