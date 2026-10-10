import { describe, expect, it } from "vitest";
import { splitUnbreakable } from "@/lib/line-break";

const join = (text: string) =>
  splitUnbreakable(text)
    .map((segment) => segment.text)
    .join("");

describe("splitUnbreakable", () => {
  it("「第97回」をひとかたまりにする（#438 で割れたタイトル）", () => {
    expect(splitUnbreakable("MON7A - 東京都市大学　第97回世田谷祭『TOSHI MUSIC 2026』")).toEqual([
      { text: "MON7A - 東京都市大学　", keepTogether: false },
      { text: "第97回", keepTogether: true },
      { text: "世田谷祭『TOSHI MUSIC 2026』", keepTogether: false },
    ]);
  });

  it("全角数字と助数詞の無い形も対象にする", () => {
    expect(splitUnbreakable("第９７回")).toEqual([{ text: "第９７回", keepTogether: true }]);
    expect(splitUnbreakable("第3")).toEqual([{ text: "第3", keepTogether: true }]);
  });

  it("複数あればそれぞれ包む", () => {
    expect(splitUnbreakable("第1弾と第2弾").filter((segment) => segment.keepTogether)).toEqual([
      { text: "第1弾", keepTogether: true },
      { text: "第2弾", keepTogether: true },
    ]);
  });

  it("数字の続かない「第」は対象にしない", () => {
    expect(splitUnbreakable("第一回・次第")).toEqual([
      { text: "第一回・次第", keepTogether: false },
    ]);
  });

  it("連結すると元のテキストに戻り、空の区間を返さない", () => {
    for (const text of ["", "お知らせ", "第97回", "第97回世田谷祭 第2弾", "前置き第1回"]) {
      expect(join(text)).toBe(text);
      expect(splitUnbreakable(text).every((segment) => segment.text.length > 0)).toBe(true);
    }
  });
});
