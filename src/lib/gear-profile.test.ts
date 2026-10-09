import { describe, expect, it } from "vitest";
import { GEAR_PROFILE, gearCornerPoints } from "@/lib/gear-profile";

describe("gearCornerPoints", () => {
  it("1歯4点で、歯数の4倍の点を返す", () => {
    expect(gearCornerPoints()).toHaveLength(GEAR_PROFILE.teeth * 4);
    expect(gearCornerPoints({ teeth: 12 })).toHaveLength(48);
  });

  it("点は内径と外径の上に交互に2点ずつ並ぶ", () => {
    const radii = gearCornerPoints().map(([x, y]) => Math.hypot(x, y));
    radii.forEach((radius, i) => {
      const expected =
        i % 4 === 1 || i % 4 === 2 ? GEAR_PROFILE.outerRadius : GEAR_PROFILE.innerRadius;
      expect(radius).toBeCloseTo(expected, 10);
    });
  });
});
