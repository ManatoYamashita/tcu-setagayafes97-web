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

describe("normalizeEvent の開催枠（#281）", () => {
  const session = (startTime?: string, endTime?: string) =>
    ({ fieldId: "session", startTime, endTime }) as const;

  it("sessions が無い既存の企画は startTime / endTime から1枠を作る", () => {
    // microCMS は未入力の繰り返しフィールドをキーごと返さないことがある
    const event = normalizeEvent(rawEventFixture({ startTime: "10:40", endTime: "15:45" }));
    expect(event.sessions).toEqual([{ startTime: "10:40", endTime: "15:45" }]);
  });

  it("sessions が空配列でも、値の無い行しか無くても startTime / endTime を使う", () => {
    // 管理画面で行を足しただけの状態で、従来の欄まで黙って無視されないようにする
    for (const sessions of [[], [session()], [session("", " ")]]) {
      const event = normalizeEvent(
        rawEventFixture({ startTime: "10:40", endTime: "11:25", sessions })
      );
      expect(event.sessions).toEqual([{ startTime: "10:40", endTime: "11:25" }]);
    }
  });

  it("sessions に値があれば startTime / endTime を無視する", () => {
    // コードより先に入稿する期間は、従来の欄に第1部だけを入れておく運用になる
    const event = normalizeEvent(
      rawEventFixture({
        startTime: "10:40",
        endTime: "15:45",
        sessions: [session("10:40", "11:25"), session("14:45", "15:45")],
      })
    );
    expect(event.sessions).toEqual([
      { startTime: "10:40", endTime: "11:25" },
      { startTime: "14:45", endTime: "15:45" },
    ]);
  });

  it("開始時刻の昇順に並べ、読めない枠は末尾で入稿順を保つ", () => {
    const event = normalizeEvent(
      rawEventFixture({
        sessions: [
          session("未定A"),
          session("14:45", "15:45"),
          session(" 9:30 ", "10:00"),
          session("未定B"),
        ],
      })
    );
    expect(event.sessions.map((s) => s.startTime)).toEqual(["9:30", "14:45", "未定A", "未定B"]);
  });

  it("時刻がどこにも無ければ空配列にする", () => {
    expect(normalizeEvent(rawEventFixture()).sessions).toEqual([]);
  });

  it("正規化後の企画に startTime / endTime を残さない", () => {
    // 型から消した欄が実行時に残ると、先頭の枠だけを読むコードが型検査をすり抜けて動く
    const event = normalizeEvent(rawEventFixture({ startTime: "10:40", endTime: "11:25" }));
    expect(event).not.toHaveProperty("startTime");
    expect(event).not.toHaveProperty("endTime");
  });
});

describe("normalizeEvent の開催枠の日程（#305）", () => {
  const session = (date: string[] | string | undefined, startTime: string, endTime: string) =>
    ({ fieldId: "session", date, startTime, endTime }) as const;

  it("select の日程（配列・文字列）を day1 / day2 として読む", () => {
    const event = normalizeEvent(
      rawEventFixture({
        date: "both : 両日",
        sessions: [
          session("day2", "11:00", "15:00"),
          session(["day1 : 10月31日（土）"], "11:00", "16:00"),
        ],
      })
    );
    expect(event.sessions).toEqual([
      { date: "day1", startTime: "11:00", endTime: "16:00" },
      { date: "day2", startTime: "11:00", endTime: "15:00" },
    ]);
  });

  it("日程の順に並べてから開始時刻で並べる", () => {
    // 開始時刻だけで並べると、2日目の 10:00 が1日目の 11:00 より前に来る
    const event = normalizeEvent(
      rawEventFixture({
        sessions: [session("day2", "10:00", "11:00"), session("day1", "11:00", "12:00")],
      })
    );
    expect(event.sessions.map(({ date }) => date)).toEqual(["day1", "day2"]);
  });

  it("both / other / 未入力の日程は「日程の指定なし」とし、date キーを持たせない", () => {
    const event = normalizeEvent(
      rawEventFixture({
        sessions: [
          session(["both : 両日"], "10:00", "11:00"),
          session("other", "12:00", "13:00"),
          session(undefined, "14:00", "15:00"),
        ],
      })
    );
    expect(event.sessions).toHaveLength(3);
    for (const normalized of event.sessions) {
      expect(normalized).not.toHaveProperty("date");
    }
  });

  it("日程だけで時刻の無い行は、値の無い行として落とす", () => {
    const event = normalizeEvent(
      rawEventFixture({ startTime: "10:40", endTime: "11:25", sessions: [session("day1", "", "")] })
    );
    expect(event.sessions).toEqual([{ startTime: "10:40", endTime: "11:25" }]);
  });
});
