import { isMicrocmsConfigured, isMicrocmsNotFound, microcmsGet } from "./microcms";
import { SPONSORS_CACHE_TAG } from "./revalidate-targets";
import {
  informationCategories,
  type Information,
  type InformationListResponse,
  type InformationCategory,
  type RawInformation,
  type RawInformationListResponse,
} from "@/types/informations";

/**
 * microCMSから返されるcategoryフィールドを正規化
 * 配列形式 ["sponsor : 協賛企業"] や文字列形式 "sponsor" に対応
 * @param category microCMSのcategoryフィールド
 * @returns 正規化されたInformationCategory。未知の値は "other"
 */
export function normalizeInformationCategory(
  category: string[] | string | undefined
): InformationCategory {
  if (!category) {
    return "other";
  }

  const rawCategory = Array.isArray(category) ? category[0] : category;

  if (typeof rawCategory !== "string") {
    return "other";
  }

  const cleanCategory = rawCategory.split(":")[0].trim().toLowerCase();

  return isInformationCategory(cleanCategory) ? cleanCategory : "other";
}

function isInformationCategory(value: string): value is InformationCategory {
  return (informationCategories as readonly string[]).includes(value);
}

/**
 * RawInformationをInformationに正規化
 * @param rawInfo microCMSから取得した生データ
 * @returns 正規化されたInformation
 */
function normalizeInformation(rawInfo: RawInformation): Information {
  return {
    ...rawInfo,
    category: normalizeInformationCategory(rawInfo.category),
  };
}

/**
 * select フィールドは microCMS の filters では絞り込めない
 *
 * `[contains]` は select に対して**配列要素の完全一致**で動く。部分一致ではない。
 * `category` は `sponsor : 協賛企業` のように `値 : ラベル` 形式で登録されているため、
 * `category[contains]sponsor` は常に 0 件を返す（2026-08-16 に実測。協賛企業一覧が
 * 空になっていた）。
 *
 * ラベルまで含めれば一致するが、入稿側でラベルを直した瞬間に壊れる。
 * したがって絞り込みは API に任せず、正規化後の値で filter する。
 * 詳細は `src/lib/events.ts` の同名コメントを参照。
 */

/**
 * 協賛・広告掲載・Special Thanks を表示順（`priority` の降順）で取得し、カテゴリで絞る
 *
 * 3つとも同じリクエストを使う。協賛・協力ページで3つを並べて呼んでも Next.js の fetch 重複排除で
 * HTTP 要求は1本にまとまり、`SPONSORS_CACHE_TAG` の失効も3つに同時に効く。
 * `limit: 100` は全カテゴリの合計にかかる（2026-10-23 時点で協賛 58 件）。超えるならページングが要る。
 * @throws microCMS から取得できなかった場合（空配列にはしない。#287）
 */
async function getPriorityOrderedList(
  category: Extract<InformationCategory, "sponsor" | "ad" | "thanks">,
  caller: string
): Promise<Information[]> {
  if (!isMicrocmsConfigured) return [];
  try {
    const response = await microcmsGet<RawInformationListResponse>({
      endpoint: "informations",
      queries: {
        limit: 100,
        orders: "-priority",
      },
      customRequestInit: {
        next: {
          revalidate: 600,
          tags: [SPONSORS_CACHE_TAG],
        },
      },
    });
    // select は API の filters で絞れない（上記コメント参照）。正規化後の値で絞る
    return response.contents.map(normalizeInformation).filter((info) => info.category === category);
  } catch (error) {
    // 「0件」と「取れなかった」を区別するため、空配列にせず投げる（#287）
    console.error(`[${caller}] Error:`, error);
    throw error;
  }
}

/**
 * 協賛企業一覧を取得
 * @returns 協賛企業の配列（優先度順）
 * @throws microCMS から取得できなかった場合（空配列にはしない。#287）
 */
export async function getSponsorsList(): Promise<Information[]> {
  return getPriorityOrderedList("sponsor", "getSponsorsList");
}

/**
 * 広告掲載一覧を取得（#476）
 * @returns 広告掲載の配列（優先度順）
 * @throws microCMS から取得できなかった場合
 */
export async function getAdsList(): Promise<Information[]> {
  return getPriorityOrderedList("ad", "getAdsList");
}

/**
 * Special Thanks 一覧を取得（#476）
 * @returns Special Thanks の配列（優先度順）
 * @throws microCMS から取得できなかった場合
 */
export async function getSpecialThanksList(): Promise<Information[]> {
  return getPriorityOrderedList("thanks", "getSpecialThanksList");
}

/**
 * フッター上の協賛バーに流す一覧を取得（#478）
 *
 * 協賛企業 → 広告掲載 → Special Thanks の順につなぐ。各カテゴリの中は優先度順で、
 * 協賛・協力ページの節の並びと同じになる。取得は上の3つと同じリクエストを共有する。
 * @throws microCMS から取得できなかった場合
 */
export async function getSponsorBannerList(): Promise<Information[]> {
  const lists = await Promise.all([getSponsorsList(), getAdsList(), getSpecialThanksList()]);
  return lists.flat();
}

/**
 * よくある質問（FAQ）一覧を取得
 * @returns FAQの配列
 * @throws microCMS から取得できなかった場合
 */
export async function getFAQList(): Promise<Information[]> {
  if (!isMicrocmsConfigured) return [];
  try {
    const response = await microcmsGet<RawInformationListResponse>({
      endpoint: "informations",
      queries: {
        limit: 100,
        orders: "-publishedAt",
      },
    });
    // select は API の filters で絞れない（上記コメント参照）。正規化後の値で絞る
    return response.contents.map(normalizeInformation).filter((info) => info.category === "faq");
  } catch (error) {
    // 「0件」と「取れなかった」を区別するため、空配列にせず投げる（#287）
    console.error("[getFAQList] Error:", error);
    throw error;
  }
}

/**
 * 特定の情報を取得
 * @param id 情報ID
 * @returns 情報、見つからない場合はnull
 * @throws microCMS が「存在しない」以外の理由で失敗した場合
 */
export async function getInformationById(id: string): Promise<Information | null> {
  if (!isMicrocmsConfigured) return null;
  try {
    const response = await microcmsGet<RawInformation>({
      endpoint: "informations",
      contentId: id,
    });
    // データを正規化して返す
    return normalizeInformation(response);
  } catch (error) {
    // null（→ 404）にするのは microCMS が「存在しない」と答えたときだけ。
    // 429 / 5xx などを null にすると、実在するページが 404 で生成される（#287）
    if (isMicrocmsNotFound(error)) return null;
    console.error("[getInformationById] Error:", error);
    throw error;
  }
}
