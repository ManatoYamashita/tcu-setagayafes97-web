"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Globe, ChevronDown, Check } from "lucide-react";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";

/**
 * 言語情報の定義
 */
const languages: { code: Locale; label: string; flag: string }[] = [
  { code: "ja", label: "日本語", flag: "JP" },
  { code: "en", label: "English", flag: "US" },
  { code: "zh", label: "简体中文", flag: "CN" },
  { code: "ko", label: "한국어", flag: "KR" },
];

/**
 * 言語切替コンポーネント
 *
 * - ドロップダウン形式で言語を選択
 * - 現在のパスを維持したまま言語を切り替え
 * - アクセシビリティ対応（キーボード操作、ARIAラベル）
 */
export function LanguageSwitcher() {
  const locale = useLocale();
  const t = useTranslations("languageSwitcher");
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 現在の言語情報を取得
  const currentLanguage = languages.find((lang) => lang.code === locale) || languages[0];

  // 言語切替ハンドラ
  const handleLanguageChange = (newLocale: Locale) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  // クリック外でドロップダウンを閉じる
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // キーボード操作
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      setIsOpen(!isOpen);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* トリガーボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition-all hover:border-primary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={t("label")}
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">{currentLanguage.label}</span>
        <span className="sm:hidden">{currentLanguage.flag}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className="absolute right-0 z-50 mt-2 w-48 origin-top-right rounded-lg border border-gray-200 bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
          role="listbox"
          aria-label={t("label")}
        >
          {languages.map((language) => {
            const isSelected = language.code === locale;
            return (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors ${
                  isSelected ? "bg-primary/10 text-primary" : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span className="flex items-center gap-3">
                  <span className="text-base">{language.flag}</span>
                  <span>{language.label}</span>
                </span>
                {isSelected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
