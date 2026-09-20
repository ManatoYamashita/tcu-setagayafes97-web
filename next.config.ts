import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";
import { specialBanner } from "./src/data/special-banner";
import { ARCHIVE_96TH_ORIGIN } from "./src/data/legacy-hosts";

const withNextIntl = createNextIntlPlugin();
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/**
 * 第96回サイトのアーカイブ先。
 *
 * `setagayafes.org` は第97回の正規ドメインになるため、第96回の WordPress は
 * このサブドメインへ退避する。旧URL `setagayafes.org/96th/*` は被リンクが残るので
 * 301 で引き継ぐ。
 *
 * IMPORTANT: rewrite（プロキシ）ではなく redirect である。理由は2つ。
 *
 * 1. プロキシにすると無限ループになる。Next.js の trailing-slash リダイレクトは
 *    rewrite より先に走るため `/96th/` が `/96th` へ 308 され、オリジンの
 *    WordPress が `/96th/` へ 301 で戻す。`skipTrailingSlashRedirect: true` で
 *    止められるが、サイト全体の正規化が効かなくなり canonical 未実装の現状では
 *    重複URLを生む。
 * 2. WordPress の全アセットが Vercel を経由し、Free Plan の帯域（100GB/月）を
 *    消費する。アーカイブのために払うコストではない。
 *
 * 前提: さくら側で `96th.setagayafes.org` のドキュメントルートを WordPress の
 * ディレクトリへ向け、WordPress の `siteurl` / `home` も同ホストへ変更しておくこと。
 * これを怠ると、WordPress が絶対URLで `setagayafes.org/96th/` を出し続けるため
 * この 301 へ戻ってループする。
 *
 * 手順と検証は docs/dev/domain-migration.md を参照。
 */

/**
 * 著名人企画LPへの転送先。
 *
 * ID の出典は `src/data/special-banner.ts` に一本化する。トップページの告知
 * セクションが参照しているのと同じ「いま推している著名人企画」であり、ここで
 * 別途ベタ書きすると 2 箇所に散る。`@/` エイリアスは next.config の読み込み時に
 * 解決されないため、相対パスで取り込む（このモジュールは他を import しない
 * 純粋なデータ定義なので、設定ファイルから読んでも副作用はない）。
 *
 * 公開フラグはビルド時に評価される。`src/data/site.ts` の SPECIAL_VISIBLE と
 * 同じ判定式だが、そちらは `@/` 経由でしか読めないため式のみを再掲する。
 */
const SPECIAL_VISIBLE = process.env.NEXT_PUBLIC_SPECIAL_VISIBLE === "true";

/**
 * 非公開の間は LP が `notFound()` を返すため、転送先を `/special` の準備中表示に
 * 落とす。ここを LP 直指しのままにすると、告知URLを踏んだ来場者が 404 に着く。
 */
const SPECIAL_LANDING_PATH = SPECIAL_VISIBLE ? `/special/${specialBanner.eventId}` : "/special";

