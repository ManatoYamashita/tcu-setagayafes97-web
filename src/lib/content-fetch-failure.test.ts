import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * microCMS の取得関数が「存在しない」と「一時的に取れなかった」を区別すること（#287）
 *
 * 以前はどの例外も `null` / `[]` に潰していたため、ビルド中に 429 を受けると
 * 実在する企画が 404 として静的生成され、それでもビルドは成功した。
 * ここでは `microcmsGet`（再試行込みの取得）だけを差し替え、判定そのもの（isMicrocmsNotFound）は
 * 本物を使う。再試行の挙動は `src/lib/microcms.test.ts` で見る。
 */
const get = vi.hoisted(() => vi.fn());

vi.mock("@/lib/microcms", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/microcms")>()),
  microcmsGet: get,
  isMicrocmsConfigured: true,
}));

// 公開フラグが false だと問い合わせ自体をしないため、全て true に固定する
vi.mock("@/data/site", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/data/site")>()),
  EVENTS_VISIBLE: true,
  NEWS_VISIBLE: true,
  SPECIAL_VISIBLE: true,
}));

const { getEventById, getEventsList, getSpecialEventById, getSpecialEvents, getFeaturedEvents } =
  await import("@/lib/events");
const { getNewsById, getNewsList } = await import("@/lib/news");
const { getInformationById, getSponsorsList, getFAQList } = await import("@/lib/informations");

const notFound = new Error("fetch API response status: 404\n  message is `Content is not found.`");
const tooMany = new Error(
  "fetch API response status: 429\n  message is `Too many requests, please try again later.`"
);
const serverError = new Error("fetch API response status: 500");

beforeEach(() => {
  get.mockReset();
  // 失敗経路のテストなので、実装側の console.error は黙らせる
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("詳細の取得", () => {
  const cases = [
    ["getEventById", getEventById],
    ["getSpecialEventById", getSpecialEventById],
    ["getNewsById", getNewsById],
    ["getInformationById", getInformationById],
  ] as const;

  it.each(cases)("%s: microCMS が 404 を返したときだけ null にする", async (_, fn) => {
    get.mockRejectedValue(notFound);
    await expect(fn("no-such-id")).resolves.toBeNull();
  });

  it.each(cases)("%s: 429 は null にせず投げる", async (_, fn) => {
    get.mockRejectedValue(tooMany);
    await expect(fn("real-id")).rejects.toBe(tooMany);
  });

  it.each(cases)("%s: 5xx は null にせず投げる", async (_, fn) => {
    get.mockRejectedValue(serverError);
    await expect(fn("real-id")).rejects.toBe(serverError);
  });
});

describe("一覧の取得", () => {
  const cases = [
    ["getEventsList", () => getEventsList()],
    ["getSpecialEvents", () => getSpecialEvents()],
    ["getFeaturedEvents", () => getFeaturedEvents()],
    ["getNewsList", () => getNewsList()],
    ["getSponsorsList", () => getSponsorsList()],
    ["getFAQList", () => getFAQList()],
  ] as const;

  it.each(cases)("%s: 失敗を空配列にせず投げる（0件と区別する）", async (_, fn) => {
    get.mockRejectedValue(tooMany);
    await expect(fn()).rejects.toBe(tooMany);
  });

  it.each(cases)("%s: 本当に0件なら空配列を返す", async (_, fn) => {
    get.mockResolvedValue({ contents: [], totalCount: 0, offset: 0, limit: 10 });
    await expect(fn()).resolves.toEqual([]);
  });
});
