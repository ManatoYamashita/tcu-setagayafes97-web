import { client } from "./microcms";
import type { Information, InformationListResponse } from "@/types/informations";

/**
 * 協賛企業一覧を取得
 * @returns 協賛企業の配列（優先度順）
 */
export async function getSponsorsList(): Promise<Information[]> {
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockSponsors } = await import("@/data/mock-sponsors");
    // priority 降順でソート
    return [...mockSponsors].sort((a, b) => (b.priority || 0) - (a.priority || 0));
  }

  try {
    const response: InformationListResponse = await client.get({
      endpoint: "informations",
      queries: {
        limit: 100,
        filters: "category[equals]sponsor",
        orders: "-priority",
      },
    });
    return response.contents;
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
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    // モックデータにFAQがない場合は空配列を返す
    return [];
  }

  try {
    const response: InformationListResponse = await client.get({
      endpoint: "informations",
      queries: {
        limit: 50,
        filters: "category[equals]faq",
        orders: "-publishedAt",
      },
    });
    return response.contents;
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
  const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";

  if (USE_MOCK) {
    const { mockSponsors } = await import("@/data/mock-sponsors");
    return mockSponsors.find((s) => s.id === id) || null;
  }

  try {
    const response = await client.get({
      endpoint: "informations",
      contentId: id,
    });
    return response;
  } catch (error) {
    console.error("[getInformationById] Error:", error);
    return null;
  }
}
