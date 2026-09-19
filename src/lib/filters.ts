import {
  buildings,
  dateFilterOptions,
  getBuildingLabel,
  isKnownBuildingId,
  OTHER_BUILDING_ID,
  resolveBuildingId,
  typeFilterOptions,
  type BuildingFilterOption,
} from "@/data/filter-options";
import { searchEvents } from "./search";
import type { Event, EventDate, EventType } from "@/types/events";

/**
 * フィルターパラメータ型
 */
export interface FilterParams {
  date?: EventDate | "all";
  type?: EventType | "all";
  building?: string;
  keyword?: string;
}

/**
 * 1ページあたりの表示件数
 *
 * `EventsContent` のローカル定数でしたが、`src/app/events/page.tsx` が
 * <Suspense> の fallback 用に同じ区切りで1ページ目を切り出す必要があるため引き上げました。
 * 2箇所で別々に持つと、fallback と本描画で表示件数がずれます。
 */
export const EVENTS_PER_PAGE = 12;

/**
 * 絞り込み無しの状態
 *
 * クエリを持たない `/events` に相当します。`page.tsx` の fallback はこの状態を描きます。
 */
export const DEFAULT_EVENT_FILTERS: FilterParams = {
  date: "all",
  type: "all",
  building: "all",
  keyword: "",
};

/**
 * `URLSearchParams` の読み取りに必要な最小限の形
 *
 * `next/navigation` の `ReadonlyURLSearchParams` と `URLSearchParams` の両方が満たします。
 * このモジュールを Next.js に依存させないための構造的型で、ユニットテストからは
 * 素の `URLSearchParams` を渡せます。
 */
interface SearchParamsLike {
  get(name: string): string | null;
}

/** 実在する日程の値（"all" を含む） */
const knownDates = new Set<string>(dateFilterOptions.map((option) => option.value));

/** 実在する企画種別の値（"all" を含む） */
const knownTypes = new Set<string>(typeFilterOptions.map((option) => option.value));

/**
 * URL のクエリ値をホワイトリストで検証する
 *
 * **素通しにしてはいけません。** 以前は `as` キャストだけだったため、`?type=Stage` のように
 * 大小文字が違うだけの値や、`?type=bogus` のような存在しない値が、エラーにも既定値にもならず
 * **静かに0件**を返していました。来場者からは「絞り込みが壊れている」と見えます。
 *
 * @param raw クエリの生値
 * @param known 許可する値の集合
 * @returns 集合に含まれる値、含まれなければ "all"
 */
function parseOption(raw: string | null, known: Set<string>): string {
  if (!raw) return "all";
  const normalized = raw.trim().toLowerCase();
  return known.has(normalized) ? normalized : "all";
}

/**
 * 建物のクエリ値を検証する
 *
 * 建物IDは `9号館` のような日本語なので `toLowerCase()` はせず、
 * `isKnownBuildingId()`（`src/data/filter-options.ts`）で照合します。
 */
function parseBuilding(raw: string | null): string {
  if (!raw) return "all";
  const value = raw.trim();
  if (value === "all" || value === "") return "all";
  return isKnownBuildingId(value) ? value : "all";
}

/**
 * URL のクエリからフィルターパラメータを組み立てる
 * @param params 読み取り元のクエリ
 * @returns 未指定の項目を既定値（"all" / 空文字）で埋めたフィルターパラメータ
 */
export function parseEventFilters(params: SearchParamsLike): FilterParams {
  return {
    date: parseOption(params.get("date"), knownDates) as EventDate | "all",
    type: parseOption(params.get("type"), knownTypes) as EventType | "all",
    building: parseBuilding(params.get("building")),
    // 空白だけのキーワードで検索を走らせない。`?keyword=%20` は truthy なので
    // trim しないと「全件から空白を含むものを探す」という無意味な検索になる
    keyword: (params.get("keyword") || "").trim(),
  };
}

/**
 * URL のクエリから現在のページ番号を取り出す
 *
 * 無限スクロールへ移行した後も残しています。`?page=N` は「N ページ目だけを見せる」ではなく
 * **「N ページ分を展開した状態で着地する」**という意味になりました（`resolveVisibleCount`）。
 *
 * @param params 読み取り元のクエリ
 * @returns ページ番号。数値として読めない場合は 1
 *
 * 範囲の検証はしません。負値や範囲外の丸めは `resolveVisibleCount` が引き受けます（#162）。
 */
export function parseEventPage(params: SearchParamsLike): number {
  return Number(params.get("page")) || 1;
}

/**
 * フィルターパラメータから URL のクエリ文字列を組み立てる
 * @param filters フィルターパラメータ
 * @param page ページ番号（1 のときは付けない）
 * @returns クエリ文字列。既定値だけなら空文字
 *
 * 既定値（"all" / 空文字 / page === 1）は落とします。`/events` の正規URLを
 * クエリ無しに保ち、`?date=all&type=all` のような同一内容の別URLを作らないためです。
 *
 * **現在URLの未知パラメータは引き継ぎません。** 以前は `searchParams.toString()` を
 * 起点にしていましたが、`/events` が読むパラメータは date / type / building / keyword / page の
 * 5つだけであり（`parseEventFilters` と `parseEventPage` が読む全て）、props から組み直しても
 * 等価です。この形にしたのは、`EventFilters` と `EventInfiniteList` から `useSearchParams()` を
 * 外すためです（理由は `EventsView` のコメントを参照）。
 */
