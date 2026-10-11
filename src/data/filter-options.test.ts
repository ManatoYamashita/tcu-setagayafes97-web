import { describe, expect, it } from "vitest";
import {
  buildings,
  getBuildingLabel,
  getEventBuildings,
  OTHER_BUILDING_ID,
  resolveBuildingId,
  sortBuildingIds,
  typeFilterOptions,
} from "@/data/filter-options";

/**
 * 建物の導出
 *
 * 建物の絞り込みの成否は `place` からの導出だけで決まる。ここで固定するのは**解決の規則**であり、
 * 実データそのものではない（第98回で企画が入れ替わっても規則は変わらない）。
 */
describe("resolveBuildingId", () => {
  it("号館はアリーナより先に判定される（順序が仕様）", () => {
    // 「9号館アリーナ」は 9号館 であって体育館ではない。
    // buildings の並びを入れ替えると、ここが体育館へ倒れて3件が誤配される
    expect(resolveBuildingId("9号館アリーナ")).toBe("9号館");
    expect(resolveBuildingId("９号館アリーナ")).toBe("9号館");
  });

  it("号館を含まないアリーナは体育館へ入れる", () => {
    expect(resolveBuildingId("世田谷キャンパス第１アリーナ　")).toBe("体育館");
  });

  it("ホールを解決する", () => {
    expect(resolveBuildingId("TCUホール")).toBe("ホール");
  });

  it("教室コードは先頭1桁を号館番号として読む", () => {
    expect(resolveBuildingId("11D")).toBe("1号館");
    expect(resolveBuildingId("61C")).toBe("6号館");
  });

  it("屋外の会場をまとめる", () => {
    expect(resolveBuildingId("SAKURA GARDEN")).toBe("屋外");
    expect(resolveBuildingId("テント１")).toBe("屋外");
  });

  it("10号館を1号館より先に判定する", () => {
    expect(resolveBuildingId("10号館 1001教室")).toBe("10号館");
  });

  it("号館番号だけの表記を読む", () => {
    expect(resolveBuildingId("7")).toBe("7号館");
  });

  it("解決できなければ「その他」へ落とし、企画を消さない", () => {
    expect(resolveBuildingId("どこか知らない場所")).toBe(OTHER_BUILDING_ID);
    expect(resolveBuildingId(undefined)).toBe(OTHER_BUILDING_ID);
    expect(resolveBuildingId("")).toBe(OTHER_BUILDING_ID);
  });

  it("数字だけの教室番号も先頭1桁で読む", () => {
    // 英字を伴わない表記で入稿されても拾う。「2026 は弾くのに 100 は 1号館」という
    // 非対称は、歯止めが桁数（3桁 + 英字1文字）だけであることの帰結である
    expect(resolveBuildingId("100")).toBe("1号館");
    expect(resolveBuildingId("999")).toBe("9号館");
  });

  it("年号のような4桁の数字を建物へ吸い込まない", () => {
    expect(resolveBuildingId("2026")).toBe(OTHER_BUILDING_ID);
  });

  it("すべての建物が自分の id で引ける（patterns と id の整合）", () => {
    for (const building of buildings) {
      expect(resolveBuildingId(building.id)).toBe(building.id);
    }
  });
});

describe("getEventBuildings", () => {
  it("buildings が入力されていればそれを返す", () => {
    expect(getEventBuildings({ buildings: ["9号館", "第3アリーナ"], place: "TCUホール" })).toEqual([
      "9号館",
      "第3アリーナ",
    ]);
  });

  it("buildings が空なら place から推定した建物を1つ返す（移行期間の後退経路）", () => {
    expect(getEventBuildings({ buildings: [], place: "９号館アリーナ" })).toEqual(["9号館"]);
    expect(getEventBuildings({ buildings: [], place: "テント１" })).toEqual(["屋外"]);
    expect(getEventBuildings({ buildings: [], place: "どこか" })).toEqual([OTHER_BUILDING_ID]);
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
    expect(sortBuildingIds(["グラウンド", "ホール", "屋外", "図書館", "体育館"])).toEqual([
      "体育館",
      "図書館",
      "屋外",
      "ホール",
      "グラウンド",
    ]);
  });

  it("表に無い名前は「その他」の直前へ、入力の順に並べる（選択肢から消さない）", () => {
    expect(sortBuildingIds(["その他", "Z広場", "体育館", "A広場"])).toEqual([
      "体育館",
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

describe("getBuildingLabel", () => {
  it("建物IDから表示名を返す", () => {
    expect(getBuildingLabel("9号館")).toBe("9号館");
    expect(getBuildingLabel(OTHER_BUILDING_ID)).toBe("その他");
  });
});

describe("typeFilterOptions", () => {
  it("模擬店を選択肢に持つ", () => {
    // 実データに store : 模擬店 が存在する。選択肢から漏れると
    // 正規化で other へ落ちたまま誰も気づけない
    expect(typeFilterOptions.map((option) => option.value)).toContain("store");
  });
});
