import { describe, expect, it } from "vitest";
import {
  CARD_GAP_PX,
  DEFAULT_TIME_RANGE,
  HOUR_HEIGHT_PX,
  MIN_EVENT_HEIGHT_PX,
  calculateBoardHeight,
  calculateEventOffset,
  calculateTimeRange,
  generateTimeAxis,
  getCardDensity,
  layoutStageEvents,
  parseTimeToMinutes,
  type TimeRange,
} from "@/lib/timetable-layout";
import { siteConfig } from "@/data/site";
import { fixture } from "@/components/timetable/__fixtures__/stage-events";
import type { Event } from "@/types/events";

/** 盤面の既定レンジ。10:00-20:00 = 600分 = 960px（1.6px/分） */
const RANGE: TimeRange = { startHour: 10, endHour: 20 };

/** 時刻だけが意味を持つ企画を作る */
function at(id: string, startTime: string, endTime: string): Event {
  return fixture(id, {
    date: "day1",
    type: "stage",
    place: "7A",
    title: id,
    organizer: "テスト",
    startTime,
    endTime,
  });
}

describe("parseTimeToMinutes", () => {
  it("HH:mm を分へ変換する", () => {
    expect(parseTimeToMinutes("10:30")).toBe(630);
    expect(parseTimeToMinutes("23:59")).toBe(1439);
  });

  it("0時ちょうどを 0 として返す", () => {
    // 0 は falsy なので、呼び出し側は必ず `=== null` で判定する必要がある。
    // その契約をここで固定する
    expect(parseTimeToMinutes("00:00")).toBe(0);
  });

  it("1桁の時と前後の空白を許容する", () => {
    expect(parseTimeToMinutes("9:05")).toBe(545);
    expect(parseTimeToMinutes(" 09:05 ")).toBe(545);
  });

  it("解釈できない入力に null を返す", () => {
    expect(parseTimeToMinutes("1000")).toBeNull(); // 区切りが無い
    expect(parseTimeToMinutes("10:5")).toBeNull(); // 分は2桁固定
    expect(parseTimeToMinutes("24:00")).toBeNull(); // 時が範囲外
    expect(parseTimeToMinutes("10:60")).toBeNull(); // 分が範囲外
    expect(parseTimeToMinutes("abc")).toBeNull();
    expect(parseTimeToMinutes("")).toBeNull();
    expect(parseTimeToMinutes(undefined)).toBeNull();
    expect(parseTimeToMinutes(null)).toBeNull();
  });

  it("どんな入力に対しても NaN を返さない", () => {
    // 旧実装は Number("ab") が例外を投げないことを見落としており、
    // try/catch をすり抜けた NaN が CSS の値として出力されていた
    const inputs = [
      "10:30",
      "00:00",
      "9:05",
      "1000",
      "10:5",
      "24:00",
      "10:60",
      "abc",
      "",
      "::",
      "-1:00",
      undefined,
      null,
    ];
    for (const input of inputs) {
      const result = parseTimeToMinutes(input);
      expect(result === null || Number.isInteger(result)).toBe(true);
    }
  });
});

describe("定数の整合", () => {
  it("カード実寸の下限が WCAG 2.5.8 の 24px を満たす", () => {
    // MIN_EVENT_HEIGHT_PX は「枠」の下限。カード実寸は CARD_GAP_PX ぶん小さい
    expect(MIN_EVENT_HEIGHT_PX - CARD_GAP_PX).toBe(24);
  });

  it("既定レンジが開催時間を包含する", () => {
    // 値をベタ書きしない。開催時間が変わっても包含関係が壊れたときだけ落ちる
    const open = parseTimeToMinutes(siteConfig.openTime);
    const close = parseTimeToMinutes(siteConfig.closeTime);
    expect(open).not.toBeNull();
    expect(close).not.toBeNull();
    expect(DEFAULT_TIME_RANGE.startHour * 60).toBeLessThanOrEqual(open!);
    expect(DEFAULT_TIME_RANGE.endHour * 60).toBeGreaterThanOrEqual(close!);
  });
});