export function buildEventsQuery(filters: FilterParams, page = 1): string {
  const params = new URLSearchParams();

  if (filters.date && filters.date !== "all") params.set("date", filters.date);
  if (filters.type && filters.type !== "all") params.set("type", filters.type);
  if (filters.building && filters.building !== "all") params.set("building", filters.building);
  if (filters.keyword) params.set("keyword", filters.keyword);
  if (page > 1) params.set("page", String(page));

  return params.toString();
}

/**
 * フィルターパラメータから `/events` の URL を組み立てる
 * @param filters フィルターパラメータ
 * @param page ページ番号（1 のときは付けない）
 * @returns 例: `/events?type=stage`。既定値だけなら `/events`
 */
export function eventsHref(filters: FilterParams, page = 1): string {
  const query = buildEventsQuery(filters, page);
  return query ? `/events?${query}` : "/events";
}

/**
 * 企画が指定された日程に該当するか
 *
 * **両日開催（`both`）は Day1 にも Day2 にも含めます。** 1日目を選んだ来場者にとって、
 * 両日やっている企画は「1日目にやっている企画」だからです。厳密一致にすると
 * 「あるはずの企画が出ない」というバグに見えます。
 *
 * `src/lib/timetable.ts` の `filterEventsByDate()` もこの述語を使います。
 * **規則を2箇所で持たないこと。** 片方だけ変えると、企画一覧とタイムテーブルで
 * 同じ日の企画数が食い違います。
 *
 * @param event 判定する企画
 * @param date 絞り込む日程。"all" は常に true
 */
export function matchesEventDate(event: Event, date: EventDate | "all"): boolean {
  if (date === "all") return true;
  if (date === "day1" || date === "day2") return event.date === date || event.date === "both";
  return event.date === date;
}

/**
 * 企画をフィルタリング
 * @param events 企画の配列
 * @param filters フィルターパラメータ
 * @returns フィルタリングされた企画の配列。キーワード指定時は関連度順
 */
export function filterEvents(events: Event[], filters: FilterParams): Event[] {
  let filtered = events;

  // 日程フィルター
  if (filters.date && filters.date !== "all") {
    const date = filters.date;
    filtered = filtered.filter((e) => matchesEventDate(e, date));
  }

  // 企画種別フィルター
  if (filters.type && filters.type !== "all") {
    filtered = filtered.filter((e) => e.type === filters.type);
  }

  // 建物フィルター
  //
  // microCMS の `building` は実データで全件未入力のため、`e.building` との比較は
  // 常に0件になる（#166）。入稿済みの `place` から導出した建物IDで判定する。
  if (filters.building && filters.building !== "all") {
    filtered = filtered.filter((e) => resolveBuildingId(e.place, e.building) === filters.building);
  }

  // キーワード検索（結果は関連度順に並ぶ）
  if (filters.keyword) {
    filtered = searchEvents(filtered, filters.keyword);
  }

  return filtered;
}

/**
 * 実データに存在する建物だけを選択肢として返す
 *
 * `src/lib/timetable.ts` の `listStageTabs()` と同じ設計です。固定の14件を出していた頃は、
 * どれを選んでも0件になる選択肢が並んでいました。
 *
 * **選択中の値は該当0件でもリストへ残します。** 外すと `<select>` の `value` が
 * 選択肢に無い状態になり、React が警告を出したうえで表示が「すべて」へ化けます。
 *
 * @param events 全企画（絞り込み前のもの）
 * @param selected 現在選択中の建物ID
 * @returns 「すべて」を先頭に、`buildings` の宣言順（最後に「その他」）で並べた選択肢
 */
export function listBuildingOptions(
  events: Event[],
  selected: string = "all"
): BuildingFilterOption[] {
  const present = new Set(events.map((event) => resolveBuildingId(event.place, event.building)));

  if (selected !== "all" && isKnownBuildingId(selected)) {
    present.add(selected);
  }

  const order = [...buildings.map((building) => building.id), OTHER_BUILDING_ID];

  return [
    { value: "all", label: "すべて" },
    ...order
      .filter((id) => present.has(id))
      .map((id) => ({ value: id, label: getBuildingLabel(id) })),
  ];
}

/**
 * 初期表示件数を決める
 *
 * 無限スクロールで「最初に何件出すか」です。`?page=3` で着地したら 3 ページ分
 * （36件）を展開した状態で開きます。ページ分割の時代に配られた既存のURL・
 * ブックマーク・ブラウザバックを壊さないための後方互換です。
 *
 * **範囲外を空にしてはいけません。** `page` は URL のクエリから検証なしに入ります
 * （`parseEventPage` の `Number(params.get("page")) || 1`。`-1` は truthy なので
 * `|| 1` を素通りします）。ページ分割だった頃は範囲外を空配列として扱っていましたが（#162）、
 * 無限スクロールで同じことをすると `?page=-1` や `?page=999` が**カードの無い真っ白な一覧**に
 * なります。ページを1枚選ぶのではなく「先頭からどこまで出すか」を決める値なので、
 * 常に最低1ページ分を出し、総件数を超える指定は総件数へ丸めます。
 *
 * @param page URL から読んだページ番号
 * @param perPage 1ページあたりの件数
 * @param total 絞り込み適用後の総件数
 * @returns 最初に表示する件数。1ページ分以上・総件数以下（総件数が0なら0）
 */
export function resolveVisibleCount(page: number, perPage: number, total: number): number {
  // 小数は切り捨てる。?page=1.5 が 18 件という半端な初期値にならないように
  const safePage = Math.floor(page);
  const requested = safePage < 1 ? perPage : safePage * perPage;
  return Math.min(requested, total);
}
