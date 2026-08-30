import { MetadataRoute } from "next";
import { getEventsList, getSpecialEvents } from "@/lib/events";
import { getNewsList } from "@/lib/news";
import { siteConfig, SPECIAL_VISIBLE } from "@/data/site";

/**
 * 再検証間隔（Webhook 障害時のフォールバック）
 *
 * 主系は microCMS Webhook によるオンデマンド再検証（`src/app/api/revalidate/route.ts`）で、
 * こちらは通知を取りこぼしたときの保険である。microCMS の Webhook は失敗しても再送されない。
 *
 * **この宣言を外すと新規コンテンツが永久に sitemap へ出なくなる。**
 * 宣言が無い間、`.next/prerender-manifest.json` の `/sitemap.xml` は
 * `initialRevalidateSeconds: false`（＝時間経過では再生成されない）だった。
 * このファイルは events / news の両方を読むため、再デプロイするまで新規企画も
 * 新規お知らせも sitemap に載らない状態になる。
 */
export const revalidate = 3600;

/**
 * サイトマップ自動生成
 * Next.js 14+ の sitemap.ts ファイルで動的生成
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.metadata.siteUrl;

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
      images: [`${baseUrl}/ogp.webp`],
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/special`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/timetable`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/access`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/info`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/info/guide`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/info/faq`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/info/pamphlet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
      images: [`${baseUrl}/images/photos/setagayafe97-image.webp`],
    },
    {
      url: `${baseUrl}/about/sponsors`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/info/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // 動的ページ: 企画詳細
  let eventPages: MetadataRoute.Sitemap = [];
  try {
    const events = await getEventsList(200);
    // 著名人企画の /events/[id] は /special/[id] へリダイレクトするため載せない
    eventPages = events
      .filter((event) => event.type !== "special")
      .map((event) => ({
        url: `${baseUrl}/events/${event.id}`,
        lastModified: new Date(event.updatedAt || event.publishedAt || Date.now()),
        changeFrequency: "daily" as const,
        priority: 0.7,
      }));
  } catch (error) {
    console.error("Failed to fetch events for sitemap:", error);
  }

  // 動的ページ: 著名人企画LP
  // SPECIAL_VISIBLE が false の間は getSpecialEvents() が空を返すため、URLは出力されない
  let specialPages: MetadataRoute.Sitemap = [];
  try {
    const specials = await getSpecialEvents();
    specialPages = specials.map((event) => ({
      url: `${baseUrl}/special/${event.id}`,
      lastModified: new Date(event.updatedAt || event.publishedAt || Date.now()),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Failed to fetch special events for sitemap:", error);
  }

  // 動的ページ: お知らせ詳細
  let newsPages: MetadataRoute.Sitemap = [];
  try {
    const newsList = await getNewsList(100);
    newsPages = newsList.map((news) => ({
      url: `${baseUrl}/info/${news.id}`,
      lastModified: new Date(news.updatedAt || news.publishedAt || Date.now()),
      changeFrequency: "weekly" as const,
      priority: 0.6,
    }));
  } catch (error) {
    console.error("Failed to fetch news for sitemap:", error);
  }

  // SPECIAL_VISIBLE が true の間、/special は LP へ302転送される
  // （next.config.ts の redirects()）。転送元をサイトマップに載せると
  // Search Console が「リダイレクトあり」として除外するため、その間は落とす。
  // 転送エントリを外して一覧へ戻したときは、この判定も併せて見直すこと。
  const canonicalStaticPages = SPECIAL_VISIBLE
    ? staticPages.filter((page) => page.url !== `${baseUrl}/special`)
    : staticPages;

  return [...canonicalStaticPages, ...eventPages, ...specialPages, ...newsPages];
}
