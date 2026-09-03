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
    deviceSizes: [512, 640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [32, 48, 64, 96, 128, 256, 320, 384, 420],
    qualities: [40, 60, 75],
    // AVIF は同じ品質でも WebP より転送量を抑えられる画像を優先する。
    // 未対応ブラウザには既存の WebP をフォールバックとして返す。
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.microcms-assets.io",
      },
    ],
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
