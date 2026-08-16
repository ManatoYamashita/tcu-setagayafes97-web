import { MetadataRoute } from "next";
import { getEventsList, getSpecialEvents } from "@/lib/events";
import { getNewsList } from "@/lib/news";

/**
 * サイトマップ自動生成
 * Next.js 14+ の sitemap.ts ファイルで動的生成
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://setagayafes97.tcu.ac.jp"; // 本番URLに変更

  // 静的ページ
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
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

  return [...staticPages, ...eventPages, ...specialPages, ...newsPages];
}
