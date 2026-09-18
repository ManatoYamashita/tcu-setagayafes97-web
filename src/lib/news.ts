import { client, isMicrocmsConfigured } from "./microcms";
import { NEWS_VISIBLE } from "@/data/site";
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
    // microCMS側で必須設定にしていても、入力漏れがあれば undefined が返り得る
    // （`normalizeEvent()` と同じ理由・同じ扱い）。
    // 下書きのプレビューでは未入力が常態であり、既定化しないと createPageMetadata() に
    // undefined が渡って "undefined | 東京都市大学 世田谷祭" というタイトルが出る
    title: rawNews.title ?? "",
    description: rawNews.description ?? "",
    content: rawNews.content ?? "",
    type: normalizeNewsType(rawNews.type),
  };
}

/**
 * お知らせ一覧を取得
 * NEWS_VISIBLE が false の間は常に空配列を返す（microCMSへは問い合わせない）
 * @param limit 取得件数（デフォルト: 10）
 * @returns お知らせの配列
 */
export async function getNewsList(limit: number = 10): Promise<News[]> {
  if (!NEWS_VISIBLE) return [];
  if (!isMicrocmsConfigured) return [];
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
 * ヒーローセクション用の最新ニュースを1件取得
 * urgentタイプが存在する場合はそれを優先表示
 * @returns 最新ニュース1件、なければnull
 */
export async function getLatestHeroNews(): Promise<News | null> {
  const newsList = await getNewsList(10);
  if (newsList.length === 0) return null;
  return newsList.find((news) => news.type === "urgent") || newsList[0];
}

/**
 * 特定のお知らせを取得
 *
 * NEWS_VISIBLE が false の間は常に null を返す（microCMSへは問い合わせない）。
 * ただし draftKey が渡された場合はフラグを跨ぐ（`getEventById()` と同じ判断。
 * 理由は docs/dev/draft-preview.md）。
 *
 * @param id お知らせID
 * @param draftKey microCMS の画面プレビューから渡された下書きキー。省略時は公開コンテンツのみ
 * @returns お知らせ情報、見つからない場合はnull
 */
export async function getNewsById(id: string, draftKey?: string): Promise<News | null> {
  if (!NEWS_VISIBLE && !draftKey) return null;
  if (!isMicrocmsConfigured) return null;
  try {
    const response: RawNews = await client.get({
      endpoint: "news",
      contentId: id,
      ...(draftKey ? { queries: { draftKey } } : {}),
    });
    // データを正規化して返す
    return normalizeNews(response);
  } catch (error) {
    console.error("[getNewsById] Error:", error);
    return null;
  }
}
