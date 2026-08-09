import { ViewTransition } from "react";

/**
 * ページ遷移アニメーションの境界。
 *
 * `template.tsx` は `layout.tsx` と異なりクライアント遷移のたびに再マウントされる。
 * そのため旧ページの `<ViewTransition>` は unmount（exit）、新ページのそれは
 * mount（enter）として扱われ、React が `document.startViewTransition()` を
 * 起動する。ページごとに `page.tsx` を包む必要はない。
 *
 * 対応範囲は `<Link>` / `router.push()` によるクライアント遷移のみ。ブラウザの
 * 戻る・進む（popstate）では `startViewTransition()` が呼ばれず、アニメーションなしで
 * 即座に切り替わる（実測で確認済み。URL は変わるが発火回数は増えない）。
 * 履歴遷移への対応は本実装のスコープ外で、独立 Issue として扱う。
 *
 * 遷移中（合計 0.3 秒）はページ全体がクリックを受け付けない。キャプチャされた要素は
 * hit-test の対象から外れるという View Transitions API の仕様によるもので、CSS では
 * 回避できない。合計時間を短く保つことが唯一の対策になる。
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
