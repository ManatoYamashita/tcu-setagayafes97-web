import { describe, expect, it } from "vitest";
import {
  buildEventScheduleJsonLd,
  formatSessions,
  getSessionLabel,
  labelSessions,
} from "@/lib/event-sessions";

const TWO_PARTS = [
  { startTime: "10:40", endTime: "11:25" },
  { startTime: "14:45", endTime: "15:45" },
];

/** 両日開催で日ごとに終了が違う企画（#305 の Jazz Festival） */
const PER_DAY = [
  { date: "day1" as const, startTime: "11:00", endTime: "16:00" },
  { date: "day2" as const, startTime: "11:00", endTime: "15:00" },
];

describe("getSessionLabel", () => {
  it("枠が2つ以上のときだけ「第n部」と呼ぶ", () => {
    expect(getSessionLabel(0, 1)).toBeUndefined();
    expect(getSessionLabel(0, 2)).toBe("第1部");
    expect(getSessionLabel(1, 2)).toBe("第2部");
  });
});

describe("labelSessions", () => {
  it("開始の無い枠を落としてから数える", () => {
    // 落とす前の数で数えると、1枠しか見えないのに「第1部」と付く
    expect(
      labelSessions([
        { startTime: "10:40", endTime: "11:25" },
        { startTime: "", endTime: "15:45" },
      ])
    ).toEqual([{ startTime: "10:40", endTime: "11:25", label: undefined }]);
  });

  it("HH:mm として読めない開始時刻も数に入れる（詳細ページは入稿どおりに出すため）", () => {
    expect(
      labelSessions([
        { startTime: "10:00", endTime: "11:00" },
        { startTime: "1400", endTime: "15:00" },
      ]).map((session) => session.label)
    ).toEqual(["第1部", "第2部"]);
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
  const dates = { day1: "2026-10-31", day2: "2026-11-01" };
  const base = {
    title: "カレッジフェスタ",
    dates,
    defaultDateIso: "2026-10-31",
    location: { name: "ホール" },
  };

  it("両日開催で日程の無い枠は、両日へ展開して日ごとの subEvent を出す（#289）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      defaultDateIso: "2026-11-01",
      undatedSessionDates: ["day1", "day2"],
      sessions: [{ startTime: "11:00", endTime: "15:00" }],
    });

    expect(result.startDate).toBe("2026-10-31T11:00:00+09:00");
    expect(result.endDate).toBe("2026-11-01T15:00:00+09:00");
    expect(result.subEvent).toEqual([
      {
        "@type": "Event",
        name: "カレッジフェスタ（1日目）",
        startDate: "2026-10-31T11:00:00+09:00",
        endDate: "2026-10-31T15:00:00+09:00",
        location: { name: "ホール" },
      },
      {
        "@type": "Event",
        name: "カレッジフェスタ（2日目）",
        startDate: "2026-11-01T11:00:00+09:00",
        endDate: "2026-11-01T15:00:00+09:00",
        location: { name: "ホール" },
      },
    ]);
  });

  it("両日開催の2部制は「日 × 枠」に展開する", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      undatedSessionDates: ["day1", "day2"],
      sessions: TWO_PARTS,
    });

    expect(result.subEvent?.map((event) => (event as { name: string }).name)).toEqual([
      "カレッジフェスタ（1日目 第1部）",
      "カレッジフェスタ（1日目 第2部）",
      "カレッジフェスタ（2日目 第1部）",
      "カレッジフェスタ（2日目 第2部）",
    ]);
  });

  it("日程を持つ枠が1つでもあれば展開しない（日ごとの枠は入稿者が書いている）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      defaultDateIso: "2026-11-01",
      undatedSessionDates: ["day1", "day2"],
      sessions: [
        { date: "day1", startTime: "11:00", endTime: "16:00" },
        { startTime: "11:00", endTime: "15:00" },
      ],
    });

    expect(result.subEvent).toHaveLength(2);
    expect(result.startDate).toBe("2026-10-31T11:00:00+09:00");
    expect(result.endDate).toBe("2026-11-01T15:00:00+09:00");
  });

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

  it("時が1桁の時刻を2桁に揃えて出す", () => {
    // 入稿値を埋め込むと 2026-10-31T9:30:00+09:00 という不正な日時になる
    expect(
      buildEventScheduleJsonLd({ ...base, sessions: [{ startTime: "9:30", endTime: "9:50" }] })
    ).toMatchObject({
      startDate: "2026-10-31T09:30:00+09:00",
      endDate: "2026-10-31T09:50:00+09:00",
    });
  });

  it("親の終了を分で比べる（文字列で比べると 9:50 が 11:00 より後になる）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      sessions: [
        { startTime: "9:00", endTime: "9:50" },
        { startTime: "10:00", endTime: "11:00" },
      ],
    });
    expect(result.endDate).toBe("2026-10-31T11:00:00+09:00");
  });

  it("最後の枠に終了が無いときは親の終了を出さない（subEvent が親の期間からはみ出すため）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      sessions: [
        { startTime: "10:40", endTime: "11:25" },
        { startTime: "14:45", endTime: "" },
      ],
    });
    expect(result.startDate).toBe("2026-10-31T10:40:00+09:00");
    expect(result.endDate).toBeUndefined();
    expect(result.subEvent).toHaveLength(2);
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

  it("日程を持つ枠はその日の日付で出し、親の範囲は両日にまたがる（#305）", () => {
    const result = buildEventScheduleJsonLd({
      ...base,
      title: "Jazz Festival",
      // 日程の無い枠の既定日（両日開催は2日目に寄る）とは別に、枠の日程が勝つ
      defaultDateIso: dates.day2,
      sessions: PER_DAY,
    });

    expect(result).toEqual({
      startDate: "2026-10-31T11:00:00+09:00",
      endDate: "2026-11-01T15:00:00+09:00",
      subEvent: [
        {
          "@type": "Event",
          name: "Jazz Festival（1日目）",
          startDate: "2026-10-31T11:00:00+09:00",
          endDate: "2026-10-31T16:00:00+09:00",
          location: base.location,
        },
        {
          "@type": "Event",
          name: "Jazz Festival（2日目）",
          startDate: "2026-11-01T11:00:00+09:00",
          endDate: "2026-11-01T15:00:00+09:00",
          location: base.location,
        },
      ],
    });
  });

  it("親の終了を日付込みで比べる（時刻だけで比べると1日目の 16:00 が勝つ）", () => {
    // 1日目 11:00–16:00 と 2日目 11:00–15:00。時刻だけなら 16:00 が最後の終了になり、
    // 親の範囲が1日目で閉じて2日目の subEvent がはみ出す
    const result = buildEventScheduleJsonLd({ ...base, sessions: PER_DAY });
    expect(result.endDate).toBe("2026-11-01T15:00:00+09:00");
  });
});

