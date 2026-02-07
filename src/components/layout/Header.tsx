"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { siteConfig } from "@/data/site";
import { LanguageSwitcherWrapper } from "@/components/layout/LanguageSwitcherWrapper";
import { DesktopNav } from "@/components/layout/DesktopNav";
import { MobileMenu } from "@/components/layout/MobileMenu";

/**
 * 共通ヘッダーコンポーネント
 *
 * - 全ページで表示される共通ヘッダー
 * - デスクトップ: ロゴ + ナビゲーション + 言語切り替え
 * - モバイル: ロゴ + 言語切り替え + ハンバーガーメニュー
 * - sticky top-0 で固定表示
 *
 * IMPORTANT: padding変更時は globals.css の --header-height も更新すること
 * 現在: py-4 (1rem × 2) + 内容物約32px = 64px (4rem)
 */
export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-white shadow-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          {/* 左: ロゴ */}
          <Link href="/" className="text-2xl font-bold text-primary">
            {siteConfig.shortName}
          </Link>

          {/* 中央: デスクトップナビ */}
          <DesktopNav />

          {/* 右: 言語切り替え + モバイルメニューボタン */}
          <div className="flex items-center gap-4">
            <LanguageSwitcherWrapper />
            <button
              className="rounded-lg p-2 transition-colors hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 md:hidden"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="メニューを開く"
            >
              <Menu className="h-6 w-6 text-gray-700" />
            </button>
          </div>
        </div>
      </header>

      {/* モバイルメニュー */}
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
    </>
  );
}
