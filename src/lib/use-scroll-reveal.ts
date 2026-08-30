"use client";

import { useEffect, useRef, type RefObject } from "react";
import { gsap } from "gsap";

import { OPENER_FAILSAFE_MS, shouldWaitForOpener } from "@/lib/motion";

/**
 * 非表示マーカーと `data-*` 属性で入場モーションを組み立てる共有フック。
 *
 * SpecialPageMotion / AccessPageMotion / SpecialGuestMotion の3つが、reveal と
 * stagger のループをほぼバイト単位で同じ形で持っていたため共通化した。演出対象は
 * Server Component 側が `data-*` 属性で宣言するだけでよく、`"use client"` を
 * 本文へ広げずに済む（設計原則は docs/frontend/access-page-design.md）。
 *
 * ここを触るときの前提:
 *
 * - **このファイルは `src/lib/` で唯一の React フックであり、唯一の `"use client"`。**
 *   Server Component や `src/proxy.ts`（Edge）から import してはいけない。
 *   `src/lib/` の他のモジュール（metadata / microcms / events など）はサーバから
 *   読まれるため、そちらへ React 依存を持ち込まないこと。規約は1行で足りる:
 *   **`src/lib/` 直下で `use-` で始まるファイルは React フックでクライアント専用。
 *   それ以外は React に依存してはならない。** 強制手段は ESLint に無く、
 *   現状は命名と本コメントだけで担保している。
 * - 依存は一方通行。ここから `@/lib/motion` を読むのは可、逆は不可。
 *   `motion.ts` は初期チャンクの HeroSection から参照されるため、あちらへ
 *   gsap や React を持ち込むと OpenerLoader の遅延ロード分離が壊れる。
 * - `src/lib/utils.ts` との住み分け: あちらは環境非依存の純関数（`cn`）。
 *   ブラウザ API や React に触れるものは置かない。
 *
 * 入場はすべて `gsap.from()` で書く。何も実行しなければ SSR HTML の完成形が
 * そのまま残るため、JavaScript 無効時も prefers-reduced-motion 時も破綻しない
 * （DESIGN.md §10）。className へ `opacity-0` を直書きする方式は採らない。
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** DESIGN.md §10 の共通基準 */
const DEFAULT_START = "top 80%";

/**
 * ScrollTrigger のチャンクを取りに行く距離。
 *
 * AboutSection は `-35%` で「セクションが画面に入ってから」読みに行くが、それだと
 * ScrollTrigger を生成した時点で既に start を通過済みになり、トリガーが即発火して
 * 演出の開始位置が IntersectionObserver 側の境界で決まってしまう。
 * SponsorLogoLoopLoader と同じ先読みの向き（正のマージン）にして、実際の発火は
 * ScrollTrigger の start に任せる。
 *
 * なお root がページ最上位のラッパーになる下層ページ（/access, /special/[id]）では、
 * この観測は読み込み直後に必ず交差するため実質1フレームの遅延しかない。
 * **そこで買っているのは「発火の遅延」ではなく「ScrollTrigger を初期チャンクから
 * 外すこと」**（TBT / parse コストの削減）である。ネットワークの往復はむしろ1つ増える。
 */
const DEFAULT_PRELOAD_ROOT_MARGIN = "600px 0px";

export type ScrollRevealVariant = "left" | "right" | "scale" | "up";

const revealOffsets: Record<ScrollRevealVariant, gsap.TweenVars> = {
  left: { x: -36, y: 0 },
  right: { x: 36, y: 0 },
  scale: { scale: 0.97, y: 18 },
  up: { y: 32 },
};

const isRevealVariant = (value: string | null): value is ScrollRevealVariant =>
  value === "left" || value === "right" || value === "scale" || value === "up";

export interface ScrollRevealScope {
  /** reveal / stagger の探索範囲であり、gsap.context の記録単位でもある */
  root: HTMLElement;
  /** フックが描画した非表示マーカー本体 */
  marker: HTMLSpanElement;
}

