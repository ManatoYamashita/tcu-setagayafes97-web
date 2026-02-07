import { client } from "./microcms";
import type { News, NewsListResponse, NewsType, RawNews, RawNewsListResponse } from "@/types/news";

// 型を再エクスポート
export type { News, NewsType } from "@/types/news";

/**
 * microCMSから返されるtypeフィールドを正規化
 * 配列形式 ["news : お知らせ"] や文字列形式 "news" に対応
 * @param type microCMSのtypeフィールド
 * @returns 正規化されたNewsType
 */
function normalizeNewsType(type: string[] | string | undefined): NewsType {
  // undefinedの場合はデフォルト値
  if (!type) {
    return "other";
  }

  // 配列の場合は最初の要素を取得
  const rawType = Array.isArray(type) ? type[0] : type;

  // 文字列でない場合はデフォルト値
  if (typeof rawType !== "string") {
    return "other";
  }

  // "news : お知らせ" のような形式から "news" 部分を抽出
  const cleanType = rawType.split(":")[0].trim().toLowerCase();

  // 有効な値かチェック
  if (cleanType === "urgent" || cleanType === "news" || cleanType === "other") {
    return cleanType;
  }

  return "other";
}

/**
 * RawNewsをNewsに正規化
 * @param rawNews microCMSから取得した生データ
 * @returns 正規化されたNews
 */
function normalizeNews(rawNews: RawNews): News {
  return {
    ...rawNews,
    type: normalizeNewsType(rawNews.type),
  };
}

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
    const response: RawNewsListResponse = await client.get({
      endpoint: "news",
      queries: {
        limit,
        orders: "-publishedAt",
      },
    });
    // データを正規化して返す
    return response.contents.map(normalizeNews);
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
    const response: RawNews = await client.get({
      endpoint: "news",
      contentId: id,
    });
    // データを正規化して返す
    return normalizeNews(response);
  } catch (error) {
    console.error("[getNewsById] Error:", error);
    return null;
  }
}
