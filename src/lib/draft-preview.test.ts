import { describe, expect, it } from "vitest";
import {
  isValidContentId,
  isValidDraftKey,
  parseDraftPreviewContext,
  resolveDraftPreviewPath,
  serializeDraftPreviewContext,
} from "@/lib/draft-preview";

/**
 * 遷移先の決定
 *
 * ここで固定するのは「どの API のどの type が、どのURLへ行くか」という対応であり、
 * 個々のコンテンツではない。`/api/draft` はこの表だけを頼りにリダイレクト先を組み立てるので、
 * 表が狂うと利用者は別の企画のページへ送られる。
 */
describe("resolveDraftPreviewPath", () => {
  it("著名人企画は /special/[id] へ送る（正規URLはこちら）", () => {
    expect(resolveDraftPreviewPath("events", "abc123", "special")).toBe("/special/abc123");
  });

  it("一般企画は /events/[id] へ送る", () => {
    expect(resolveDraftPreviewPath("events", "abc123", "room")).toBe("/events/abc123");
  });

  it("type 未入力の下書きは一般企画として扱う", () => {
    // 未入力の select は normalizeEvent() が "other" へ落とす。
    // 著名人企画は必ず type を入れて入稿される前提なので、判別できない下書きは
    // /events/[id] 側で見せる（/special/[id] は type=special 以外を 404 にするため）
    expect(resolveDraftPreviewPath("events", "abc123", "other")).toBe("/events/abc123");
    expect(resolveDraftPreviewPath("events", "abc123", undefined)).toBe("/events/abc123");
  });

  it("お知らせは /info/[id] へ送る", () => {
    expect(resolveDraftPreviewPath("news", "news-1", "urgent")).toBe("/info/news-1");
  });

  it("informations は遷移先を持たない（単一コンテンツの詳細ページが無い）", () => {
    expect(resolveDraftPreviewPath("informations", "sponsor-1")).toBeNull();
  });

  it("不正なIDはパスを組み立てない（オープンリダイレクト対策）", () => {
    expect(resolveDraftPreviewPath("events", "../../evil")).toBeNull();
    expect(resolveDraftPreviewPath("events", "https://example.com")).toBeNull();
    expect(resolveDraftPreviewPath("events", "")).toBeNull();
  });
});

describe("isValidContentId", () => {
  it("microCMS が許す文字種を通す", () => {
    expect(isValidContentId("abc123")).toBe(true);
    expect(isValidContentId("event-1_2")).toBe(true);
  });

  it("パス区切りとプロトコルを弾く", () => {
    expect(isValidContentId("a/b")).toBe(false);
    expect(isValidContentId("..")).toBe(false);
    expect(isValidContentId("//example.com")).toBe(false);
    expect(isValidContentId("a b")).toBe(false);
  });

  it("空文字と長すぎる値を弾く", () => {
    expect(isValidContentId("")).toBe(false);
    expect(isValidContentId("a".repeat(65))).toBe(false);
  });
});

describe("isValidDraftKey", () => {
  it("英数字とハイフン・アンダースコアを通す", () => {
    expect(isValidDraftKey("aBc123_-")).toBe(true);
  });

  it("空文字と不正な文字を弾く", () => {
    expect(isValidDraftKey("")).toBe(false);
    expect(isValidDraftKey("key with space")).toBe(false);
    expect(isValidDraftKey("a".repeat(129))).toBe(false);
  });
});

/**
 * cookie の往復
 *
 * cookie は利用者の手元にあり、書き換えられる前提で扱う。
 * ここを通った値がそのまま microCMS へのクエリとリダイレクト先になるため、
 * 「壊れていたら黙って null」が満たされていることを固定する。
 */
describe("parseDraftPreviewContext", () => {
  const context = { api: "events", id: "abc123", draftKey: "key123" } as const;

  it("serialize した値をそのまま復元できる", () => {
    expect(parseDraftPreviewContext(serializeDraftPreviewContext(context))).toEqual(context);
  });

  it("未設定・空文字は null", () => {
    expect(parseDraftPreviewContext(undefined)).toBeNull();
    expect(parseDraftPreviewContext("")).toBeNull();
  });

  it("JSON として壊れていれば null（例外を投げない）", () => {
    expect(parseDraftPreviewContext("{not json")).toBeNull();
    expect(parseDraftPreviewContext("null")).toBeNull();
    expect(parseDraftPreviewContext('"文字列"')).toBeNull();
  });

  it("フィールドが欠けていれば null", () => {
    expect(parseDraftPreviewContext(JSON.stringify({ api: "events", id: "abc123" }))).toBeNull();
    expect(parseDraftPreviewContext(JSON.stringify({ id: "abc123", draftKey: "k" }))).toBeNull();
  });

  it("未知の API 名は null（遷移先の定義が無いため）", () => {
    expect(
      parseDraftPreviewContext(JSON.stringify({ api: "unknown", id: "abc123", draftKey: "k" }))
    ).toBeNull();
  });

  it("細工されたIDとキーは null", () => {
    expect(
      parseDraftPreviewContext(JSON.stringify({ api: "events", id: "../evil", draftKey: "k" }))
    ).toBeNull();
    expect(
      parseDraftPreviewContext(JSON.stringify({ api: "events", id: "abc", draftKey: "a b" }))
    ).toBeNull();
  });

  it("型が違えば null", () => {
    expect(
      parseDraftPreviewContext(JSON.stringify({ api: "events", id: 123, draftKey: "k" }))
    ).toBeNull();
  });
});
