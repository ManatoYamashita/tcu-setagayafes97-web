"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import type { ChromeNavItem } from "@/components/layout/useChromeNav";

interface NavDropdownProps {
  item: ChromeNavItem;
}

/**
 * ドロップダウンナビゲーションコンポーネント
 *
 * デスクトップ用のドロップダウンメニュー
 * - ホバー: 300ms遅延後に開く
 * - クリック: 即座にトグル
 * - クリック外/Escape: 閉じる
 * - Escape で閉じたときはトリガーへフォーカスを戻す（パネル内のリンクから押しても）
 * - Enter / Space は `<button>` のネイティブな click に任せる
 */
export function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // ホバー時: 300ms後に開く
  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsOpen(true), 300);
  };

  // ホバー外れる: 200ms後に閉じる
  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => setIsOpen(false), 200);
  };

  // クリック: 即座にトグル
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(!isOpen);
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

  /*
   * Escape はトリガーではなく外側の div で受ける。パネル内のリンクにフォーカスが
   * あるときも閉じられるようにするため。閉じるとパネルが DOM から消えるので、
   * フォーカスを戻さないと <body> へ落ち、次の Tab がページ先頭からやり直しになる（#37）。
   *
   * Enter / Space は扱わない。<button> はどちらでもネイティブに click を発火するので、
   * ここで処理すると handleClick と二重にトグルする。
   */
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "Escape" || !isOpen) return;
    setIsOpen(false);
    triggerRef.current?.focus();
  };

  // コンポーネントのクリーンアップ時にタイマーをクリア
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onKeyDown={handleKeyDown}
      className="relative"
    >
      <button
        ref={triggerRef}
        type="button"
        onClick={handleClick}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 text-gray-900/80 transition-colors hover:text-gray-900 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-60 mt-2 min-w-[200px] rounded-lg border border-gray-200 bg-white py-2">
          {item.children?.map((child) => (
            // key は href ではなく id。href はロケールで変わるため
            <Link
              key={child.id}
              href={child.href}
              hrefLang={child.hrefLang}
              className="block px-4 py-2 text-sm text-gray-900/80 transition-colors hover:bg-gray-100 hover:text-gray-900 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-primary-600"
              onClick={() => setIsOpen(false)}
            >
              {child.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
