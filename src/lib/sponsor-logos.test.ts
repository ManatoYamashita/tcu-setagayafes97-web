import { describe, expect, it } from "vitest";
import { SPONSOR_LOGO_HEIGHT, toSponsorLogos } from "@/lib/sponsor-logos";
import type { Information } from "@/types/informations";

function sponsor(id: string, image?: Information["image"]): Information {
  return {
    id,
    createdAt: "2026-09-01T00:00:00.000Z",
    updatedAt: "2026-09-01T00:00:00.000Z",
    category: "sponsor",
    title: `協賛${id}`,
    image,
  };
}

/**
 * ロゴ帯の契約
 *
 * 画像の有無で協賛を捨てないこと、並びを変えないことを固定する（#332）。
 */
describe("toSponsorLogos", () => {
  it("画像の無い協賛も捨てず、入力の順序を保つ", () => {
    const logos = toSponsorLogos([
      sponsor("a", { url: "https://example.com/a.png", width: 200, height: 100 }),
      sponsor("b"),
      sponsor("c", { url: "https://example.com/c.png", width: 100, height: 100 }),
    ]);

    expect(logos.map((logo) => [logo.sponsor.id, logo.kind])).toEqual([
      ["a", "image"],
      ["b", "text"],
      ["c", "image"],
    ]);
  });

  it("url が空の画像は文字ロゴにする", () => {
    expect(toSponsorLogos([sponsor("a", { url: "" })])[0].kind).toBe("text");
  });

  it("表示幅は縦横比を保ってロゴ帯の高さへ合わせる", () => {
    const [logo] = toSponsorLogos([
      sponsor("a", { url: "https://example.com/a.png", width: 300, height: 100 }),
    ]);

    expect(logo).toMatchObject({ kind: "image", displayWidth: 3 * SPONSOR_LOGO_HEIGHT });
  });

  it("寸法が欠けた画像は正方形として扱う（NaN にしない）", () => {
    const [logo] = toSponsorLogos([sponsor("a", { url: "https://example.com/a.png" })]);

    expect(logo).toMatchObject({ kind: "image", displayWidth: SPONSOR_LOGO_HEIGHT });
  });

  it("空配列は空配列を返す", () => {
    expect(toSponsorLogos([])).toEqual([]);
  });
});