/**
 * ヒーロー入場の組み立て。
 *
 * 戻り値に関数を返すと、gsap がそれを `ctx.revert()` 時の後片付けとして登録する
 * （`Context.prototype.add` の実装）。**戻り値を呼び出し側で保持して自前に
 * 登録し直してはいけない。二重実行になる。**
 */
export type ScrollRevealEntrance = (scope: ScrollRevealScope) => (() => void) | void;

export interface UseScrollRevealOptions {
  /** 例: `"data-access-reveal"`。属性値がバリアント名になる */
  readonly revealAttribute: string;
  /** 例: `"data-access-stagger"`。直下の子が stagger の単位になる */
  readonly staggerAttribute: string;
  /** 属性値が無い / 未知のときのバリアント。既定 `"up"` */
  readonly defaultVariant?: ScrollRevealVariant;
  /** 既定 `"top 80%"` */
  readonly revealStart?: string;
  /** 既定 `"top 80%"` */
  readonly staggerStart?: string;
  /** 既定は `marker.parentElement` */
  readonly resolveRoot?: (marker: HTMLSpanElement) => HTMLElement | null | undefined;
  /** 既定 `"600px 0px"` */
  readonly preloadRootMargin?: string;
  /** ヒーロー入場。**ScrollTrigger を使ってはいけない**（下の IMPORTANT を参照） */
  readonly entrance?: ScrollRevealEntrance;
  /** `entrance` を `opener-done` まで待たせる。既定 `false` */
  readonly waitForOpener?: boolean;
}

/**
 * `options` は**モジュールスコープの定数として渡すこと。**
 *
 * 依存配列が `[options]` なので、インラインのオブジェクトリテラルを渡すと毎レンダーで
 * effect が張り直され、`ctx.revert()` → 再生成でモーションが目に見えて壊れる。
 * 3つの呼び出し元の `entrance` は state も props も捕まえていない（すべて
 * `root.querySelector` で DOM から取る）ため、モジュールスコープへ出せる。
 *
 * @example
 * const ACCESS_MOTION: UseScrollRevealOptions = {
 *   revealAttribute: "data-access-reveal",
 *   staggerAttribute: "data-access-stagger",
 * };
 *
 * export function AccessPageMotion() {
 *   const markerRef = useScrollReveal(ACCESS_MOTION);
 *   return <span ref={markerRef} hidden aria-hidden="true" />;
 * }
 */
