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
 * `scripts/assert-no-image-optimizer.mjs` が生成物を読んで検出する。
 * 逆に、`public/` の静的画像へ渡してはいけない。静的画像は `unoptimized` で
 * **事前最適化済みの実体をそのまま配る**ので、このローダーを通す意味が無い
 * （通しても `isMicrocmsImage` が false で素通しになるが、意図が読めなくなる）。
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
 *
 * ただし **「だから静的画像は Vercel に残してよい」は誤りだった**（#241）。
 * 枠はアカウント全体の総量で枯れるので、消費が 7% の利用者も**すでに枯れた枠の上では
 * 402 になる**。実際トップページの静的画像 srcset 128通り中81通りが 402 で、
 * オープナーのロゴは Retina で必ず消えていた。**静的画像も Vercel から外し、
 * 手元で事前に AVIF へ焼いて配る**（`scripts/optimize-static-images.mjs`）。
 *
 * ## なぜ `next.config.ts` の `loaderFile` ではなく `loader` prop なのか
 *
 * **`images.loader: "custom"` を設定すると、`/_next/image` エンドポイントが 404 になる。**
 * 2026-09-19 に `loaderFile` 方式で実装して実測したところ、`dev` / `start` のいずれでも
 * ローカル静的画像が 404 になった（`loaderFile` を外すと同じURLが 200 を返す）。
 *
 * 静的画像も Vercel から外したいまは「巻き添え」自体が起きないが、`loaderFile` は
 * **すべての画像にこのローダーを通してしまう。** `public/` の画像まで
 * `appImageLoader` の分岐を踏むことになり、`AppImage` が持っている
 * 「どこで変換するか」の決定が2箇所に散る。`loader` prop のままにする。
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

/** 画像をどこで変換して配るか。`raw` は事前最適化済みの実体をそのまま配る経路。 */
export type ImageDelivery = "imgix" | "raw";

/**
 * `src` から配信経路を決める。`AppImage` の振り分けそのものである。
 *
 * **`AppImage` の中にインラインで書かない。** インラインだと、`loader` や
 * `unoptimized` の指定が外れても `appImageLoader` は無傷なのでユニットテストは緑のまま通り、
 * **枠の消費が静かに復活する**（#237 で実際に起きた形）。ここへ出しておけば
 * 振り分け自体を `image-loader.test.ts` が固定できる。
 *
 * 文字列でない `src`（画像の静的 import）は `public/` 配下と同じ扱いにする。
 * microCMS の画像が静的 import で入ることはありえないためである。
 */
export function resolveDelivery(src: unknown): ImageDelivery {
  return typeof src === "string" && isMicrocmsImage(src) ? "imgix" : "raw";
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
 * ## `auto=format` を使わず `fm=avif` を決め打ちする理由
 *
 * imgix の `auto=format` は Accept ヘッダを見て AVIF / WebP を出し分ける機能だが、
 * **microCMS の前段にある CloudFront が Accept を転送しないため機能しない。**
 * 2026-09-19 の実測では、`Accept: image/avif,image/webp,...` を明示して
 * `auto=format` を付けても応答は `image/jpeg` のままで、`Vary` ヘッダも返らなかった。
 *
 * 出し分けができない以上フォーマットは固定するしかない。**AVIF を選ぶ。**
 *
 * | 指定                         | 応答         | サイズ  |
 * | ---------------------------- | ------------ | ------- |
 * | `auto=format`（Accept 明示） | `image/jpeg` | 15,772B |
 * | `fm=webp&q=75`               | `image/webp` | 11,170B |
 * | `fm=webp&q=75&auto=compress` | `image/webp` |  8,506B |
 * | `fm=avif&q=75&auto=compress` | `image/avif` |  5,651B |
 *
 * （`写真部.jpg` 1081x1081 / 原寸 70,481B を `w=340` で変換）
 *
 * ### フォールバックを失う代わりに何を得るか（2026-09-20 実測）
 *
 * 公開中の入稿画像30本（4ルート×2画面幅でブラウザが実際に取得したもの）で
 * **1,568,048B → 996,780B、36.4% 減。** ページ別は `/` −38.2%、`/special` −39.1%、
 * `/about/sponsors` −28.2%、`/events` −25.9%。30本すべてが `image/avif` を返した。
 *
 * ### なぜフォールバックを捨ててよいか
 *
 * 1. **サポート下限がすでに AVIF を要求している。** 下限（iOS Safari 16.4 /
 *    Chrome 111 / Firefox 128）は TailwindCSS v4 の `@property` / `color-mix()` 由来で、
 *    AVIF の下限（Safari 16.0 / Chrome 85 / Firefox 93）より高い。
 *    **AVIF が読めない環境では、そもそも CSS が効かずレイアウトが崩れている。**
 * 2. **本番はすでに全画像を AVIF で配っている。** `next.config.ts` の
 *    `formats` は #107 から AVIF 優先で、実測でも本番は `image/avif` を返す。
 *    PR #110 の Lighthouse 基準（Performance 98 / LCP 2.4秒）も AVIF 配信下の値。
 * 3. **OGP は影響を受けない。** `src/lib/metadata.ts` は `thumbnail.url` から
 *    `w=1200&h=630&fit=fill&fill=solid&fill-color=…` を独自に組み立てており
 *    `fm=` を付けない。**AVIF 非対応のクローラ（X など）には原形式が届く。**
 * 4. **デコードは重くならない。** 低性能Android相当（CPU 6x）の強制デコードで、
 *    `w=828` で最大 +1.3ms、`w=1080` 以上ではむしろ AVIF のほうが速い
 *    （データ量が少ないため）。`/events` を Slow 4G + CPU 6x で通しても
 *    LCP は 1,444ms → 1,440ms で差が出なかった。
 *
 * 残るリスクは、企業プロキシの再エンコードのような**想定外の環境**だけである。
 * 切り戻すときは下の `fm` の値と `image-loader.test.ts` の期待値を戻す。
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
  url.searchParams.set("fm", "avif");
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
