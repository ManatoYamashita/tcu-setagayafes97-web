import { createJapaneseParser } from "@/lib/budoux-ja";
import { describe, expect, it } from "vitest";
import { PHRASE_SEPARATOR as SEP, insertPhraseBreaks, stripPhraseBreaks } from "@/lib/phrase-break";

const parser = createJapaneseParser();
const apply = (text: string) => insertPhraseBreaks(text, (value) => parser.parse(value));

describe("insertPhraseBreaks", () => {
  it("助詞の後ろへ区切りを入れる", () => {
    expect(apply("雨天時の企画変更について")).toBe(`雨天時の${SEP}企画変更に${SEP}ついて`);
  });

  it("名詞の連なりは区切らない（「東京都市大 / 学」「第 / 97回」で折らせない）", () => {
    expect(apply("MON7A - 東京都市大学　第97回世田谷祭")).toBe(
      "MON7A - 東京都市大学　第97回世田谷祭"
    );
  });

  it("何度適用しても結果が変わらない", () => {
    const once = apply("カレッジフェスタコレクションの出演者が決定しました");
    expect(apply(once)).toBe(once);
  });

  it("外すと元の文字列に戻る", () => {
    const text = "今年の世田谷祭は10月31日と11月1日に開催します";
    expect(stripPhraseBreaks(apply(text))).toBe(text);
  });

  it("日本語を含まない文字列には触れない", () => {
    const parse = () => {
      throw new Error("呼ばれてはいけない");
    };
    expect(insertPhraseBreaks("TOSHI MUSIC 2026", parse)).toBe("TOSHI MUSIC 2026");
    expect(insertPhraseBreaks("", parse)).toBe("");
  });
});
