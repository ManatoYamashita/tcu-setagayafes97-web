/**
 * 企画詳細ページのローディングUI
 */
export default function EventDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* パンくずリストスケルトン */}
      <nav className="border-b border-gray-200 bg-white py-4">
        <div className="container mx-auto px-4">
          <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
        </div>
      </nav>

      {/* メインコンテンツスケルトン */}
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl space-y-8">
          {/* サムネイルスケルトン */}
          <div className="aspect-video w-full animate-pulse rounded-lg bg-gray-200" />

          {/* タイトルセクションスケルトン */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
              <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
            </div>
            <div className="h-10 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="h-7 w-1/2 animate-pulse rounded bg-gray-200" />
          </div>

          {/* メタ情報スケルトン */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>

          {/* 詳細スケルトン */}
          <div className="space-y-3 rounded-lg border border-gray-200 bg-white p-6">
            <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
