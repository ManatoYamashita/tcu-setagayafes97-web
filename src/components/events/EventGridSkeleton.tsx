interface EventGridSkeletonProps {
  /** 描くカードの枚数 */
  count?: number;
}

/**
 * 企画グリッドの骨格表示
 *
 * 列構成は `EventGrid` の既定（`default`）と揃えている。揃えないと、本物のカードへ
 * 切り替わった瞬間に列数が変わって画面が跳ねる。
 *
 * ページ遷移中（`src/app/events/(list)/loading.tsx`）と、意味検索の応答待ち
 * （`EventsView`）の両方で使う。スクリーンリーダー向けの通知は呼び出し側が担当するため、
 * ここは装飾として `aria-hidden` にしてある。
 *
 * **`useSearchParams()` を使ってはいけません。** `EventsView` 経由で `<Suspense>` の
 * fallback にも描かれます（#156）。
 */
export function EventGridSkeleton({ count = 6 }: EventGridSkeletonProps) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
        >
          {/* サムネイル */}
          <div className="aspect-video w-full animate-pulse bg-gray-200" />
          <div className="p-6">
            <div className="mb-3 flex gap-2">
              <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mb-3 h-5 w-1/2 animate-pulse rounded bg-gray-200" />
            <div className="mb-4 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="flex gap-4 border-t border-gray-200 pt-3">
              <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
