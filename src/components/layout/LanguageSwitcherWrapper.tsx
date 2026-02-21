"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * シンプルな言語切り替えコンポーネント
 *
 * 表示形式: JP / EN / ZH / KO （シンプルテキストリンク）
 * [locale] ルート配下（/en, /zh, /ko, /ja で始まるパス）の場合のみ表示
 */
export function LanguageSwitcherWrapper() {
  const pathname = usePathname();
  const localeMatch = pathname.match(/^\/(ja|en|zh|ko)/);

  if (!localeMatch) {
    return null;
  }

  const currentLocale = localeMatch[1];

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
                ? "text-gray-900 font-bold"
                : "text-gray-900/70 hover:text-gray-900 transition-colors"
            }
          >
            {locale.label}
          </Link>
          {index < locales.length - 1 && <span className="text-gray-900/50">/</span>}
        </div>
      ))}
    </div>
  );
}
