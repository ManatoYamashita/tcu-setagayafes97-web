"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { LanguageSwitcherWrapper } from "@/components/layout/LanguageSwitcherWrapper";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileMenu } from "@/components/layout/MobileMenu";

/**
 * 共通ヘッダーコンポーネント（Glassmorphism デザイン）
 *
 * - 全ページで表示される共通ヘッダー
 * - デスクトップ: ロゴ + ナビゲーション + 言語切り替え
 * - モバイル: ロゴ + 言語切り替え + ハンバーガーメニュー
 * - sticky top-0 で固定表示
 * - スクロール前: 透明背景
 * - スクロール時: 半透明glass背景（backdrop-blur-md）
 *
 * IMPORTANT: padding変更時は globals.css の --header-height も更新すること
 * 現在: py-5 (1.25rem × 2) + 内容物約32px = 80px (5rem)
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // スクロール検知
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-secondary ${
          isScrolled ? "border-b border-gray-400/30" : "border-b border-gray-200/20"
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-6 py-5">
          {/* 左: ロゴ */}
          <Link href="/" className="text-3xl font-bold text-gray-900 hover:text-gray-700">
            {siteConfig.shortName}
          </Link>

          {/* 中央: デスクトップナビ */}
          <DesktopNav />

          {/* 右: 言語切り替え + モバイルメニューボタン */}
          <div className="flex items-center gap-4">
            <LanguageSwitcherWrapper />
            <button
              className="rounded-lg p-2 hover:bg-gray-900/10 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6 text-gray-900" />
            </button>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
