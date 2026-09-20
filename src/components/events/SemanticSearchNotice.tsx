import type { SemanticOutcome } from "@/lib/semantic-search";

export interface SemanticSearchNoticeProps {
  /** 案内の種類。`null` なら何も描かない */
  outcome: SemanticOutcome | null;
  /** 来場者が入力した文字列 */
  query: string;
}

/**
 * 意味検索（第4段）の状態表示
 *
 * リテラル照合が0件だったとき、**黙って結果を差し替えません。** 来場者が入力した語が
 * そのまま含まれる企画は無いという事実を伝えたうえで、近い内容を出していると明示します。
 *
 * **「0件」の理由を混ぜてはいけません。** 意味検索も該当なしだったのか、近い企画はあるが
 * 絞り込みで消えたのかで、来場者が次に取るべき行動が正反対になります。判定は
 * `resolveSemanticOutcome()`（`src/lib/semantic-search.ts`）が持ち、ここは文言だけを持ちます。
 *
 * **`useSearchParams()` を使ってはいけません。** このコンポーネントは `EventsView` の
 * 配下にあり、`src/app/events/(list)/page.tsx` の `<Suspense>` fallback としても描かれます
 * （#156。`eslint.config.mjs` の `EVENTS_FALLBACK_TREE` に登録済み）。
 */
export function SemanticSearchNotice({ outcome, query }: SemanticSearchNoticeProps) {
  if (outcome === null) return null;

  const messages: Record<SemanticOutcome, string> = {
    loading: `「${query}」に近い企画を探しています…`,
    "no-match": `「${query}」に合う企画は見つかりませんでした。別の言葉でもお試しください。`,
    "filtered-out": `「${query}」に近い企画はありますが、現在の絞り込みでは表示できません。日程・場所・種別の条件を外してみてください。`,
    replaced: `「${query}」をそのまま含む企画はありませんでした。内容の近い企画を表示しています。`,
  };

  return (
    <p
      className="mb-4 rounded-lg bg-primary-50 px-4 py-3 text-sm text-gray-700"
      role="status"
      aria-live="polite"
    >
      {messages[outcome]}
    </p>
  );
}
