"use client";

import { Fragment, useEffect, useRef } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

import { aboutConfig } from "@/data/about";

gsap.registerPlugin(ScrollTrigger, SplitText);

const {
  themeLabel,
  heading,
  briefDescription,
  messageLabel,
  messageHeading,
  name,
  position,
  image,
  subImage,
  imageAlt,
  message,
} = aboutConfig.chairpersonMessage;

/**
 * データ中の改行を実マークアップへ落とす。
 *
 * white-space: pre-line / pre-wrap に頼ったままだと SplitText の行分割が
 * 空白の畳み込み（reduceWhiteSpace の既定値 true）に影響されるため、
 * 改行は <br /> と個別の <p> で表現する。
 */
const headingLines = heading.split("\n");
// 単一の \n 区切り。元は pre-line で「行送りのみ・段落間の余白なし」だったので、
// margin が 0 の <p>（preflight）を連続させると見た目が一致する。
const briefParagraphs = briefDescription.split("\n");
// 空行区切り。空行 1 つ分（= leading-[2] の 1 行）を space-y-7 sm:space-y-8 で再現する。
const messageParagraphs = message.split(/\n\s*\n/).map((paragraph) => paragraph.trim());

/**
 * 装飾三角形（lg以上のみ）。
 *
 * 負の animationDelay で 6 個の位相をずらし、一斉に同じ動きをしないようにする。
 * keyframes は transform ではなく個別プロパティ translate を動かすため、
 * Tailwind の rotate-*（v4 は個別プロパティ rotate を出力）と確実に合成される。
 */
const DECOR_TRIANGLES = [
  {
    shape: "top-16 right-[5%] h-20 w-20 rotate-[15deg] bg-primary-200",
    drift: "triangle-drift-1 22s",
    delay: "0s",
  },
  {
    shape: "top-[12%] left-[8%] h-8 w-8 -rotate-[10deg] bg-primary-100",
    drift: "triangle-drift-2 24s",
    delay: "-6s",
  },
  {
    shape: "top-[42%] right-[30%] h-12 w-12 rotate-[40deg] bg-primary-200/60",
    drift: "triangle-drift-1 20s",
    delay: "-11s",
  },
  {
    shape: "top-[58%] left-[4%] h-6 w-6 rotate-[25deg] bg-primary-200",
    drift: "triangle-drift-2 21s",
    delay: "-3s",
  },
  {
    shape: "bottom-[18%] right-[8%] h-14 w-14 -rotate-[20deg] bg-primary-100",
    drift: "triangle-drift-1 23s",
    delay: "-14s",
  },
  {
    shape: "bottom-[8%] left-[20%] h-10 w-10 rotate-[55deg] bg-primary-200/40",
    drift: "triangle-drift-2 20s",
    delay: "-8s",
  },
] as const;

const TRIANGLE_CLIP = "polygon(50% 0%, 0% 100%, 100% 100%)";

/**
 * テーマ解説 + 委員長挨拶セクション — Grid散在レイアウト
 *
 * lg 以上では CSS Grid 12列を使い、各要素を独立した座標に配置してジグザグ・
 * スタガーで散在感を演出する。lg 未満は flex の通常フローで縦積みになるため、
 * グリッド座標に依存せず DOM 順がそのまま表示順になる。
 *
 * DOM 順は縦積み時の読み順（テーマ → 挨拶ヘッダー → 署名 → 本文）に合わせてあり、
 * lg 以上は全要素が col-start / row-start で明示配置されるため DOM 順の影響を受けない。
 *
 * セクションが画面内に入ると各要素が入場する（ScrollTrigger, once）。
 * 見出しとテーマ解説は SplitText で行単位に分割してリヴィールする。
 */
