"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly { readonly label: string; readonly href: string }[];
}

interface NavDropdownProps {
  item: NavItem;
}

/**
 * ドロップダウンナビゲーションコンポーネント
 *
 * デスクトップ用のドロップダウンメニュー
 * - ホバー: 300ms遅延後に開く
 * - クリック: 即座にトグル
 * - クリック外/Escape: 閉じる
 * - アクセシビリティ対応（ARIA属性、キーボード操作）
 */
export function NavDropdown({ item }: NavDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // キーボード操作
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
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
      className="relative"
    >
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="flex items-center gap-1 text-white/80 transition-colors hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
      >
        {item.label}
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-60 mt-2 min-w-[200px] rounded-lg border border-white/20 bg-primary-dark py-2">
          {item.children?.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              className="block px-4 py-2 text-sm text-white/80 transition-colors hover:bg-white/10 hover:text-white"
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
