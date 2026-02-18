"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { navigationConfig } from "@/data/navigation";
import { LanguageSwitcherWrapper } from "@/components/layout/LanguageSwitcherWrapper";
import { MobileNavAccordion } from "@/components/layout/MobileNavAccordion";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * モバイルメニューコンポーネント
 *
 * - 右からスライドインするメニュー
 * - オーバーレイ背景（クリックで閉じる）
 * - スクロールロック（メニュー開いている間）
 * - Escapeキーでクローズ
 */
export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escapeキーでクローズ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <>
      {/* オーバーレイ */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 ${
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* スライドインメニュー */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-[280px] transform bg-white border-l border-gray-200 ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* ヘッダー */}
        <div className="flex items-center justify-between border-b border-gray-200 p-4">
          <span className="text-lg font-bold text-gray-800">MENU</span>
          <button
            onClick={onClose}
            aria-label="メニューを閉じる"
            className="rounded-lg p-1 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        {/* ナビゲーション */}
        <nav className="overflow-y-auto p-4" style={{ maxHeight: "calc(100vh - 140px)" }}>
          {navigationConfig.header.map((item) => (
            <MobileNavAccordion key={item.href} item={item} onNavigate={onClose} />
          ))}
        </nav>

        {/* 言語切り替え */}
        <div className="border-t border-gray-200 p-4">
          <LanguageSwitcherWrapper />
        </div>
      </div>
    </>
  );
}
