import type { ImageLoaderProps } from "next/image";

/**
 * microCMS の画像を imgix へ、それ以外を Next.js の既定へ振り分ける `next/image` のローダー。
 *
 * microCMS のメディアは imgix で配信されているため、変換を imgix 側へ委譲する。
 * Vercel の Image Optimization を経由しないので、Free Plan の変換枠
 * （Image Transformations）も帯域も消費しない。
 *
 * **microCMS 由来の画像を描く `<Image>` には必ず `loader={appImageLoader}` を渡すこと。**
 * 渡し忘れた画像は Vercel の変換枠を消費する。`pnpm build` の末尾で走る
 * `scripts/assert-remote-images-bypass-optimizer.mjs` が生成物を読んで検出する。
 * 逆に、`public/` の静的画像へ渡してはいけない（Vercel の最適化を素通りして原寸配信になる）。
 * 振り分けは `src/components/ui/AppImage.tsx` が実行時に行うので、呼び出し側は意識しなくてよい。
 *
 * ## 背景（#237）
 *
 * 2026-09-19、本番の `/_next/image` が `402 Payment Required`
 * （`x-vercel-error: OPTIMIZED_IMAGE_REQUEST_PAYMENT_REQUIRED`）を返し、
 * 企画サムネイルの一部が表示されなくなった。無料枠（Hobby は月5,000変換）の枯渇である。
 *
 * 課金単位は「画像1枚」ではなく変換1回、すなわち
 * `(元画像, 幅, 品質, フォーマット)` の組み合わせ1つ。変換済みの結果は CDN に
 * 残るため、枯渇後は「未変換の組み合わせだけが壊れる」という分かりにくい形で表面化した。
 *
 * 枠を焼いていた主体は microCMS 側である。2026-09-20 に本番HTMLの srcset を全数えした
 * 結果、変換数の上限は `public/` の静的画像11ファイルで 178通り×2形式＝**356**
 * （枠 5,000 の 7%）。対して microCMS は企画サムネイル93枚だけで約 3,348。
 * **ここだけ imgix へ逃がせば根治する。静的画像は Vercel の最適化に残す。**
 *
 * ## なぜ `next.config.ts` の `loaderFile` ではなく `loader` prop なのか
 *
 * **`images.loader: "custom"` を設定すると、`/_next/image` エンドポイントが 404 になる。**
 * 2026-09-19 に `loaderFile` 方式で実装して実測したところ、`dev` / `start` のいずれでも
 * ローカル静的画像が 404 になった（`loaderFile` を外すと同じURLが 200 を返す）。
 * グローバルに適用すると、**静的画像が巻き添えで最適化を失う。**
 *
 * ## なぜ `AppImage` というラッパーが要るのか
 *
 * **`loader` prop に関数を渡せるのは Client Component だけである。** Server Component から
 * 渡すと prerender の時点で `Functions cannot be passed directly to Client Components` で
 * **ビルドが落ちる**（2026-09-19、`/about/sponsors` で実測）。`next/image` の既定
 * エクスポートは `next/dist/client/image-component` のクライアント部品であり、
 * 関数 prop はこの境界を越えられない。**開発サーバーでは顕在化せず `next build` で初めて出る。**
 */

/** microCMS のメディア配信ホスト。imgix 互換の変換パラメータを受け付ける。 */
const MICROCMS_ASSETS_ORIGIN = "https://images.microcms-assets.io/";

/** imgix の変換を掛けられる画像か。`AppImage` が `unoptimized` の切り替えに使う。 */
export function isMicrocmsImage(src: string): boolean {
  return src.startsWith(MICROCMS_ASSETS_ORIGIN);
}

/**
 * `quality` 未指定時の既定値。next/image の既定と揃える。
 *
 * `next.config.ts` の `qualities` に含まれる値でなければ `/_next/image` が 400 を返すため、
 * ローカル画像側の経路ではこの値がそのまま制約になる。
 */
const DEFAULT_QUALITY = 75;

/**
 * microCMS の画像URLへ imgix の変換パラメータを付与する。
 *
 * ## `auto=format` を使わず `fm=webp` を決め打ちする理由
 *
 * imgix の `auto=format` は Accept ヘッダを見て AVIF / WebP を出し分ける機能だが、
 * **microCMS の前段にある CloudFront が Accept を転送しないため機能しない。**
 * 2026-09-19 の実測では、`Accept: image/avif,image/webp,...` を明示して
 * `auto=format` を付けても応答は `image/jpeg` のままで、`Vary` ヘッダも返らなかった。
 *
 * 出し分けができない以上フォーマットは固定するしかなく、対応環境の広い WebP を選ぶ。
 * サポート下限（iOS Safari 16.4 / Chrome 111 / Firefox 128）はいずれも AVIF にも
 * 対応しているが、`<picture>` によるフォールバックを持てない固定指定では、
 * 画像プロキシや古い WebView のような想定外の環境で表示自体を失う損失のほうが大きい。
 *
 * 実測（`写真部.jpg` 1081x1081 / 原寸 70,481B を `w=340` で変換）:
 *
 * | 指定                            | 応答          | サイズ  |
 * | ------------------------------- | ------------- | ------- |
 * | `auto=format`（Accept 明示）    | `image/jpeg`  | 15,772B |
 * | `fm=webp&q=75`                  | `image/webp`  | 11,170B |
 * | `fm=webp&q=75&auto=compress`    | `image/webp`  |  8,506B |
 * | `fm=avif&q=75&auto=compress`    | `image/avif`  |  5,651B |
 *
 * ## `fit=max` が必須である理由
 *
 * imgix は既定で拡大もする。入稿画像の寸法は入稿者任せで、`deviceSizes` の上端
 * （3840）に届かないものが大半である。実測では 1081px の原画像に `w=1920` を指定すると
 * 1920x1920 へ水増しされ 65,952B になった。`fit=max` を付けると 1081px で止まり
 * 35,886B に収まる。劣化した画像を余計な転送量で配るのを防ぐ。
 */
function toImgixUrl(src: string, width: number, quality: number): string {
  const url = new URL(src);
  url.searchParams.set("w", String(width));
  url.searchParams.set("q", String(quality));
  url.searchParams.set("fm", "webp");
  url.searchParams.set("auto", "compress");
  url.searchParams.set("fit", "max");
  return url.toString();
}

export function appImageLoader({ src, width, quality }: ImageLoaderProps): string {
  /*
   * imgix を使えない画像は、変換せず原寸のまま返す。
   *
   * **通常この分岐には到達しない。** `AppImage` は microCMS の画像にしかこのローダーを
   * 渡さず、`public/` の静的画像は `loader` 無し（= next/image の既定ローダー）で
   * Vercel の最適化へ回るためである。ここは、このローダーを直接使われたときに
   * 意図しないホストの画像を imgix のパラメータ付きで返さないための保険である。
   */
  if (!isMicrocmsImage(src)) return src;

  return toImgixUrl(src, width, quality ?? DEFAULT_QUALITY);
}
