import { describe, expect, it } from "vitest";
import {
  filterEvents,
  generatePageNumbers,
  getTotalPages,
  paginateEvents,
  type FilterParams,
} from "@/lib/filters";
import { fixture } from "@/components/timetable/__fixtures__/stage-events";
import type { Event } from "@/types/events";

const ids = (events: Event[]): string[] => events.map((event) => event.id);

/**
 * `/events` の絞り込み用データ
 *
 * `date` は day1 / day2 / both / other を1件ずつ持たせている。
 * 「両日開催」を独立した選択肢として扱う契約を検証するため。
 */
const events: Event[] = [
  fixture("ev-day1", {
    date: "day1",
    type: "room",
    place: "1101教室",
    building: "1号館",
    title: "化学実験ショー",
    organizer: "化学部",
    description: "身近な材料でできる実験を披露します。",
  }),
  fixture("ev-day2", {
    date: "day2",
    type: "stage",
    place: "7A ステージ",
    building: "7号館",
    title: "Jazz Live",
    organizer: "ジャズ研究会",
    description: "スタンダードナンバーを演奏します。",
  }),
  fixture("ev-both", {
    date: "both",
    type: "room",
    place: "2201教室",
    building: "2号館",
    title: "鉄道模型展示",
    organizer: "鉄道研究会",
    description: "ジオラマの走行展示を行います。",
  }),
  fixture("ev-other", {
    date: "other",
    type: "special",
    place: "体育館 メインアリーナ",
    building: "体育館",
    title: "前夜祭",
    organizer: "実行委員会",
    description: "前日の限定企画です。",
  }),
];

describe("filterEvents", () => {
  it("フィルタ未指定なら全件返す", () => {
    expect(ids(filterEvents(events, {}))).toEqual(ids(events));
  });

  it('"all" は素通しする', () => {
    const filters: FilterParams = { date: "all", type: "all", building: "all", keyword: "" };
    expect(ids(filterEvents(events, filters))).toEqual(ids(events));
  });

  it("date を厳密一致で扱い、両日開催を1日目に含めない", () => {
    // /events は dateFilterOptions に「両日開催」を独立した選択肢として持つ。
    // Day1 / Day2 のタブしか無い /timetable の filterEventsByDate() が
    // "both" を両方へ出すのとは、意図的に異なる契約である。
    expect(ids(filterEvents(events, { date: "day1" }))).toEqual(["ev-day1"]);
    expect(ids(filterEvents(events, { date: "day2" }))).toEqual(["ev-day2"]);
    expect(ids(filterEvents(events, { date: "both" }))).toEqual(["ev-both"]);
    expect(ids(filterEvents(events, { date: "other" }))).toEqual(["ev-other"]);
  });

  it("type と building も厳密一致で扱う", () => {
    expect(ids(filterEvents(events, { type: "room" }))).toEqual(["ev-day1", "ev-both"]);
    expect(ids(filterEvents(events, { building: "7号館" }))).toEqual(["ev-day2"]);
  });

  it("キーワードが5つのフィールドを横断する", () => {
    expect(ids(filterEvents(events, { keyword: "化学実験ショー" }))).toEqual(["ev-day1"]); // title
    expect(ids(filterEvents(events, { keyword: "ジャズ研究会" }))).toEqual(["ev-day2"]); // organizer
    expect(ids(filterEvents(events, { keyword: "ジオラマ" }))).toEqual(["ev-both"]); // description
    expect(ids(filterEvents(events, { keyword: "メインアリーナ" }))).toEqual(["ev-other"]); // place
    expect(ids(filterEvents(events, { keyword: "2号館" }))).toEqual(["ev-both"]); // building
  });

  it("キーワードの大文字小文字を無視する", () => {
    expect(ids(filterEvents(events, { keyword: "jazz" }))).toEqual(["ev-day2"]);
    expect(ids(filterEvents(events, { keyword: "JAZZ" }))).toEqual(["ev-day2"]);
  });

  it("該当が無ければ空配列を返す", () => {
    expect(filterEvents(events, { keyword: "存在しない語" })).toEqual([]);
  });

  it("複数の条件を AND で適用する", () => {
    expect(ids(filterEvents(events, { type: "room", building: "2号館" }))).toEqual(["ev-both"]);
    // 単独では該当するが、組み合わせると該当しない
    expect(filterEvents(events, { type: "room", building: "7号館" })).toEqual([]);
  });

  it("引数の配列を破壊しない", () => {
    const before = ids(events);
    filterEvents(events, { date: "day1", keyword: "化学" });
    expect(ids(events)).toEqual(before);
  });
});

