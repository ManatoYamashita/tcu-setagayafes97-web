import { EventGridSkeleton } from "@/components/events/EventGridSkeleton";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";

/**
 * 企画一覧ページのローディングUI
 *
 * 本体（`page.tsx`）と同じ `PageSheetLayout` を使う。以前は濃紫グラデーションの
 * ヘッダーを個別に手書きしており、本体の白いシートへ切り替わる瞬間に見た目が
 * 飛んでいた。骨格を共有コンポーネントへ揃えることでこの不整合を無くす。
 */
export default function EventsLoading() {
  return (
    <PageSheetLayout hero={pageHeroes.events}>
      <div className="container mx-auto px-4 py-12" role="status" aria-live="polite">
        <span className="sr-only">企画を読み込んでいます</span>
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
          {/* サイドバー: フィルタースケルトン */}
          <aside className="mb-8 lg:mb-0">
            {/*
              lg 未満: 本体と同じ細いバー（キーワード入力＋「条件」ボタン）。
              全項目の骨格を出すと、読み込みの間だけ 600px 超の塊が画面を占める（#376）
            */}
            <div className="flex items-center gap-2 py-2 lg:hidden">
              <div className="h-11 flex-1 animate-pulse rounded-lg bg-gray-200" />
              <div className="h-11 w-20 animate-pulse rounded-lg bg-gray-200" />
            </div>
            <div className="hidden rounded-lg border border-gray-200 bg-white p-6 shadow-sm lg:block">
              <div className="mb-4 flex items-center justify-between">
                <div className="h-6 w-24 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="space-y-6">
                {/* 日程フィルタースケルトン */}
                <div>
                  <div className="mb-2 h-5 w-16 animate-pulse rounded bg-gray-200" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-20 animate-pulse rounded-full bg-gray-200" />
                    ))}
                  </div>
                </div>
                {/* 企画種別フィルタースケルトン */}
                <div>
                  <div className="mb-2 h-5 w-20 animate-pulse rounded bg-gray-200" />
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="h-10 w-24 animate-pulse rounded-full bg-gray-200" />
                    ))}
                  </div>
                </div>
                {/* 建物フィルタースケルトン */}
                <div>
                  <div className="mb-2 h-5 w-12 animate-pulse rounded bg-gray-200" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
                {/* キーワード検索スケルトン */}
                <div>
                  <div className="mb-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
                </div>
              </div>
            </div>
          </aside>

          {/* メインコンテンツ */}
          <div>
            {/* 検索結果件数スケルトン */}
            <div className="mb-6 h-5 w-48 animate-pulse rounded bg-gray-200" />

            {/* 企画グリッドスケルトン */}
            <EventGridSkeleton />
          </div>
        </div>
      </div>
    </PageSheetLayout>
  );
}
