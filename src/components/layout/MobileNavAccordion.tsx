"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";

interface NavItem {
  readonly label: string;
  readonly href: string;
  readonly children?: readonly { readonly label: string; readonly href: string }[];
}

interface MobileNavAccordionProps {
  item: NavItem;
  onNavigate: () => void;
}

/**
 * モバイル用アコーディオンナビゲーションコンポーネント
 *
 * - children がない場合: 通常リンク
 * - children がある場合: アコーディオン形式で展開
 * - リンククリックで onNavigate() を呼び出し、メニューをクローズ
 */
export function MobileNavAccordion({ item, onNavigate }: MobileNavAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  // children がない場合は通常リンク
  if (!item.children) {
    return (
      <Link
        href={item.href}
        onClick={onNavigate}
        className="block py-3 text-white/80 transition-colors hover:text-white"
      >
        {item.label}
      </Link>
    );
  }

  // children がある場合はアコーディオン
  return (
    <div className="border-b border-white/20 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-white/80 transition-colors hover:text-white"
        aria-expanded={isOpen}
      >
        <span className="font-medium">{item.label}</span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      <div
        className={`overflow-hidden transition-all duration-300 ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="pl-4 pt-2">
          {item.children.map((child) => (
            <Link
              key={child.href}
              href={child.href}
              onClick={onNavigate}
              className="block py-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
