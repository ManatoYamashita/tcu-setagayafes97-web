"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { clearHistoryNavigation, isHistoryNavigationPending } from "@/lib/history-navigation";

/**
 * ページ遷移アニメーションの実 DOM 側ラッパー。
 *
 * `src/app/template.tsx` の `<ViewTransition>` 直下に置かれ、遷移のたびに再マウントされる。
 *
 * - リンク遷移（`<Link>` / `router.push()`）: React が View Transition を起動するので
 *   ここは何もしない。演出は `::view-transition-old(.page-exit)` /
 *   `::view-transition-new(.page-enter)` が担う。
 * - 履歴遷移（戻る・進む）: React は View Transition を必ずスキップするため、
 *   `page-enter-history` を付けて CSS 側の enter だけを再現する。
 *
 * 対応する CSS は `src/app/globals.css` の
 * `.page-transition-wrapper.page-enter-history`。判定材料は
 * `src/lib/history-navigation.ts` が保持する。
 */

/**
 * 「初回レンダー = ハイドレーション」という不変条件を保持する。
 *
 * 履歴遷移が初回マウントであることはありえないので、初回は必ずクラス無しにする。
 * ハイドレーション直前に戻るボタンが押された場合でもサーバーの HTML と一致し、
 * className の hydration mismatch を起こさない。
 */
let hasMountedOnce = false;

export function PageTransitionWrapper({ children }: { children: React.ReactNode }) {
  /*
   * render 中に決めるのが必須。useEffect で後からクラスを足すと、最終状態が
   * 1フレーム見えてから translateY(14px) へ巻き戻り、逆再生に見える。
   */
  const [isHistoryEnter] = useState(() => hasMountedOnce && isHistoryNavigationPending());

  useEffect(() => {
    hasMountedOnce = true;
    // 消費済みの記録を残さない。次のリンク遷移が食べて二重再生になるのを防ぐ。
    clearHistoryNavigation();
  }, []);

  return (
    <div className={cn("page-transition-wrapper", isHistoryEnter && "page-enter-history")}>
      {children}
    </div>
  );
}
