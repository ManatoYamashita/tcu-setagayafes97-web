import Link from "next/link";
import { getFeaturedEvents } from "@/lib/events";
import { getSponsorsList } from "@/lib/informations";
import { EventGrid } from "@/components/events/EventGrid";
import { SponsorLogoLoop } from "./SponsorLogoLoop";

/**
 * おすすめ企画セクション
 * 注目の企画 + 協賛企業ロゴループを表示
 */
export async function FeaturedEvents() {
  const [events, sponsors] = await Promise.all([getFeaturedEvents(), getSponsorsList()]);

  return (
    <section className="overflow-hidden bg-secondary py-32">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-5xl font-bold md:text-6xl">おすすめ企画</h2>
          <p className="text-lg text-gray-900/80">実行委員会が選ぶ注目の企画</p>
        </div>

        {/* 検索フォーム */}
        <form action="/events" method="GET" className="mx-auto mb-10 max-w-md">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <svg
                className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-900/40"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                type="text"
                name="keyword"
                placeholder="企画名・団体名で検索"
                className="w-full rounded-full border border-gray-200/30 bg-white/20 py-3 pl-12 pr-4 text-sm text-gray-900 placeholder-gray-900/40 focus:border-gray-200 focus:outline-none focus:ring-2 focus:ring-white/30"
                aria-label="企画をキーワードで検索"
              />
            </div>
            <button
              type="submit"
              className="rounded-full bg-white px-6 py-3 text-sm font-bold text-primary transition-colors hover:opacity-90"
            >
              検索
            </button>
          </div>
        </form>

        {events.length > 0 ? (
          <EventGrid events={events} variant="featured" />
        ) : (
          <div className="text-center text-gray-900/60">現在、おすすめ企画はありません。</div>
        )}

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

      {/* 協賛企業ロゴループ */}
      {sponsors.length > 0 && (
        <div className="mt-20">
          <div className="container mx-auto px-4">
            <h3 className="mb-8 text-center text-2xl font-bold">協賛企業</h3>
          </div>
          <SponsorLogoLoop sponsors={sponsors} />
        </div>
      )}
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
