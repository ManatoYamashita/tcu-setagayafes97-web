import { client } from "./microcms";
import type { News, NewsListResponse } from "@/types/news";

/**
 * お知らせ一覧を取得
 * @param limit 取得件数（デフォルト: 10）
 * @returns お知らせの配列
 */
export async function getNewsList(limit: number = 10): Promise<News[]> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockNews } = await import("@/data/mock-news");
    return mockNews.slice(0, limit);
  }

  try {
    const response: NewsListResponse = await client.get({
      endpoint: "news",
      queries: {
        limit,
        orders: "-publishedAt",
      },
    });
    return response.contents;
  } catch (error) {
    console.error("[getNewsList] Error:", error);
    return [];
  }
}

/**
 * 特定のお知らせを取得
 * @param id お知らせID
 * @returns お知らせ情報、見つからない場合はnull
 */
export async function getNewsById(id: string): Promise<News | null> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockNews } = await import("@/data/mock-news");
    return mockNews.find((n) => n.id === id) || null;
  }

  try {
    const response = await client.get({
      endpoint: "news",
      contentId: id,
    });
    return response;
  } catch (error) {
    console.error("[getNewsById] Error:", error);
    return null;
  }
}
