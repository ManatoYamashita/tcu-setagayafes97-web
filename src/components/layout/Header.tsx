"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useChromeNav } from "@/components/layout/useChromeNav";
import dynamic from "next/dynamic";
const StaggeredMobileMenu = dynamic(
  () => import("@/components/layout/StaggeredMobileMenu").then((m) => m.StaggeredMobileMenu),
  { ssr: false }
);
import { LogoVideo } from "@/components/home/LogoVideo";

/**
 * 共通ヘッダーコンポーネント（フラット⇔ピル型モーフィング）
 *
 * - 全ページで常時表示される共通ヘッダー
 * - デスクトップ (>=lg): ロゴ + ナビゲーション + 言語切り替え
 * - モバイル (<lg): ロゴ + ハンバーガーボタン（言語切り替えはメニューパネル内）
 * - 画面最上部: フラット（幅いっぱい・角丸なし・影なし）
 * - スクロール時: ピル型（container幅・rounded-full・shadow-md）
 *
 * IMPORTANT: padding変更時は globals.css の --header-height も更新すること
 */
export function Header() {
  const pathname = usePathname();
  const isAboutPage = pathname === "/about" || pathname.endsWith("/about");

  // ロケール解決はここで1回だけ行い、子へは props で流す。
  // 子でも呼ぶと usePathname() の購読と useMemo が二重になるうえ、
  // デスクトップナビとモバイルメニューが同じ結果を共有することが読み取れなくなる。
  const { home, headerItems, messages } = useChromeNav();

  const [isAtTop, setIsAtTop] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openerDone, setOpenerDone] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY;
      setIsAtTop((prev) => (prev ? y < 50 : y < 10));
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleOpenerDone = () => setOpenerDone(true);
    window.addEventListener("opener-done", handleOpenerDone);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("opener-done", handleOpenerDone);
    };
  }, []);

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isAtTop ? "px-0 pt-0" : "px-4 pt-2"
        }`}
        // viewTransitionName はページ遷移中にヘッダーを固定するための識別子。
        // globals.css の ::view-transition-group(site-header) と対になっている。
        style={{
          backgroundColor: isAtTop ? "var(--header-top-bg)" : "transparent",
          viewTransitionName: "site-header",
        }}
      >
        <div
          className={`flex items-center justify-between px-6 py-3 transition-all duration-300 ${
            isAtTop
              ? "rounded-none shadow-none"
              : "bg-white container mx-auto rounded-full shadow-md"
          }`}
        >
          {/* 左: ロゴ */}
          <Link
            href={home.href}
            hrefLang={home.hrefLang}
            className="hover:opacity-80"
            aria-label={siteConfig.shortName}
          >
            {isAboutPage ? (
              <Image
                src="/images/brand/logo.webp"
                alt="世田谷祭ロゴ"
                width={208}
                height={40}
                className={`h-auto object-contain transition-[width,opacity] duration-300 ${isAtTop ? "w-52" : "w-28"}`}
                priority
              />
            ) : (
              <LogoVideo
                className={`transition-[width,opacity] duration-300 ${openerDone ? (isAtTop ? "w-52" : "w-28") : "w-0 opacity-0"}`}
              />
            )}
          </Link>

          {/* 中央: デスクトップナビ */}
          <DesktopNav items={headerItems} />

          {/* 右: 言語切り替え + ハンバーガー */}
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden lg:block" />
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label={messages.header.openMenu}
              aria-expanded={isMobileMenuOpen}
              aria-controls="staggered-menu-panel"
              onClick={() => setIsMobileMenuOpen(true)}
              type="button"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* モバイルメニュー（StaggeredMenu: 外部制御） */}
      <StaggeredMobileMenu
        isOpen={isMobileMenuOpen}
        onClose={handleCloseMobileMenu}
        items={headerItems}
        closeLabel={messages.header.closeMenu}
      />
    </>
  );
}
