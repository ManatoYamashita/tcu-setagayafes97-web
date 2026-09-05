/**
 * 企画詳細ページのローディングUI
 *
 * 本体（`page.tsx` + `EventDetail.tsx`）と同じ骨格を敷く。白いシート・`max-w-7xl`・
 * 2カラムのヒーローまで一致させないと、スケルトンから本体へ切り替わる瞬間に
 * レイアウトが飛ぶ。本体の幅やブレークポイントを変えたら、ここも同じコミットで追従させること。
 *
 * 入場アニメーション（`event-detail-entrance-*`）は本体側だけに置く。
 * スケルトンにも付けると、切り替え時に同じ演出が二度走る。
 */
export default function EventDetailLoading() {
  return (
    <div
      className="min-h-screen bg-gradient-to-b from-white via-primary-50 to-secondary pb-20"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">企画情報を読み込んでいます</span>

      {/* パンくずリストスケルトン */}
      <nav className="bg-white py-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </nav>

      {/* メインコンテンツスケルトン */}
      <div className="relative z-10 mx-4 mt-0 overflow-hidden rounded-[2rem] bg-white shadow-[0_-4px_20px_rgba(0,0,0,0.08)] sm:mx-6 lg:mx-8">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
          <div className="space-y-12">
            {/* ヒーロー（画像 + 見出し） */}
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.75fr)] lg:items-start lg:gap-12">
              <div className="-mx-4 -mt-10 aspect-[4/3] animate-pulse rounded-t-2xl rounded-b-none bg-gray-200 sm:-mx-6 sm:aspect-[16/9] lg:mx-0 lg:mt-0 lg:aspect-[4/3] lg:rounded-b-2xl" />

              <div className="lg:py-6">
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 w-16 animate-pulse rounded-full bg-gray-200" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
                </div>

                <div className="mt-5 flex flex-col gap-3">
                  <div className="h-9 w-full animate-pulse rounded bg-gray-200 sm:h-11 lg:h-14" />
                  <div className="h-9 w-2/3 animate-pulse rounded bg-gray-200 sm:h-11 lg:h-14" />
                </div>

                <div className="mt-6 border-t border-gray-200 pt-5">
                  <div className="h-4 w-12 animate-pulse rounded bg-gray-200" />
                  <div className="mt-2 h-5 w-40 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </div>

            {/* 開催情報スケルトン */}
            <div className="border-y border-gray-200 py-8">
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              <div className="mt-6 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
                {["開催日", "開催時間", "会場", "企画種別"].map((key) => (
                  <div key={key}>
                    <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
                    <div className="mt-2 h-5 w-32 animate-pulse rounded bg-gray-200" />
                  </div>
                ))}
              </div>
            </div>

            {/* 企画概要スケルトン */}
            <div className="max-w-3xl">
              <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
              <div className="mt-5 flex flex-col gap-3">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
