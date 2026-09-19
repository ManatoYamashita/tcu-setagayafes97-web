"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Event } from "@/types/events";
import { buildEventsQuery, type FilterParams } from "@/lib/filters";
import { EventGrid } from "./EventGrid";

interface EventInfiniteListProps {
  /** 絞り込み適用後の全企画。ここへ渡す前にページ分割してはいけません（下記参照） */
  events: Event[];
  /** 最初に表示する件数（`resolveVisibleCount` の結果） */
  initialVisibleCount: number;
  /** 1回の追加で増やす件数 */
  step: number;
  /** 現在の絞り込み。URL へ `page` を書き戻すときに使います */
  filters: FilterParams;
}

/**
 * センチネルを何px手前で発火させるか
 *
 * 末尾に到達してから読み込むと、指を止めた瞬間に空白が見えます。1画面ぶん手前から
 * 継ぎ足すことで、来場者には「切れ目なく続いている」ように見えます。
 *
 * **大きくしすぎてはいけません。** 追加したカードの高さがこの値を超えないと、
 * 新しいセンチネルが生成直後にまた視界へ入り、連鎖して全件が一気に展開します。
 * 1回の追加（12件）はモバイル1列で約4,800px、デスクトップ4列で約1,200px 伸びるため、
 * 300px はどちらでも安全側です。
 */
const SENTINEL_ROOT_MARGIN = "300px 0px";

/**
 * 企画一覧の無限スクロール
 *
 * 末尾に近づくと自動で次の12件を継ぎ足し、同じ位置に「もっと見る」ボタンも常設します。
 *
 * **ボタンは装飾ではありません。** `IntersectionObserver` が発火しない経路が実在します。
 *
 * - キーボードのみの操作（Tab でフォーカスは進むが、ビューポートが観測条件を満たすとは限らない）
 * - スクリーンリーダーの仮想カーソル移動（読み上げ位置は動いてもスクロールしないことがある）
 * - 省電力モードや拡張機能によるレンダリング抑制、`IntersectionObserver` 非対応環境
 *
 * これらの環境では、ボタンが13件目以降への**唯一の到達手段**になります。外さないでください。
 *
 * ## `useSearchParams()` を使ってはいけません
 *
 * このコンポーネントは `EventsView` の配下にあり、`src/app/events/(list)/page.tsx` の
 * `<Suspense>` **fallback としても描かれます。** fallback にはそれ以上落ちる先が無いため、
 * ここでクエリを読むと fallback 自身が bailout し、ページ本体が静的HTMLから丸ごと消えます（#156）。
 * 現在の絞り込みは props で受け取ります。`eslint.config.mjs` の `EVENTS_FALLBACK_TREE` に
 * このファイルを登録してあり、`useSearchParams` の import は lint で落ちます。
 *
 * `useState` / `useEffect` / `useRef` と `window.history` は bailout を起こさないため使えます。
 *
 * ## ページ分割済みの配列を渡してはいけません
 *
 * 絞り込み後の**全件**を受け取り、表示範囲は自分で `slice()` します。`getEventsList(200)` が
 * 既に全件をサーバーから降ろしているため、追加読み込みに通信は発生しません。呼び出し側で
 * 切ってから渡すと、その先が永久に読めなくなります。
 */
