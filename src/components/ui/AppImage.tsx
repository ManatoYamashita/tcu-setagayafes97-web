"use client";

import type { Ref } from "react";
import Image, { type ImageProps } from "next/image";
import { appImageLoader, isMicrocmsImage } from "@/lib/image-loader";

/**
 * このプロジェクトで画像を描くための `next/image`。
 *
 * **`next/image` を直接使わず、必ずこれを使うこと。** 直接使うと Vercel の
 * Image Optimization を通り、Free Plan の変換枠を消費する。枠が枯れると `402` が返り、
 * **その画像だけが壊れる**（#237）。素の `next/image` の混入は `pnpm build` の末尾で走る
 * `scripts/assert-remote-images-bypass-optimizer.mjs` が生成物を読んで落とす。
 *
 * 画像の出どころで扱いを変える。
 *
 * | 出どころ                | 扱い                                     |
 * | ----------------------- | ---------------------------------------- |
 * | microCMS（imgix 配信）  | `appImageLoader` が imgix で変換させる   |
 * | `public/` 配下の静的画像 | `unoptimized` で原寸のまま配信する       |
 *
 * 判定は実行時に `src` を見て行う。同じ箇所に microCMS の画像とローカルのフォールバックの
 * 両方が入りうるため（`FeaturedCarousel` と `NewsCard` がその例）、呼び出し側が
 * 区別する必要は無い。
 *
 * ## なぜ静的画像を `unoptimized` にするのか
 *
 * `/_next/image` へ回しても**枠の枯渇からは逃れられない**。2026-09-19 に Preview で
 * 実測したところ、静的画像もブラウザが実際に選ぶ帯（w=640〜1920）はすべて 402 で、
 * ヘッダーロゴもヒーロー画像も壊れていた。枠を一切使わない状態にすることを選んでいる。
 * 代償として静的画像は原寸で配信される（9種・合計 617KB）。表示寸法への事前縮小は
 * 別途行う。
 *
 * ## なぜラッパーが要るのか
 *
 * **`loader` prop に関数を渡せるのは Client Component だけである。** Server Component から
 * 渡すと、事前描画の時点で `Functions cannot be passed directly to Client Components` で
 * **ビルドが落ちる**（2026-09-19、`/about/sponsors` の prerender で実測）。開発サーバーでは
 * 顕在化せず、`next build` で初めて出る。
 *
 * このコンポーネントが `"use client"` を持つことで、呼び出し側は Server / Client を
 * 問わなくなる。
 *
 * 設計と実測値は docs/frontend/image-delivery.md を参照。
 */
/**
 * `next/image` の `ImageProps` は `ref` を含まないが、GSAP の演出で要る箇所がある
 * （`AboutSection` と `NewsSectionInteractive` の計3箇所）。React 19 では関数
 * コンポーネントが `ref` を通常の prop として受け取れるので、型だけ足して素通しする。
 */
type AppImageProps = ImageProps & { ref?: Ref<HTMLImageElement> };

// `alt` を明示的に受けて渡している。スプレッドに含めたままだと jsx-a11y/alt-text が
// 「alt が無い」と誤って警告する（静的解析ではスプレッドの中身を追えないため）。
export function AppImage({ src, alt, ref, ...props }: AppImageProps) {
  /*
   * `unoptimized` が true のとき next/image はローダーを呼ばず `src` をそのまま使う。
   * 文字列でない `src`（静的インポート）はこのプロジェクトで使っていないが、
   * 来た場合も最適化しない側へ倒す。
   */
  const optimizable = typeof src === "string" && isMicrocmsImage(src);

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      loader={appImageLoader}
      unoptimized={!optimizable}
      {...props}
    />
  );
}
