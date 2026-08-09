/**
 * ブラウザの戻る・進む（履歴遷移）を検知する記録係。
 *
 * 履歴遷移では View Transition が原理的に走らない。理由は上流に2層ある。
 *
 * 1. React が意図的にスキップしている。popstate 由来の startTransition は
 *    スクロール・フォームの復元を成立させるために同期で完了する必要があり、
 *    非同期の View Transition と両立しない（react-dom の
 *    shouldAttemptEagerTransition が window.event.type === "popstate" を見て
 *    transition レーンを同期フラッシュする）。
 * 2. Next.js 側でもそもそも transition レーンに乗らない。app-router-instance の
 *    dispatchAction は ACTION_RESTORE のときだけ startTransition(setState) を
 *    スキップし、非同期の runAction を跨いだマイクロタスクで setState が走る。
 *
 * どちらもアプリ側から解除できないため、履歴遷移のときだけ実 DOM のラッパーへ
 * enter アニメーションを掛けるという代替をとる。このモジュールはその判定材料
 * （直前の popstate）を1件だけ保持する。
 *
 * 設計判断の経緯は docs/frontend/page-transition.md を参照。
 */

type HistoryNavigationRecord = {
  /** popstate 時点の performance.now() */
  at: number;
  /** popstate 時点の location.href。消費側で同一URLかを照合する */
  href: string;
};

let record: HistoryNavigationRecord | null = null;

/**
 * 記録を有効とみなす最大経過時間。
 *
 * popstate からラッパーの mount まではマイクロタスク1〜2ホップで、実測は 1ms 未満。
 * この値は「消費されずに残った記録がいつまでも効かないようにする」ための上限であって、
 * 遅延を吸収するためのものではない。伸ばすとリンク遷移を誤検知する窓が広がる。
 */
const MAX_AGE_MS = 200;

if (typeof window !== "undefined") {
  /*
   * IMPORTANT: このリスナは Next.js の app-router より先に登録されていなければならない。
   *
   * popstate のリスナは window への登録順に呼ばれ、1つ返るたびにマイクロタスク
   * チェックポイントが走る。Next.js の onPopState が先に走ると、そのチェックポイントで
   * ACTION_RESTORE の setState と React の同期フラッシュまで到達し、新しいラッパーの
   * render（＝ isHistoryNavigationPending の呼び出し）が終わってしまう。
   *
   * useEffect で登録してはいけない。再マウントのたびに登録が末尾へ移動し、
   * 「1回目の戻るだけ動いて2回目以降は動かない」という壊れ方をする。
   * モジュール評価時（＝クライアントチャンク実行時＝ハイドレーション前）に
   * 一度だけ登録することで、登録順がツリー構造の変更から独立する。
   */
  window.addEventListener("popstate", () => {
    record = { at: performance.now(), href: window.location.href };
  });

  /*
   * BFCache からの復帰は履歴遷移ではない。同一ドキュメントが丸ごと戻ってくるだけで、
   * Next.js の app-router も同じ tree で ACTION_RESTORE を投げるため再マウントは起きない。
   * ブラウザによっては pageshow に続けて popstate も飛ぶため、記録を明示的に捨てる。
   */
  window.addEventListener("pageshow", (event) => {
    if (event.persisted) {
      record = null;
    }
  });
}

/**
 * 直前の popstate が「いま mount しようとしている URL」に対応するものかを返す。
 *
 * 副作用を持たない。React が render を二重に実行しても同じ答えを返すため、
 * 記録の破棄はここではなく呼び出し側の useEffect で行う。
 */
export function isHistoryNavigationPending(): boolean {
  if (typeof window === "undefined") return false;
  if (record === null) return false;
  // 記録後にリンク遷移が挟まっていれば URL が変わっているので無効
  if (record.href !== window.location.href) return false;
  return performance.now() - record.at <= MAX_AGE_MS;
}

/** 記録を破棄する。消費後に必ず呼ぶこと。 */
export function clearHistoryNavigation(): void {
  record = null;
}
