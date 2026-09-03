import { describe, expect, it } from "vitest";
import {
  stages,
  extractStageId,
  resolveStageId,
  isKnownStageId,
  getStageName,
  OTHER_STAGE_ID,
  OTHER_STAGE_NAME,
} from "@/data/stages";

/**
 * ステージ解決の不変条件
 *
 * 期待値は可能なかぎり `stages` から導出しています。第98回で会場が入れ替わっても、
 * 「不変条件が壊れたときだけ」落ちるようにするためです。
 */
describe("extractStageId", () => {
  it("place に id が含まれていれば、その id を返す", () => {
    expect(extractStageId("7A ステージ")).toBe("7A");
    expect(extractStageId("体育館 メインアリーナ")).toBe("体育館");
  });

  it("id の完全一致を name の部分一致より優先する", () => {
    // "中庭特設ステージ" は id "中庭" と name "中庭特設ステージ" の両方に一致するが、
    // 探索順により id 側で解決される
    expect(extractStageId("中庭特設ステージ")).toBe("中庭");
  });

  it("どのステージにも一致しなければ null を返す", () => {
    expect(extractStageId("【TEST】テストステージ会場")).toBeNull();
    expect(extractStageId("")).toBeNull();
  });

  it("すべてのステージについて、name から id を復元できる", () => {
    for (const stage of stages) {
      expect(extractStageId(stage.name)).toBe(stage.id);
    }
  });
});

describe("resolveStageId", () => {
  it("一致しない place を「その他」へ落とす（企画が消える経路が無い）", () => {
    expect(resolveStageId("【TEST】テストステージ会場")).toBe(OTHER_STAGE_ID);
    expect(resolveStageId("")).toBe(OTHER_STAGE_ID);
  });

  it("すべてのステージについて id をそのまま解決する", () => {
    for (const stage of stages) {
      expect(resolveStageId(stage.id)).toBe(stage.id);
    }
  });
});

describe("isKnownStageId", () => {
  it("実在するステージと「その他」を通す", () => {
    expect(isKnownStageId(OTHER_STAGE_ID)).toBe(true);
    for (const stage of stages) {
      expect(isKnownStageId(stage.id)).toBe(true);
    }
  });

  it("実在しないIDを弾く", () => {
    // URL のクエリがそのままタブのラベルになるのを防ぐための関門
    expect(isKnownStageId("存在しないID")).toBe(false);
    expect(isKnownStageId("all")).toBe(false);
    expect(isKnownStageId("")).toBe(false);
  });
});

describe("getStageName", () => {
  it("「その他」の名前を返す", () => {
    expect(getStageName(OTHER_STAGE_ID)).toBe(OTHER_STAGE_NAME);
  });

  it("未知のIDをそのまま返す", () => {
    // この挙動があるからこそ、外部由来の文字列は isKnownStageId で弾く必要がある
    expect(getStageName("未知のステージ")).toBe("未知のステージ");
  });
});

describe("stages の定義", () => {
  it("「その他」を会場一覧へ混ぜない", () => {
    // stages は「実在する会場」の定義。混ぜると会場一覧として読む箇所へ
    // 実在しない会場が漏れる
    expect(stages.every((stage) => stage.id !== OTHER_STAGE_ID)).toBe(true);
  });

  it("id が一意である", () => {
    const ids = stages.map((stage) => stage.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
