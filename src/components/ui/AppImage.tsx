"use client";

import type { Ref } from "react";
import Image, { type ImageProps } from "next/image";
import { appImageLoader, isMicrocmsImage } from "@/lib/image-loader";

/**
 * このプロジェクトで画像を描くための `next/image`。
 *
 * **`next/image` を直接使わず、必ずこれを使うこと。** microCMS の画像を直接描くと
 * Vercel の Image Optimization を通り、Free Plan の変換枠を消費する。枠が枯れると
 * `402` が返り、**その画像だけが壊れる**（#237）。素の `next/image` の混入は
 * `pnpm build` の末尾で走る `scripts/assert-remote-images-bypass-optimizer.mjs` が
 * 生成物を読んで落とす。
 *
 * 画像の出どころで扱いを変える。
 *
 * | 出どころ                 | 扱い                                       |
 * | ------------------------ | ------------------------------------------ |
 * | microCMS（imgix 配信）   | `appImageLoader` が imgix で変換させる     |
 * | `public/` 配下の静的画像 | Vercel の Image Optimization（既定の動作） |
 *
 * 判定は実行時に `src` を見て行う。同じ箇所に microCMS の画像とローカルのフォールバックの
 * 両方が入りうるため（`FeaturedCarousel` と `NewsCard` がその例）、呼び出し側が
 * 区別する必要は無い。
 *
 * ## なぜ静的画像は Vercel に残すのか
 *
 * **枠を焼いていたのは microCMS 側だけだからである。** 2026-09-20 に本番HTMLの
 * srcset を全数えしたところ、変換数の上限は静的画像11ファイルで 178通り×2形式＝356、
 * 対して microCMS は企画サムネイル93枚だけで約3,348（#237）。静的画像は枠 5,000 の
 * 7% しか使っていない。
 *
 * 静的画像まで `unoptimized` にすると、docs が LCP 要素と名指しする
 * `favicon-outline.webp` が 16,272B → 76,520B（4.7倍）になり、`quality` 指定も死ぬ。
 * トップページ1画面の画像転送量は 139,856B → 653,780B（4.67倍）だった（実測）。
 * **払う必要のない代償なので払わない。**
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
   * microCMS の画像だけ imgix へ回す。それ以外（`public/` の静的画像と、
   * 文字列でない `src` = 静的インポート）は Vercel の最適化に残す。
   *
   * `loader` を渡さなければ next/image は既定のローダーへ落ちる
   * （`get-img-props.js` の `rest.loader || defaultLoader`）。`unoptimized` は使わない。
   */
  const useImgix = typeof src === "string" && isMicrocmsImage(src);

  return (
    <Image
      ref={ref}
      src={src}
      alt={alt}
      loader={useImgix ? appImageLoader : undefined}
      {...props}
    />
  );
}
