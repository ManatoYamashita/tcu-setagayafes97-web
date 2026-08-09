import { getFeaturedEvents } from "@/lib/events";
import { EVENTS_VISIBLE } from "@/data/site";
import { FeaturedCarousel } from "./FeaturedCarousel";
import { FeaturedGearScene } from "./FeaturedGearScene";

/**
 * おすすめ企画セクション
 * 左: 縦書きタイトル+ナビ / 右: 横スクロールカルーセル
 * EVENTS_VISIBLE が false の間はセクションごと非表示
 *
 * 背面にカラクリの3D歯車を装飾として置く。カルーセル化のリファクタリング
 * （11d0e73）で旧12カラムグリッドごと外れていたものを、新レイアウトに
 * 合わせて背景装飾として復帰させたもの。
 */
export async function FeaturedEvents() {
  // 企画非公開期間はセクションごと非表示（フェッチも行わない）
  if (!EVENTS_VISIBLE) {
    return null;
  }

  const events = await getFeaturedEvents();
  const featured = events.slice(0, 6);

  return (
    <section className="relative overflow-hidden bg-secondary py-24 lg:py-32">
      {/*
        3D歯車（装飾）。セクション左下から画面外へはみ出させ、本文の背面に敷く。
        セクションの overflow-hidden で切り取られるため、はみ出し量は自由に取れる。

        pointer-events は lg 以上でのみ有効にする。歯車のマウス追従チルトは
        Canvas 要素のポインタイベントを R3F が拾って動くため、none のままだと
        チルトしない。一方モバイルではチルト自体を無効化しており、有効にすると
        スクロールを奪うだけなので none で固定する。
      */}
      <div
        className="pointer-events-none absolute -left-[32%] bottom-[-12%] z-0 aspect-square w-[78%] opacity-70 sm:-left-[24%] sm:w-[62%] lg:pointer-events-auto lg:-left-[10%] lg:bottom-[-18%] lg:w-[42%] lg:opacity-100"
        aria-hidden="true"
      >
        <FeaturedGearScene />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 mx-auto max-w-7xl pl-4 sm:pl-8 md:pl-12 lg:pl-16">
        <FeaturedCarousel events={featured} />
      </div>
    </section>
  );
}

export const revalidate = 3600;
