import type { SemanticSearchStatus } from "./useSemanticSearch";

export interface SemanticSearchNoticeProps {
  /** 第4段の状態 */
  status: SemanticSearchStatus;
  /** 来場者が入力した文字列 */
  query: string;
  /** 意味検索も該当なしと判定したか */
  noMatch: boolean;
}

/**
 * 意味検索（第4段）の状態表示
 *
 * リテラル照合が0件だったとき、**黙って結果を差し替えません。** 来場者が入力した語が
 * そのまま含まれる企画は無いという事実を伝えたうえで、近い内容を出していると明示します。
 *
 * **`useSearchParams()` を使ってはいけません。** このコンポーネントは `EventsView` の
 * 配下にあり、`src/app/events/(list)/page.tsx` の `<Suspense>` fallback としても描かれます
 * （#156。`eslint.config.mjs` の `EVENTS_FALLBACK_TREE` に登録済み）。
 *
 * `failed` で何も描かないのは意図的です。TypeSafe が落ちていることは来場者には関係が無く、
 * 出せるものが増えるわけでもありません。
 */
export function SemanticSearchNotice({ status, query, noMatch }: SemanticSearchNoticeProps) {
  if (status === "idle" || status === "failed") return null;

  const message =
    status === "loading"
      ? `「${query}」に近い企画を探しています…`
      : noMatch
        ? `「${query}」に合う企画は見つかりませんでした。別の言葉でもお試しください。`
        : `「${query}」をそのまま含む企画はありませんでした。内容の近い企画を表示しています。`;

  return (
    <p
      className="mb-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-gray-700"
      role="status"
      aria-live="polite"
    >
      {message}
    </p>
  );
}
