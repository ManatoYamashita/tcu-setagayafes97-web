import type { Event } from "@/types/events";
import { buildEventsQuery, type FilterParams } from "@/lib/filters";
import type { BuildingFilterOption } from "@/data/filter-options";
import { EventFilters } from "./EventFilters";
import { EventInfiniteList } from "./EventInfiniteList";
import { SemanticSearchNotice, type SemanticSearchNoticeProps } from "./SemanticSearchNotice";

interface EventsViewProps {
  /**
   * 絞り込み適用後の**全企画**
   *
   * ページ分割してから渡してはいけません。表示範囲は `EventInfiniteList` が
   * 自分で `slice()` します。ここで切ると、その先が永久に読めなくなります。
   */
  events: Event[];
  /** 現在のフィルター。EventFilters と EventInfiniteList が遷移先URLの組み立てに使う */
  filters: FilterParams;
  /**
   * 建物の選択肢
   *
   * 全企画から導出するため、絞り込み後の `events` からは作れません。
   * `src/app/events/(list)/page.tsx` が `listBuildingOptions()` で1回だけ作って降ろします。
   */
  buildingOptions: BuildingFilterOption[];
  /** 最初に表示する件数（`resolveVisibleCount` の結果） */
  initialVisibleCount: number;
  /** 1回の追加で増やす件数 */
  step: number;
  /**
   * 意味検索（第4段）の状態
   *
   * `undefined` は「リテラル検索で当たったので第4段は関与していない」という意味です。
   * `<Suspense>` の fallback としてこのツリーが描かれるときも `undefined` になります。
   */
  semantic?: SemanticSearchNoticeProps;
}

/**
 * 企画一覧の表示ツリー
 *
 * **`useSearchParams()` に依存させないこと。** これは意図的な制約です。
 *
 * このツリーは `src/app/events/(list)/page.tsx` の `<Suspense>` の fallback としても描かれます。
 * fallback は「境界がクライアント描画へ落ちたときに静的HTMLへ出力されるもの」であり、
 * その中で `useSearchParams()` を呼ぶと fallback 自身が bailout して落ちる先を失います。
 * クエリを読むのは `EventsContent` の1箇所だけに保ってください。
 *
 * 背景と実測は docs/frontend/static-html-and-search-params.md を参照。
 */
export function EventsView({
  events,
  filters,
  buildingOptions,
  initialVisibleCount,
  step,
  semantic,
}: EventsViewProps) {
  /**
   * 絞り込みが変わったら表示件数を先頭へ戻すための key
   *
   * `EventInfiniteList` は表示件数を自分の state で持ち、**props の変化では上書きしません。**
   * 日程や種別を変えたのに「36件表示中」のまま残らないよう、ここで再マウントさせます。
   *
   * **`page` を含めてはいけません。** 継ぎ足しのたびに `history.replaceState` が
   * `?page=N` を書き戻すため、含めると1回追加するごとに一覧全体が作り直され、
   * 表示件数が12件へ巻き戻ります。`buildEventsQuery(filters)` は第2引数を省くと
   * `page` を付けないので、絞り込みだけの指紋になります。
   *
   * **意味検索の状態遷移は含めます。** `EventInfiniteList` は表示件数を `useState` の
   * 初期化子で1度だけ決め、props の変化では上書きしません。第4段が走るのは
   * リテラル検索が0件のときだけなので、初回の表示件数は必ず0になります。
   * ここで作り直さないと、結果が返っても**一覧が0件のまま動きません。**
   */
  const listKey = `${buildEventsQuery(filters) || "all"}${semantic?.outcome ? `|${semantic.outcome}` : ""}`;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="lg:grid lg:grid-cols-[300px_1fr] lg:gap-8">
        {/*
          サイドバー: フィルター

          **スクロールしても画面内に残す**（#239）。読み進めた来場者が絞り込みを変えるために
          ページ先頭まで戻らなくてよいようにするためです。

          `self-start` は grid で必須です。grid item の既定は `align-self: stretch` で、
          高さが行全体（= カード群の高さ）まで伸びるため、**sticky が一度も貼り付きません。**
          見た目は変わらないので、外すと静かに追従だけが失われます。

          `lg` 未満では通常フローの中で貼り付きます。背景を白で敷き、左右は `-mx-4 px-4` で
          シートの端まで伸ばしています。敷かないと、背後を流れるカードが透けて重なります。
          `z-20` はカードより上・ヘッダー（`z-40`）より下という意味です。

          **`lg` 未満の `top` は `--header-height` より 1rem 小さくします。** この変数は
          ページ最上部のヘッダー（88px）の値ですが、スクロール中のヘッダーはピル型へ縮んで
          実高 77px になります。変数のまま 88px に置くと 11px の隙間が空き、そこを
          カードが通り抜けて見えます（2026-09-20 実測。`elementFromPoint` が
          `DIV.grid` を返した）。72px まで上げてピルの背後へ 5px 潜り込ませると隙間が消えます。
          ヘッダーは `z-40` なので、潜り込んだぶんは隠れて見えません。

          `lg` 側は逆に +1rem の余白を取ります。カードは右カラムにあり aside の背後を
          通らないため、隙間が見た目の問題になりません。
        */}
        <aside className="sticky top-[calc(var(--header-height)-1rem)] z-20 -mx-4 mb-8 self-start bg-white px-4 py-2 lg:top-[calc(var(--header-height)+1rem)] lg:mx-0 lg:mb-0 lg:bg-transparent lg:px-0 lg:py-0">
          <EventFilters filters={filters} buildingOptions={buildingOptions} />
        </aside>

        {/*
          結果一覧。PageSheetLayout が <main> を出すようになったため div に戻す。
          ここはサイドバー（aside）と並ぶ一区画であり、ページの main ではない
        */}
        <div>
          {/* 意味検索（第4段）の状態。リテラル検索で当たったときは描かれない */}
          {semantic && <SemanticSearchNotice {...semantic} />}

          {/* 検索結果件数 */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-gray-700" role="status" aria-live="polite">
              <span className="font-semibold text-gray-900">{events.length}</span>{" "}
              件の企画が見つかりました
            </p>
          </div>

          {/* 企画グリッド（無限スクロール） */}
          <EventInfiniteList
            key={listKey}
            events={events}
            initialVisibleCount={initialVisibleCount}
            step={step}
            filters={filters}
          />
        </div>
      </div>
    </div>
  );
}
