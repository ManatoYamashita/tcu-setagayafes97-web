"use client";

import Image, { type ImageProps } from "next/image";
import { appImageLoader } from "@/lib/image-loader";

/**
 * microCMS 由来の画像を描く `next/image`。
 *
 * **microCMS の画像は必ずこのコンポーネントで描くこと。** 素の `next/image` で描くと
 * Vercel の Image Optimization を通り、Free Plan の変換枠を消費する。枠が枯れると
 * `402` が返り、その画像だけが壊れる（#237）。渡し忘れは `pnpm build` の末尾で走る
 * `scripts/assert-remote-images-bypass-optimizer.mjs` が生成物を読んで落とす。
 *
 * ## なぜラッパーが要るのか
 *
 * 変換先の振り分けは `appImageLoader` が行うが、**`loader` prop に関数を渡せるのは
 * Client Component だけである。** Server Component から渡すと、事前描画の時点で
 * `Functions cannot be passed directly to Client Components` で**ビルドが落ちる**
 * （2026-09-19、`/about/sponsors` の prerender で実測）。開発サーバーでは顕在化せず、
 * `next build` で初めて出る。
 *
 * このコンポーネントが `"use client"` を持つことで、呼び出し側は Server / Client を
 * 問わなくなる。現在の呼び出し元12ファイルのうち6つは Server Component である。
 *
 * ローカル画像を渡しても安全で、その場合は `/_next/image` へ回る（既定と同じ挙動）。
 * 同じ `<Image>` に microCMS の画像とローカルのフォールバックの両方が入りうるため
 * （`FeaturedCarousel` と `NewsCard` がその例）、この性質が要る。
 *
 * 設計と実測値は docs/frontend/image-delivery.md を参照。
 */
export function RemoteImage(props: ImageProps) {
  return <Image loader={appImageLoader} {...props} />;
}
