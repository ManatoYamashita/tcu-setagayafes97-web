import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  countDistinctEvents,
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

const ids = (events: Pick<Event, "id">[]): string[] => events.map((event) => event.id);

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

describe("filterStageEvents の開催枠の展開（#281）", () => {
  const blocks = stageEvents.filter((entry) => entry.id === "fx-hall-2");

  it("2部制の企画を開催枠ごとの2ブロックにする", () => {
    // 1ブロックにまとめると、空き時間の 11:25〜14:45 まで盤面を占める
    expect(blocks.map((entry) => [entry.startTime, entry.endTime])).toEqual([
      ["10:40", "11:25"],
      ["14:45", "15:45"],
    ]);
  });

  it("ブロックごとに一意の key と「第n部」を持たせる", () => {
    expect(blocks.map((entry) => entry.entryKey)).toEqual(["fx-hall-2#0", "fx-hall-2#1"]);
    expect(blocks.map((entry) => entry.sessionLabel)).toEqual(["第1部", "第2部"]);

    const keys = stageEvents.map((entry) => entry.entryKey);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("1枠の企画には「第1部」を付けない", () => {
    const single = stageEvents.find((entry) => entry.id === "fx-7a-1");
    expect(single?.sessionLabel).toBeUndefined();
  });

  it("読めない枠だけを落とし、同じ企画の他の枠は残す", () => {
    const entries = filterStageEvents([
      fixture("half-broken", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "片方が壊れた2部制",
        organizer: "テスト",
        sessions: [
          { startTime: "10:00", endTime: "11:00" },
          { startTime: "1400", endTime: "15:00" },
        ],
      }),
    ]);

    expect(entries.map((entry) => entry.entryKey)).toEqual(["half-broken#0"]);
    // 呼び名は元の枠の数で決まる。落ちた枠があっても「第1部」のまま
    expect(entries[0].sessionLabel).toBe("第1部");
  });
});

describe("filterStageEvents の日程つき開催枠（#305）", () => {
  // 両日開催で、日ごとに終了が違う企画（実データの Jazz Festival）
  const perDay = fixture("per-day", {
    date: "both",
    type: "stage",
    place: "中庭",
    title: "日ごとに時刻が違う企画",
    organizer: "検証用",
    sessions: [
      { date: "day1", startTime: "11:00", endTime: "16:00" },
      { date: "day2", startTime: "11:00", endTime: "15:00" },
    ],
  });
  const entries = filterStageEvents([perDay]);

  it("枠ごとに、その日だけのブロックにする", () => {
    expect(filterEventsByDate(entries, "day1").map((entry) => entry.endTime)).toEqual(["16:00"]);
    expect(filterEventsByDate(entries, "day2").map((entry) => entry.endTime)).toEqual(["15:00"]);
  });

  it("各日1枠なので「第n部」を付けず、各日1企画と数える", () => {
    expect(entries.map((entry) => entry.sessionLabel)).toEqual([undefined, undefined]);
    expect(countDistinctEvents(filterEventsByDate(entries, "day2"))).toBe(1);
  });
});

describe("countDistinctEvents", () => {
  it("2部制の企画をブロック数ではなく1企画として数える", () => {
    const hall = filterEventsByStage(day1Events, "ホール");
    expect(hall.map((entry) => entry.id).sort()).toEqual(["fx-hall-1", "fx-hall-2", "fx-hall-2"]);
    expect(countDistinctEvents(hall)).toBe(2);
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

  it("アリーナ表記と体育館表記を同じステージで絞り込む", () => {
    const arenaEvent = fixture("arena", {
      date: "day1",
      type: "stage",
      place: "アリーナ",
      title: "アリーナ企画",
      organizer: "実行委員会",
      startTime: "10:00",
      endTime: "11:00",
    });
    const events = [...day1Events, ...filterStageEvents([arenaEvent])];
    expect(ids(filterEventsByStage(events, "体育館"))).toEqual(["fx-gym-1", "fx-gym-2", "arena"]);
    expect(groupEventsByStage(events).find((group) => group.id === "体育館")?.name).toBe(
      "アリーナ"
    );
    expect(listStageTabs(events, "all").find((tab) => tab.id === "体育館")?.name).toBe("アリーナ");
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
    const entries = filterStageEvents(unsorted);
    const before = ids(entries);
    const groups = groupEventsByStage(entries);

    expect(ids(groups[0].events)).toEqual(["earlier", "later"]); // 出力は並べ替わる
    expect(ids(entries)).toEqual(before); // 入力は動かない
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

  it("2部制の読めない枠は、どの部かを添えて警告する", async () => {
    const { filterStageEvents: filter } = await import("@/lib/timetable");
    filter([
      fixture("half-broken", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "片方が壊れた2部制",
        organizer: "テスト",
        sessions: [
          { startTime: "10:00", endTime: "11:00" },
          { startTime: "1400", endTime: "15:00" },
        ],
      }),
    ]);

    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("片方が壊れた2部制」の第2部");
  });

  it("開始の無い枠は警告して落とし、残った1枠に「第1部」を付けない", async () => {
    const { filterStageEvents: filter } = await import("@/lib/timetable");
    const entries = filter([
      fixture("end-only", {
        date: "day1",
        type: "stage",
        place: "7A",
        title: "開始が抜けた2枠目",
        organizer: "テスト",
        sessions: [
          { startTime: "10:00", endTime: "11:00" },
          { startTime: "", endTime: "15:00" },
        ],
      }),
    ]);

    // 詳細ページにも1枠しか出ないので、呼び名は付けない（詳細ページと揃える）
    expect(entries.map((entry) => entry.sessionLabel)).toEqual([undefined]);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain("開始が抜けた2枠目");
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
