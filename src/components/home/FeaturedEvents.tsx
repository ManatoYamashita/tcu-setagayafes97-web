import dynamic from "next/dynamic";
import { getFeaturedEvents } from "@/lib/events";
import { EVENTS_VISIBLE } from "@/data/site";
import { FeaturedGearScene } from "./FeaturedGearScene";

// 初期ビューポート外のカルーセルをトップページ初期JSから分離する。
const FeaturedCarousel = dynamic(() =>
  import("./FeaturedCarousel").then((module) => module.FeaturedCarousel)
);

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
    <section className="deferred-section deferred-section--events relative overflow-hidden bg-secondary py-24 lg:py-32">
      {/*
        3D歯車（装飾）。セクション左下から画面外へはみ出させ、本文の背面に敷く。
        セクションの overflow-hidden で切り取られるため、はみ出し量は自由に取れる。

        pointer-events は md 以上でのみ有効にする。歯車のマウス追従チルトは
        Canvas 要素のポインタイベントを R3F が拾って動くため、none のままだと
        チルトしない。一方モバイルではチルト自体を無効化しており、有効にしても
        ポインタ座標を拾うだけ無駄なので none で固定する。

        しきい値は Gear.tsx の isMobile（max-width: 767.98px）と対にすること。
        md は min-width: 768px なので、isMobile 側を 768px にすると 768px ちょうど
        （iPad ポートレート）で両方成立し、pointer-events だけ有効な帯域ができる。
        逆にずらすと「チルトは有効なのにポインタ座標が来ない」帯域ができる。

        この指定が効くのは GearScene が Canvas へ pointerEvents: "inherit" を
        渡しているからで、外すと R3F 既定の auto が復活して none が無効になる。
      */}
      <div
        className="pointer-events-none absolute -left-[32%] bottom-[-12%] z-0 aspect-square w-[78%] opacity-70 sm:-left-[24%] sm:w-[62%] md:pointer-events-auto lg:-left-[10%] lg:bottom-[-18%] lg:w-[42%] lg:opacity-100"
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
