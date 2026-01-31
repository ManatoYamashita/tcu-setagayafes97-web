import { client } from "./microcms";
import type {
  Event,
  EventListResponse,
  EventDate,
  EventType,
  RawEvent,
  RawEventListResponse,
  SNSLinks,
} from "@/types/events";

/**
 * 企画一覧取得のフィルタオプション
 */
export interface EventsFilterOptions {
  date?: EventDate;
  type?: EventType;
  building?: string;
}

/**
 * microCMSから返されるdateフィールドを正規化
 * 配列形式 ["day1 : 10月31日（土）"] や文字列形式 "day1" に対応
 * @param date microCMSのdateフィールド
 * @returns 正規化されたEventDate
 */
function normalizeEventDate(date: string[] | string | undefined): EventDate {
  if (!date) {
    return "other";
  }

  const rawDate = Array.isArray(date) ? date[0] : date;

  if (typeof rawDate !== "string") {
    return "other";
  }

  const cleanDate = rawDate.split(":")[0].trim().toLowerCase();

  if (
    cleanDate === "day1" ||
    cleanDate === "day2" ||
    cleanDate === "both" ||
    cleanDate === "other"
  ) {
    return cleanDate;
  }

  return "other";
}

/**
 * microCMSから返されるtypeフィールドを正規化
 * 配列形式 ["room : 教室企画"] や文字列形式 "room" に対応
 * @param type microCMSのtypeフィールド
 * @returns 正規化されたEventType
 */
function normalizeEventType(type: string[] | string | undefined): EventType {
  if (!type) {
    return "other";
  }

  const rawType = Array.isArray(type) ? type[0] : type;

  if (typeof rawType !== "string") {
    return "other";
  }

  const cleanType = rawType.split(":")[0].trim().toLowerCase();

  if (
    cleanType === "room" ||
    cleanType === "stage" ||
    cleanType === "special" ||
    cleanType === "other"
  ) {
    return cleanType;
  }

  return "other";
}

/**
 * SNS情報を正規化
 * @param sns microCMSのsnsフィールド
 * @returns 正規化されたSNSLinks
 */
function normalizeSNSLinks(sns: string | undefined): SNSLinks | undefined {
  if (!sns) {
    return undefined;
  }

  // SNSが単一のURLの場合は、URLの形式から判定
  const links: SNSLinks = {};

  if (sns.includes("twitter.com") || sns.includes("x.com")) {
    links.twitter = sns;
  } else if (sns.includes("instagram.com")) {
    links.instagram = sns;
  } else {
    links.website = sns;
  }

  return links;
}

/**
 * RawEventをEventに正規化
 * @param rawEvent microCMSから取得した生データ
 * @returns 正規化されたEvent
 */
function normalizeEvent(rawEvent: RawEvent): Event {
  return {
    ...rawEvent,
    date: normalizeEventDate(rawEvent.date),
    type: normalizeEventType(rawEvent.type),
    sns: typeof rawEvent.sns === "string" ? normalizeSNSLinks(rawEvent.sns) : undefined,
  };
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

    const response: RawEventListResponse = await client.get({
      endpoint: "events",
      queries: {
        limit,
        orders: "-publishedAt",
        ...(filterQueries.length > 0 && {
          filters: filterQueries.join("[and]"),
        }),
      },
    });
    // データを正規化して返す
    return response.contents.map(normalizeEvent);
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
    const response: RawEventListResponse = await client.get({
      endpoint: "events",
      queries: {
        limit: 6,
        filters: "featured[equals]true",
        orders: "-publishedAt",
      },
    });
    // データを正規化して返す
    return response.contents.map(normalizeEvent);
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
    const response: RawEvent = await client.get({
      endpoint: "events",
      contentId: id,
    });
    // データを正規化して返す
    return normalizeEvent(response);
  } catch (error) {
    console.error("[getEventById] Error:", error);
    return null;
  }
}
