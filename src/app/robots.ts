import { MetadataRoute } from "next";
import { siteConfig } from "@/data/site";

/**
 * robots.txt自動生成
 * Next.js 14+ の robots.ts ファイルで動的生成
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = siteConfig.metadata.siteUrl;

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
