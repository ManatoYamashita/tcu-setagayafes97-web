"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ArrowUpRight, X } from "lucide-react";
import { AppImage } from "@/components/ui/AppImage";
import { Badge } from "@/components/ui/Badge";
import { SNSLinks } from "@/components/events/SNSLinks";
import { EventMediaPlaceholder } from "@/components/events/EventMediaPlaceholder";
import { displayEventText, EVENT_DISPLAY_FALLBACKS } from "@/lib/event-display";
import type { TimetableEntry, TimetableEventDetail } from "@/types/timetable";

/** 前後の企画へ移るボタンが必要とする最小限の情報 */
export interface PanelNeighbor {
  event: TimetableEntry;
  stageName: string;
}

/** パネルが1回の表示で描くもの。親が `useMemo` で同一性を保つこと */
export interface TimetablePanelView {
  event: TimetableEntry;
  stageName: string;
  detail: TimetableEventDetail | undefined;
  prev: PanelNeighbor | null;
  next: PanelNeighbor | null;
}

interface TimetableEventPanelProps {
  /** null のときは閉じる。退場アニメーションの間は直前の内容を描き続ける */
  view: TimetablePanelView | null;
  /** ×・Esc・背景の押下。URL の更新は親が持つ */
  onClose: () => void;
  /** 前後の企画へ移る。履歴を積まないのは親の責務 */
  onNavigate: (entryKey: string) => void;
}

/**
 * 退場アニメーションが `animationend` を出さなかったときの保険（ms）。
 * `globals.css` の `.timetable-panel[data-closing]` の所要時間より長くすること。
 */
const CLOSE_FALLBACK_MS = 320;

const dateBadgeLabels = { day1: "1日目", day2: "2日目", both: "両日", other: "その他" } as const;
const typeBadgeLabels = { stage: "ステージ", special: "スペシャル" } as const;

const SQUARE_IMAGE_TOLERANCE = 0.05;

function isSquare(width: number, height: number): boolean {
  return (
    width > 0 &&
    height > 0 &&
    Math.abs(width - height) / Math.max(width, height) <= SQUARE_IMAGE_TOLERANCE
  );
}

function timeText(event: TimetableEntry): string {
  return `${event.sessionLabel ? `${event.sessionLabel} ` : ""}${event.startTime}–${event.endTime}`;
}

/**
 * タイムテーブルの企画詳細パネル
 *
 * ネイティブ `<dialog>` を `showModal()` で開く。フォーカストラップ・Esc・背景の inert・
 * top layer（z-index が要らない）を標準で得られる。デスクトップでは右からのパネル、
 * 狭い画面では下からのボトムシートになる。形状と動きは `globals.css` の `.timetable-panel`。
 *
 * 入場・退場とも CSS keyframes で動かす。`@starting-style` + `overlay` の方式は退場が
 * Firefox / Safari で効かないため採らない。退場だけ JS で `data-closing` を付け、
 * アニメーションの終了を待ってから `close()` する。
 *
 * 設計判断は docs/frontend/timetable-event-panel.md を参照。
 */
export function TimetableEventPanel({ view, onClose, onNavigate }: TimetableEventPanelProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const isOpen = view !== null;

  // 退場中も内容を描くため、最後に開いていた内容を保持する。
  // render 中の setState は「props が変わったら state を合わせる」公式の書き方で、
  // view の同一性が変わらない限り再描画は1回で止まる。
  const [snapshot, setSnapshot] = useState<TimetablePanelView | null>(view);
  if (view !== null && view !== snapshot) setSnapshot(view);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      delete dialog.dataset.closing;
      if (!dialog.open) dialog.showModal();
      return;
    }

    if (!dialog.open) return;

    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      delete dialog.dataset.closing;
      dialog.close();
      setSnapshot(null);
    };
    const onEnd = (e: AnimationEvent) => {
      if (e.target === dialog) finish();
    };

    dialog.dataset.closing = "";
    dialog.addEventListener("animationend", onEnd);
    const timer = window.setTimeout(finish, CLOSE_FALLBACK_MS);

    return () => {
      // 退場の途中で開き直された（または unmount された）場合
      window.clearTimeout(timer);
      dialog.removeEventListener("animationend", onEnd);
    };
  }, [isOpen]);

  // unmount 時に top layer へ残さない
  useEffect(() => {
    const dialog = dialogRef.current;
    return () => {
      if (dialog?.open) dialog.close();
    };
  }, []);

  // Esc。ネイティブの閉じ方に任せると URL と状態が食い違うため、自前の閉じる処理へ流す
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dialog.addEventListener("cancel", onCancel);
    return () => dialog.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const current = view ?? snapshot;
  // 背景の押下は dialog 自身が target になる。中身は dialog を隙間なく覆うため、
  // パネルの内側を押して誤って閉じることはない。Safari は `closedby` 未対応なのでこの経路が必須
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className="timetable-panel"
      aria-labelledby="timetable-panel-title"
      onClick={handleClick}
    >
      {current && <PanelBody view={current} onClose={onClose} onNavigate={onNavigate} />}
    </dialog>
  );
}