describe("calculateTimeRange", () => {
  it("企画が無ければ fallback を同一参照で返す", () => {
    expect(calculateTimeRange([])).toBe(DEFAULT_TIME_RANGE);
  });

  it("すべての時刻が不正なら fallback を返す", () => {
    expect(calculateTimeRange([at("broken", "1000", "11:00")])).toBe(DEFAULT_TIME_RANGE);
  });

  it("終了が開始以前の企画だけなら fallback を返す", () => {
    const events = [at("same", "13:00", "13:00"), at("reversed", "14:00", "13:00")];
    expect(calculateTimeRange(events)).toBe(DEFAULT_TIME_RANGE);
  });

  it("独自の fallback をそのまま返す", () => {
    const fallback: TimeRange = { startHour: 8, endHour: 22 };
    expect(calculateTimeRange([], fallback)).toBe(fallback);
  });

  it("最早開始を切り捨て、最遅終了を切り上げる", () => {
    const events = [at("early", "09:30", "10:15"), at("late", "17:30", "19:00")];
    expect(calculateTimeRange(events)).toEqual({ startHour: 9, endHour: 19 });
  });

  it("不正な時刻を飛ばして有効な企画だけで算出する", () => {
    const events = [at("broken", "1000", "11:00"), at("valid", "13:00", "14:00")];
    expect(calculateTimeRange(events)).toEqual({ startHour: 13, endHour: 14 });
  });

  it("同一の正時に収まる企画でも最低1時間を確保する", () => {
    // ここが 0 になると calculateBoardHeight も 0 になり、#148 と同じ見た目になる
    const range = calculateTimeRange([at("tiny", "10:00", "10:01")]);
    expect(range).toEqual({ startHour: 10, endHour: 11 });
    expect(calculateBoardHeight(range)).toBeGreaterThan(0);
  });
});

describe("calculateBoardHeight", () => {
  it("レンジの時間数 × 1時間の高さを返す", () => {
    expect(calculateBoardHeight(RANGE)).toBe(960);
  });

  it("引数の hourHeightPx を使う（定数の直参照へ戻していないこと）", () => {
    expect(calculateBoardHeight(RANGE, 60)).toBe(600);
  });

  it("退化・逆転したレンジで負を返さない", () => {
    expect(calculateBoardHeight({ startHour: 12, endHour: 12 })).toBe(0);
    expect(calculateBoardHeight({ startHour: 13, endHour: 12 })).toBe(0);
  });
});