export function ChairpersonSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const themeLabelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const imageFrameRef = useRef<HTMLDivElement>(null);
  const briefRef = useRef<HTMLDivElement>(null);
  const messageHeaderRef = useRef<HTMLDivElement>(null);
  const signatureRef = useRef<HTMLDivElement>(null);
  const messageRef = useRef<HTMLDivElement>(null);
  const ctxRef = useRef<gsap.Context | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (ctxRef.current) return;

    // モーション軽減設定では SplitText の分割自体を行わない。
    // 入場は全て gsap.from() なので、何もしなければ静的な完成形が表示される。
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const splits: SplitText[] = [];

    const ctx = gsap.context(() => {
      const scrollTriggerBase = {
        trigger: sectionRef.current,
        start: "top 80%",
        once: true,
      };

      // フェード + スライドアップ（このセクションの基本の入場）
      const fadeUp = (target: Element | null, vars: gsap.TweenVars = {}) => {
        if (!target) return;
        gsap.from(target, {
          autoAlpha: 0,
          y: 30,
          duration: 0.7,
          ease: "power4.out",
          force3D: true,
          scrollTrigger: { ...scrollTriggerBase },
          ...vars,
        });
      };

      fadeUp(themeLabelRef.current);
      fadeUp(messageHeaderRef.current);
      fadeUp(signatureRef.current, { duration: 0.8, delay: 0.1 });

      // ── 見出し: 行ごとにマスクの下からせり上げる ──
      // autoSplit がフォント読み込みとリサイズを監視して自動で再分割する。
      // onSplit で生成した animation を return すると、再分割時に SplitText が破棄してくれる。
      if (headingRef.current) {
        let headingRevealed = false;
        splits.push(
          SplitText.create(headingRef.current, {
            type: "lines",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) => {
              // 再生済みなら再分割で作り直さない（スクロール位置によっては再生され直すため）
              if (headingRevealed) return;
              return gsap.from(self.lines, {
                yPercent: 100,
                duration: 0.9,
                ease: "power3.out",
                stagger: 0.12,
                force3D: true,
                scrollTrigger: { ...scrollTriggerBase },
                onComplete: () => {
                  headingRevealed = true;
                },
              });
            },
          })
        );
      }

      // ── テーマ解説: 行ごとに順番に表示 ──
      if (briefRef.current) {
        let briefRevealed = false;
        splits.push(
          SplitText.create(briefRef.current.querySelectorAll("p"), {
            type: "lines",
            // 日本語は単語間に空白がないため、既定の区切りだと段落全体が1単語=1行になる。
            // 1文字ずつを最小単位にして行を測らせる（type に chars を含めないので
            // 行へグループ化したあと文字要素は解除され、行 div には素のテキストが残る）。
            wordDelimiter: "",
            autoSplit: true,
            onSplit: (self) => {
              if (briefRevealed) return;
              return gsap.from(self.lines, {
                autoAlpha: 0,
                y: 16,
                duration: 0.6,
                ease: "power3.out",
                stagger: 0.05,
                force3D: true,
                scrollTrigger: { ...scrollTriggerBase },
                onComplete: () => {
                  briefRevealed = true;
                },
              });
            },
          })
        );
      }

      // ── 画像: 二層ズームイン ──
      // 枠には overflow-hidden と rounded-l-2xl / lg:rounded-full があるため
      // clip-path は使わない（border-radius が失われる）。
      // 枠の autoAlpha/y と、内側 <img> の scale を別 tween に分ける。
      if (imageFrameRef.current) {
        gsap.from(imageFrameRef.current, {
          autoAlpha: 0,
          y: 32,
          duration: 0.9,
          ease: "power3.out",
          force3D: true,
          scrollTrigger: { ...scrollTriggerBase },
        });

        const imageEl = imageFrameRef.current.querySelector("img");
        if (imageEl) {
          gsap.from(imageEl, {
            scale: 1.2,
            duration: 1.4,
            ease: "power2.out",
            force3D: true,
            scrollTrigger: { ...scrollTriggerBase },
          });
        }
      }

      // ── 挨拶本文: 段落ごとにフェードアップ ──
      if (messageRef.current) {
        gsap.from(messageRef.current.children, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          force3D: true,
          scrollTrigger: { ...scrollTriggerBase },
        });
      }
    }, sectionRef);

    ctxRef.current = ctx;

    return () => {
      // ctx.revert() で戻るはずだが、autoSplit のリスナーを確実に外すため明示的に revert する
      splits.forEach((split) => split.revert());
      splits.length = 0;
      ctxRef.current?.revert();
      ctxRef.current = null;
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden bg-gray-50 py-24 lg:py-32"
      aria-labelledby="about-theme-heading"
    >
      {/* ── 装飾三角形 ×6（lg以上のみ、常時ゆっくり漂う） ── */}
      {DECOR_TRIANGLES.map((triangle) => (
        <div
          key={triangle.shape}
          className={`animate-triangle-drift absolute z-0 hidden lg:block ${triangle.shape}`}
          style={{
            clipPath: TRIANGLE_CLIP,
            animation: `${triangle.drift} ease-in-out infinite`,
            animationDelay: triangle.delay,
          }}
          aria-hidden="true"
        />
      ))}

      <div className="relative z-10 mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
        {/* === モバイル: 通常フロー縦積み / デスクトップ: Grid 12列 === */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
          {/* ── テーマラベル (THEME) ── col 7-10, row 1 */}
          <div className="lg:col-start-7 lg:col-end-10 lg:row-start-1">
            <p
              ref={themeLabelRef}
              className="text-xs font-bold uppercase tracking-[0.24em] text-primary-700"
            >
              {themeLabel}
            </p>
          </div>

          {/* ── テーマ見出し ── col 7-13, row 2 */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-2 lg:mt-2 mb-8 lg:mb-12">
            <h2
              id="about-theme-heading"
              ref={headingRef}
              className="font-heading text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl"
            >
              {headingLines.map((line, index) => (
                <Fragment key={line}>
                  {index > 0 && <br />}
                  {line}
                </Fragment>
              ))}
            </h2>
          </div>

          {/*
            ── 世田谷祭の様子（1ノードで両レイアウトを兼ねる） ──
            lg 未満: 右端からはみ出す 4:3 の角丸。lg 以上: col 2-6 / row 2-4 の正円。
            形状差は Tailwind の lg バリアントのみで表現し、DOM を二重に持たない。

            - 負のマージンは左右パディング（px-8 sm:px-12）と対で増やす。揃えないと
              sm 以上で画面端まで届かず、角と影が縦帯として見えてしまう。
            - lg:max-h-none は必須。外すと 1152px 以上で正円が max-h-80 に潰れる
              （1024px では潰れないため見落としやすい）。
          */}
          <div className="-mr-8 ml-[20%] sm:-mr-12 lg:col-start-2 lg:col-end-6 lg:row-start-2 lg:row-end-5 lg:mr-0 lg:ml-0 lg:pt-8">
            <div
              ref={imageFrameRef}
              className="relative aspect-[4/3] max-h-64 w-full overflow-hidden rounded-l-2xl shadow-lg sm:max-h-80 md:max-h-96 lg:aspect-square lg:max-h-none lg:rounded-full"
            >
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover object-[center_25%]"
                sizes="(min-width: 72rem) 330px, (min-width: 64rem) 30vw, 80vw"
              />
            </div>
          </div>

          {/*
            ── テーマ解説 ── col 7-13, row 4
            max-w-2xl は 768〜1023px 帯で1行が58字に伸びるのを抑えるためのもの。
            lg のカラム幅（最大500px）はこれを下回るため lg では効かない。
          */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-4">
            <div ref={briefRef} className="max-w-2xl lg:max-w-none">
              {briefParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-base leading-[2] text-gray-600 lg:text-lg">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/*
            ── 挨拶ブロックのヘッダー ── col 3-7, row 5（テーマ解説との境界）
            lg は gap-y-0 なので row 6 の本文との間隔が生まれない。lg:pb-8 で
            lg 未満の gap-8 と同じリズムを確保する。
          */}
          <div
            ref={messageHeaderRef}
            className="border-t border-gray-200 pt-8 lg:col-start-3 lg:col-end-8 lg:row-start-5 lg:mt-24 lg:pt-10 lg:pb-8"
          >
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-700">
              {messageLabel}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-bold text-gray-900 lg:text-3xl">
              {messageHeading}
            </h3>
          </div>

          {/*
            ── 署名（ポートレート + 名前・役職） ── col 8-11, row 6（本文と並行）
            lg 未満は本文の直上に置く署名カード（小さい丸アバターと名前の横並び）。
            lg 以上は従来どおり全幅の正円 + 右寄せの名前に戻る。
          */}
          <div ref={signatureRef} className="lg:col-start-8 lg:col-end-12 lg:row-start-6 lg:mt-36">
            <div className="flex items-center gap-4 lg:block">
              {/* shrink-0 は必須。外すと役職名が長いときにアバターが縮み、
                  aspect-square の作用で高さまで一緒に縮む。 */}
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-full shadow-lg sm:w-28 lg:w-full">
                {/* 氏名・役職が隣接して読み上げられるため alt は空にする（装飾扱い） */}
                <Image
                  src={subImage}
                  alt=""
                  fill
                  className="object-cover object-[center_25%]"
                  sizes="(min-width: 72rem) 330px, (min-width: 64rem) 30vw, 112px"
                />
              </div>
              <div className="min-w-0 lg:mt-4 lg:text-right">
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{position}</p>
              </div>
            </div>
          </div>

          {/* ── 挨拶本文 ── col 3-7, row 6（max-w-2xl の意図はテーマ解説と同じ） */}
          <div className="lg:col-start-3 lg:col-end-8 lg:row-start-6">
            <div ref={messageRef} className="max-w-2xl space-y-7 sm:space-y-8 lg:max-w-none">
              {messageParagraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-[2] text-gray-600 sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