const nextConfig: NextConfig = {
  // `/96th/` の専用301をNext.jsの自動308より先に処理するため、
  // 末尾スラッシュの自動リダイレクトは proxy.ts で明示的に再現する。
  skipTrailingSlashRedirect: true,
  async redirects() {
    return [
      {
        // 旧・実行委員会サイトのトップを、現在の委員会紹介へ統合する。
        // サブページは内容が一致しないため一括転送せず、404のまま整理する。
        source: "/sfa",
        destination: "/about",
        statusCode: 301,
      },
      {
        source: "/96th/:path*",
        destination: `${ARCHIVE_96TH_ORIGIN}/:path*`,
        /*
         * `permanent: true` ではなく `statusCode: 301` を指定する。
         * `permanent: true` は 308 を返す。308 は method を保持する仕様で、
         * 検索エンジンの扱いは 301 と同等だが、古いクローラやリンクチェッカには
         * 301 のほうが確実に伝わる。アーカイブへの GET 導線に method 保持は不要。
         */
        statusCode: 301,
      },
      {
        /*
         * 旧・第97回サイトの委員会紹介URL。著名人企画の告知導線として再利用する。
         *
         * このURLは放置すると404ではなく200を返す。`src/app/[locale]/about/page.tsx`
         * の `[locale]` が `97th` をロケールとして飲み込み、`/about` と同じ内容を
         * 重複配信するためである。`redirects()` は動的ルートの照合より先に走るので、
         * ここで塞ぐのが唯一の確実な層になる（proxy.ts の matcher では遅い）。
         *
         * `statusCode: 301` ではなく 302。301 はブラウザが無期限にキャッシュするため、
         * 企画終了後にこの転送を外しても、一度踏んだ訪問者の端末では効き続ける。
         */
        source: "/97th/about",
        destination: SPECIAL_LANDING_PATH,
        statusCode: 302,
      },
      /*
       * 公開中の著名人企画が1組だけの間、`/special` の一覧はカード1枚が並ぶだけに
       * なるため、一覧を挟まず LP へ送る。非公開の間は `/special` 自身が準備中表示を
       * 担うので転送しない。
       *
       * ページ側の `redirect()` では代用できない。ルート直下の `loading.tsx` により
       * ストリーミングのシェルが先に送出され、`redirect()` は HTTP ステータスに
       * 反映されず `<meta http-equiv="refresh">` へ格下げされる（実測済み）。
       *
       * 2組目が公開されたらこのエントリを削除すること。`src/app/special/page.tsx`
       * の一覧表示がそのまま復帰する。
       */
      ...(SPECIAL_VISIBLE
        ? [
            {
              source: "/special",
              destination: SPECIAL_LANDING_PATH,
              statusCode: 302 as const,
            },
          ]
        : []),
    ];
  },
  images: {
    /*
     * **この設定はもう microCMS の画像にしか効かない。**
     *
     * `public/` の静的画像は `AppImage` が `unoptimized` で描くようになったため、
     * `/_next/image` を一切通らない（srcset も出ない）。実体は
     * `scripts/optimize-static-images.mjs` が表示寸法の AVIF へ焼いて `public/` へ置く。
     * 寸法・品質・バイト予算の一次定義は `scripts/static-image-manifest.mjs`。
     *
     * 静的画像まで外した理由は **枠が総量で枯れるから**である。#240 では
     * 「静的画像は枠の 7% しか使わないので残してよい」と判断したが、すでに枯れた枠の上では
     * 消費の少なさは何も保護せず、実際 2026-09-20 にはトップページの静的画像 srcset
     * 128通り中81通りが 402 だった（#241）。経緯は docs/frontend/image-delivery.md。
     */

    /*
     * **imgix 経路の srcset の幅を決める。** `getImgProps` は `loader` の種類に関係なく
     * ここから幅を取り、その幅をローダーへ渡す。`sizes` に固定 px を書いても
     * srcset には全候補が並ぶので、**ここへ幅を足すと microCMS の imgix URL の本数が増える。**
     * imgix には変換数の課金が無いので枠は焼かないが、HTML は太る。追加時は用途を PR に書くこと。
     *
     * 512 と 320 は隣接する 640 / 384 との差が小さく、丸め先との差はそれぞれ 25% / 20%
     * にとどまるので落とした。2048 と 3840 は残す。PageHero が `100vw` を使っており、
     * 4K・Retina 環境で目に見えて甘くなるため。
     */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 384, 420],
    /*
     * `getImgProps` は `loader` の種類に関係なく `quality` をこの一覧で検証し、
     * 外れた値を渡すと落ちる。imgix 経路が既定の 75 を使うため残している。
     * （静的画像側では `quality` そのものが無視されるので、値は manifest が持つ。）
     */
    qualities: [40, 60, 75],
    /*
     * `formats` は **意図的に置いていない。** これは Vercel の Image Optimization が
     * Accept を見て出し分けるための設定で、その経路を通る画像がもう1枚も無い。
     * 置いたままにすると「静的画像には WebP のフォールバックがある」と読めてしまうが、
     * **実際には AVIF 単独配信である**（判断の根拠は docs/frontend/image-delivery.md の
     * 「静的画像を AVIF 単独で配る判断」）。
     */
    /*
     * microCMS のホストを許可している。`loader` prop の渡し忘れでここへ回った画像も
     * 表示自体はできてしまうが、その場合は枠を消費する。渡し忘れは
     * `scripts/assert-no-image-optimizer.mjs` がビルド時に落とす。
     */
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
  },
  /**
   * `public/` 配下の画像に明示的なキャッシュ期間を与える。
   *
   * **これは `unoptimized` へ移ったことの必須の後始末である。** Vercel は `/_next/image`
   * の応答には長期 immutable を付けるが、`public/` の静的ファイルには
   * `public, max-age=0, must-revalidate` を返す（2026-09-20 に本番で実測）。
   * このまま静的画像を `public/` から配ると、**402 を「画像ごと・ページ遷移ごとの
   * 再検証往復」と取り替えるだけ**になる。学園祭当日の同時アクセスで効いてくる。
   *
   * ファイル名にハッシュを入れれば `immutable` にできるが、焼き直すたびに `src/` の
   * リテラルが全部変わる。学祭までの運用では日次の鮮度で足り、差し替えたい日は
   * 1日待てばよい（7日間は stale を配りつつ裏で取り直す）。
   */
  async headers() {
    return [
      {
        source: "/:dir(images|materials)/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=86400, stale-while-revalidate=604800",
          },
        ],
      },
    ];
  },
  experimental: {
    optimizePackageImports: [
      "gsap",
      "lucide-react",
      "three",
      "@react-three/fiber",
      "@react-three/drei",
    ],
  },
};

export default withBundleAnalyzer(withNextIntl(nextConfig));