describe("calculateEventOffset", () => {
  it("レンジ内の企画を px へ写像する", () => {
    expect(calculateEventOffset("10:00", "11:00", RANGE)).toEqual({ topPx: 0, heightPx: 96 });
    expect(calculateEventOffset("10:30", "12:00", RANGE)).toEqual({ topPx: 48, heightPx: 144 });
    expect(calculateEventOffset("10:00", "20:00", RANGE)).toEqual({ topPx: 0, heightPx: 960 });
  });

  it("壊れた入力に既定値を返さず null を返す", () => {
    // 旧実装は { top: 0, height: 10 } を黙って返しており、
    // 「10:00 開始の企画」と区別が付かなかった。描画しないほうが誤情報より安全
    expect(calculateEventOffset("1000", "11:00", RANGE)).toBeNull();
    expect(calculateEventOffset(undefined, "11:00", RANGE)).toBeNull();
    expect(calculateEventOffset("11:00", undefined, RANGE)).toBeNull();
  });

  it("終了が開始以前なら null を返す", () => {
    expect(calculateEventOffset("11:00", "11:00", RANGE)).toBeNull();
    expect(calculateEventOffset("12:00", "11:00", RANGE)).toBeNull();
  });

  it("レンジと全く重ならない企画に null を返す", () => {
    expect(calculateEventOffset("08:00", "09:30", RANGE)).toBeNull(); // レンジ手前
    expect(calculateEventOffset("20:00", "21:00", RANGE)).toBeNull(); // レンジ後方
  });

  it("レンジの上端をはみ出す企画をクリップし、下限高さへクランプする", () => {
    expect(calculateEventOffset("09:30", "10:15", RANGE)).toEqual({
      topPx: 0,
      heightPx: MIN_EVENT_HEIGHT_PX,
    });
  });

  it("15分企画を下限高さへクランプする", () => {
    expect(calculateEventOffset("11:00", "11:15", RANGE)).toEqual({
      topPx: 96,
      heightPx: MIN_EVENT_HEIGHT_PX,
    });
  });

  it("盤面の下端を突き抜けないよう top を押し戻す", () => {
    // 素の top は (1190-600)*1.6 = 944 だが、boardHeight - heightPx = 932 へ押し戻され、
    // 932 + 28 = 960 でぴったり収まる。押し戻しを消すと盤面から溢れる
    const offset = calculateEventOffset("19:50", "20:30", RANGE);
    expect(offset).toEqual({ topPx: 932, heightPx: MIN_EVENT_HEIGHT_PX });
    expect(offset!.topPx + offset!.heightPx).toBe(calculateBoardHeight(RANGE));
  });

  it("退化したレンジをまたぐ企画に 0 を返す（null ではない）", () => {
    const degenerate: TimeRange = { startHour: 12, endHour: 12 };
    expect(calculateEventOffset("11:00", "13:00", degenerate)).toEqual({ topPx: 0, heightPx: 0 });
  });

  it("引数の hourHeightPx を使う", () => {
    expect(calculateEventOffset("10:00", "11:00", RANGE, 60)).toEqual({ topPx: 0, heightPx: 60 });
  });
});

describe("layoutStageEvents", () => {
  it("重なる企画をレーンへ分割し、重ならなくなったらリセットする", () => {
    const events = [
      at("a", "10:30", "12:00"),
      at("b", "13:00", "14:30"),
      at("c", "13:30", "14:00"), // b と重なる
    ];
    const positioned = layoutStageEvents(events, RANGE);

    expect(positioned.map((p) => p.event.id)).toEqual(["a", "b", "c"]);
    expect(positioned[0]).toMatchObject({ laneIndex: 0, laneCount: 1 });
    expect(positioned[1]).toMatchObject({ laneIndex: 0, laneCount: 2 });
    expect(positioned[2]).toMatchObject({ laneIndex: 1, laneCount: 2 });
  });

  it("重なり判定に実時刻を使い、クランプ後の px を使わない", () => {
    // 11:00-11:15 と 11:15-12:00 は隣接しているだけで重なっていない。
    // ところがクランプ後の px では前者の下端(124)が後者の上端(120)を越えるため、
    // px で判定する実装に戻すと偽の重なりとしてレーンが割れる
    const events = [at("first", "11:00", "11:15"), at("second", "11:15", "12:00")];
    const positioned = layoutStageEvents(events, RANGE);

    expect(positioned[0]).toMatchObject({ laneIndex: 0, laneCount: 1 });
    expect(positioned[1]).toMatchObject({ laneIndex: 0, laneCount: 1 });

    const firstBottom = positioned[0].topPx + positioned[0].heightPx;
    expect(firstBottom).toBeGreaterThan(positioned[1].topPx);
  });

  it("開始が同着なら終了が遅いほうを先（レーン0）に置く", () => {
    const positioned = layoutStageEvents(
      [at("short", "13:00", "13:30"), at("long", "13:00", "14:00")],
      RANGE
    );
    expect(positioned.map((p) => p.event.id)).toEqual(["long", "short"]);
    expect(positioned[0].laneIndex).toBe(0);
    expect(positioned[1].laneIndex).toBe(1);
    expect(positioned.every((p) => p.laneCount === 2)).toBe(true);
  });

  it("空いたレーンを再利用する", () => {
    const positioned = layoutStageEvents(
      [at("a", "13:00", "14:00"), at("b", "13:30", "14:30"), at("c", "14:00", "15:00")],
      RANGE
    );
    expect(positioned.map((p) => p.laneIndex)).toEqual([0, 1, 0]);
    expect(positioned.every((p) => p.laneCount === 2)).toBe(true);
  });

  it("3重なりで3レーンに割る", () => {
    const positioned = layoutStageEvents(
      [at("a", "13:00", "15:00"), at("b", "13:30", "14:30"), at("c", "14:00", "16:00")],
      RANGE
    );
    expect(positioned.map((p) => p.laneIndex)).toEqual([0, 1, 2]);
    expect(positioned.every((p) => p.laneCount === 3)).toBe(true);
  });

  it("描画できない企画を除外する", () => {
    const positioned = layoutStageEvents(
      [at("broken", "1000", "11:00"), at("outside", "20:00", "21:00"), at("ok", "13:00", "14:00")],
      RANGE
    );
    expect(positioned.map((p) => p.event.id)).toEqual(["ok"]);
  });

  it("引数の配列を破壊しない", () => {
    const events = [at("late", "14:00", "15:00"), at("early", "10:30", "11:00")];
    const before = events.map((event) => event.id);
    layoutStageEvents(events, RANGE);
    expect(events.map((event) => event.id)).toEqual(before);
  });

  it("開始時刻の昇順で返す（DOM 順 = Tab 順・読み上げ順の保証）", () => {
    const positioned = layoutStageEvents(
      [at("c", "15:00", "16:00"), at("a", "10:30", "11:00"), at("b", "13:00", "14:00")],
      RANGE
    );
    expect(positioned.map((p) => p.event.id)).toEqual(["a", "b", "c"]);
  });
});

