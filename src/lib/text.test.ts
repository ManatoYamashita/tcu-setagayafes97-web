import { describe, expect, it } from "vitest";
import { normalizeText, stripHtml } from "@/lib/text";

/**
 * 正規化の契約
 *
 * ここで固定するのは「どの揺れを同一視するか」であり、実データそのものではない。
 * 第98回で企画が総入れ替えされてもこの表は変わらない。
 */
describe("normalizeText", () => {
  it("全角数字と半角数字を同一視する（実データに両方ある）", () => {
    expect(normalizeText("９号館アリーナ")).toBe(normalizeText("9号館アリーナ"));
  });

  it("カタカナとひらがなを同一視する", () => {
    expect(normalizeText("ダンス")).toBe(normalizeText("だんす"));
  });

  it("半角カナを全角カナと同一視する", () => {
    expect(normalizeText("ﾎｰﾙ")).toBe(normalizeText("ホール"));
  });

  it("英大文字と小文字を同一視する", () => {
    expect(normalizeText("SAKURA GARDEN")).toBe(normalizeText("sakura garden"));
  });

  it("前後の空白を落とす（全角空白を含む）", () => {
    expect(normalizeText("世田谷キャンパス第１アリーナ　")).toBe(
      normalizeText("世田谷キャンパス第1アリーナ")
    );
  });

  it("長音符の有無を同一視する", () => {
    expect(normalizeText("ホール")).toBe(normalizeText("ホル"));
  });

  it("欠落フィールドを空文字にする（#166 の再発防止）", () => {
    // microCMS は未入力フィールドをキーごと返さない。呼び出し側へ ?. を撒く代わりに
    // ここで吸収する契約になっている
    expect(normalizeText(undefined)).toBe("");
    expect(normalizeText(null)).toBe("");
    expect(normalizeText("")).toBe("");
  });

  it("語の中の空白は1つに畳んで残す", () => {
    expect(normalizeText("SAKURA   GARDEN")).toBe("sakura garden");
  });
});

describe("stripHtml", () => {
  it("タグを落として本文だけを残す", () => {
    expect(stripHtml("<p>ダンス<br>ステージ</p>")).toBe("ダンス ステージ");
  });

  it("タグ名が検索に引っかからない", () => {
    // タグを残すと "a" や "p" の1文字検索が全件にヒットする
    expect(stripHtml('<a href="https://example.com">詳細</a>')).toBe("詳細");
  });

  it("主要な実体参照を戻す", () => {
    expect(stripHtml("A&amp;B&nbsp;C")).toBe("A&B C");
  });

  it("未入力を空文字にする", () => {
    expect(stripHtml(undefined)).toBe("");
  });
});
