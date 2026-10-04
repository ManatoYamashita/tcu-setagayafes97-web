"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface EventResultsProps {
  /**
   * 絞り込みの指紋（`buildEventsQuery(filters)`）
   *
   * これが変わったときだけ結果の先頭へ寄せます。意味検索の状態遷移（loading → done）は
   * 含めません。含めると、結果が届いた時点でもう一度スクロールが走ります。
   */
  filterKey: string;
  children: ReactNode;
}

/**
 * 企画一覧の結果ブロック
 *
 * **絞り込みが変わったとき、結果の先頭が隠れていれば追従バーの直下へ寄せます**（#392）。
 *
 * 絞り込みは `router.replace` / `router.push` を `{ scroll: false }` で呼ぶため、
 * スクロール位置はそのまま残ります。一覧を読み進めた状態で結果が減ると文書の高さが縮み、
 * ブラウザが `scrollY` を新しい最大値へ切り詰めるので、件数次第で一覧の途中や
 * フッター付近に着地していました。`{ scroll: true }` にしても Next.js はページの
 * 先頭へ移るだけで、結果の先頭にはなりません。
 *
 * 寄せるのは「先頭が `scroll-margin-top` より上にある（ヘッダーや追従バーの裏、
 * または画面外）」ときだけです。ページ最上部で入力し始めた来場者の画面は動かしません。
 * 初回マウントでも動かしません（深いリンクで来た位置を奪わないため）。
 *
 * **`useSearchParams()` を使わないこと。** `EventsView` 経由で `<Suspense>` の
 * fallback にも描かれます（#156）。`EventsView` 自体は Server Component からも
 * 描かれるため hooks を持てず、この部分だけをクライアント部品にしています。
 */
export function EventResults({ filterKey, children }: EventResultsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prevKeyRef = useRef(filterKey);

  useEffect(() => {
    if (prevKeyRef.current === filterKey) return;
    prevKeyRef.current = filterKey;

    const el = ref.current;
    if (!el) return;

    // オフセットは CSS の scroll-margin-top が一次定義。計算値は px に解決済みで返る
    const offset = parseFloat(getComputedStyle(el).scrollMarginTop) || 0;
    if (el.getBoundingClientRect().top >= offset) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduceMotion ? "auto" : "smooth" });
  }, [filterKey]);

  return (
    /*
      scroll-margin-top は「先頭を隠すものの下端」。EventsView の aside の寸法と対応している。

      - lg 未満: 結果の上に追従バーが重なる。バーの top（header − 1rem）＋
        高さ（上 1rem + 5px ＋ 入力欄 2.75rem ＋ 下 0.5rem）＝ header + 5px + 3.25rem（145px）
      - lg 以上: バーは横に並ぶので、隠すのはヘッダーだけ。aside の lg:top と同じ header + 1rem

      aside の寸法を変えたら、ここも合わせること（e2e/events/results-scroll.spec.ts が実測で落とす）
    */
    <div
      ref={ref}
      className="scroll-mt-[calc(var(--header-height)+5px+3.25rem)] lg:scroll-mt-[calc(var(--header-height)+1rem)]"
    >
      {children}
    </div>
  );
}
