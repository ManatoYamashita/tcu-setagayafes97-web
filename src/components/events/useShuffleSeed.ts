"use client";

import { useSyncExternalStore } from "react";
import { createShuffleSeed } from "@/lib/shuffle";

/**
 * 企画一覧の並び順を決めるシード（#409）
 *
 * **寿命はページの読み込み（document）1回分です。** 再読み込みや新しいタブでは作り直されて
 * 順番が変わりますが、企画詳細へ移って戻る（ソフトナビゲーション）間は同じ値を保ちます。
 * 戻るたびに順番が変わると、`EventInfiniteList` が `?page=N` で復元した読み込み位置に
 * 別の企画が並び、来場者は今見ていた企画を見失います。
 *
 * `useState` に持たせてはいけません。詳細ページへ移るとこのツリーはアンマウントされ、
 * 戻ったときに新しい順番になります。
 */
let seed: number | null = null;

/** シードは変化しないので購読するものが無い */
function subscribe(): () => void {
  return () => {};
}

function getSnapshot(): number {
  seed ??= createShuffleSeed();
  return seed;
}

/**
 * サーバーでは並べ替えない
 *
 * サーバーのモジュール変数にシードを作ると、リクエストをまたいで全員が同じ順番になります。
 * また、サーバーとクライアントで別のシードを使うと hydration mismatch になります。
 * `null` を返しておけば、hydrate の後に React が `getSnapshot` の値で描き直します。
 */
function getServerSnapshot(): null {
  return null;
}

/**
 * 企画一覧の並び順のシードを返すフック
 *
 * @returns シード。サーバー描画と hydrate の間は `null`（並べ替えない）
 */
export function useShuffleSeed(): number | null {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
