import { describe, expect, it } from "vitest";
import type { Information } from "@/types/informations";
import { hasSponsorDetails } from "./sponsor-list";

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

/** 協賛・協力ページでタイルを押せるかの判定を固定する（#371） */
describe("hasSponsorDetails", () => {
  it("画像・説明・URL のいずれかがあれば押せる", () => {
    expect(hasSponsorDetails(sponsor("a", { description: "説明" }))).toBe(true);
    expect(hasSponsorDetails(sponsor("b", { url: "https://example.com" }))).toBe(true);
    expect(
      hasSponsorDetails(sponsor("c", { image: { url: "https://images.microcms-assets.io/x.png" } }))
    ).toBe(true);
    expect(hasSponsorDetails(sponsor("d"))).toBe(false);
    expect(hasSponsorDetails(sponsor("e", { description: "", url: "" }))).toBe(false);
  });
});
