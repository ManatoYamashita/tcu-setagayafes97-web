"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * シンプルな言語切り替えコンポーネント
 *
 * 表示形式: JP / EN / ZH / KO （シンプルテキストリンク）
 * [locale] ルート配下（/en, /zh, /ko, /ja で始まるパス）の場合のみ表示
 */
export function LanguageSwitcherWrapper() {
  const [currentLocale, setCurrentLocale] = useState<string | null>(null);

  useEffect(() => {
    const pathname = window.location.pathname;
    const localeMatch = pathname.match(/^\/(ja|en|zh|ko)/);

    if (localeMatch) {
      setCurrentLocale(localeMatch[1]);
    }
  }, []);

  // next-intl コンテキストがない場合は何も表示しない
  if (!currentLocale) {
    return null;
  }

  const locales = [
    { code: "ja", label: "JP" },
    { code: "en", label: "EN" },
    { code: "zh", label: "ZH" },
    { code: "ko", label: "KO" },
  ];

  return (
    <div className="flex items-center gap-2 text-sm font-medium">
      {locales.map((locale, index) => (
        <div key={locale.code} className="flex items-center gap-2">
          <Link
            href={`/${locale.code}`}
            className={
              currentLocale === locale.code
                ? "text-primary font-bold"
                : "text-gray-700 hover:text-primary transition-colors"
            }
          >
            {locale.label}
          </Link>
          {index < locales.length - 1 && <span className="text-gray-400">/</span>}
        </div>
      ))}
    </div>
  );
}
