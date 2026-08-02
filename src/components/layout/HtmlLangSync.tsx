"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { splitLocalePrefix } from "@/i18n/localized-pathnames";

/**
 * `<html lang>` を現在のロケールへ同期する。
 *
 * ルートレイアウトは `<html>` を持つがロケールを知らない。`headers()` から
 * `X-NEXT-INTL-LOCALE` を読む方法もあるが、ルートレイアウトで `headers()` を
 * 呼ぶとサイト全体が動的レンダリングへ落ちる（実測でトップ・企画・タイムテーブル
 * を含む全ページが Static から Dynamic になった）。Vercel Free Plan の帯域と
 * 実行時間の制約上それは選べないため、クライアント側で属性を同期する。
 *
 * 初期HTMLは `lang="ja"` のままなので、JavaScriptを実行しないクローラ向けには
 * `src/app/[locale]/layout.tsx` が要素レベルの `lang` で言語範囲を宣言している。
 * こちらはブラウザの翻訳UIやJSを実行するクローラのための補完。
 */
export function HtmlLangSync() {
  const pathname = usePathname();
  const { locale } = splitLocalePrefix(pathname);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}
