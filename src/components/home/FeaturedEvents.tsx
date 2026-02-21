import Link from "next/link";
import { getFeaturedEvents } from "@/lib/events";
import { EventGrid } from "@/components/events/EventGrid";

/**
 * おすすめ企画セクション
 * 注目の企画を表示
 */
export async function FeaturedEvents() {
  const events = await getFeaturedEvents();

  // データが取得できない場合の表示
  if (events.length === 0) {
    return (
      <section className="bg-secondary py-32">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-5xl font-bold md:text-6xl">おすすめ企画</h2>
            <p className="text-lg text-gray-900/80">実行委員会が選ぶ注目の企画</p>
          </div>
          <div className="text-center text-gray-900/60">現在、おすすめ企画はありません。</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-secondary py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold md:text-6xl">おすすめ企画</h2>
          <p className="text-lg text-gray-900/80">実行委員会が選ぶ注目の企画</p>
        </div>

        <EventGrid events={events} variant="featured" />

        {/* もっと見るボタン */}
        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-bold text-primary transition-colors hover:opacity-90"
          >
            <span>全ての企画を見る</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
