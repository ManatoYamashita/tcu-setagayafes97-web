import { siteConfig } from "@/data/site";

/**
 * 開催概要セクション
 * イベントの基本情報を表示
 */
export function EventOverview() {
  // 日付フォーマット変換（2026-10-31 → 10月31日）
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };

  const day1Formatted = formatDate(siteConfig.dates.day1);
  const day2Formatted = formatDate(siteConfig.dates.day2);
  const year = new Date(siteConfig.dates.day1).getFullYear();

  return (
    <section className="bg-gradient-to-b from-white to-gray-50 py-20">
      <div className="container mx-auto px-4">
        <h2 className="mb-12 text-center text-4xl font-bold">開催概要</h2>

        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {/* 開催日時 */}
            <div className="rounded-xl bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">開催日時</h3>
              <p className="mb-1 text-2xl font-bold text-primary">{year}年</p>
              <p className="mb-2 text-lg font-semibold">
                {day1Formatted} (
                {new Date(siteConfig.dates.day1).toLocaleDateString("ja-JP", { weekday: "short" })})
              </p>
              <p className="mb-3 text-lg font-semibold">
                {day2Formatted} (
                {new Date(siteConfig.dates.day2).toLocaleDateString("ja-JP", { weekday: "short" })})
              </p>
              <p className="text-sm text-gray-600">
                {siteConfig.openTime} - {siteConfig.closeTime}
              </p>
            </div>

            {/* 会場 */}
            <div className="rounded-xl bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">会場</h3>
              <p className="mb-2 text-lg font-bold text-gray-900">{siteConfig.venue}</p>
              <p className="text-sm text-gray-600">{siteConfig.address}</p>
            </div>

            {/* 来場予定者数 */}
            <div className="rounded-xl bg-white p-6 text-center shadow-md transition-shadow hover:shadow-lg">
              <div className="mb-4 flex justify-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <svg
                    className="h-8 w-8 text-primary"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="mb-3 text-lg font-semibold text-gray-800">来場予定者数</h3>
              <p className="mb-2 text-3xl font-bold text-primary">
                {siteConfig.expectedVisitors.toLocaleString()}
                <span className="ml-1 text-lg">名</span>
              </p>
              <p className="text-sm text-gray-600">（両日合計）</p>
            </div>
          </div>

          {/* 補足情報 */}
          <div className="mt-12 rounded-xl bg-primary/5 p-6 text-center">
            <p className="text-sm text-gray-700">
              入場無料・事前予約不要
              <span className="mx-2">|</span>
              雨天決行
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
