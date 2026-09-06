import { client, isMicrocmsConfigured } from "./microcms";
import { EVENTS_VISIBLE, SPECIAL_VISIBLE } from "@/data/site";
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
    cleanType === "store" ||
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
export function normalizeEvent(rawEvent: RawEvent): Event {
  return {
    ...rawEvent,
    // microCMS側で必須設定にしていても、入力漏れがあれば undefined が返り得る。
    // filterEvents 等の内部コードがこれらを常に string だと信頼できるよう、
    // 外部データの境界であるここで一度だけ空文字へ既定化する。
    title: rawEvent.title ?? "",
    organizer: rawEvent.organizer ?? "",
    description: rawEvent.description ?? "",
    place: rawEvent.place ?? "",
    building: rawEvent.building ?? "",
    // content は実データ18件中16件で欠落している（2026-09-06 実測）。
    // キーワード検索が本文も対象にするため、ここでも既定化しておく
    content: rawEvent.content ?? "",
    date: normalizeEventDate(rawEvent.date),
    type: normalizeEventType(rawEvent.type),
    sns: typeof rawEvent.sns === "string" ? normalizeSNSLinks(rawEvent.sns) : undefined,
  };
}

/** microCMS API の1リクエストあたり取得上限 */
const MICROCMS_MAX_LIMIT = 100;

/**
 * select フィールドは microCMS の filters では絞り込めない
 *
 * `[contains]` は select に対して**配列要素の完全一致**で動く。部分一致ではない。
 * 本プロジェクトの select は `値 : ラベル` 形式（例: `special : スペシャル企画`）で
 * 登録されているため、値だけを渡すと常に 0 件になる。
 *
 * 実測（2026-08-16）:
 *
 * | filters                                  | 件数 |
 * | ---------------------------------------- | ---- |
 * | `type[contains]special`                  | 0    |
 * | `type[contains]スペシャル`               | 0    |
 * | `type[contains]special : スペシャル企画` | 2    |
 * | `type[equals]special : スペシャル企画`   | 0    |
 *
 * ラベルまで含めれば一致するが、**入稿側でラベルを直した瞬間に壊れる**。
 * したがって select の絞り込みは API に任せず、正規化後の値で filter する。
 * text フィールド（`building` など）は `[equals]` が正しく動くため API 側で絞ってよい。
 */

/**
 * 未解禁の著名人企画を一覧から除外する
 *
 * SPECIAL_VISIBLE が false の間、type = special の企画は
 * 企画一覧・タイムテーブル・おすすめ企画のどこにも出してはいけない。
 * 解禁前の出演者名が露出すると契約上の事故になる。
 * @param events 正規化済みの企画配列
 * @returns SPECIAL_VISIBLE が false の場合、type = special を除いた配列
 */
function excludeUnreleasedSpecial(events: Event[]): Event[] {
  if (SPECIAL_VISIBLE) return events;
  return events.filter((event) => event.type !== "special");
}

/**
 * 企画一覧を取得
 * limit が microCMS 上限(100)を超える場合は自動的にページネーションで全件取得
 * EVENTS_VISIBLE が false の間は常に空配列を返す（microCMSへは問い合わせない）
 * @param limit 取得件数（デフォルト: 50）
 * @param filters フィルタオプション
 * @returns 企画の配列
 */
export async function getEventsList(
  limit: number = 50,
  filters?: EventsFilterOptions
): Promise<Event[]> {
  if (!EVENTS_VISIBLE) return [];
  if (!isMicrocmsConfigured) return [];
  try {
    // microCMS filters パラメータの構築
    // select（date / type）は API では絞れないため、取得後に applyFilters() で適用する
    const filterQueries: string[] = [];
    if (filters?.building) {
      filterQueries.push(`building[equals]${filters.building}`);
    }

    const filterParam = filterQueries.length > 0 ? { filters: filterQueries.join("[and]") } : {};

    /** select の絞り込みを正規化後の値で適用する */
    const applyFilters = (events: Event[]): Event[] =>
      events.filter(
        (event) =>
          (!filters?.date || event.date === filters.date) &&
          (!filters?.type || event.type === filters.type)
      );

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
      return excludeUnreleasedSpecial(applyFilters(response.contents.map(normalizeEvent)));
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

    return excludeUnreleasedSpecial(applyFilters(allContents.map(normalizeEvent)));
  } catch (error) {
    console.error("[getEventsList] Error:", error);
    return [];
  }
}

/**
 * 著名人企画（type = special）の一覧を取得
 *
 * IMPORTANT: 判定に使うのは SPECIAL_VISIBLE のみで、EVENTS_VISIBLE には依存しない。
 * 著名人ページは一般企画一覧より先に公開されることがあり、`getEventsList()` を
 * 流用すると EVENTS_VISIBLE が false の間は常に空になって先行公開が成立しない。
 * @returns 著名人企画の配列（公開日の新しい順）
 */
export async function getSpecialEvents(): Promise<Event[]> {
  if (!SPECIAL_VISIBLE) return [];
  if (!isMicrocmsConfigured) return [];
  try {
    const response: RawEventListResponse = await client.get({
      endpoint: "events",
      queries: {
        limit: MICROCMS_MAX_LIMIT,
        orders: "-publishedAt",
      },
    });
    // select は API の filters で絞れない（上記コメント参照）。正規化後の値で絞る
    return response.contents.map(normalizeEvent).filter((event) => event.type === "special");
  } catch (error) {
    console.error("[getSpecialEvents] Error:", error);
    return [];
  }
}

/**
 * 著名人企画を1件取得
 *
 * `getEventById()` と違い EVENTS_VISIBLE には依存しない（`getSpecialEvents()` と同じ理由）。
 * type が special でないコンテンツを指定した場合は null を返す。
 * @param id 企画ID
 * @returns 著名人企画、該当しない場合は null
 */
export async function getSpecialEventById(id: string): Promise<Event | null> {
  if (!SPECIAL_VISIBLE) return null;
  if (!isMicrocmsConfigured) return null;
  try {
    const response: RawEvent = await client.get({
      endpoint: "events",
      contentId: id,
    });
    const event = normalizeEvent(response);
    return event.type === "special" ? event : null;
  } catch (error) {
    console.error("[getSpecialEventById] Error:", error);
    return null;
  }
}

/**
 * おすすめ企画を取得（全企画からランダムに最大6件）
 * ISR再検証のたびにランダムが更新される
 * EVENTS_VISIBLE が false の間は常に空配列を返す（microCMSへは問い合わせない）
 * @returns おすすめ企画の配列
 */
export async function getFeaturedEvents(): Promise<Event[]> {
  if (!EVENTS_VISIBLE) return [];
  if (!isMicrocmsConfigured) return [];
  try {
    const allEvents = await getEventsList(100);
    if (allEvents.length === 0) return [];

    // Fisher-Yatesシャッフルで均一ランダム選択
    const shuffled = [...allEvents];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled.slice(0, 6);
  } catch (error) {
    console.error("[getFeaturedEvents] Error:", error);
    return [];
  }
}

/**
 * 特定の企画を取得
 * EVENTS_VISIBLE が false の間は常に null を返す（microCMSへは問い合わせない）
 * @param id 企画ID
 * @returns 企画情報、見つからない場合はnull
 */
export async function getEventById(id: string): Promise<Event | null> {
  if (!EVENTS_VISIBLE) return null;
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