export function EventInfiniteList({
  events,
  initialVisibleCount,
  step,
  filters,
}: EventInfiniteListProps) {
  /**
   * 現在の表示件数
   *
   * **props の変化で上書きしません。** 絞り込みが変わったときのリセットは、呼び出し側
   * （`EventsView`）が `key` を変えて再マウントすることで担保しています。ここで
   * `initialVisibleCount` に追従させると、下記の `history.replaceState` が書き戻した
   * `?page=N` を読んだ再レンダリングと噛み合って、表示件数が巻き戻ります。
   */
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(initialVisibleCount, events.length)
  );

  const sentinelRef = useRef<HTMLDivElement>(null);
  const completionRef = useRef<HTMLParagraphElement>(null);

  /**
   * 「もっと見る」で全件に達したか
   *
   * ボタンが消えるとフォーカスが `<body>` へ落ち、次の Tab がページ先頭へ戻ってしまいます。
   * ボタン由来の追加で打ち止めになったときだけ、完了メッセージへフォーカスを移します。
   * 自動追加（スクロール）のときは移しません。来場者の読んでいる位置が飛ぶためです。
   */
  const focusCompletionRef = useRef(false);

  const total = events.length;
  const hasMore = visibleCount < total;
  const remaining = total - visibleCount;

  const loadMore = useCallback(() => {
    setVisibleCount((current) => Math.min(current + step, total));
  }, [step, total]);

  const handleLoadMoreClick = () => {
    focusCompletionRef.current = visibleCount + step >= total;
    loadMore();
  };

  /**
   * 末尾センチネルの監視
   *
   * **発火したら即 `disconnect()` します。** 1回のコールバックに複数エントリが載ることも、
   * 再監視までに続けて発火することもあり、`setVisibleCount` は関数型更新なので
   * そのぶん加算が累積します。次の監視はこの効果が組み直されるときに始まります。
   *
   * **打ち切り条件に `hasMore` ではなく `visibleCount` を直に書いているのは意図的です。**
   * 切ったあと張り直す契機は「`visibleCount` が変わって効果が組み直されること」だけですが、
   * `hasMore` と `loadMore` は継ぎ足しても値・参照ともに変わりません。依存が
   * `[hasMore, loadMore]` だと効果が二度と再実行されず、**1回だけ追加して永久に止まります**
   * （2026-09-20 実測。12件 → 24件 で打ち止めになった）。
   *
   * この事故は lint / 型 / ユニットテスト / build のすべてを通過します。`/events` は
   * microCMS を読むため CI では0件になり、**E2E を置いても企画が無いまま緑になります**
   * （`getEventsList` は `isMicrocmsConfigured` が false なら `[]` を返す）。
   * そこで `visibleCount` を効果の中で直接読み、`react-hooks/exhaustive-deps` に
   * 依存を強制させています。**この参照を `hasMore` へ戻すと、規則ごと無効になります。**
   */
  useEffect(() => {
    if (visibleCount >= total) return;

    const node = sentinelRef.current;
    if (!node) return;
    if (typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        loadMore();
      },
      { rootMargin: SENTINEL_ROOT_MARGIN }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [visibleCount, total, loadMore]);

  /**
   * ボタンで打ち止めになったときのフォーカス移動
   */
  useEffect(() => {
    if (!focusCompletionRef.current) return;
    focusCompletionRef.current = false;
    completionRef.current?.focus();
  }, [visibleCount]);

  /**
   * 絞り込みだけを表したクエリ（`page` を含まない）
   *
   * 下の効果の依存に `filters` を直接置けないため、文字列へ畳んでから渡します
   * （`filters` は呼び出し側で毎レンダー組み直されるので参照が一致しません）。
   */
  const filterQuery = buildEventsQuery(filters);

  /**
   * 読み進めた位置を URL へ書き戻す
   *
   * 企画詳細から戻ったときに読み込み位置が失われないようにするためです。
   *
   * **`router.replace()` ではなく `window.history.replaceState` を使います。** 前者は
   * ナビゲーションを起こし、`EventsContent` の再描画とスクロール位置の復元が走るため、
   * 継ぎ足しのたびに画面が跳ねます。後者は App Router と同期しつつ履歴だけを差し替えます。
   * 第1引数は Next.js の公式例どおり `null` を渡します（ルーター側が内部状態を補います）。
   */
  useEffect(() => {
    const page = Math.ceil(visibleCount / step);
    const params = new URLSearchParams(filterQuery);
    if (page > 1) params.set("page", String(page));

    const query = params.toString();
    const href = query ? `/events?${query}` : "/events";

    if (window.location.pathname + window.location.search === href) return;
    window.history.replaceState(null, "", href);
  }, [visibleCount, step, filterQuery]);

  return (
    <>
      <EventGrid events={events.slice(0, visibleCount)} />

      {/*
        追加読み込みの通知

        絞り込みの変更では読み上げられません。`key` による再マウントで領域ごと作り直されるため、
        ライブリージョンが「既存領域の変化」として扱わないからです。件数そのものの通知は
        EventsView 側のライブリージョンが担当しており、二重に読み上げられることはありません。
      */}
      <p className="sr-only" role="status" aria-live="polite">
        {total > 0 && `${total} 件中 ${visibleCount} 件を表示しています`}
      </p>

      {hasMore && (
        <div ref={sentinelRef} className="mt-12 flex justify-center">
          <button
            type="button"
            onClick={handleLoadMoreClick}
            className="inline-flex items-center gap-2 rounded-full border border-primary-600 bg-primary-600 px-8 py-3 text-base font-semibold text-white transition-colors hoverable:hover:bg-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
          >
            もっと見る
            <span className="text-sm font-normal">（残り {remaining} 件）</span>
          </button>
        </div>
      )}

      {/* 打ち止めの明示。1ページ分に満たない結果では出さない（継ぎ足しが一度も起きていないため） */}
      {!hasMore && total > step && (
        <p
          ref={completionRef}
          tabIndex={-1}
          className="mt-12 text-center text-sm text-gray-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
        >
          すべての企画（{total} 件）を表示しました
        </p>
      )}
    </>
  );
}
