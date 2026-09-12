import { EVENT_DISPLAY_FALLBACKS } from "@/lib/event-display";

interface EventMediaPlaceholderProps {
  variant: "card" | "detail";
  size?: "md" | "lg";
}

/**
 * サムネイル未入力時の共通プレースホルダー。
 * 画像が無い場合もカードの視覚的な重心と、準備中である意味を保つ。
 */
export function EventMediaPlaceholder({ variant, size = "lg" }: EventMediaPlaceholderProps) {
  if (variant === "detail") {
    return (
      <div
        role="img"
        aria-label={EVENT_DISPLAY_FALLBACKS.thumbnail}
        className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-2xl border border-primary-100 bg-primary-50 text-primary-700"
      >
        <svg
          className="h-12 w-12"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span className="text-sm font-semibold">{EVENT_DISPLAY_FALLBACKS.thumbnail}</span>
      </div>
    );
  }

  return (
    <div
      role="img"
      aria-label={EVENT_DISPLAY_FALLBACKS.thumbnail}
      className={`relative flex flex-col items-center justify-center gap-1 rounded-full border border-primary-100 bg-primary-50 text-primary-700 ${size === "md" ? "h-24 w-24" : "h-32 w-32"}`}
    >
      <svg
        className="h-8 w-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <span className="text-[10px] font-semibold">{EVENT_DISPLAY_FALLBACKS.thumbnail}</span>
    </div>
  );
}
