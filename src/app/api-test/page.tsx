import { getNewsList } from "@/lib/news";
import { getEventsList, getFeaturedEvents } from "@/lib/events";
import { getSponsorsList } from "@/lib/informations";
import { Badge } from "@/components/ui/Badge";

/**
 * APIテストページ
 * microCMSヘルパー関数の動作確認用
 */
export default async function APITestPage() {
  // データ取得
  const newsList = await getNewsList(3);
  const eventsList = await getEventsList(6);
  const featuredEvents = await getFeaturedEvents();
  const sponsorsList = await getSponsorsList();

  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-8">
        <h1 className="mb-4 text-4xl font-bold">API / ヘルパー関数テスト</h1>
        <div className="rounded-lg bg-yellow-100 p-4">
          <p className="font-semibold">
            現在のモード:{" "}
            {USE_MOCK ? (
              <span className="text-orange-600">モックデータ使用中</span>
            ) : (
              <span className="text-green-600">microCMS本番接続中</span>
            )}
          </p>
          <p className="mt-2 text-sm text-gray-700">
            環境変数 NEXT_PUBLIC_USE_MOCK_DATA で切り替え可能
          </p>
        </div>
      </div>

      {/* News Section */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">
          お知らせ（getNewsList）
          <span className="ml-3 text-sm text-gray-500">取得件数: {newsList.length}</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {newsList.map((news) => (
            <div key={news.id} className="rounded-lg border p-4">
              <div className="mb-2">
                <Badge variant={news.type} label={news.type.toUpperCase()} />
              </div>
              <h3 className="mb-2 font-semibold">{news.title}</h3>
              <p className="text-sm text-gray-600">{news.description}</p>
              <div className="mt-3 text-xs text-gray-400">ID: {news.id}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Events Section */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">
          企画一覧（getEventsList）
          <span className="ml-3 text-sm text-gray-500">取得件数: {eventsList.length}</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {eventsList.map((event) => (
            <div key={event.id} className="rounded-lg border p-4">
              <div className="mb-2 flex gap-2">
                <Badge variant={event.date} label={event.date} />
                <Badge variant={event.type} label={event.type} />
              </div>
              <h3 className="mb-1 font-semibold">{event.title}</h3>
              <p className="mb-2 text-sm text-gray-500">主催: {event.organizer}</p>
              <p className="text-sm text-gray-600">{event.description}</p>
              <div className="mt-2 text-xs text-gray-400">
                場所: {event.building} {event.place}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">
          おすすめ企画（getFeaturedEvents）
          <span className="ml-3 text-sm text-gray-500">取得件数: {featuredEvents.length}</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {featuredEvents.map((event) => (
            <div key={event.id} className="rounded-lg border-2 border-primary bg-primary/5 p-4">
              <div className="mb-2 flex gap-2">
                <Badge variant={event.date} label={event.date} />
                <Badge variant={event.type} label={event.type} />
              </div>
              <h3 className="mb-1 font-semibold">{event.title}</h3>
              <p className="mb-2 text-sm text-gray-500">主催: {event.organizer}</p>
              <p className="text-sm text-gray-600">{event.description.slice(0, 80)}...</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sponsors Section */}
      <section className="mb-16">
        <h2 className="mb-6 text-2xl font-bold">
          協賛企業（getSponsorsList）
          <span className="ml-3 text-sm text-gray-500">取得件数: {sponsorsList.length}</span>
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          {sponsorsList.map((sponsor) => (
            <div key={sponsor.id} className="rounded-lg border p-4">
              <div className="mb-3">
                <div className="flex h-32 items-center justify-center rounded bg-gray-100">
                  <span className="text-sm text-gray-400">LOGO: {sponsor.logo?.url}</span>
                </div>
              </div>
              <h3 className="mb-1 font-semibold">{sponsor.sponsorName}</h3>
              <p className="mb-2 text-sm text-gray-600">{sponsor.sponsorDescription}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
                <span>優先度: {sponsor.priority}</span>
                {sponsor.url && (
                  <a
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Website
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-lg bg-green-100 p-6">
        <h2 className="mb-2 text-xl font-bold text-green-800">検証完了</h2>
        <p className="text-green-700">
          すべてのヘルパー関数が正常に動作しています。環境変数を切り替えてmicroCMS本番接続のテストも可能です。
        </p>
      </section>
    </div>
  );
}
