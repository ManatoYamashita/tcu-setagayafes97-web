"use client";

import { Globe } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { languageOptions } from "@/data/navigation";
import {
  buildLocaleHref,
  isLocalizedPathname,
  LOCALE_FALLBACK_PATHNAME,
} from "@/i18n/localized-pathnames";
import type { Locale } from "@/i18n/routing";
import { useCurrentLocale } from "@/i18n/use-current-locale";

const focusRing =
  "focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

interface LanguageLink {
  code: Locale;
  label: string;
  href: string;
  isCurrent: boolean;
  /** 多言語版が無いページから切り替えるとき、着地先のページ名を対象言語で示す */
  note?: string;
}

/**
 * 現在のパスを起点に、各言語版のリンクを組み立てる。
 *
 * ロケール解決は `useCurrentLocale()` に委ねる（Provider 外でロケールを得られない
 * 理由と、静的生成時とハイドレーション後でパスが食い違う話はそちらのコメント参照）。
 *
 * href の組み立ては `localizeNavHref()` を使わない。ナビゲーションは多言語版が
 * 無いページへ実在パスで直リンクするが、言語切替は着地先が無いと切替自体が
 * 成立しないため `LOCALE_FALLBACK_PATHNAME` へ倒す。この差は意図的なもの。
 */
function useLanguageLinks(): { current: LanguageLink; items: LanguageLink[] } {
  const { locale: currentLocale, pathname: basePathname } = useCurrentLocale();
  const isFallbackMode = !isLocalizedPathname(basePathname);
  const targetPathname = isFallbackMode ? LOCALE_FALLBACK_PATHNAME : basePathname;

  const items = languageOptions.map<LanguageLink>((option) => {
    const isCurrent = option.code === currentLocale;

    return {
      code: option.code,
      label: option.label,
      href: buildLocaleHref(isCurrent ? basePathname : targetPathname, option.code),
      isCurrent,
      note: isFallbackMode && !isCurrent ? option.fallbackLabel : undefined,
    };
  });

  return { current: items.find((item) => item.isCurrent) ?? items[0], items };
}

interface LanguageSwitcherProps {
  className?: string;
}

/**
 * 言語切替ドロップダウン（デスクトップ用）
 *
 * NavDropdown と同じ操作感（ホバー300msで開く / 200msで閉じる / クリックでトグル /
 * 外側クリック・Escapeで閉じる）を踏襲しつつ、以下を改善している。
 * - Escape で閉じたときトリガーへフォーカスを戻す
 * - パネルを right-0 に置く（ヘッダー右端では left-0 だと画面外へはみ出す）
 * - フォーカスリングを白背景でも視認できる指定にする
 */
export function LanguageSwitcher({ className }: LanguageSwitcherProps) {
  const { current, items } = useLanguageLinks();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handleMouseEnter = () => {
    clearTimer();
    timeoutRef.current = setTimeout(() => setIsOpen(true), 300);
  };

  const handleMouseLeave = () => {
    clearTimer();
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => clearTimer, []);

  return (
    <div
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !isOpen) return;
        setIsOpen(false);
        triggerRef.current?.focus();
      }}
      className={`relative ${className ?? ""}`}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-label="言語を選択 / Select language"
        onClick={() => {
          clearTimer();
          setIsOpen((open) => !open);
        }}
        className={`inline-flex min-h-11 items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold text-gray-900/80 transition-colors hover:bg-gray-100 hover:text-gray-900 ${focusRing}`}
      >
        <Globe aria-hidden="true" className="h-4 w-4" />
        <span lang={current.code}>{current.label}</span>
      </button>

      {isOpen && (
        <ul className="absolute right-0 top-full z-60 mt-2 min-w-[220px] rounded-lg border border-gray-200/20 bg-secondary py-2">
          {items.map((item) => (
            <li key={item.code}>
              <Link
                href={item.href}
                lang={item.code}
                hrefLang={item.code}
                aria-current={item.isCurrent ? "true" : undefined}
                onClick={() => setIsOpen(false)}
                className={`block px-4 py-2 text-sm transition-colors hover:bg-white/20 ${focusRing} ${
                  item.isCurrent ? "font-bold text-gray-900" : "text-gray-900/80"
                }`}
              >
                {item.label}
                {item.note && (
                  <span className="mt-0.5 block text-xs font-normal text-gray-900/60">
                    {item.note}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

interface LanguageSwitcherInlineProps {
  className?: string;
  onNavigate?: () => void;
}

/**
 * 言語切替ピル群（モバイルメニュー内）
 *
 * オーバーレイの中に入れ子のポップオーバーを作らず、その場で選べる形にする。
 * StaggeredMobileMenu の GSAP タイムラインが参照するクラス名
 * （sm-socials-title / sm-socials-link）は付けないこと。付けると SNS ブロックの
 * フェードイン対象を奪ってしまう。
 */
export function LanguageSwitcherInline({ className, onNavigate }: LanguageSwitcherInlineProps) {
  const { items } = useLanguageLinks();

  return (
    <nav aria-label="言語を選択 / Select language" className={className}>
      <ul className="flex flex-wrap gap-2">
        {items.map((item) => (
          <li key={item.code}>
            <Link
              href={item.href}
              lang={item.code}
              hrefLang={item.code}
              aria-current={item.isCurrent ? "true" : undefined}
              onClick={onNavigate}
              className={`inline-flex min-h-11 flex-col justify-center rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${focusRing} ${
                item.isCurrent
                  ? "border-transparent bg-primary-400 text-white"
                  : "border-gray-200/40 text-gray-900/80 hover:bg-white/20 hover:text-gray-900"
              }`}
            >
              {item.label}
              {item.note && (
                <span className="text-xs font-normal text-gray-900/60">{item.note}</span>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
