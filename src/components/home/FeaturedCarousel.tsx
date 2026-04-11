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
  const SCROLL_AMOUNT = 324; // card width(300) + gap(24)

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
      {/* モバイル用タイトル */}
      <div className="mb-8 px-8 lg:hidden">
        <p className="mb-1 text-xs uppercase tracking-widest text-primary-900">Pick Up</p>
        <h2 className="text-3xl font-bold text-primary-900">おすすめ企画</h2>
        <p className="mt-1 text-sm text-primary-700">実行委員会が選ぶ注目の企画</p>
      </div>

      <div className="flex items-start">
        {/* 左サイド: 縦書きタイトル + ナビ */}
        <div className="hidden w-44 shrink-0 flex-col items-center pt-4 lg:flex">
          {/* 縦書きテキスト群 */}
          <div className="flex items-start gap-2">
            <p
              className="text-xs tracking-[0.3em] text-primary-700"
              style={{ writingMode: "vertical-rl" }}
            >
              おすすめ企画
            </p>
            <h2
              className="text-5xl font-bold leading-none tracking-tight text-primary-900"
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
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-900 text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
              aria-label="前の企画を表示"
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-primary-900 text-primary-900 transition-colors hover:bg-primary-900 hover:text-white"
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
            className="flex gap-6 overflow-x-auto px-8 pb-4 lg:pl-6 lg:pr-0 [&::-webkit-scrollbar]:hidden"
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
                  className="group w-[280px] shrink-0 md:w-[300px]"
                  style={{ scrollSnapAlign: "start" }}
                >
                  <div className="overflow-hidden rounded-2xl bg-white transition-shadow duration-300 group-hover:shadow-lg">
                    {/* 画像 */}
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={event.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="300px"
                      />
                      {/* カテゴリバッジ */}
                      <span className="absolute bottom-0 left-4 rounded-t-md bg-gray-900 px-4 py-1 text-xs font-medium text-white">
                        {typeLabels[event.type]}
                      </span>
                    </div>

                    {/* テキスト */}
                    <div className="p-4">
                      <time className="text-xs text-gray-400">{formatDate(event.publishedAt)}</time>
                      <h3 className="mt-1.5 text-sm font-bold leading-snug text-gray-900 line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-gray-400 line-clamp-3">
                        {event.description}
                      </p>
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
        <Link
          href="/info"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-80"
        >
          お知らせ一覧
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
