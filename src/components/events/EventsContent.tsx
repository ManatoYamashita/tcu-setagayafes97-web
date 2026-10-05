"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import type { Event } from "@/types/events";
import {
  filterEvents,
  listBuildingOptions,
  parseEventFilters,
  parseEventPage,
  resolveVisibleCount,
  EVENTS_PER_PAGE,
} from "@/lib/filters";
import {
  resolveSemanticOutcome,
  selectSemanticEvents,
  shouldAskSemanticSearch,
} from "@/lib/semantic-search";
import { seededShuffle } from "@/lib/shuffle";
import { EventsView } from "./EventsView";
import { useSemanticSearch } from "./useSemanticSearch";
import { useShuffleSeed } from "./useShuffleSeed";

interface EventsContentProps {
  initialEvents: Event[];
}

/**
 * 企画一覧コンテンツ
 * クライアントサイドで絞り込みを行い、一覧は無限スクロールで継ぎ足す
 *
 * **このアプリで `/events` のクエリを読むのはここだけです。** `useSearchParams()` は
 * 静的レンダリング時に「最も近い `<Suspense>` 境界より内側」をクライアント描画へ落とします。
 * 読む場所を増やすと落ちる範囲が広がるため、下位（`EventFilters` / `EventInfiniteList`）へは
 * 値を props で渡します。境界は `src/app/events/(list)/page.tsx` にあります（#156）。
 */
export function EventsContent({ initialEvents }: EventsContentProps) {
  const searchParams = useSearchParams();

  // URL Search Params からフィルター情報を取得
  const filters = parseEventFilters(searchParams);
  const currentPage = parseEventPage(searchParams);

  // 建物の選択肢。全企画から導出するので、絞り込み後の配列からは作れない。
  //
  // **選択中の建物を渡せるのはここだけ。** page.tsx は useSearchParams() を読まないため
  // 選択値を知らず、そちらで作った配列を降ろすと listBuildingOptions() の selected が
  // production から一度も渡らない。該当0件の建物（?building=7号館 など）を指定されたとき、
  // <select> の value が選択肢に無い状態＝ selectedIndex = -1 になり、絞り込みが
  // 効いていないように見える。
  const buildingOptions = listBuildingOptions(initialEvents, filters.building);

  /*
   * 表示順のランダム化（#409）
   *
   * microCMS は公開日の新しい順に返すため、そのままだと同じ企画が先頭に出続ける。
   * 来場者ごとに並びを変えて、団体の間で露出の差が出ないようにする。
   *
   * **絞り込みの前にシャッフルする。** 日程・種別・建物の絞り込みは順番を保つので、
   * 条件を変えても企画同士の前後関係は変わらない。キーワード検索は関連度で並べ替え、
   * 同点の企画だけがこの順に並ぶ。意味検索は `ranking` の順で組み直すので影響を受けない。
   *
   * シードの寿命とサーバーで並べ替えない理由は `useShuffleSeed` を参照。
   */
  const seed = useShuffleSeed();
  const orderedEvents = useMemo(
    () => (seed === null ? initialEvents : seededShuffle(initialEvents, seed)),
    [initialEvents, seed]
  );

  // フィルタリング（段1〜3のリテラル検索まで）
  const literalEvents = filterEvents(orderedEvents, filters);

  /*
   * 第4段（意味検索）のゲート
   *
   * **段1〜3のどれかが当たったら呼ばない。** `/api/search` は認証の無い従量課金口で、
   * 1リクエストがそのまま TypeSafe への課金になる。`たこ焼き` や `9号館 ダンス` は
   * リテラル照合が同じ答えを無料・0msで出すため、そこへ課金する理由がない。
   *
   * 判定は**絞り込み前の全企画**に対して行う。日程や建物で0件になっただけのケースまで
   * 落とすと、どのみち下の積集合で消える結果に課金することになる。
   */
  const keyword = filters.keyword ?? "";
  const semanticEnabled = shouldAskSemanticSearch(initialEvents, keyword);
  const semantic = useSemanticSearch(keyword, semanticEnabled);

  /*
   * ランキングと現在の絞り込みの積集合
   *
   * `/api/search` は日程・種別・建物を知らず、常に全企画のランキングを返す。そのぶん
   * URLの種類が減ってCDNに載る。絞り込みはここで掛け直す。`selectSemanticEvents` は
   * 手元に無いIDを黙って捨てるため、削除済みの企画が返っても壊れない。
   */
  const semanticEvents =
    semanticEnabled && semantic.result?.hasMatch
      ? selectSemanticEvents(
          semantic.result.ranking,
          filterEvents(initialEvents, { ...filters, keyword: "" })
        )
      : [];

  const events = semanticEvents.length > 0 ? semanticEvents : literalEvents;

  /*
   * ページ分割はしない。絞り込み後の全件をそのまま降ろし、表示範囲は
   * EventInfiniteList が自分の state で決める（#239）。
   *
   * `?page=N` は「N ページ目だけを見せる」ではなく「N ページ分を展開した状態で着地する」
   * という意味になった。ページ分割の時代に配られたURLとブラウザバックを壊さないための
   * 後方互換で、負値や範囲外の丸めは resolveVisibleCount が引き受ける。
   */
  return (
    <EventsView
      events={events}
      filters={filters}
      buildingOptions={buildingOptions}
      initialVisibleCount={resolveVisibleCount(currentPage, EVENTS_PER_PAGE, events.length)}
      step={EVENTS_PER_PAGE}
      semantic={
        semanticEnabled
          ? {
              outcome: resolveSemanticOutcome(
                semantic.status,
                semantic.result?.hasMatch ?? false,
                semanticEvents.length
              ),
              query: keyword,
            }
          : undefined
      }
    />
  );
}
