"use client";

import { useMemo } from "react";
import { navigationConfig } from "@/data/navigation";
import { getChromeMessages, type ChromeMessages } from "@/i18n/chrome-messages";
import { localizeNavHref, type LocalizedNavHref } from "@/i18n/localized-pathnames";
import type { Locale } from "@/i18n/routing";
import { useCurrentLocale } from "@/i18n/use-current-locale";

export interface ChromeLink extends LocalizedNavHref {
  /**
   * React の key に使う識別子。
   * href はロケールで変わる（/access ↔ /en/access）ため key には使えない。
   * key が変わるとノードが unmount され、GSAP が掴んでいる DOM が消える。
   */
  readonly id: string;
  readonly label: string;
}

export interface ChromeNavItem extends ChromeLink {
  readonly children?: readonly ChromeLink[];
}

export interface ChromeFooterSection {
  readonly id: string;
  readonly title: string;
  readonly links: readonly ChromeLink[];
}

export interface ChromeNav {
  readonly locale: Locale;
  /** ロゴのリンク先。`/` は多言語版が無いので常に接頭辞なし */
  readonly home: LocalizedNavHref;
  readonly headerItems: readonly ChromeNavItem[];
  readonly footerSections: readonly ChromeFooterSection[];
  /** aria-label など、ナビ項目に紐づかない単発の文言 */
  readonly messages: ChromeMessages;
}

/**
 * ナビゲーション構成を指定ロケールで解決する純関数。
 * フックから切り離してあるのはテストしやすさのため。
 */
export function buildChromeNav(locale: Locale): ChromeNav {
  const messages = getChromeMessages(locale);

  const toLink = (config: { labelKey: keyof ChromeMessages["navigation"]; href: string }) => ({
    id: config.labelKey,
    label: messages.navigation[config.labelKey],
    ...localizeNavHref(config.href, locale),
  });

  return {
    locale,
    home: localizeNavHref("/", locale),
    headerItems: navigationConfig.header.map((item) => ({
      ...toLink(item),
      ...("children" in item && item.children
        ? { children: item.children.map(toLink) }
        : undefined),
    })),
    footerSections: navigationConfig.footer.map((section) => ({
      id: section.titleKey,
      title: messages.footer[section.titleKey],
      links: section.links.map(toLink),
    })),
    messages,
  };
}

/**
 * ヘッダー・フッター用のロケール解決済みナビゲーション。
 *
 * Header がこのフックを1回だけ呼び、DesktopNav / StaggeredMobileMenu へは
 * props で流す。子でも呼ぶと usePathname() の購読と useMemo が二重になるうえ、
 * デスクトップとモバイルが同一の解決結果を共有することがコードから読み取れなくなる。
 * Footer はサーバーコンポーネントで props を渡せないため FooterNav が自前で呼ぶ。
 */
export function useChromeNav(): ChromeNav {
  const { locale } = useCurrentLocale();

  // 依存は pathname ではなく locale。Header はスクロールのたびに再レンダリング
  // する（isAtTop の useState）ため、これが無いと毎回オブジェクトを作り直して
  // 子の再レンダリングを誘発する。同一ロケール内の遷移でも参照を保てる。
  return useMemo(() => buildChromeNav(locale), [locale]);
}
