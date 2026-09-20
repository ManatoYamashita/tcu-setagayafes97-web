"use client";

import { useEffect, useState } from "react";
import { normalizeSemanticQuery, type SemanticSearchResult } from "@/lib/semantic-search";

/**
 * 意味検索（第4段）を `/api/search` へ問い合わせるフック
 *
 * **`useSearchParams()` を使ってはいけません。** このフックは `EventsContent` からだけ
 * 呼ばれますが、将来 `EventsView` 配下へ移されると `<Suspense>` fallback の中で
 * クエリを読むことになり、ページ本体が静的HTMLから消えます（#156）。現在のキーワードは
 * 引数で受け取ります。
 *
 * 呼ぶかどうかの判断はここではなく `shouldAskSemanticSearch()` が持ちます。
 * このフックは「呼ぶと決まったものを、なるべく少ない回数で叩く」ことだけを担当します。
 */

/**
 * 既存の300msデバウンスに上乗せする待ち時間
 *
 * `EventFilters` の300msデバウンスを抜けた値がURLへ入り、ここへ届きます。それでも
 * `食べ` → `食べ物` のように**途中の2文字以上が通過するたびに課金が発生する**ため、
 * もう一段待ちます。合計で最後の打鍵から約700msです。
 */
export const SEMANTIC_DEBOUNCE_MS = 400;

export type SemanticSearchStatus = "idle" | "loading" | "done" | "failed";

export interface SemanticSearchState {
  status: SemanticSearchStatus;
  /** `status` が `done` のときだけ入る */
  result: SemanticSearchResult | null;
}

/** 第4段が関与していない状態。参照を固定して無駄な再レンダリングを避ける */
const IDLE: SemanticSearchState = { status: "idle", result: null };

/** 問い合わせ中。結果がまだ無いことから導出されるので、state としては持たない */
const LOADING: SemanticSearchState = { status: "loading", result: null };

/**
 * 正規化済みクエリ → 結果
 *
 * モジュールスコープなので、絞り込みを変えて一覧が作り直されても残ります。
 * **同じ要望を2度叩かないための、いちばん手前の節約です。**
 * `食べ物` と `食べ物　`（末尾全角空白）は正規化後に同じキーになります。
 */
const cache = new Map<string, SemanticSearchResult>();

/**
 * 実行中の問い合わせ（正規化済みクエリ → その Promise）
 *
 * **キャッシュだけでは二重発火を防げません。** キャッシュが埋まるのは応答が返ったあとで、
 * それまでに効果がもう一度走ると、同じクエリで2本目が飛びます。実測（2026-09-21、
 * 絞り込み付きURLからの入力）で2本飛んだため、実行中のものを共有して1本に畳みます。
 * **1本が 0.097円なので、二重発火はそのまま二重課金です。**
 */
const inflight = new Map<string, Promise<SemanticSearchResult>>();

/**
 * 1クエリぶんの問い合わせ。同じキーが実行中ならそれを共有する
 *
 * **中断しません。** リクエストを送った時点で課金は発生しており、途中で切っても
 * 費用は戻りません。最後まで走らせてキャッシュへ入れるほうが、次の入力で得になります。
 */
function request(key: string, rawQuery: string): Promise<SemanticSearchResult> {
  const running = inflight.get(key);

  if (running) return running;

  /*
   * 正規化前の生入力を送る。`normalizeText()` はカタカナをひらがなへ寄せ長音符を
   * 落とすため、`スケボー` が `すけぼ` になって手がかりが減る。正規化済みの値は
   * 検証とキャッシュのキーにだけ使う。
   */
  const promise = fetch(`/api/search?q=${encodeURIComponent(rawQuery)}`)
    .then(async (response) => {
      if (!response.ok) throw new Error(`status ${response.status}`);

      const json = (await response.json()) as Partial<SemanticSearchResult> & {
        success?: boolean;
      };

      if (!json.success || !json.ranking) throw new Error("unsuccessful response");

      return {
        hasMatch: !!json.hasMatch,
        matchProbability: json.matchProbability ?? 0,
        ranking: json.ranking,
      } satisfies SemanticSearchResult;
    })
    .then((result) => {
      cache.set(key, result);
      return result;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, promise);

  return promise;
}

/**
 * 取得が終わった1件ぶん
 *
 * **`status: "loading"` をここへ持ちません。** 効果の本体で同期的に `setState` すると
 * React が段階的な再レンダリングを起こし、`react-hooks/set-state-in-effect` が落とします。
 * 「まだ結果が無い＝読み込み中」は下の導出で表せるため、状態として持つ必要がありません。
 */
interface FetchedEntry {
  /** どの正規化済みクエリに対する結果か */
  key: string;
  status: "done" | "failed";
  result: SemanticSearchResult | null;
}

export function useSemanticSearch(query: string, enabled: boolean): SemanticSearchState {
  const [fetched, setFetched] = useState<FetchedEntry | null>(null);

  const key = enabled ? normalizeSemanticQuery(query) : null;
  const cached = key === null ? undefined : cache.get(key);

  useEffect(() => {
    if (key === null) return;
    if (cache.has(key)) return;

    let stale = false;

    const timer = setTimeout(() => {
      request(key, query)
        .then((result) => {
          if (!stale) setFetched({ key, status: "done", result });
        })
        .catch(() => {
          // 失敗は表に出さない。既存のリテラル検索の結果を出したまま静かに戻る
          if (!stale) setFetched({ key, status: "failed", result: null });
        });
    }, SEMANTIC_DEBOUNCE_MS);

    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [key, query]);

  if (key === null) return IDLE;
  if (cached) return { status: "done", result: cached };
  if (fetched?.key === key) return { status: fetched.status, result: fetched.result };

  return LOADING;
}
