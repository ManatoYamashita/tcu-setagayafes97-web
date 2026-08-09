import { ViewTransition } from "react";
import { PageTransitionWrapper } from "@/components/layout/PageTransitionWrapper";

/**
 * ページ遷移アニメーションの境界。
 *
 * `template.tsx` は `layout.tsx` と異なりクライアント遷移のたびに再マウントされる。
 * そのため旧ページの `<ViewTransition>` は unmount（exit）、新ページのそれは
 * mount（enter）として扱われ、React が `document.startViewTransition()` を
 * 起動する。ページごとに `page.tsx` を包む必要はない。
 *
 * 演出は経路によって2系統に分かれる。
 * - `<Link>` / `router.push()`: React が `document.startViewTransition()` を起動し、
 *   `::view-transition-old(.page-exit)` → `::view-transition-new(.page-enter)` が走る。
 * - ブラウザの戻る・進む（popstate）: React は View Transition を必ずスキップする
 *   （同期フラッシュとの両立が仕様上できないため）。代わりに `PageTransitionWrapper`
 *   が実 DOM へ `page-enter-history` を付け、同じ `dreamy-fade-in` を enter だけ再生する。
 *   旧ページの exit は、popstate 時点で旧 DOM を保持する手段がないため再現できない。
 *
 * どちらも「template が再マウントされたとき」だけ発火する。ルート直下セグメントの
 * stateKey が変わらない遷移（`/about` → `/access` など `src/app/[locale]/` 配下どうし）は
 * リンクでも戻るでも無演出になる。詳細は docs/frontend/page-transition.md を参照。
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
      <PageTransitionWrapper>{children}</PageTransitionWrapper>
    </ViewTransition>
  );
}
