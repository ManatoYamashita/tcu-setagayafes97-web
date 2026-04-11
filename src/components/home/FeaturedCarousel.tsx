"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Event, EventType } from "@/types/events";

const typeLabels: Record<EventType, string> = {
  room: "教室企画",
  stage: "ステージ",
  special: "特別企画",
  other: "その他",
};

function formatDate(iso?: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      className="h-5 w-5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      {direction === "left" ? (
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5m0 0l6-6m-6 6l6 6" />
      ) : (
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m0 0l-6-6m6 6l-6 6" />
      )}
    </svg>
  );
}

export function FeaturedCarousel({ events }: { events: Event[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const SCROLL_AMOUNT = 364; // card width(340) + gap(24)

  const scroll = (direction: 1 | -1) => {
    scrollRef.current?.scrollBy({
      left: direction * SCROLL_AMOUNT,
      behavior: "smooth",
    });
  };

  if (events.length === 0) {
    return (
      <div className="px-8 text-center">
        <p className="text-primary-700">現在、おすすめ企画はありません。</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-start">
        {/* 左サイド: 縦書きタイトル + ナビ */}
        <div className="flex w-28 shrink-0 flex-col items-center pt-4 sm:w-36 lg:w-44">
          {/* 縦書きテキスト群 */}
          <div className="flex items-start gap-2">
            <p
              className="text-xs tracking-[0.3em] text-primary-700"
              style={{ writingMode: "vertical-rl" }}
            >
              おすすめ企画
            </p>
            <h2
              className="text-3xl font-bold leading-none tracking-tight text-primary-900 sm:text-4xl lg:text-5xl"
              style={{ writingMode: "vertical-rl" }}
            >
              PICK UP
            </h2>
          </div>
          <p
            className="mt-3 text-[10px] uppercase tracking-[0.2em] text-primary-600"
            style={{ writingMode: "vertical-rl" }}
          >
            Setagaya Festival 97th
          </p>

          {/* 矢印ナビ */}
          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-900 text-primary-900 transition-colors hover:bg-primary-900 hover:text-white sm:h-10 sm:w-10 lg:h-11 lg:w-11"
              aria-label="前の企画を表示"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-primary-900 text-primary-900 transition-colors hover:bg-primary-900 hover:text-white sm:h-10 sm:w-10 lg:h-11 lg:w-11"
              aria-label="次の企画を表示"
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>

        {/* 右サイド: カルーセル */}
        <div className="min-w-0 flex-1">
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto px-4 pb-4 sm:gap-6 sm:px-6 lg:pl-6 lg:pr-0 [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: "x mandatory", scrollbarWidth: "none" }}
            role="region"
            aria-label="おすすめ企画一覧"
            aria-roledescription="カルーセル"
            tabIndex={0}
          >
            {events.map((event) => {
              const imageUrl = event.thumbnail?.url || "/images/placeholder/pastel-castle.webp";
              return (
                <Link
                  key={event.id}
                  href={`/events/${event.id}`}
                  className="group w-[260px] max-w-[70vw] shrink-0 sm:w-[300px] sm:max-w-[45vw] md:w-[340px] md:max-w-[340px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="relative aspect-[3/5] overflow-hidden rounded-3xl shadow-lg transition-shadow duration-300 group-hover:shadow-2xl">
                    {/* 全面画像 */}
                    <Image
                      src={imageUrl}
                      alt={event.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="340px"
                    />

                    {/* グラデーション */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
                      aria-hidden="true"
                    />

                    {/* コンテンツ（下部） */}
                    <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col p-5">
                      {/* ドットインジケーター */}
                      <div className="mb-4 flex justify-center gap-1.5" aria-hidden="true">
                        <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                        <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
                      </div>

                      {/* タイトル + バッジ */}
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-bold leading-snug text-white line-clamp-2 sm:text-lg">
                          {event.title}
                        </h3>
                        <span className="shrink-0 rounded-full border border-white/40 bg-white/15 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                          {typeLabels[event.type]}
                        </span>
                      </div>

                      {/* 説明文 */}
                      <p className="mt-2.5 text-xs leading-relaxed text-white/70 line-clamp-3">
                        {event.description}
                      </p>

                      {/* 分類タグ */}
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                          {typeLabels[event.type]}
                        </span>
                        <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur-sm">
                          {event.building}
                        </span>
                      </div>

                      {/* 詳細ボタン */}
                      <span className="mt-4 block w-full rounded-full bg-white py-2.5 text-center text-sm font-semibold text-gray-900 transition-opacity group-hover:opacity-90">
                        詳細を見る
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* CTAボタン */}
      <div className="mt-12 flex flex-wrap justify-center gap-4 px-8">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          企画一覧
          <svg
            className="h-4 w-4"
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
  );
}
