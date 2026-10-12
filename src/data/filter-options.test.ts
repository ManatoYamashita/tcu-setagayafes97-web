import { describe, expect, it } from "vitest";
import {
  getEventBuildings,
  OTHER_BUILDING_ID,
  sortBuildingIds,
  typeFilterOptions,
} from "@/data/filter-options";

describe("getEventBuildings", () => {
  it("buildings の値をそのまま返す", () => {
    expect(getEventBuildings({ buildings: ["9号館", "第3アリーナ"] })).toEqual([
      "9号館",
      "第3アリーナ",
    ]);
  });

  it("buildings が空なら「その他」を返し、企画を選択肢から消さない", () => {
    expect(getEventBuildings({ buildings: [] })).toEqual([OTHER_BUILDING_ID]);
  });

  it("buildings が欠けた企画（normalizeEvent を通らないデータ）でも例外にしない", () => {
    expect(getEventBuildings({} as { buildings: string[] })).toEqual([OTHER_BUILDING_ID]);
  });
});

describe("sortBuildingIds", () => {
  it("号館を文字列ではなく数字の順に並べる", () => {
    expect(sortBuildingIds(["10号館", "9号館", "1号館"])).toEqual(["1号館", "9号館", "10号館"]);
  });

  it("第Nアリーナを号館の後に数字の順で並べる", () => {
    expect(sortBuildingIds(["第3アリーナ", "第1アリーナ", "9号館", "第2アリーナ"])).toEqual([
      "9号館",
      "第1アリーナ",
      "第2アリーナ",
      "第3アリーナ",
    ]);
  });

  it("名前の付いた場所は表の順に並べる", () => {
    expect(sortBuildingIds(["グラウンド", "ホール", "屋外", "図書館"])).toEqual([
      "図書館",
      "屋外",
      "ホール",
      "グラウンド",
    ]);
  });

  it("表に無い名前は「その他」の直前へ、入力の順に並べる（選択肢から消さない）", () => {
    expect(sortBuildingIds(["その他", "Z広場", "図書館", "A広場"])).toEqual([
      "図書館",
      "Z広場",
      "A広場",
      "その他",
    ]);
  });

  it("入力の配列を変更しない", () => {
    const input = ["10号館", "9号館"];
    sortBuildingIds(input);
    expect(input).toEqual(["10号館", "9号館"]);
  });
});

describe("typeFilterOptions", () => {
  it("模擬店を選択肢に持つ", () => {
    // 実データに store : 模擬店 が存在する。選択肢から漏れると
    // 正規化で other へ落ちたまま誰も気づけない
    expect(typeFilterOptions.map((option) => option.value)).toContain("store");
  });
});
