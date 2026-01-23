"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type {
  AccordionItem as AccordionItemType,
  AccordionItemProps,
  AccordionProps,
} from "@/types/accordion";

/**
 * 個別のアコーディオンアイテムコンポーネント
 * クリックまたはキーボード操作（Enter/Space）で開閉可能
 */
function AccordionItem({ item, index }: AccordionItemProps) {
  const [isOpen, setIsOpen] = useState(item.defaultOpen ?? false);

  // キーボード操作のハンドラー
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
      {/* アコーディオンのヘッダー部分 */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-expanded={isOpen}
        aria-controls={`accordion-content-${index}`}
        className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-gray-50"
      >
        <span className="text-base font-semibold text-gray-900 md:text-lg">{item.title}</span>
        <ChevronDown
          className={cn(
            "h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* アコーディオンのコンテンツ部分 */}
      <div
        id={`accordion-content-${index}`}
        className={cn(
          "overflow-hidden transition-all duration-300",
          isOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="border-t border-gray-200 p-4">
          <p className="whitespace-pre-wrap text-sm text-gray-700 md:text-base">{item.content}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Accordionコンポーネント
 * 複数のアコーディオンアイテムを表示
 * FAQページなどで使用
 */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => (
        <AccordionItem key={index} item={item} index={index} />
      ))}
    </div>
  );
}