describe("generateTimeAxis", () => {
  it("endHour を含む閉区間でゼロ埋めして返す", () => {
    const axis = generateTimeAxis({ startHour: 9, endHour: 19 });
    expect(axis).toHaveLength(11);
    expect(axis[0]).toBe("09:00");
    expect(axis[axis.length - 1]).toBe("19:00");
  });

  it("24時以降を 00:00 へ折り返す", () => {
    expect(generateTimeAxis({ startHour: 22, endHour: 25 })).toEqual([
      "22:00",
      "23:00",
      "00:00",
      "01:00",
    ]);
  });

  it("退化したレンジでも1目盛りを返す", () => {
    expect(generateTimeAxis({ startHour: 12, endHour: 12 })).toEqual(["12:00"]);
  });
});

describe("getCardDensity", () => {
  it("企画長ごとの密度を返す", () => {
    expect(getCardDensity(HOUR_HEIGHT_PX)).toBe("full"); // 60分
    expect(getCardDensity(HOUR_HEIGHT_PX / 2)).toBe("compact"); // 30分
    expect(getCardDensity(MIN_EVENT_HEIGHT_PX)).toBe("minimal"); // 15分（クランプ後）
  });

  it("枠ではなくカード実寸で判定する", () => {
    // 枠 89px のカード実寸は 85px で full の下限 89px に届かない。
    // 枠のまま比べる実装に戻すと 89 >= 89 で full を返し、内容が溢れる（#154 の指摘）
    expect(getCardDensity(89)).toBe("compact");
  });

  it("full の境界", () => {
    expect(getCardDensity(93)).toBe("full"); // 実寸 89
    expect(getCardDensity(92)).toBe("compact"); // 実寸 88
  });

  it("compact の境界", () => {
    expect(getCardDensity(47.5)).toBe("compact"); // 実寸 43.5
    expect(getCardDensity(47)).toBe("minimal"); // 実寸 43
  });
});
