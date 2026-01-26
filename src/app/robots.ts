import { MetadataRoute } from "next";

/**
 * robots.txt自動生成
 * Next.js 14+ の robots.ts ファイルで動的生成
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://setagayafes97.tcu.ac.jp"; // 本番URLに変更

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/api-test/", "/test-ui/"], // APIエンドポイントとテストページをクロール禁止
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
