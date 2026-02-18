"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileMenu } from "@/components/layout/MobileMenu";

/**
 * スクロール対応ヘッダーコンポーネント
 *
 * - 初期状態: 透明背景 + 白文字（ダークHeroと一体化）
 * - スクロール後: 白背景 + 黒文字（backdrop-blur付き）
 * - sticky top-0 z-40
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`sticky top-0 z-40 transition-all duration-300 ${
        isScrolled ? "bg-white/90 shadow-sm backdrop-blur-sm" : "bg-transparent"
      }`}
      style={{ height: "var(--header-height)" }}
    >
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* ロゴ */}
        <Link
          href="/"
          className={`text-lg font-bold transition-colors ${
            isScrolled ? "text-gray-900 hover:text-primary" : "text-white hover:text-white/80"
          }`}
        >
          {siteConfig.shortName}
        </Link>

        {/* デスクトップナビ */}
        <DesktopNav isScrolled={isScrolled} />

        {/* ハンバーガーボタン（モバイル） */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          aria-label="メニューを開く"
          className={`rounded-lg p-2 transition-colors md:hidden ${
            isScrolled ? "text-gray-700 hover:bg-gray-100" : "text-white hover:bg-white/10"
          }`}
        >
          <Menu className="h-6 w-6" />
        </button>

        {/* モバイルメニュー */}
        <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
      </div>
    </header>
  );
}
