import { client, isMicrocmsConfigured } from "./microcms";
import type {
  Information,
  InformationListResponse,
  InformationCategory,
  RawInformation,
  RawInformationListResponse,
} from "@/types/informations";

/**
 * microCMSから返されるcategoryフィールドを正規化
 * 配列形式 ["sponsor : 協賛企業"] や文字列形式 "sponsor" に対応
 * @param category microCMSのcategoryフィールド
 * @returns 正規化されたInformationCategory
 */
function normalizeInformationCategory(
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

  if (cleanCategory === "sponsor" || cleanCategory === "faq" || cleanCategory === "other") {
    return cleanCategory;
  }

  return "other";
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
 * 協賛企業一覧を取得
 * @returns 協賛企業の配列（優先度順）
 */
export async function getSponsorsList(): Promise<Information[]> {
  if (!isMicrocmsConfigured) return [];
  try {
    const response: RawInformationListResponse = await client.get({
      endpoint: "informations",
      queries: {
        limit: 100,
        orders: "-priority",
      },
    });
    // select は API の filters で絞れない（上記コメント参照）。正規化後の値で絞る
    return response.contents
      .map(normalizeInformation)
      .filter((info) => info.category === "sponsor");
  } catch (error) {
    console.error("[getSponsorsList] Error:", error);
    return [];
  }
}

/**
 * よくある質問（FAQ）一覧を取得
 * @returns FAQの配列
 */
export async function getFAQList(): Promise<Information[]> {
  if (!isMicrocmsConfigured) return [];
  try {
    const response: RawInformationListResponse = await client.get({
      endpoint: "informations",
      queries: {
        limit: 100,
        orders: "-publishedAt",
      },
    });
    // select は API の filters で絞れない（上記コメント参照）。正規化後の値で絞る
    return response.contents.map(normalizeInformation).filter((info) => info.category === "faq");
  } catch (error) {
    console.error("[getFAQList] Error:", error);
    return [];
  }
}

/**
 * 特定の情報を取得
 * @param id 情報ID
 * @returns 情報、見つからない場合はnull
 */
export async function getInformationById(id: string): Promise<Information | null> {
  if (!isMicrocmsConfigured) return null;
  try {
    const response: RawInformation = await client.get({
      endpoint: "informations",
      contentId: id,
    });
    // データを正規化して返す
    return normalizeInformation(response);
  } catch (error) {
    console.error("[getInformationById] Error:", error);
    return null;
  }
}
