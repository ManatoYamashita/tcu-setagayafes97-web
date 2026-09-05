"use client";

import { useState, useMemo } from "react";
import { Search, MessageCircleQuestion, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Accordion } from "@/components/ui/Accordion";
import { Link } from "@/i18n/navigation";
import type { Information } from "@/types/informations";
import type { AccordionItem } from "@/types/accordion";

interface FAQContentProps {
  initialFAQ: Information[];
}

type FAQFilter = "all" | "visit" | "event" | "facility" | "other";

interface FAQFilterDef {
  key: Exclude<FAQFilter, "all" | "other">;
  keywords: string[];
}

/**
 * FAQのサブカテゴリ分類定義
 * タイトル・descriptionのキーワードで自動分類
 *
 * IMPORTANT: keywords は microCMS の日本語コンテンツに対する照合ロジックであり、
 * UI 文言ではない。翻訳すると全ロケールで分類が「その他」に倒れるため、
 * 表示ロケールに関わらず日本語のまま維持すること。
 */
const FAQ_FILTERS: FAQFilterDef[] = [
  {
    key: "visit",
    keywords: ["入場", "アクセス", "駅", "車", "駐車", "雨天", "ペット", "開催日", "開催"],
  },
  {
    key: "event",
    keywords: ["企画", "ステージ", "タイムテーブル", "出展", "参加", "申し込み"],
  },
  {
    key: "facility",
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
  const t = useTranslations("faq");
  const tNav = useTranslations("navigation");
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

  /**
   * CMS にFAQが1件も登録されていない場合。
   * 検索・フィルターを出しても操作対象が無いため、案内のみを表示する。
   */
  if (initialFAQ.length === 0) {
    return (
      <div className="mx-auto max-w-4xl">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
          <MessageCircleQuestion
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
          />
          <p className="text-gray-500">{t("empty.title")}</p>
          <p className="mt-2 text-sm text-gray-400">
            {t("empty.prefix")}{" "}
            <Link href="/info/contact" className="text-primary hover:underline">
              {t("empty.contactLink")}
            </Link>{" "}
            {t("empty.suffix")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      {/* 検索バー */}
      <div className="relative mb-6">
        <Search
          aria-hidden="true"
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
        />
        <input
          type="text"
          aria-label={t("search.label")}
          placeholder={t("search.placeholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-xl border border-gray-400 bg-gray-50 py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-500 transition-colors focus:border-gray-600 focus:bg-white focus-visible:outline-3 focus-visible:outline-offset-1 focus-visible:outline-primary-600"
        />
      </div>

      {/* フィルターボタン群 */}
      <div className="mb-6 flex flex-wrap gap-3">
        <FilterButton
          label={t("filters.all")}
          isActive={activeFilter === "all"}
          onClick={() => setActiveFilter("all")}
          count={categoryCounts.all}
        />
        <FilterButton
          label={t("filters.visit")}
          isActive={activeFilter === "visit"}
          onClick={() => setActiveFilter("visit")}
          count={categoryCounts.visit}
        />
        <FilterButton
          label={t("filters.event")}
          isActive={activeFilter === "event"}
          onClick={() => setActiveFilter("event")}
          count={categoryCounts.event}
        />
        <FilterButton
          label={t("filters.facility")}
          isActive={activeFilter === "facility"}
          onClick={() => setActiveFilter("facility")}
          count={categoryCounts.facility}
        />
        <FilterButton
          label={t("filters.other")}
          isActive={activeFilter === "other"}
          onClick={() => setActiveFilter("other")}
          count={categoryCounts.other}
        />
      </div>

      {/* 件数表示 */}
      <div className="mb-6">
        <p className="text-sm text-gray-600">{t("count", { count: filteredFAQ.length })}</p>
      </div>

      {/* FAQ一覧（アコーディオン） */}
      {filteredFAQ.length > 0 ? (
        <Accordion items={accordionItems} />
      ) : (
        <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
          <MessageCircleQuestion
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12 text-gray-300"
          />
          <p className="text-gray-500">{t("noResults.title")}</p>
          <p className="mt-2 text-sm text-gray-400">{t("noResults.description")}</p>
        </div>
      )}

      {/* お問い合わせ誘導バナー */}
      <div className="mt-10 rounded-xl border border-blue-200 bg-blue-50 p-6 md:p-8">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{t("cta.title")}</h2>
            <p className="mt-1 text-sm text-gray-600">{t("cta.description")}</p>
          </div>
          <Link
            href="/info/contact"
            className="inline-flex items-center gap-2 whitespace-nowrap rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-500"
          >
            {tNav("contact")}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={`rounded-full border px-5 py-2 text-sm font-semibold transition-all focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 ${
        isActive
          ? "border-primary-600 bg-primary-600 text-white shadow-md"
          : "border-gray-200 bg-gray-50 text-gray-700 hoverable:hover:border-gray-400 hoverable:hover:bg-white"
      }`}
    >
      {label} <span className="ml-1 opacity-75">({count})</span>
    </button>
  );
}
