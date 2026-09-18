/**
 * microCMS の「画面プレビュー」から渡された下書きを、本番と同じルートで表示するための
 * 純粋関数群。`next/headers` に依存する読み取りは `src/lib/draft-mode.ts` にある。
 *
 * ## なぜ draftKey を cookie で運ぶのか
 *
 * Next.js の Draft Mode が持つ `__prerender_bypass` cookie は「有効か無効か」しか表現できず、
 * draftKey のような値を載せられない。かといって `searchParams` で受け取ると、それを読んだ
 * 時点でルート全体が動的レンダリングへ切り替わり、**下書きを見ない通常の訪問者に対しても
 * ISR が失われる**（`src/app/timetable/page.tsx` に同じ理由の回避記録がある）。
 *
 * そのため `/api/draft` が draftKey を別 cookie へ保存し、詳細ページはそれを読む。
 * cookie には api と id も入れて、**表示中のページと一致するときだけ**下書きを使う。
 * 一致を見ないと、企画Aのプレビューを開いた cookie のまま企画Bを開いたときに、
 * Bの draftKey として A のキーを送ってしまう。
 *
 * ## draftKey は失効する
 *
 * microCMS の draftKey は**コンテンツを保存するたびに変わる**（`docs/dev/microcms.md` に
 * curl での実測記録がある）。したがって cookie に残った古いキーは 404 を返すようになる。
 * これは異常ではなく通常の寿命であり、取得側は null を返して通常表示へ落ちる設計にしてある。
 *
 * 設定手順と運用は `docs/dev/draft-preview.md` を参照。
 */

import { type MicrocmsApi } from "./revalidate-targets";

/**
 * draftKey を運ぶ cookie の名前。
 *
 * Next.js が予約する `__prerender_bypass` / `__next_preview_data` とは別物で、
 * こちらは本プロジェクトが独自に置くもの。
 */
export const DRAFT_PREVIEW_COOKIE = "setagayafes-draft-preview";

/** プレビュー中であることと、その対象を表す。cookie に JSON で載る */
export interface DraftPreviewContext {
  /** 下書きの所属する microCMS API */
  readonly api: MicrocmsApi;
  /** 下書きのコンテンツID */
  readonly id: string;
  /** microCMS へ渡す draftKey。保存のたびに変わる */
  readonly draftKey: string;
}

/**
 * microCMS のコンテンツIDとして妥当か。
 *
 * microCMS が許すのは半角英数字・ハイフン・アンダースコアのみ。ここを通した値だけを
 * リダイレクト先のパスへ埋めることで、`/api/draft` がオープンリダイレクトにならないようにする。
 */
export function isValidContentId(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,64}$/.test(value);
}

/**
 * draftKey として妥当か。
 *
 * 形式は microCMS が決めるもので公開仕様が無いため、長さの上限を緩めに取りつつ
 * 文字種だけを縛る。cookie へ入れる前段の最低限の検査である。
 */
export function isValidDraftKey(value: string): boolean {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value);
}

/**
 * API ごとの「コンテンツID → 詳細ページのパス」。
 *
 * `Record<MicrocmsApi, ...>` にしてあるので、`MICROCMS_APIS` へ4つ目を足すと
 * ここを埋めるまでビルドが通らない（`REVALIDATE_TARGETS` と同じ思想）。
 *
 * `events` だけ戻り値が type によって割れる。著名人企画の正規URLは `/special/[id]` であり、
 * microCMS のプレビューURLからは type が分からないため、**呼び出し側が下書きを取得してから
 * 正規化済みの type を渡す**。type 未入力の下書きは `normalizeEvent()` が `"other"` へ
 * 落とすので、その場合は一般企画として `/events/[id]` へ送られる。
 */
const DRAFT_PREVIEW_PATHS: Record<
  MicrocmsApi,
  (id: string, contentType: string | undefined) => string | null
> = {
  events: (id, contentType) => (contentType === "special" ? `/special/${id}` : `/events/${id}`),
  news: (id) => `/info/${id}`,
  // informations は単一コンテンツの詳細ページを持たない（協賛一覧とFAQの構成要素にしかならない）。
  // 画面プレビューの設定自体を行わない API なので、ここへ来たら遷移先なしとして扱う。
  informations: () => null,
};

/**
 * 下書きを表示すべきページのパスを決める。
 *
 * @param api 下書きの所属する microCMS API
 * @param id コンテンツID
 * @param contentType `events` のみ使う。正規化済みの `Event["type"]` を渡すこと
 * @returns 遷移先のパス。対応する詳細ページが無い場合とIDが不正な場合は null
 */
export function resolveDraftPreviewPath(
  api: MicrocmsApi,
  id: string,
  contentType?: string
): string | null {
  if (!isValidContentId(id)) return null;
  return DRAFT_PREVIEW_PATHS[api](id, contentType);
}

/** cookie へ載せる文字列を作る */
export function serializeDraftPreviewContext(context: DraftPreviewContext): string {
  return JSON.stringify(context);
}

/**
 * cookie の値を復元する。
 *
 * cookie は利用者の手元にあり書き換えられる前提で扱う。JSON として壊れている場合はもちろん、
 * 型が合わない場合・未知の API 名・不正な文字を含むIDやキーもすべて null にする。
 * ここを通った値だけが microCMS へのクエリとパスの組み立てに使われる。
 */
export function parseDraftPreviewContext(raw: string | undefined): DraftPreviewContext | null {
  if (!raw) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }

  if (typeof parsed !== "object" || parsed === null) return null;

  const { api, id, draftKey } = parsed as Record<string, unknown>;
  if (typeof api !== "string" || typeof id !== "string" || typeof draftKey !== "string") {
    return null;
  }
  // 未知の API 名を弾く。isMicrocmsApi を使わず Record のキーで判定すると、
  // 将来 API が増えたときに遷移先の定義漏れをそのまま通してしまう
  if (!(api in DRAFT_PREVIEW_PATHS)) return null;
  if (!isValidContentId(id) || !isValidDraftKey(draftKey)) return null;

  return { api: api as MicrocmsApi, id, draftKey };
}
