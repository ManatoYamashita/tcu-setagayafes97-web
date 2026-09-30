import { describe, expect, it } from "vitest";
import type { Information } from "@/types/informations";
import { groupSponsorsForList, hasSponsorDetails } from "./sponsor-list";

function sponsor(id: string, extra: Partial<Information> = {}): Information {
  return {
    id,
    createdAt: "2026-09-30T00:00:00.000Z",
    updatedAt: "2026-09-30T00:00:00.000Z",
    category: "sponsor",
    title: `協賛${id}`,
    ...extra,
  };
}

/**
 * 協賛・協力ページの振り分けを固定する（#337）。
 * 1件も捨てないこと、各群で順序を変えないことが契約。
 */
describe("groupSponsorsForList", () => {
  it("画像・説明・URL のいずれかがあれば詳細ありに入れる", () => {
    expect(hasSponsorDetails(sponsor("a", { description: "説明" }))).toBe(true);
    expect(hasSponsorDetails(sponsor("b", { url: "https://example.com" }))).toBe(true);
    expect(
      hasSponsorDetails(sponsor("c", { image: { url: "https://images.microcms-assets.io/x.png" } }))
    ).toBe(true);
    expect(hasSponsorDetails(sponsor("d"))).toBe(false);
    expect(hasSponsorDetails(sponsor("e", { description: "", url: "" }))).toBe(false);
  });

  it("1件も捨てず、各群で入力の順序を保つ", () => {
    const input = [
      sponsor("1"),
      sponsor("2", { url: "https://example.com/2" }),
      sponsor("3"),
      sponsor("4", { description: "説明" }),
      sponsor("5"),
    ];
    const { detailed, nameOnly } = groupSponsorsForList(input);
    expect(detailed.map((s) => s.id)).toEqual(["2", "4"]);
    expect(nameOnly.map((s) => s.id)).toEqual(["1", "3", "5"]);
    expect(detailed.length + nameOnly.length).toBe(input.length);
  });
});
