"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { Accordion } from "@/components/ui/Accordion";
import type { Information } from "@/types/informations";
import type { AccordionItem } from "@/types/accordion";

interface FAQContentProps {
  initialFAQ: Information[];
}

type FAQFilter = "all" | "visit" | "event" | "facility" | "other";

interface FAQFilterDef {
  key: FAQFilter;
  label: string;
  keywords: string[];
}

/**
 * FAQのサブカテゴリ分類定義
 * タイトル・descriptionのキーワードで自動分類
 */
const FAQ_FILTERS: FAQFilterDef[] = [
  {
    key: "visit",
    label: "来場",
    keywords: ["入場", "アクセス", "駅", "車", "駐車", "雨天", "ペット", "開催日", "開催"],
  },
  {
    key: "event",
    label: "企画",
    keywords: ["企画", "ステージ", "タイムテーブル", "出展", "参加", "申し込み"],
  },
  {
    key: "facility",
    label: "会場・施設",
    keywords: ["トイレ", "授乳", "キャンパス", "建物", "落とし物", "忘れ物", "本部"],
  },
];

/**
 * FAQアイテムのサブカテゴリを判定
 */
function classifyFAQ(faq: Information): FAQFilter {
  const text = `${faq.title} ${faq.description || ""}`;
  for (const filter of FAQ_FILTERS) {
    if (filter.keywords.some((kw) => text.includes(kw))) {
      return filter.key;
    }
  }
  return "other";
}

/**
 * FAQコンテンツコンポーネント
 * キーワード検索 + カテゴリフィルター + アコーディオン表示
 */
export function FAQContent({ initialFAQ }: FAQContentProps) {
  const [activeFilter, setActiveFilter] = useState<FAQFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // FAQ にサブカテゴリを付与
  const classifiedFAQ = useMemo(
    () => initialFAQ.map((faq) => ({ ...faq, subCategory: classifyFAQ(faq) })),
    [initialFAQ]
  );

  // フィルタリング + 検索
  const filteredFAQ = useMemo(() => {
    let result = classifiedFAQ;

    // カテゴリフィルター
    if (activeFilter !== "all") {
      result = result.filter((faq) => faq.subCategory === activeFilter);
    }

    // キーワード検索
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      result = result.filter(
        (faq) =>
          faq.title.toLowerCase().includes(query) ||
          (faq.description || "").toLowerCase().includes(query)
      );
    }

    return result;
  }, [classifiedFAQ, activeFilter, searchQuery]);

  // カテゴリ別件数
  const categoryCounts = useMemo(() => {
    const counts: Record<FAQFilter, number> = {
      all: classifiedFAQ.length,
      visit: 0,
      event: 0,
      facility: 0,
      other: 0,
    };
    for (const faq of classifiedFAQ) {
      counts[faq.subCategory]++;
    }
    return counts;
  }, [classifiedFAQ]);

  // AccordionItem 形式に変換
  const accordionItems: AccordionItem[] = filteredFAQ.map((faq) => ({
    title: faq.title,
    content: faq.description || "",
    defaultOpen: false,
  }));

  return (
    <div className="mx-auto max-w-4xl">
      {/* 検索バー */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="キーワードで質問を検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-400 transition-colors focus:border-purple-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-100"
        />
      </div>

      {/* フィルターボタン群 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <FilterButton
          label="すべて"
          isActive={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          count={categoryCounts.all}
        />
        {FAQ_FILTERS.map((filter) => (
          <FilterButton
            key={filter.key}
            label={filter.label}
            isActive={activeFilter === filter.key}
            onClick={() => setActiveFilter(filter.key)}
            count={categoryCounts[filter.key]}
          />
        ))}
        <FilterButton
          label="その他"
          isActive={activeFilter === "other"}
          onClick={() => setActiveFilter("other")}
          count={categoryCounts.other}
        />
      </div>

      {/* 件数表示 */}
      <div className="mb-6">
        <p className="text-sm text-gray-900/80">
          <span className="font-semibold text-gray-900">{filteredFAQ.length}</span>{" "}
          件の質問があります
        </p>
      </div>

      {/* FAQ一覧（アコーディオン） */}
      {filteredFAQ.length > 0 ? (
        <Accordion items={accordionItems} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
          <MessageCircleQuestion className="mx-auto mb-4 h-12 w-12 text-gray-300" />
          <p className="text-gray-500">該当する質問が見つかりませんでした</p>
          <p className="mt-2 text-sm text-gray-400">別のキーワードやフィルターをお試しください</p>
        </div>
      )}

      {/* お問い合わせ誘導バナー */}
      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-bold text-gray-900">お探しの質問が見つかりませんか？</h3>
            <p className="mt-1 text-sm text-gray-600">
              お気軽にお問い合わせフォームからご質問ください。担当者が回答いたします。
            </p>
          </div>
          <Link
            href="/about/contact"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary/90"
          >
            お問い合わせ
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * フィルターボタンコンポーネント
 */
interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  count: number;
}

function FilterButton({ label, isActive, onClick, count }: FilterButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all ${
        isActive
          ? "border-gray-200 bg-white text-primary shadow-md"
          : "border-gray-200/30 bg-white/10 text-gray-900/90 hover:border-gray-200 hover:bg-white/10"
      }`}
    >
      {label} <span className="ml-1 opacity-75">({count})</span>
    </button>
  );
}
