"use client";

import { useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { gsap } from "gsap";
import type { AboutPageContent } from "@/data/about";
import { OPENER_FAILSAFE_MS, shouldWaitForOpener } from "@/lib/motion";

const Grainient = dynamic(() => import("@/components/ui/Grainient"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full bg-gradient-to-r from-primary-400 via-primary-500 to-primary-600" />
  ),
});

/**
 * About ページ ヒーローセクション
 *
 * - Header高さを差し引いたフルビューポート
 * - 中央に透明バンド（Grainient背景が透けて見える）
 * - 上下マスクがGSAPで分離するアニメーション
 * - 右下にページタイトル + スクロールインジケーター
 */
export function AboutHero({ content }: { content: AboutPageContent["hero"] }) {
  const { ordinalPrefix, ordinalSuffix, ordinalSuffixGap, university, committee, scrollIndicator } =
    content;

  const sectionRef = useRef<HTMLElement>(null);
  const upperMaskRef = useRef<HTMLDivElement>(null);
  const lowerMaskRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  // Header背景色を上マスク(gray-50)と同色に
  useEffect(() => {
    document.documentElement.style.setProperty("--header-top-bg", "oklch(97% 0 0deg)");
    return () => {
      document.documentElement.style.removeProperty("--header-top-bg");
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    const runEntrance = () => {
      if (!sectionRef.current || ctxRef.current) return;

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();

        mm.add(
          {
            isSmall: "(max-width: 767px)",
            isMedium: "(min-width: 768px) and (max-width: 1023px)",
            isLarge: "(min-width: 1024px)",
          },
          (context) => {
            const { isSmall, isMedium } = context.conditions!;
            // バンド高さの半分: sm=30px, md=40px, lg=50px
            const halfBand = isSmall ? 30 : isMedium ? 40 : 50;

            // 上下マスク: 最初は中央で密着（バンド見えない）→ 分離してバンド露出
            // 45%: Headerの高さ分を考慮し、視覚的な画面中央に合わせる
            if (upperMaskRef.current) {
              gsap.set(upperMaskRef.current, { bottom: "55%" });
              gsap.to(upperMaskRef.current, {
                bottom: `calc(55% + ${halfBand}px)`,
                duration: 0.8,
                ease: "power3.inOut",
              });
            }

            if (lowerMaskRef.current) {
              gsap.set(lowerMaskRef.current, { top: "45%" });
              gsap.to(lowerMaskRef.current, {
                top: `calc(45% + ${halfBand}px)`,
                duration: 0.8,
                ease: "power3.inOut",
              });
            }
          }
        );

        // タイトル: フェードイン + 上昇
        const textTargets = [titleRef.current].filter(Boolean) as HTMLElement[];
        gsap.set(textTargets, { opacity: 0, y: 20 });
        gsap.to(textTargets, {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.15,
          delay: 0.4,
        });

        // スクロールインジケーター: フェードイン
        if (scrollRef.current) {
          gsap.set(scrollRef.current, { opacity: 0 });
          gsap.to(scrollRef.current, {
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            delay: 1.0,
          });
        }
      }, sectionRef);

      ctxRef.current = ctx;
    };

    if (!shouldWaitForOpener()) {
      runEntrance();
    } else {
      window.addEventListener("opener-done", runEntrance);
      const failsafe = setTimeout(runEntrance, OPENER_FAILSAFE_MS);

      return () => {
        window.removeEventListener("opener-done", runEntrance);
        clearTimeout(failsafe);
        ctxRef.current?.revert();
        ctxRef.current = null;
      };
    }

    return () => {
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex h-[calc(100svh-var(--header-height))] min-h-[420px] w-full items-center justify-center overflow-hidden sm:min-h-[460px] lg:min-h-[560px]"
    >
      {/*
        Layer 0: Grainient 背景

        Grainient は色を WebGL シェーダの uniform へ渡すため、CSS 変数を解決できない。
        ここだけは実配信 HEX の直書きが必要である。color2 は --color-primary-400 の
        実配信値であり、@theme を変更したら手で追従させること。
        color1 / color3 はトークン外の演出色で、どのスケールにも属さない。
      */}
      <div className="absolute inset-0 z-0">
        <Grainient
          color1="#F9F0FD"
          color2="#bf73e3"
          color3="#5227FF"
          timeSpeed={1}
          grainAmount={0.15}
          contrast={1.4}
          warpStrength={1.2}
          warpAmplitude={40.0}
          saturation={1.2}
        />
      </div>

      {/* Layer 1: 上マスク（gray-50で覆う） */}
      <div
        ref={upperMaskRef}
        className="absolute inset-x-0 top-0 z-10 bg-gray-50"
        style={{ bottom: "55%" }}
      />

      {/* Layer 1: 下マスク（gray-50で覆う） */}
      <div
        ref={lowerMaskRef}
        className="absolute inset-x-0 bottom-0 z-10 bg-gray-50"
        style={{ top: "45%" }}
      />

      {/*
        Layer 2: 右下テキストブロック — 「97」を主役にした縦積みレイアウト

        上端を帯の下端（45% + バンド半高 + 余白12px）に固定した領域の底へ寄せる。
        バンド半高は GSAP の halfBand（30 / 40 / 50px。768 / 1024px 境界）と揃えてあり、
        変えるときは両方を動かすこと。領域に収まる高さは Hero の min-h が保証する
        （見出しの高さ: 約105 / 135 / 165px）。
      */}
      <div className="absolute inset-x-0 bottom-0 top-[calc(45%+42px)] z-20 flex items-end justify-end px-6 pb-20 text-right sm:px-8 sm:pb-16 md:top-[calc(45%+52px)] lg:top-[calc(45%+62px)] lg:px-12 lg:pb-20">
        <h1 ref={titleRef} className="leading-tight" style={{ fontFamily: "var(--font-sans)" }}>
          <span className="block text-2xl font-semibold tracking-[0.08em] text-gray-900 sm:text-3xl lg:text-4xl">
            {ordinalPrefix}
            {/*
              地色は gray-50（実配信 #f5f5f5）。60px/700 は大テキスト扱いで要求 3:1。

              紫からピンクへ抜ける配色はサイト所有者の指定である。#179 B でブランド紫の
              600段→700段（6.84 / 10.28）へ倒したが、ピンクが失われるため #229 で戻した。
              **元の値には戻していない。**

              | 段                          | 描画色    | 比        |
              | --------------------------- | --------- | --------- |
              | 旧・既定パレット 紫の500段  | `#ad46ff` | 3.78 OK   |
              | 旧・既定パレット 桃の400段  | `#fb64b6` | 2.53 未達 |
              | 現・ブランド紫の500段       | `#9c50be` | 4.47 OK   |
              | 現・既定パレット 桃の500段  | `#f6339a` | 3.29 OK   |

              終点を1段だけ暗くすれば足りる。桃の400段は 2.53 で届かないが500段は 3.29 で通る。
              始点の既定パレット紫は eslint.config.mjs が禁止しているためブランド紫へ置き換えた
              （色相差 15° 未満でブランド紫と区別されないため）。
              桃の500段は special バッジと同じ段で、docs/frontend/design.md が
              「残している非ブランド色相」として明記している。

              桃の500段とブランド紫の500段は、フォールバックの #hex と lab() が一致するため
              上の描画色をそのまま比の計算に使える（食い違うのは既定パレットの高彩度段。
              docs/frontend/design.md「実配信HEXは2つある」）。

              **ここにクラス名を原形で書かないこと。** Tailwind のソース走査はコメントも
              読むため、書いた瞬間に使っていないユーティリティが配信CSSへ出る。
              #229 が実際にこれを踏み、本番の配信CSSへ未使用の1件を出した（2026-09-19 実測）。
            */}
            <span
              className="text-4xl font-bold bg-gradient-to-r from-primary-500 to-pink-500 bg-clip-text text-transparent tracking-tighter sm:text-5xl lg:text-6xl"
              style={{ fontFamily: 'var(--font-kaisei-opti, "Kaisei Opti"), serif' }}
            >
              97
            </span>
            <span className={ordinalSuffixGap ? "ml-1 sm:ml-2" : undefined}>{ordinalSuffix}</span>
          </span>
          {/*
            正式名は「第97回東京都市大学世田谷祭実行委員会」。大学名を見出しの外へ出すと
            表示の語順も h1 のアクセシブルネームも崩れるため、見出しの中の1段として置く。
          */}
          <span className="block text-2xl font-semibold tracking-[0.08em] text-gray-900 sm:text-3xl lg:text-4xl">
            {university}
          </span>
          <span className="block text-2xl font-semibold tracking-[0.08em] text-gray-900 sm:text-3xl lg:text-4xl">
            {committee}
          </span>
        </h1>
      </div>

      {/* Layer 2: スクロールインジケーター */}
      <div
        ref={scrollRef}
        className="absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
        role="presentation"
        aria-label={scrollIndicator}
      >
        <span className="text-[10px] uppercase tracking-[0.2em] text-gray-400">Scroll</span>
        <div className="relative h-10 w-px bg-gray-200">
          <div className="animate-scroll-line absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-gray-900" />
        </div>
      </div>
    </section>
  );
}