describe("getTotalPages", () => {
  it("件数と1ページあたりの表示数から総ページ数を出す", () => {
    expect(getTotalPages(0, 12)).toBe(0);
    expect(getTotalPages(1, 12)).toBe(1);
    expect(getTotalPages(12, 12)).toBe(1);
    expect(getTotalPages(13, 12)).toBe(2);
  });
});

describe("paginateEvents", () => {
  /** ページ分割の検証にだけ使う連番データ */
  const items: Event[] = Array.from({ length: 30 }, (_, index) =>
    fixture(`item-${index + 1}`, {
      date: "day1",
      type: "room",
      place: "教室",
      title: `企画 ${index + 1}`,
      organizer: "テスト",
    })
  );

  it("1ページ目を切り出す", () => {
    expect(ids(paginateEvents(items, 1, 12))).toEqual(ids(items.slice(0, 12)));
  });

  it("最終ページの端数を切り出す", () => {
    const lastPage = paginateEvents(items, 3, 12);
    expect(lastPage).toHaveLength(6);
    expect(ids(lastPage)).toEqual(ids(items.slice(24)));
  });

  it("総ページ数を超えたページは空配列を返す", () => {
    expect(paginateEvents(items, 4, 12)).toEqual([]);
    expect(paginateEvents(items, 999, 12)).toEqual([]);
  });

  it("1未満のページは空配列を返す", () => {
    // page は URL から検証なしに入る。始点が負のまま slice へ渡すと
    // 末尾からの相対位置として解釈され、別のページが返る（#162）
    expect(paginateEvents(items, 0, 12)).toEqual([]);
    expect(paginateEvents(items, -1, 12)).toEqual([]);
    expect(paginateEvents(items, -2, 12)).toEqual([]);
  });

  it("小数のページを切り捨てる", () => {
    // ?page=1.5 が slice(6, 18) という半端な窓を返さないこと
    expect(ids(paginateEvents(items, 1.5, 12))).toEqual(ids(paginateEvents(items, 1, 12)));
  });

  it("全ページを連結すると元の配列に戻る（欠けも重複も無い）", () => {
    const perPage = 12;
    const totalPages = getTotalPages(items.length, perPage);
    const joined = Array.from({ length: totalPages }, (_, index) =>
      paginateEvents(items, index + 1, perPage)
    ).flat();

    expect(ids(joined)).toEqual(ids(items));
  });

  it("引数の配列を破壊しない", () => {
    const before = ids(items);
    paginateEvents(items, 2, 12);
    expect(ids(items)).toEqual(before);
  });
});

describe("generatePageNumbers", () => {
  const MAX_PAGES = 7;

  it("総ページ数が上限以下なら全ページを返す", () => {
    expect(generatePageNumbers(1, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(generatePageNumbers(1, MAX_PAGES)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("ページが無ければ空配列を返す", () => {
    expect(generatePageNumbers(1, 0)).toEqual([]);
  });

  it("先頭付近では窓を左端に寄せる", () => {
    expect(generatePageNumbers(1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(generatePageNumbers(4, 10)).toEqual([1, 2, 3, 4, 5, 6, 7]); // 左寄せの境界
  });

  it("中央では現在ページを挟む", () => {
    expect(generatePageNumbers(5, 10)).toEqual([2, 3, 4, 5, 6, 7, 8]);
  });

  it("末尾付近では窓を右端に寄せる", () => {
    expect(generatePageNumbers(7, 10)).toEqual([4, 5, 6, 7, 8, 9, 10]); // 右寄せの境界
    expect(generatePageNumbers(10, 10)).toEqual([4, 5, 6, 7, 8, 9, 10]);
  });

  it("範囲外の現在ページでも妥当な窓を返す", () => {
    // currentPage は URL から検証なしに入るため、範囲外でも壊れないこと
    expect(generatePageNumbers(0, 10)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(generatePageNumbers(-1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(generatePageNumbers(15, 10)).toEqual([4, 5, 6, 7, 8, 9, 10]);
  });

  it("総ページ数1〜40の全組み合わせで4つの不変条件を満たす", () => {
    for (let totalPages = 1; totalPages <= 40; totalPages++) {
      for (let currentPage = 1; currentPage <= totalPages; currentPage++) {
        const pages = generatePageNumbers(currentPage, totalPages);
        const label = `(currentPage=${currentPage}, totalPages=${totalPages})`;

        expect(pages, `長さ ${label}`).toHaveLength(Math.min(totalPages, MAX_PAGES));
        expect(
          pages.every((page, index) => index === 0 || page === pages[index - 1] + 1),
          `昇順の連続 ${label}`
        ).toBe(true);
        expect(pages, `現在ページを含む ${label}`).toContain(currentPage);
        expect(
          pages.every((page) => page >= 1 && page <= totalPages),
          `範囲内 ${label}`
        ).toBe(true);
      }
    }
  });
});
