import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  filterEventsByDate,
  filterEventsByStage,
  filterStageEvents,
  groupEventsByStage,
  listStageTabs,
} from "@/lib/timetable";
import { OTHER_STAGE_ID, OTHER_STAGE_NAME, stages } from "@/data/stages";
import { fixture, stageEventFixtures } from "@/components/timetable/__fixtures__/stage-events";
import type { Event } from "@/types/events";

/** `groupEventsByStage` / `listStageTabs` が守る並び順 */
const STAGE_ORDER = [...stages.map((stage) => stage.id), OTHER_STAGE_ID];

/** 本番と同じ入口を通した集合 */
const stageEvents = filterStageEvents(stageEventFixtures);
const day1Events = filterEventsByDate(stageEvents, "day1");
const day2Events = filterEventsByDate(stageEvents, "day2");

const ids = (events: Event[]): string[] => events.map((event) => event.id);

describe("filterStageEvents", () => {
  it("ステージ企画と著名人企画を通す", () => {
    const kept = ids(stageEvents);
    expect(kept).toContain("fx-7a-1"); // type: stage
    expect(kept).toContain("fx-gym-2"); // type: special
  });

  it("時刻を解釈できない企画を落とす", () => {
    // 盤面は座標を計算できない企画を描けないが縦スタックは描けてしまうため、
    // 入口で揃えないと「デスクトップに無いのにモバイルには出る企画」が生まれる
    expect(ids(stageEvents)).not.toContain("fx-broken-1");
  });

  it("終了が開始以前の企画を落とす", () => {
    const events = [
      fixture("reversed", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "逆転",
        organizer: "テスト",
        startTime: "14:00",
        endTime: "13:00",
      }),
    ];
    expect(filterStageEvents(events)).toHaveLength(0);
  });

  it("ステージ企画でない企画を落とす", () => {
    const events = [
      fixture("room", {
        date: "day1",
        type: "room",
        place: "7A",
        title: "教室企画",
        organizer: "テスト",
        startTime: "10:00",
        endTime: "11:00",
      }),
    ];
    expect(filterStageEvents(events)).toHaveLength(0);
  });

  it("引数の配列を破壊しない", () => {
    const before = ids(stageEventFixtures);
    filterStageEvents(stageEventFixtures);
    expect(ids(stageEventFixtures)).toEqual(before);
  });
});

describe("filterEventsByDate", () => {
  it('"all" は同一参照を返す', () => {
    expect(filterEventsByDate(stageEvents, "all")).toBe(stageEvents);
  });

  it("両日開催を Day1 / Day2 の双方へ出す", () => {
    expect(ids(day1Events)).toContain("fx-hall-1"); // date: "both"
    expect(ids(day2Events)).toContain("fx-hall-1");
  });

  it("他日の企画を含めない", () => {
    expect(ids(day1Events)).not.toContain("fx-day2-1");
    expect(ids(day2Events)).not.toContain("fx-7a-1");
  });
});

describe("filterEventsByStage", () => {
  it('"all" は同一参照を返す', () => {
    expect(filterEventsByStage(day1Events, "all")).toBe(day1Events);
  });

  it("place にステージが含まれる企画を取る", () => {
    expect(ids(filterEventsByStage(day1Events, "7A"))).toEqual(["fx-7a-1", "fx-7a-2", "fx-7a-3"]);
  });

  it("「その他」で受け皿の企画を取れる", () => {
    // extractStageId() へ戻すと null !== "other" で必ず外れ、
    // 「その他」タブが常に空になる
    expect(ids(filterEventsByStage(day1Events, OTHER_STAGE_ID))).toEqual(["fx-other-1"]);
  });

  it("グループ化と完全に一致する（両方が resolveStageId を通っている）", () => {
    // 片方だけ extractStageId() に戻した瞬間に落ちる
    for (const group of groupEventsByStage(day1Events)) {
      const filtered = filterEventsByStage(day1Events, group.id);
      expect(new Set(ids(filtered))).toEqual(new Set(ids(group.events)));
    }
  });
});

