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
        className="block py-3 text-gray-900/80 transition-colors hover:text-gray-900"
      >
        {item.label}
      </Link>
    );
  }

  // children がある場合はアコーディオン
  return (
    <div className="border-b border-gray-200/20 py-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-2 text-left text-gray-900/80 transition-colors hover:text-gray-900"
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
              className="block py-2 text-sm text-gray-900/70 transition-colors hover:text-gray-900"
            >
              {child.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
