import { describe, expect, it } from "vitest";
import { pickAd, shouldShowMobileAdDock } from "@/lib/ad-placements";

/** モバイルの固定バナーを出すページ（#481） */
describe("shouldShowMobileAdDock", () => {
  it.each([
    ["/", false],
    ["/en", false],
    ["/special/special-event-mon7a", false],
    ["/special/special-event-mon7a/", false],
    ["/events", true],
    ["/events/abc", true],
    ["/special", true],
    ["/about/sponsors", true],
    ["/en/about", true],
    ["/ko/access", true],
  ] as const)("%s → %s", (pathname, expected) => {
    expect(shouldShowMobileAdDock(pathname)).toBe(expected);
  });
});

describe("pickAd", () => {
  it("空なら null", () => {
    expect(pickAd([], 0.5)).toBeNull();
  });

  it("乱数の両端で先頭と末尾を選ぶ", () => {
    expect(pickAd(["a", "b", "c"], 0)).toBe("a");
    expect(pickAd(["a", "b", "c"], 0.999)).toBe("c");
  });

  it("範囲外の値でも配列の外を指さない", () => {
    expect(pickAd(["a", "b"], 1)).toBe("b");
    expect(pickAd(["a", "b"], -0.1)).toBe("a");
  });
});