describe("groupEventsByStage", () => {
  it("どの企画も落とさない", () => {
    const groups = groupEventsByStage(day1Events);
    const total = groups.reduce((sum, group) => sum + group.events.length, 0);
    expect(total).toBe(day1Events.length);
  });

  it("stages の宣言順に並べ、最後に「その他」を置く", () => {
    // 期待値を stages から導出する。会場が入れ替わっても順序の契約だけを見る
    const actual = groupEventsByStage(day1Events).map((group) => group.id);
    const expected = STAGE_ORDER.filter((id) => actual.includes(id));
    expect(actual).toEqual(expected);
  });

  it("企画が無いステージを含めない", () => {
    const groups = groupEventsByStage(day2Events).map((group) => group.id);
    expect(groups).not.toContain("中庭");
  });

  it("各グループを開始時刻の昇順にする", () => {
    for (const group of groupEventsByStage(day1Events)) {
      const times = group.events.map((event) => event.startTime ?? "");
      expect([...times].sort((a, b) => a.localeCompare(b))).toEqual(times);
    }
  });

  it("引数の配列を破壊しない", () => {
    // 旧実装は props で受け取った配列をそのまま sort しており、呼び出し元の順序を変えていた
    const unsorted = [
      fixture("later", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "後",
        organizer: "テスト",
        startTime: "13:00",
        endTime: "14:00",
      }),
      fixture("earlier", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "先",
        organizer: "テスト",
        startTime: "10:30",
        endTime: "11:00",
      }),
    ];
    const before = ids(unsorted);
    const groups = groupEventsByStage(unsorted);

    expect(ids(groups[0].events)).toEqual(["earlier", "later"]); // 出力は並べ替わる
    expect(ids(unsorted)).toEqual(before); // 入力は動かない
  });

  it("「その他」グループに名前を与える", () => {
    const other = groupEventsByStage(day1Events).find((group) => group.id === OTHER_STAGE_ID);
    expect(other?.name).toBe(OTHER_STAGE_NAME);
  });
});

describe("listStageTabs", () => {
  it("当日企画のあるステージを並べる", () => {
    expect(listStageTabs(day2Events, "all").map((tab) => tab.id)).toEqual(["7A", "ホール"]);
  });

  it("選択中のステージを当日0件でも残す", () => {
    // 残さないと、その日に企画が無いステージIDをURLで開いたときタブが一覧から落ち、
    // 「すべて」も含めてどのタブも aria-pressed にならない（#154 のレビュー指摘）
    const tabs = listStageTabs(day2Events, "体育館").map((tab) => tab.id);
    expect(tabs).toContain("体育館");
    expect(tabs).toEqual(STAGE_ORDER.filter((id) => tabs.includes(id))); // 並び順も保つ
  });

  it("当日0件の「その他」も選択中なら残す", () => {
    const tabs = listStageTabs(day2Events, OTHER_STAGE_ID).map((tab) => tab.id);
    expect(tabs[tabs.length - 1]).toBe(OTHER_STAGE_ID);
  });

  it("実在しないステージIDを無視する", () => {
    // 素通しにすると URL の任意の文字列がタブのラベルとして表示される
    expect(listStageTabs(day2Events, "存在しないID").map((tab) => tab.id)).toEqual([
      "7A",
      "ホール",
    ]);
  });

  it("既に含まれるステージを重複させない", () => {
    expect(listStageTabs(day2Events, "7A").map((tab) => tab.id)).toEqual(["7A", "ホール"]);
  });
});

/**
 * 警告の検証はここへ隔離する
 *
 * `warnOnce` は同じ文言をモジュールスコープの Set に溜め続けるため、静的 import のままだと
 * 2本目以降が「呼ばれない」で落ちる。`vi.resetModules()` で毎回モジュール実体を作り直す。
 *
 * 動的 import で得た値は静的 import と別実体になるので、同一参照（`toBe`）の検証は
 * このブロックへ持ち込まないこと。
 */
describe("開発時の警告", () => {
  let warn: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetModules();
    warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    warn.mockRestore();
  });

  it("ステージへ紐付かない place を1回だけ警告する", async () => {
    const { warnUnresolvedStagePlaces } = await import("@/lib/timetable");
    warnUnresolvedStagePlaces(day1Events);
    warnUnresolvedStagePlaces(day1Events);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("【TEST】テストステージ会場");
  });

  it("本番では警告しない", async () => {
    // process.env.NODE_ENV への直接代入は readonly 宣言により型エラーになる
    vi.stubEnv("NODE_ENV", "production");
    const { warnUnresolvedStagePlaces } = await import("@/lib/timetable");
    warnUnresolvedStagePlaces(day1Events);

    expect(warn).not.toHaveBeenCalled();
  });

  it("時刻を解釈できない企画を落とすときに警告する", async () => {
    const { filterStageEvents: filter } = await import("@/lib/timetable");
    filter(stageEventFixtures);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("時刻が壊れている企画");
  });

  it("時刻が未入力の企画は黙って落とす", async () => {
    const { filterStageEvents: filter } = await import("@/lib/timetable");
    filter([
      fixture("undecided", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "時刻未定",
        organizer: "テスト",
      }),
    ]);

    expect(warn).not.toHaveBeenCalled();
  });
});
