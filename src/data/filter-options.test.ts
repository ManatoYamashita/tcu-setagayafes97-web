import { describe, expect, it } from "vitest";
import {
  buildings,
  getBuildingLabel,
  isKnownBuildingId,
  OTHER_BUILDING_ID,
  resolveBuildingId,
  typeFilterOptions,
} from "@/data/filter-options";

/**
 * 建物の導出
 *
 * microCMS の `building` は実データ18件すべてで未入力のため、絞り込みの成否は
 * `place` からの導出だけで決まる。ここで固定するのは**解決の規則**であり、
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

  it("building が入稿されていれば place より優先する", () => {
    // 将来 CMS 側を埋めたときに、そちらが勝つ
    expect(resolveBuildingId("TCUホール", "7号館")).toBe("7号館");
  });

  it("building に号館番号だけが入っていても読む", () => {
    // docs/requires/require.md が示す入力例（"7"）に備える
    expect(resolveBuildingId("", "7")).toBe("7号館");
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

describe("isKnownBuildingId", () => {
  it("定義済みの建物と「その他」を受け入れる", () => {
    expect(isKnownBuildingId("9号館")).toBe(true);
    expect(isKnownBuildingId(OTHER_BUILDING_ID)).toBe(true);
  });

  it("未知の値を弾く（URL 直打ちの受け口）", () => {
    expect(isKnownBuildingId("99号館")).toBe(false);
    expect(isKnownBuildingId("all")).toBe(false);
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
