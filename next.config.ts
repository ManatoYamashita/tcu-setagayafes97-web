import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import bundleAnalyzer from "@next/bundle-analyzer";

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
const ARCHIVE_96TH_ORIGIN = "https://96th.setagayafes.org";

const nextConfig: NextConfig = {
  async redirects() {
    return [
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
    ];
  },
  images: {
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
