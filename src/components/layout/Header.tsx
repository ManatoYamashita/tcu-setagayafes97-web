"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { LanguageSwitcherWrapper } from "@/components/layout/LanguageSwitcherWrapper";
import { DesktopNav } from "@/components/layout/DesktopNav";
import dynamic from "next/dynamic";
const StaggeredMobileMenu = dynamic(
  () => import("@/components/layout/StaggeredMobileMenu").then((m) => m.StaggeredMobileMenu),
  { ssr: false }
);
import { LogoVideo } from "@/components/home/LogoVideo";

/**
 * 共通ヘッダーコンポーネント（ピル型白背景デザイン）
 *
 * - 全ページで表示される共通ヘッダー
 * - デスクトップ (>=lg): ロゴ + ナビゲーション + 言語切り替え
 * - モバイル (<lg): ロゴ + 言語切り替え + ハンバーガーボタン
 * - sticky top-0 で固定表示、rounded-full ピル型
 *
 * IMPORTANT: padding変更時は globals.css の --header-height も更新すること
 * 現在: pt-2 + py-3×2 + ロゴ高さ約56px = 5.5rem
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // HeroSection可視判定（ホームページのみ）
  useEffect(() => {
    if (pathname !== "/") return;

    const heroEl = document.getElementById("hero-section");
    if (!heroEl) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHeroVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(heroEl);
    return () => observer.disconnect();
  }, [pathname]);

  const shouldHide = pathname === "/" && isHeroVisible;

  const handleCloseMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 px-4 pt-2 transition-[transform,opacity] duration-300 ${
          shouldHide ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between rounded-full bg-white px-6 py-3 shadow-md">
          {/* 左: ロゴ */}
          <Link href="/" className="hover:opacity-80" aria-label={siteConfig.shortName}>
            <LogoVideo className="w-28" />
          </Link>

          {/* 中央: デスクトップナビ */}
          <DesktopNav />

          {/* 右: 言語切り替え + ハンバーガー */}
          <div className="flex items-center gap-3">
            <LanguageSwitcherWrapper />
            <button
              className="inline-flex items-center justify-center rounded-full p-2 text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900 lg:hidden"
              aria-label="メニューを開く"
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
      <StaggeredMobileMenu isOpen={isMobileMenuOpen} onClose={handleCloseMobileMenu} />
    </>
  );
}