describe("日程を持つ開催枠（#305）", () => {
  it("同じ日の枠の中でだけ「第n部」を数え、日程が2種類以上なら「n日目」を付ける", () => {
    expect(labelSessions(PER_DAY)).toEqual([
      { ...PER_DAY[0], dayLabel: "1日目" },
      { ...PER_DAY[1], dayLabel: "2日目" },
    ]);

    const mixed = labelSessions([
      { date: "day1", startTime: "10:00", endTime: "11:00" },
      { date: "day1", startTime: "13:00", endTime: "14:00" },
      { date: "day2", startTime: "10:00", endTime: "11:00" },
    ]);
    expect(mixed.map(({ dayLabel, label }) => [dayLabel, label])).toEqual([
      ["1日目", "第1部"],
      ["1日目", "第2部"],
      ["2日目", undefined],
    ]);
  });

  it("日程が1種類だけなら「n日目」を付けない（1日だけの企画に付けても情報が増えない）", () => {
    const sessions = [{ date: "day1" as const, startTime: "10:00", endTime: "11:00" }];
    expect(labelSessions(sessions)[0]).not.toHaveProperty("dayLabel");
  });

  it("詳細ページは「1日目 11:00 〜 16:00」の形で出す", () => {
    expect(formatSessions(PER_DAY)).toEqual(["1日目 11:00 〜 16:00", "2日目 11:00 〜 15:00"]);
  });

  it("カード向け（withLabel: false）でも「n日目」は付ける", () => {
    // 付けないと "11:00 - 16:00 / 11:00 - 15:00" になり、どちらが何日目か読めない
    expect(formatSessions(PER_DAY, { separator: " - ", withLabel: false })).toEqual([
      "1日目 11:00 - 16:00",
      "2日目 11:00 - 15:00",
    ]);
  });
});
