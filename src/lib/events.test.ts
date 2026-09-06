import { describe, expect, it } from "vitest";
import { normalizeEvent } from "@/lib/events";
import { filterEvents } from "@/lib/filters";
import type { RawEvent } from "@/types/events";

/**
 * `RawEvent` は `title` / `organizer` / `description` / `place` / `building` を
 * 必須の `string` と宣言しているが、これは型上の約束に過ぎない。microCMS の
 * フィールドが未入力のまま公開されると、実際には `undefined` が返り得る。
 *
 * `title` などを意図的に省いた `Partial<RawEvent>` を `RawEvent` として渡し、
 * 型の宣言と実データが食い違うケースを再現する。
 */
function rawEventFixture(overrides: Partial<RawEvent> = {}): RawEvent {
  return {
    id: "ev-1",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
    date: "day1 : 10月31日（土）",
    type: "room : 教室企画",
    place: "1101教室",
    building: "1号館",
    title: "テスト企画",
    organizer: "テスト団体",
    description: "テスト説明文",
    content: "",
    ...overrides,
  } as RawEvent;
}

describe("normalizeEvent", () => {
  it("title/organizer/description/place/building が undefined でも空文字に既定化する", () => {
    const raw = rawEventFixture({
      title: undefined,
      organizer: undefined,
      description: undefined,
      place: undefined,
      building: undefined,
    } as Partial<RawEvent>);

    const event = normalizeEvent(raw);

    expect(event.title).toBe("");
    expect(event.organizer).toBe("");
    expect(event.description).toBe("");
    expect(event.place).toBe("");
    expect(event.building).toBe("");
  });

  it("正規化後の企画をキーワード検索してもクラッシュしない（回帰）", () => {
    const raw = rawEventFixture({ title: undefined } as Partial<RawEvent>);
    const events = [normalizeEvent(raw)];

    expect(() => filterEvents(events, { keyword: "テスト" })).not.toThrow();
  });
});
