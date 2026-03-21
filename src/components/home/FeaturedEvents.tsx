import Link from "next/link";
import Image from "next/image";
import { getFeaturedEvents } from "@/lib/events";
import type { Event } from "@/types/events";

/**
 * おすすめ企画カード（画像背景）
 */
function FeaturedEventCard({ event }: { event: Event }) {
  const imageUrl = event.thumbnail?.url || "/images/placeholder/pastel-castle.webp";

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative block aspect-[16/5] overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
    >
      {/* 背景画像 */}
      <Image
        src={imageUrl}
        alt={event.title}
        fill
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
      />

      {/* グラデーションオーバーレイ */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
        aria-hidden="true"
      />

      {/* テキスト */}
      <div className="absolute inset-x-0 bottom-0 p-4">
        <h3 className="text-lg font-bold leading-snug text-white line-clamp-2">{event.title}</h3>
        <p className="mt-1 text-sm text-white/70">{event.organizer}</p>
      </div>
    </Link>
  );
}

/**
 * 企画検索フォーム（/events へGET遷移）
 */
function EventSearchForm() {
  return (
    <form action="/events" method="get" className="mb-8 flex gap-2">
      <div className="relative flex-1">
        {/* 虫眼鏡アイコン */}
        <svg
          className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
          />
        </svg>
        <input
          type="text"
          name="keyword"
          placeholder="企画名・団体名で検索"
          className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 text-sm text-gray-900 placeholder:text-gray-400 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>
      <button
        type="submit"
        className="shrink-0 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-80"
      >
        検索
      </button>
    </form>
  );
}

/** 「+」装飾の配置座標 */
const plusPositions = [
  "top-[8%] left-[5%]",
  "top-[18%] right-[12%]",
  "bottom-[25%] left-[15%]",
  "bottom-[8%] right-[5%]",
  "top-[50%] left-[45%]",
] as const;

/**
 * おすすめ企画セクション
 * 上部: タイトル+検索（左寄せ） / 下部: イラストとカードが重なる配置
 */
export async function FeaturedEvents() {
  const events = await getFeaturedEvents();
  const featured = events.slice(0, 3);

  return (
    <section className="relative overflow-hidden py-24 lg:py-32">
      {/* 背景グラデーション: 上下フェードで前後セクションと自然に接続 */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-secondary via-10% to-secondary"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-secondary to-transparent"
        aria-hidden="true"
      />

      {/* 「+」装飾 */}
      {plusPositions.map((pos, i) => (
        <span
          key={i}
          className={`absolute ${pos} text-3xl font-light text-primary/40 pointer-events-none select-none`}
          aria-hidden="true"
        >
          +
        </span>
      ))}

      <div className="relative z-10 mx-auto max-w-6xl px-8 sm:px-12 lg:px-20">
        {/* 上部: タイトル + 検索（左寄せ） */}
        <div className="lg:max-w-[50%]">
          <p className="mb-3 text-xs uppercase tracking-widest text-primary-900">Pick Up</p>
          <h2 className="mb-2 text-4xl font-bold text-primary-900 md:text-5xl">おすすめ企画</h2>
          <p className="mb-10 text-sm text-primary-700">実行委員会が選ぶ注目の企画</p>

          {/* 検索フォーム */}
          <EventSearchForm />
        </div>

        {/* 下部: イラスト + カード（重なり配置） */}
        <div className="relative mt-8 lg:grid lg:grid-cols-12 lg:items-end">
          {/* イラスト: col 1-7, 背面（デスクトップのみ） */}
          <div className="hidden lg:col-start-1 lg:col-end-7 lg:row-start-1 lg:flex lg:items-end z-0">
            <div className="relative w-full max-w-[440px]">
              <Image
                src="/images/placeholder/pastel-castle.webp"
                alt="おすすめ企画のイラスト"
                width={440}
                height={440}
                className="h-auto w-full"
                sizes="440px"
                priority={false}
              />
            </div>
          </div>

          {/* カード + CTA: col 5-13, 前面 */}
          <div className="lg:col-start-5 lg:col-end-13 lg:row-start-1 z-10 flex flex-col gap-5">
            {featured.length > 0 ? (
              <>
                {featured.map((event) => (
                  <FeaturedEventCard key={event.id} event={event} />
                ))}
              </>
            ) : (
              <p className="text-gray-600">現在、おすすめ企画はありません。</p>
            )}

            {/* CTA */}
            <div className="mt-3 text-right">
              <Link
                href="/events"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-900 underline underline-offset-4 transition-opacity hover:opacity-70"
              >
                全ての企画を見る
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* モバイル用イラスト */}
          <div className="mt-8 flex justify-center lg:hidden">
            <div className="relative w-full max-w-[320px] sm:max-w-[380px]">
              <Image
                src="/images/placeholder/pastel-castle.webp"
                alt="おすすめ企画のイラスト"
                width={440}
                height={440}
                className="h-auto w-full"
                sizes="(max-width: 640px) 320px, 380px"
                priority={false}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
