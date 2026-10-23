import { describe, expect, it } from "vitest";
import { normalizeInformationCategory } from "@/lib/informations";

/**
 * microCMS の select は `値 : ラベル` 形式で返る。値の部分だけを見て分類することを固定する。
 * 選択肢を足したのに型と判定を足し忘れると、新しいカテゴリは `other` に吸い込まれて
 * どのページにも出ない（#476 で広告掲載・Special Thanks を足したときの前提）。
 */
describe("normalizeInformationCategory", () => {
  it.each([
    ["sponsor : 協賛企業", "sponsor"],
    ["faq : FAQ", "faq"],
    ["ad : 広告掲載", "ad"],
    ["thanks : Special Thanks", "thanks"],
    ["other : その他", "other"],
  ] as const)("%s → %s", (raw, expected) => {
    expect(normalizeInformationCategory([raw])).toBe(expected);
    expect(normalizeInformationCategory(raw)).toBe(expected);
  });

  it("ラベルを書き換えても値で判定する", () => {
    expect(normalizeInformationCategory(["ad : 広告"])).toBe("ad");
  });

  it("未知の値・空は other にする", () => {
    expect(normalizeInformationCategory(["unknown : 不明"])).toBe("other");
    expect(normalizeInformationCategory([])).toBe("other");
    expect(normalizeInformationCategory(undefined)).toBe("other");
  });
});
