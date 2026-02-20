import Link from "next/link";

/**
 * 企画詳細ページの404ページ
 */
export default function EventDetailNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-dark to-primary">
      {/* パンくずリスト */}
      <nav className="border-b border-white/20 bg-white/10 py-4">
        <div className="container mx-auto px-4">
          <ol className="flex items-center gap-2 text-sm text-white/80">
            <li>
              <a href="/" className="hover:text-white hover:underline">
                トップ
              </a>
            </li>
            <li>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </li>
            <li>
              <a href="/events" className="hover:text-white hover:underline">
                企画を探す
              </a>
            </li>
          </ol>
        </div>
      </nav>

      {/* 404メッセージ */}
      <div className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-md text-center">
          <div className="mb-6 text-6xl font-bold text-primary-light">404</div>
          <h2 className="mb-4 text-2xl font-bold text-white">企画が見つかりません</h2>
          <p className="mb-8 text-white/80">
            お探しの企画は存在しないか、削除された可能性があります。
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/events"
              className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 text-base font-semibold text-primary shadow-md transition-all duration-200 hover:bg-white/90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              企画一覧へ戻る
            </Link>
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-lg bg-white/10 px-6 py-3 text-base font-semibold text-white shadow-md transition-all duration-200 hover:bg-white/20 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
            >
              トップページへ戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
