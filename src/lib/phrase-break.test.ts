import { describe, expect, it } from "vitest";
import { splitPhrases } from "@/lib/phrase-break";

describe("splitPhrases", () => {
  it("連結すると元のテキストに戻る", () => {
    const text = "カレッジフェスタコレクションの出演者が決定しました";
    expect(splitPhrases(text).join("")).toBe(text);
  });

  it("助詞の後ろで区切る", () => {
    expect(splitPhrases("雨天時の企画変更について")).toEqual(["雨天時の", "企画変更に", "ついて"]);
  });

  it("名詞の連なりは区切らない（「東京都市大 / 学」「第 / 97回」で折らせない）", () => {
    expect(splitPhrases("東京都市大学第97回世田谷祭")).toEqual(["東京都市大学第97回世田谷祭"]);
  });

  it("空文字は空配列にする", () => {
    expect(splitPhrases("")).toEqual([]);
  });
});
