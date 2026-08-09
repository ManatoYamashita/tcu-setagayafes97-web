import { ViewTransition } from "react";

/**
 * ページ遷移アニメーションの境界。
 *
 * `template.tsx` は `layout.tsx` と異なりナビゲーションのたびに再マウントされる。
 * そのため旧ページの `<ViewTransition>` は unmount（exit）、新ページのそれは
 * mount（enter）として扱われ、React が `document.startViewTransition()` を
 * 起動する。ページごとに `page.tsx` を包む必要はない。
 *
 * - `enter` / `exit` は `view-transition-class` として DOM に付与される。
 *   対応する `::view-transition-old(.page-exit)` / `::view-transition-new(.page-enter)`
 *   は `globals.css` にある。
 * - `default="none"` は「更新」ケースの view-transition-name を無効化する。
 *   これを外すと、ページ内の `startTransition` を伴う状態更新のたびに
 *   ページ全体がクロスフェードしてしまう。
 *
 * 設計判断の経緯は docs/frontend/page-transition.md を参照。
 */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className="page-transition-wrapper">{children}</div>
    </ViewTransition>
  );
}
