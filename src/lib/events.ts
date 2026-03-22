import { client, isMicrocmsConfigured } from "./microcms";
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

/** microCMS API の1リクエストあたり取得上限 */
const MICROCMS_MAX_LIMIT = 100;

/**
 * 企画一覧を取得
 * limit が microCMS 上限(100)を超える場合は自動的にページネーションで全件取得
 * @param limit 取得件数（デフォルト: 50）
 * @param filters フィルタオプション
 * @returns 企画の配列
 */
export async function getEventsList(
  limit: number = 50,
  filters?: EventsFilterOptions
): Promise<Event[]> {
  if (!isMicrocmsConfigured) return [];
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

    const filterParam = filterQueries.length > 0 ? { filters: filterQueries.join("[and]") } : {};

    // 100件以下なら1回で取得
    if (limit <= MICROCMS_MAX_LIMIT) {
      const response: RawEventListResponse = await client.get({
        endpoint: "events",
        queries: {
          limit,
          orders: "-publishedAt",
          ...filterParam,
        },
      });
      return response.contents.map(normalizeEvent);
    }

    // 100件超: ページネーションで全件取得
    const allContents: RawEvent[] = [];
    let offset = 0;

    while (allContents.length < limit) {
      const perPage = Math.min(MICROCMS_MAX_LIMIT, limit - allContents.length);
      const response: RawEventListResponse = await client.get({
        endpoint: "events",
        queries: {
          limit: perPage,
          offset,
          orders: "-publishedAt",
          ...filterParam,
        },
      });

      allContents.push(...response.contents);

      // 取得件数が要求数未満 = これ以上データがない
      if (response.contents.length < perPage) break;
      offset += perPage;
    }

    return allContents.map(normalizeEvent);
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
  if (!isMicrocmsConfigured) return [];
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
  if (!isMicrocmsConfigured) return null;
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
