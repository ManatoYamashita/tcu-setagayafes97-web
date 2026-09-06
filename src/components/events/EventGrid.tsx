import type { Event } from "@/types/events";
import { EventCard } from "./EventCard";

interface EventGridProps {
  events: Event[];
  variant?: "default" | "featured" | "compact";
}

/**
 * 企画グリッドレイアウト
 * EventCardを格子状に配置
 */
export function EventGrid({ events, variant = "default" }: EventGridProps) {
  // 企画が0件の場合
  if (events.length === 0) {
    return (
      <div className="py-16 text-center">
        <svg
          className="mx-auto mb-4 h-16 w-16 text-gray-900/30"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-semibold text-gray-900/80">該当する企画が見つかりませんでした</p>
        <p className="mt-2 text-sm text-gray-900/60">フィルター条件を変更してお試しください</p>
      </div>
    );
  }

  // compact（関連企画等、常に3件固定）には xl 列を増やさない。
  // 3件しかない行にカラムだけ増やすと、4本目のトラックが空のまま伸びてしまう。
  const gridColsClassName =
    variant === "compact"
      ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";

  return (
    <div className={gridColsClassName}>
      {events.map((event) => (
        <EventCard key={event.id} event={event} variant={variant} />
      ))}
    </div>
  );
}
