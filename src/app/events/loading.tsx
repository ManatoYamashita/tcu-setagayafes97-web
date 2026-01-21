/**
 * 企画一覧ページのローディングUI
 */
export default function EventsLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <h1 className="mb-4 text-center text-4xl font-bold md:text-5xl">企画を探す</h1>
          <p className="text-center text-lg opacity-90">
            第97回 世田谷祭の企画を検索・閲覧できます
          </p>
        </div>
      </div>

      {/* コンテンツ */}
      <div className="container mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
          {/* サイドバー: フィルタースケルトン */}
          <aside className="mb-8 lg:mb-0">
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
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
          <main>
            {/* 検索結果件数スケルトン */}
            <div className="mb-6 h-5 w-48 animate-pulse rounded bg-gray-200" />

            {/* 企画グリッドスケルトン */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
                >
                  {/* サムネイルスケルトン */}
                  <div className="aspect-video w-full animate-pulse bg-gray-200" />
                  {/* コンテンツスケルトン */}
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
                    <div className="flex gap-4 border-t pt-3">
                      <div className="h-4 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="h-4 w-28 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
