import { MetadataRoute } from "next";
import { getEventsList, getSpecialEvents } from "@/lib/events";
import { getNewsList } from "@/lib/news";
import { siteConfig, SPECIAL_VISIBLE } from "@/data/site";
import { buildStaticSitemapEntries } from "@/lib/sitemap-entries";

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

/** 一覧の最終更新日時のうち最も新しいもの。空なら undefined */
function latestUpdate(items: readonly { updatedAt?: string; publishedAt?: string }[]) {
  const times = items
    .map((item) => item.updatedAt || item.publishedAt)
    .filter((value): value is string => Boolean(value))
    .map((value) => new Date(value).getTime())
    .filter((time) => Number.isFinite(time));

  return times.length > 0 ? new Date(Math.max(...times)) : undefined;
}

/**
 * サイトマップ自動生成
 *
 * 静的ページの組み立ては `src/lib/sitemap-entries.ts` にある。
 * `src/app/` 配下にはテストを置けない（ルートとして解釈される）ため、
 * ここには microCMS の取得と連結だけを残す。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = siteConfig.metadata.siteUrl;

  // 動的ページ: 企画詳細
  let events: Awaited<ReturnType<typeof getEventsList>> = [];
  try {
    events = await getEventsList(200);
  } catch (error) {
    console.error("Failed to fetch events for sitemap:", error);
  }
  // 著名人企画の /events/[id] は /special/[id] へリダイレクトするため載せない
  const eventPages: MetadataRoute.Sitemap = events
    .filter((event) => event.type !== "special")
    .map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: new Date(event.updatedAt || event.publishedAt || Date.now()),
      changeFrequency: "daily" as const,
      priority: 0.7,
    }));

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
  let newsList: Awaited<ReturnType<typeof getNewsList>> = [];
  try {
    newsList = await getNewsList(100);
  } catch (error) {
    console.error("Failed to fetch news for sitemap:", error);
  }
  const newsPages: MetadataRoute.Sitemap = newsList.map((news) => ({
    url: `${baseUrl}/info/${news.id}`,
    lastModified: new Date(news.updatedAt || news.publishedAt || Date.now()),
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  /*
   * CMS を読む一覧ページの lastmod は、載っている記事の最新更新日時から導く。
   * 取得に失敗して一覧が空のときは undefined になり、lastmod ごと省かれる。
   * 誤った lastmod より、無いほうがよい。
   */
  const newsUpdatedAt = latestUpdate(newsList);
  const eventsUpdatedAt = latestUpdate(events);
  const homeUpdatedAt = latestUpdate([
    ...(newsUpdatedAt ? [{ updatedAt: newsUpdatedAt.toISOString() }] : []),
    ...(eventsUpdatedAt ? [{ updatedAt: eventsUpdatedAt.toISOString() }] : []),
  ]);

  const staticPages = buildStaticSitemapEntries({
    specialVisible: SPECIAL_VISIBLE,
    cmsLastModified: {
      ...(homeUpdatedAt ? { "/": homeUpdatedAt } : {}),
      ...(newsUpdatedAt ? { "/info": newsUpdatedAt } : {}),
      ...(eventsUpdatedAt ? { "/events": eventsUpdatedAt } : {}),
    },
  });

  return [...staticPages, ...eventPages, ...specialPages, ...newsPages];
}
