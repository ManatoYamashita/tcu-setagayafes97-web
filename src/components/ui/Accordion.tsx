import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { AccordionProps } from "@/types/accordion";

/**
 * Accordionコンポーネント
 *
 * ネイティブの `<details>` / `<summary>` で作る。開閉・キーボード操作（Enter / Space）・
 * 閉じた内容の非表示・ページ内検索（Ctrl+F）での自動展開はブラウザが担うため、
 * 状態・ARIA 属性・キー処理は持たない。
 *
 * - 複数を同時に開けるよう、排他用の `name` 属性は付けない
 * - 内容の高さに上限を付けないこと。かつて `max-h-screen` ＋ `overflow-hidden` で
 *   画面より高い回答が途中で切れていた
 * - `key` は必ず `item.id` にする。位置（index）だと、絞り込みで並びが変わったとき
 *   開いた状態が別の項目へ移る
 *
 * FAQページで使用。
 */
export function Accordion({ items, className }: AccordionProps) {
  return (
    <div className={cn("divide-y divide-gray-200 border-y border-gray-200", className)}>
      {items.map((item) => (
        <details key={item.id} open={item.defaultOpen} className="group">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-left hoverable:hover:text-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 [&::-webkit-details-marker]:hidden">
            <span className="text-base font-semibold text-gray-900 md:text-lg">{item.title}</span>
            <ChevronDown
              aria-hidden="true"
              className="h-5 w-5 flex-shrink-0 text-gray-600 group-open:rotate-180"
            />
          </summary>
          <p className="whitespace-pre-wrap pb-5 leading-8 text-gray-700">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
