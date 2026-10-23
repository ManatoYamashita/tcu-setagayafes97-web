import { ExternalLink } from "lucide-react";
import type { Information } from "@/types/informations";

interface SpecialThanksListProps {
  /** Special Thanks（優先度順）。並べ替えず、1件も捨てない */
  people: Information[];
}

/**
 * Special Thanks の一覧（名前だけを文字で並べる。#476）
 *
 * 協賛・広告掲載のようなロゴのタイルにはしない。画像と説明は読まない。
 * URL があるものだけ外部リンクにする（リンクの作法は `SponsorList` の詳細パネルと同じ）。
 */
export function SpecialThanksList({ people }: SpecialThanksListProps) {
  return (
    <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-center">
      {people.map((person) => (
        <li
          key={person.id}
          className="font-semibold text-balance [overflow-wrap:anywhere] [word-break:auto-phrase] text-gray-900 md:text-lg"
        >
          {person.url ? (
            <a
              href={person.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 underline decoration-gray-400 underline-offset-4 hoverable:hover:text-primary-700 hoverable:hover:decoration-primary-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
            >
              {person.title}
              <ExternalLink className="size-4 shrink-0 text-gray-500" aria-hidden="true" />
              <span className="sr-only">（新しいタブで開きます）</span>
            </a>
          ) : (
            person.title
          )}
        </li>
      ))}
    </ul>
  );
}
