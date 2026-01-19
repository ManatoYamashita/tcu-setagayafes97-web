import { client } from "./microcms";
import type { Event, EventListResponse, EventDate, EventType } from "@/types/events";

/**
 * 企画一覧取得のフィルタオプション
 */
export interface EventsFilterOptions {
  date?: EventDate;
  type?: EventType;
  building?: string;
}

/**
 * 企画一覧を取得
 * @param limit 取得件数（デフォルト: 50）
 * @param filters フィルタオプション
 * @returns 企画の配列
 */
export async function getEventsList(
  limit: number = 50,
  filters?: EventsFilterOptions
): Promise<Event[]> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockEvents } = await import("@/data/mock-events");
    let filtered = mockEvents;

    // フィルタリング処理
    if (filters?.date) {
      filtered = filtered.filter((event) => event.date === filters.date);
    }
    if (filters?.type) {
      filtered = filtered.filter((event) => event.type === filters.type);
    }
    if (filters?.building) {
      filtered = filtered.filter((event) => event.building === filters.building);
    }

    return filtered.slice(0, limit);
  }

  try {
    // microCMS filters パラメータの構築
    const filterQueries: string[] = [];
    if (filters?.date) {
      filterQueries.push(`date[equals]${filters.date}`);
    }
    if (filters?.type) {
      filterQueries.push(`type[equals]${filters.type}`);
    }
    if (filters?.building) {
      filterQueries.push(`building[equals]${filters.building}`);
    }

    const response: EventListResponse = await client.get({
      endpoint: "events",
      queries: {
        limit,
        orders: "-publishedAt",
        ...(filterQueries.length > 0 && {
          filters: filterQueries.join("[and]"),
        }),
      },
    });
    return response.contents;
  } catch (error) {
    console.error("[getEventsList] Error:", error);
    return [];
  }
}

/**
 * おすすめ企画（featured）を取得
 * @returns おすすめ企画の配列
 */
export async function getFeaturedEvents(): Promise<Event[]> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockEvents } = await import("@/data/mock-events");
    // モックデータは全てfeatured扱い（最大6件）
    return mockEvents.slice(0, 6);
  }

  try {
    // microCMSにfeaturedフラグがある場合の実装例
    // 実際のフィールド名に合わせて調整してください
    const response: EventListResponse = await client.get({
      endpoint: "events",
      queries: {
        limit: 6,
        filters: "featured[equals]true",
        orders: "-publishedAt",
      },
    });
    return response.contents;
  } catch (error) {
    console.error("[getFeaturedEvents] Error:", error);
    // featuredフラグがない場合は、最新6件を返す
    return getEventsList(6);
  }
}

/**
 * 特定の企画を取得
 * @param id 企画ID
 * @returns 企画情報、見つからない場合はnull
 */
export async function getEventById(id: string): Promise<Event | null> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockEvents } = await import("@/data/mock-events");
    return mockEvents.find((e) => e.id === id) || null;
  }

  try {
    const response = await client.get({
      endpoint: "events",
      contentId: id,
    });
    return response;
  } catch (error) {
    console.error("[getEventById] Error:", error);
    return null;
  }
}