export function useScrollReveal(
  options: UseScrollRevealOptions
): RefObject<HTMLSpanElement | null> {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const marker = markerRef.current;

    if (!marker) return;

    // IMPORTANT: この判定より前で gsap にも IntersectionObserver にも触れないこと。
    // 順序を入れ替えると、モーション軽減時にも ScrollTrigger のチャンクを取りに
    // 行ってしまう（明確な劣化）。ここで return すれば SSR の完成形が残る。
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return;

    const {
      revealAttribute,
      staggerAttribute,
      defaultVariant = "up",
      revealStart = DEFAULT_START,
      staggerStart = DEFAULT_START,
      resolveRoot,
      preloadRootMargin = DEFAULT_PRELOAD_ROOT_MARGIN,
      entrance,
      waitForOpener = false,
    } = options;

    const root = (resolveRoot ? resolveRoot(marker) : marker.parentElement) ?? null;

    if (!root) return;

    let disposed = false;
    /** IO / イベントリスナー / タイマーの後片付け。gsap の管轄外のものだけ持つ */
    const disposers: Array<() => void> = [];

    // gsap コアは静的 import なので context はここで同期的に作れる。中身は空で、
    // 下の2箇所から ctx.add() で足していく。
    //
    // 第2引数の scope はセレクタ解決には使っていない（reveal は toArray の第2引数、
    // entrance は root.querySelector で範囲を明示する）。実質「revert のための
    // 記録単位」であり、**scope があるから裸のセレクタで安全、とは考えないこと。**
    const ctx = gsap.context(() => {}, root);

    // ------------------------------------------------------------------
    // 1. ヒーロー入場（ScrollTrigger 非依存）
    //
    // IMPORTANT: ここは動的 import の外、同期パスに置くこと。ヒーロー入場は
    // ScrollTrigger を1つも使わない素の timeline なので、チャンク取得を待たせる
    // 理由が無い。IO ゲートの内側へ移すと、opener-done の後にチャンク取得のぶん
    // だけヒーローが遅れて動き出す。「ついでにまとめる」改修で壊れやすい。
    // ------------------------------------------------------------------
    if (entrance) {
      let entranceStarted = false;

      // opener-done とフェイルセーフの両方から呼ばれるため多重実行を防ぐ
      const runEntrance = () => {
        if (disposed || entranceStarted) return;
        entranceStarted = true;
        ctx.add(() => entrance({ root, marker }));
      };

      if (waitForOpener && shouldWaitForOpener()) {
        window.addEventListener("opener-done", runEntrance);
        const failsafeId = window.setTimeout(runEntrance, OPENER_FAILSAFE_MS);

        disposers.push(() => {
          window.removeEventListener("opener-done", runEntrance);
          window.clearTimeout(failsafeId);
        });
      } else {
        runEntrance();
      }
    }

    // ------------------------------------------------------------------
    // 2. スクロールリビール（ScrollTrigger を IO ゲート越しに動的取得）
    //
    // opener は待たない。待つとファーストビュー直下のセクションで発火を取りこぼす。
    // ------------------------------------------------------------------
    const registerScrollReveal = async () => {
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      ctx.add(() => {
        const revealTargets = gsap.utils.toArray<HTMLElement>(`[${revealAttribute}]`, root);

        revealTargets.forEach((target) => {
          const raw = target.getAttribute(revealAttribute);
          const variant = isRevealVariant(raw) ? raw : defaultVariant;

          gsap.from(target, {
            autoAlpha: 0,
            duration: variant === "scale" ? 0.85 : 0.72,
            ease: "power3.out",
            force3D: true,
            clearProps: "opacity,visibility,transform",
            ...revealOffsets[variant],
            scrollTrigger: { trigger: target, start: revealStart, once: true },
          });
        });

        const staggerGroups = gsap.utils.toArray<HTMLElement>(`[${staggerAttribute}]`, root);

        staggerGroups.forEach((group) => {
          const items = Array.from(group.children);

          if (items.length === 0) return;

          gsap.from(items, {
            autoAlpha: 0,
            y: 24,
            duration: 0.64,
            ease: "power3.out",
            stagger: 0.1,
            force3D: true,
            clearProps: "opacity,visibility,transform",
            scrollTrigger: { trigger: group, start: staggerStart, once: true },
          });
        });
      });

      // content-visibility: auto のセクションは、画面外では contain-intrinsic-size の
      // 推定値が要素高になる。実寸が確定した時点でトリガー位置を測り直す。
      ScrollTrigger.refresh();
    };

    // IntersectionObserver 非対応、または既にスクロールで通り過ぎている場合は待たない
    const canObserve = "IntersectionObserver" in window && root.getBoundingClientRect().bottom > 0;

    const observer: IntersectionObserver | null = canObserve
      ? new IntersectionObserver(
          ([entry]) => {
            if (!entry.isIntersecting) return;
            observer?.disconnect();
            void registerScrollReveal();
          },
          { rootMargin: preloadRootMargin }
        )
      : null;

    if (observer) {
      observer.observe(root);
    } else {
      void registerScrollReveal();
    }

    return () => {
      disposed = true;
      observer?.disconnect();
      // 後から張ったものから外す
      for (let i = disposers.length - 1; i >= 0; i -= 1) disposers[i]();
      // entrance が返した後片付けはこの中で走る（gsap の Context._r）
      ctx.revert();
    };
  }, [options]);

  return markerRef;
}
