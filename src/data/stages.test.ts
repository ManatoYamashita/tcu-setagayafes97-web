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

  it("アリーナ表記を、号館の有無にかかわらず体育館と同じステージへ解決する", () => {
    expect(extractStageId("アリーナ")).toBe("体育館");
    expect(extractStageId("世田谷キャンパス第１アリーナ")).toBe("体育館");
    // 実データの入稿表記（#302）。号館を理由に外すと「その他」へ落ち、アリーナのタブが出ない
    expect(extractStageId("9号館アリーナ")).toBe("体育館");
    expect(extractStageId("９号館アリーナ")).toBe("体育館");
  });

  it("実データの place をパンフレットの会場へ解決する（#474）", () => {
    // microCMS の入稿表記そのまま。全角数字・号館つき・末尾の全角空白を含む
    expect(extractStageId("７号館１階TCUホール")).toBe("ホール");
    expect(extractStageId("7号館1階TCUホール")).toBe("ホール");
    expect(extractStageId("9号館 体育館(第1アリーナ)　")).toBe("体育館");
    expect(extractStageId("SAKURA GARDEN")).toBe("SAKURA");
    expect(extractStageId("61C")).toBe("61C");
  });

  it("表示名を振り分けに使わない", () => {
    // 表示名で判定すると、見出しの文言を変えただけで企画が「その他」へ落ちる。
    // 「（第1アリーナ）」が「アリーナ」として拾われるのは、表示名ではなく aliases による
    expect(extractStageId("TCU")).toBeNull();
    expect(extractStageId("ガーデン")).toBeNull();
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
  it("パンフレットの表記で表示する（#474）", () => {
    expect(getStageName("ホール")).toBe("TCUホール（7号館）");
    expect(getStageName("体育館")).toBe("体育館（第1アリーナ）");
  });

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

  it("先頭の並びがパンフレットの列順と同じ（#474）", () => {
    // 宣言順がそのまま盤面の列順になる
    expect(stages.slice(0, 4).map((stage) => stage.name)).toEqual([
      "TCUホール（7号館）",
      "体育館（第1アリーナ）",
      "SAKURAガーデン",
      "61C",
    ]);
  });

  it("id が一意である", () => {
    const ids = stages.map((stage) => stage.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
