"use client";

import type { Ref } from "react";
import Image, { type ImageProps } from "next/image";
import { appImageLoader, resolveDelivery } from "@/lib/image-loader";

/**
 * このプロジェクトで画像を描くための `next/image`。
 *
 * **`next/image` を直接使わず、必ずこれを使うこと。** `eslint.config.mjs` の
 * `no-restricted-imports` が error で止める（例外はこのファイルと
 * `src/lib/image-loader.ts` のみ）。
 *
 * 画像の出どころで扱いを変える。判定は実行時に `src` を見て行うので、
 * 呼び出し側は Server / Client も、microCMS / 静的も区別しなくてよい。
 * 同じ箇所に microCMS の画像とローカルのフォールバックの両方が入りうるため
 * （`FeaturedCarousel` と `NewsCard` がその例）、これは必要な性質である。
 *
 * | 出どころ                 | 扱い                                       |
 * | ------------------------ | ------------------------------------------ |
 * | microCMS（imgix 配信）   | `appImageLoader` が imgix で変換させる     |
 * | `public/` 配下の静的画像 | **`unoptimized` で事前最適化済みの実体をそのまま配る** |
 *
 * **どちらも Vercel の Image Optimization を通らない。変換枠の消費は 0 である。**
 *
 * ## なぜ静的画像も Vercel から外すのか
 *
 * **枠は総量で枯れるからである。**
 *
 * 2026-09-19、Vercel Hobby の変換枠（月5,000）が枯れて `402` が返り始めた。
 * 焼いていた主体は microCMS 側（企画サムネイル93枚で約3,348変換）で、
 * 静的画像は上限でも月356（枠の7%）しか使っていなかった。そのため #240 では
 * 「消費が少ないのだから静的画像は Vercel に残してよい」と判断した。**これが誤りだった。**
 *
 * 消費が 7% の利用者も、**すでに枯れた枠の上では 402 になる。** 変換数の少なさは
 * 何も保護しない。2026-09-20 の実測では、トップページの静的画像 srcset 128通りのうち
 * **81通りが 402** で、オープナーのロゴは DPR2 のブラウザが選ぶ w=640 が未変換のため
 * **Retina では必ず表示されなかった**（#241）。枠は直近30日のローリング窓なので、
 * 一度枯れると約1か月戻らない。
 *
 * ## 「外すと LCP 要素が 4.7 倍になる」はどうなったか
 *
 * #240 が差し戻しの根拠にした 4.67 倍（トップ1画面 139,856 B → 653,780 B）は、
 * **原画像を事前最適化していなかったことの帰結**であって、Vercel から外すことの
 * 必然的な代償ではなかった。`assets/source/` の原画像を表示寸法の AVIF へ焼くと
 * **724,228 B → 199,005 B（73% 減）** になり、ファーストビュー8枚は 167,878 B
 * （Vercel 経由の実測 139,856 B に対し +20%）に収まる。
 *
 * 寸法・品質・バイト予算の一次定義は `scripts/static-image-manifest.mjs`、
 * 焼くのは `pnpm images:optimize`、守るのは `pnpm check:images` である。
 *
 * ## なぜラッパーが要るのか
 *
 * **`loader` prop に関数を渡せるのは Client Component だけである。** Server Component から
 * 渡すと、事前描画の時点で `Functions cannot be passed directly to Client Components` で
 * **ビルドが落ちる**（2026-09-19、`/about/sponsors` の prerender で実測）。開発サーバーでは
 * 顕在化せず、`next build` で初めて出る。
 *
 * 設計と実測値は docs/frontend/image-delivery.md を参照。
 */
/**
 * `next/image` の `ImageProps` は `ref` を含まないが、GSAP の演出で要る箇所がある
 * （`AboutSection` と `NewsSectionInteractive` の計3箇所）。React 19 では関数
 * コンポーネントが `ref` を通常の prop として受け取れるので、型だけ足して素通しする。
 *
 * `loader` と `unoptimized` は **`Omit` で塞いでいる。** `{...props}` が後ろにある以上、
 * 型で消さないと呼び出し側が個別に Vercel の最適化へ戻せてしまい、
 * 枠の消費がまた静かに復活する。配信経路の決定権はこのコンポーネントだけが持つ。
 */
type AppImageProps = Omit<ImageProps, "loader" | "unoptimized"> & {
  ref?: Ref<HTMLImageElement>;
};

// `alt` を明示的に受けて渡している。スプレッドに含めたままだと jsx-a11y/alt-text が
// 「alt が無い」と誤って警告する（静的解析ではスプレッドの中身を追えないため）。
export function AppImage({ src, alt, ref, ...props }: AppImageProps) {
  const useImgix = resolveDelivery(src) === "imgix";

  /*
   * `quality` は `unoptimized` の経路で完全に無視される。渡されていても何も起きないので
   * 型では落とせず、かつ `src` が実行時に決まる箇所（microCMS とローカルのフォールバックが
   * 同居する `FeaturedCarousel` / `NewsCard`）があるため ESLint でも判定できない。
   * 実行時に気づかせるのがここしかない。本番ビルドでは丸ごと落ちる。
   */
  if (process.env.NODE_ENV !== "production" && !useImgix && props.quality !== undefined) {
    console.warn(
      `[AppImage] ${String(src)}: quality は public/ の静的画像には効きません。` +
        "品質は scripts/static-image-manifest.mjs の quality で決め、" +
        "pnpm images:optimize で実体へ焼き込みます。"
    );
  }

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      loader={useImgix ? appImageLoader : undefined}
      unoptimized={!useImgix}
      {...props}
    />
  );
}
