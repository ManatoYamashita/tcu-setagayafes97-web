import Link from "next/link";
import Image from "next/image";
import { getFeaturedEvents } from "@/lib/events";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

/**
 * おすすめ企画セクション
 * 注目の企画を表示
 */
export async function FeaturedEvents() {
  const events = await getFeaturedEvents();

  // データが取得できない場合の表示
  if (events.length === 0) {
    return (
      <section className="bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold">おすすめ企画</h2>
            <p className="text-lg text-gray-600">実行委員会が選ぶ注目の企画</p>
          </div>
          <div className="text-center text-gray-500">現在、おすすめ企画はありません。</div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-4xl font-bold">おすすめ企画</h2>
          <p className="text-lg text-gray-600">実行委員会が選ぶ注目の企画</p>
        </div>

        <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <Card key={event.id} href={`/events/${event.id}`} variant="featured">
              <article className="h-full">
                {/* サムネイル */}
                {event.thumbnail && (
                  <div className="relative aspect-video w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={event.thumbnail.url}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 400px"
                    />
                  </div>
                )}

                <div className="p-6">
                  {/* バッジ */}
                  <div className="mb-3 flex flex-wrap gap-2">
                    <Badge variant={event.date} label={event.date} />
                    <Badge variant={event.type} label={event.type} />
                  </div>

                  {/* タイトル */}
                  <h3 className="mb-2 line-clamp-2 text-xl font-bold text-gray-900">
                    {event.title}
                  </h3>

                  {/* 主催団体 */}
                  <p className="mb-3 text-sm font-semibold text-primary">{event.organizer}</p>

                  {/* 説明文 */}
                  <p className="mb-4 line-clamp-3 text-sm text-gray-600">{event.description}</p>

                  {/* メタ情報 */}
                  <div className="flex flex-wrap gap-x-4 gap-y-2 border-t pt-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <svg
                        className="h-4 w-4"
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
                      </svg>
                      <span>
                        {event.building} {event.place}
                      </span>
                    </div>
                    {event.startTime && event.endTime && (
                      <div className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>
                          {event.startTime} - {event.endTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            </Card>
          ))}
        </div>

        {/* もっと見るボタン */}
        <div className="mt-12 text-center">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-3 font-semibold text-white shadow-md transition-all hover:bg-primary/90 hover:shadow-lg"
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
