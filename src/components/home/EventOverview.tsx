import { siteConfig } from "@/data/site";

/**
 * 開催概要セクション
 * イベントの基本情報をテキスト中心のシンプルな3カラムで表示
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
    <section className="bg-primary py-32">
      <div className="container mx-auto px-4">
        <h2 className="mb-16 text-center text-5xl font-bold md:text-6xl">開催概要</h2>

        <div className="mx-auto max-w-4xl">
          <div className="grid grid-cols-1 divide-y md:grid-cols-3 md:divide-x md:divide-y-0 divide-white/20">
            {/* 開催日時 */}
            <div className="py-8 md:py-0 md:px-10 text-center">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/50">Date</p>
              <p className="text-lg font-semibold text-white">{year}年</p>
              <p className="text-lg font-semibold text-white">
                {day1Formatted} (
                {new Date(siteConfig.dates.day1).toLocaleDateString("ja-JP", { weekday: "short" })})
              </p>
              <p className="text-lg font-semibold text-white">
                {day2Formatted} (
                {new Date(siteConfig.dates.day2).toLocaleDateString("ja-JP", { weekday: "short" })})
              </p>
              <p className="mt-2 text-sm text-white/60">
                {siteConfig.openTime} – {siteConfig.closeTime}
              </p>
            </div>

            {/* 会場 */}
            <div className="py-8 md:py-0 md:px-10 text-center">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/50">Venue</p>
              <p className="text-lg font-semibold text-white">{siteConfig.venue}</p>
              <p className="mt-2 text-sm text-white/60">{siteConfig.address}</p>
            </div>

            {/* 来場予定者数 */}
            <div className="py-8 md:py-0 md:px-10 text-center">
              <p className="mb-3 text-xs uppercase tracking-widest text-white/50">Visitors</p>
              <p className="text-lg font-semibold text-white">
                {siteConfig.expectedVisitors.toLocaleString()} 名
              </p>
              <p className="mt-2 text-sm text-white/60">入場無料・事前予約不要 / 雨天決行</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
