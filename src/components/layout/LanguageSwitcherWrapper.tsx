"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// LanguageSwitcher を dynamic import で遅延ロード（SSR無効化）
const LanguageSwitcher = dynamic(
  () => import("@/components/layout/LanguageSwitcher").then((mod) => mod.LanguageSwitcher),
  {
    ssr: false,
    loading: () => null,
  }
);

/**
 * LanguageSwitcher のラッパーコンポーネント
 *
 * next-intl のコンテキストがある場合のみ LanguageSwitcher を表示
 * コンテキストがない場合（ルートページ等）は何も表示しない
 *
 * [locale] ルート配下（/en, /zh, /ko, /ja で始まるパス）の場合のみ表示
 */
export function LanguageSwitcherWrapper() {
  const [shouldShow, setShouldShow] = useState(false);

  useEffect(() => {
    // クライアントサイドで pathname をチェック
    const pathname = window.location.pathname;
    const hasLocaleInPath =
      pathname.startsWith("/en") ||
      pathname.startsWith("/zh") ||
      pathname.startsWith("/ko") ||
      pathname.startsWith("/ja");

    setShouldShow(hasLocaleInPath);
  }, []);

  // next-intl コンテキストがない場合は何も表示しない
  if (!shouldShow) {
    return null;
  }

  return <LanguageSwitcher />;
}