function PanelBody({
  view,
  onClose,
  onNavigate,
}: {
  view: TimetablePanelView;
  onClose: () => void;
  onNavigate: (entryKey: string) => void;
}) {
  const { event, stageName, detail, prev, next } = view;
  const href = event.type === "special" ? `/special/${event.id}` : `/events/${event.id}`;
  const organizer = displayEventText(event.organizer, EVENT_DISPLAY_FALLBACKS.organizer);
  const venue = displayEventText(detail?.venue || event.place, EVENT_DISPLAY_FALLBACKS.venue);
  const description = displayEventText(detail?.description, EVENT_DISPLAY_FALLBACKS.description);
  const thumbnail = detail?.thumbnail;
  const squareThumbnail = thumbnail ? isSquare(thumbnail.width, thumbnail.height) : false;

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-200 px-4 py-2 sm:px-6">
        <p className="min-w-0 truncate text-sm font-semibold text-gray-700">{stageName}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="企画詳細を閉じる"
          className="-me-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full text-gray-900 transition-colors hoverable:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>

      <div
        data-timetable-panel-scroll
        className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6"
      >
        {thumbnail ? (
          squareThumbnail ? (
            <div className="mb-5 flex aspect-[2/1] items-center justify-center rounded-xl bg-primary-50">
              <div className="relative size-28 overflow-hidden rounded-lg">
                <AppImage
                  src={thumbnail.url}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="112px"
                />
              </div>
            </div>
          ) : (
            <div className="relative mb-5 aspect-[16/9] overflow-hidden rounded-xl bg-primary-50">
              <AppImage
                src={thumbnail.url}
                alt=""
                fill
                className="object-cover object-center"
                sizes="(min-width: 64rem) 448px, 100vw"
              />
            </div>
          )
        ) : (
          <div className="mb-5">
            <EventMediaPlaceholder variant="card" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant={event.date} label={dateBadgeLabels[event.date]} tone="soft" />
          {(event.type === "stage" || event.type === "special") && (
            <Badge variant={event.type} label={typeBadgeLabels[event.type]} tone="soft" />
          )}
        </div>

        <h2
          id="timetable-panel-title"
          className="mt-3 text-2xl font-bold leading-tight text-balance text-gray-900"
        >
          {event.title}
        </h2>

        <dl className="mt-5 space-y-3 border-y border-gray-200 py-4 text-sm">
          <div className="flex gap-4">
            <dt className="w-12 shrink-0 font-semibold text-gray-600">時間</dt>
            <dd className="font-semibold text-gray-900 tabular-nums">{timeText(event)}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-12 shrink-0 font-semibold text-gray-600">会場</dt>
            <dd className="font-semibold text-gray-900">{venue}</dd>
          </div>
          <div className="flex gap-4">
            <dt className="w-12 shrink-0 font-semibold text-gray-600">主催</dt>
            <dd className="font-semibold text-gray-900">{organizer}</dd>
          </div>
        </dl>

        <p className="mt-5 text-base leading-8 whitespace-pre-wrap text-gray-700">{description}</p>

        {detail?.sns && (
          <div className="mt-6">
            <SNSLinks sns={detail.sns} variant="panel" />
          </div>
        )}

        <Link
          href={href}
          className="mt-6 inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-primary-700 underline underline-offset-4 hoverable:hover:text-primary-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
        >
          企画ページで全文を見る
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      {/* 内容が切り替わったことを読み上げる。フォーカスは押したボタンに残す */}
      <p role="status" className="sr-only">
        {`${event.title}、${timeText(event)}`}
      </p>

      <nav
        aria-label="前後の企画"
        className="grid shrink-0 grid-cols-2 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)]"
      >
        <NeighborButton direction="prev" neighbor={prev} onNavigate={onNavigate} />
        <NeighborButton direction="next" neighbor={next} onNavigate={onNavigate} />
      </nav>
    </div>
  );
}

function NeighborButton({
  direction,
  neighbor,
  onNavigate,
}: {
  direction: "prev" | "next";
  neighbor: PanelNeighbor | null;
  onNavigate: (entryKey: string) => void;
}) {
  const isPrev = direction === "prev";
  const Icon = isPrev ? ArrowLeft : ArrowRight;

  // 端では押せなくするが、位置は保つ（もう一方のボタンが動くと押し間違える）。
  // disabled にするとフォーカスが失われるため aria-disabled で表す
  return (
    <button
      type="button"
      data-timetable-panel-nav={direction}
      aria-disabled={neighbor === null}
      onClick={() => neighbor && onNavigate(neighbor.event.entryKey)}
      className={`flex min-h-16 min-w-0 items-center gap-3 px-4 py-3 text-start transition-colors focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-600 sm:px-6 ${
        isPrev ? "" : "flex-row-reverse text-end"
      } ${neighbor === null ? "cursor-not-allowed text-gray-500" : "text-gray-900 hoverable:hover:bg-primary-50"} ${
        isPrev ? "" : "border-s border-gray-200"
      }`}
    >
      <Icon className="size-5 shrink-0" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-xs font-semibold text-gray-600">
          {isPrev ? "前の企画" : "次の企画"}
        </span>
        <span className="block line-clamp-2 text-sm font-bold">
          {neighbor ? neighbor.event.title : "なし"}
        </span>
        {neighbor && (
          <span className="block text-xs text-gray-600 tabular-nums">
            {timeText(neighbor.event)}
          </span>
        )}
      </span>
    </button>
  );
}
