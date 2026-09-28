import { describe, expect, it } from "vitest";
import { buildEventScheduleJsonLd, formatSessions, getSessionLabel } from "@/lib/event-sessions";

const TWO_PARTS = [
  { startTime: "10:40", endTime: "11:25" },
  { startTime: "14:45", endTime: "15:45" },
];

describe("getSessionLabel", () => {
  it("枠が2つ以上のときだけ「第n部」と呼ぶ", () => {
    expect(getSessionLabel(0, 1)).toBeUndefined();
    expect(getSessionLabel(0, 2)).toBe("第1部");
    expect(getSessionLabel(1, 2)).toBe("第2部");
  });
});

describe("formatSessions", () => {
  it("1枠は「第1部」を付けずに出す", () => {
    expect(formatSessions([{ startTime: "10:40", endTime: "11:25" }])).toEqual(["10:40 〜 11:25"]);
  });

  it("2部制は枠ごとに「第n部」を付けて出す", () => {
    expect(formatSessions(TWO_PARTS)).toEqual(["第1部 10:40 〜 11:25", "第2部 14:45 〜 15:45"]);
  });

  it("開始だけの枠は「○○〜」、開始の無い枠は出さない（従来の表示を踏襲）", () => {
    expect(formatSessions([{ startTime: "13:00", endTime: "" }])).toEqual(["13:00〜"]);
    expect(formatSessions([{ startTime: "", endTime: "14:00" }])).toEqual([]);
    expect(formatSessions([])).toEqual([]);
  });

  it("カード向けの指定では、終了の無い枠を落とし「第n部」を付けない", () => {
    const options = { separator: " - ", requireEnd: true, withLabel: false };
    expect(formatSessions([...TWO_PARTS, { startTime: "17:00", endTime: "" }], options)).toEqual([
      "10:40 - 11:25",
      "14:45 - 15:45",
    ]);
  });
});

describe("buildEventScheduleJsonLd", () => {
  const base = { title: "カレッジフェスタ", dateIso: "2026-10-31", location: { name: "ホール" } };

  it("1枠は親の開始・終了だけを出し、subEvent を付けない", () => {
    expect(
      buildEventScheduleJsonLd({ ...base, sessions: [{ startTime: "10:40", endTime: "11:25" }] })
    ).toEqual({
      startDate: "2026-10-31T10:40:00+09:00",
      endDate: "2026-10-31T11:25:00+09:00",
      subEvent: undefined,
    });
  });

  it("2部制は親の範囲に加えて、枠ごとの subEvent を出す", () => {
    const result = buildEventScheduleJsonLd({ ...base, sessions: TWO_PARTS });

    expect(result.startDate).toBe("2026-10-31T10:40:00+09:00");
    expect(result.endDate).toBe("2026-10-31T15:45:00+09:00");
    expect(result.subEvent).toEqual([
      {
        "@type": "Event",
        name: "カレッジフェスタ（第1部）",
        startDate: "2026-10-31T10:40:00+09:00",
        endDate: "2026-10-31T11:25:00+09:00",
        location: { name: "ホール" },
      },
      {
        "@type": "Event",
        name: "カレッジフェスタ（第2部）",
        startDate: "2026-10-31T14:45:00+09:00",
        endDate: "2026-10-31T15:45:00+09:00",
        location: { name: "ホール" },
      },
    ]);
  });

  it("親の終了は最後に終わる枠から取る（最後に始まる枠とは限らない）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      sessions: [
        { startTime: "10:00", endTime: "16:00" },
        { startTime: "13:00", endTime: "13:30" },
      ],
    });
    expect(result.endDate).toBe("2026-10-31T16:00:00+09:00");
  });

  it("読めない時刻を日時として出さない", () => {
    expect(
      buildEventScheduleJsonLd({ ...base, sessions: [{ startTime: "1000", endTime: "11:00" }] })
    ).toEqual({});
    expect(
      buildEventScheduleJsonLd({
        ...base,
        sessions: [{ startTime: "10:00", endTime: "未定" }],
      })
    ).toEqual({ startDate: "2026-10-31T10:00:00+09:00", endDate: undefined, subEvent: undefined });
  });

  it("時刻が無いときは fallbackStartDate を使う（省略時は何も出さない）", () => {
    expect(buildEventScheduleJsonLd({ ...base, sessions: [] })).toEqual({});
    expect(
      buildEventScheduleJsonLd({ ...base, sessions: [], fallbackStartDate: "2026-10-31" })
    ).toEqual({ startDate: "2026-10-31" });
  });
});
