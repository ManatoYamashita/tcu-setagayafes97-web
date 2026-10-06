import { describe, expect, it } from "vitest";
import { GEAR_PROFILE, gearClipPath, gearCornerPoints } from "@/lib/gear-profile";

/** `polygon(10% 20%, …)` を数値の組へ戻す */
function parsePolygon(value: string): Array<[number, number]> {
  const body = value.match(/^polygon\((.*)\)$/)?.[1];
  if (!body) throw new Error(`polygon ではありません: ${value}`);
  return body.split(", ").map((pair) => {
    const [x, y] = pair.split(" ").map((v) => Number.parseFloat(v));
    return [x, y];
  });
}

const distanceFromCenter = ([x, y]: [number, number]) => Math.hypot(x - 50, y - 50);

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

describe("gearClipPath", () => {
  it("既定では外径が箱の辺に接し、全点が箱の中に収まる", () => {
    const points = parsePolygon(gearClipPath());
    expect(points).toHaveLength(GEAR_PROFILE.teeth * 4);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(100);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(100);
    }
    const maxRadius = Math.max(...points.map(distanceFromCenter));
    expect(maxRadius).toBeCloseTo(50, 2);
  });

  it("回転 0 では歯が真上を向く（真上の点が外径にある）", () => {
    const points = parsePolygon(gearClipPath());
    const top = points.filter(([, y]) => y < 1);
    expect(top).toHaveLength(2);
    // 真上の歯の歯先2点は左右対称に並ぶ
    expect(top[0][0] + top[1][0]).toBeCloseTo(100, 2);
  });

  it("scale 0 では全点が中心に潰れる（リビールの開始形）", () => {
    for (const point of parsePolygon(gearClipPath({ scale: 0 }))) {
      expect(point).toEqual([50, 50]);
    }
  });

  it("回転しても点の数と中心からの距離は変わらない", () => {
    const base = parsePolygon(gearClipPath()).map(distanceFromCenter);
    const rotated = parsePolygon(gearClipPath({ rotationDeg: -37 })).map(distanceFromCenter);
    expect(rotated).toHaveLength(base.length);
    rotated.forEach((radius, i) => expect(radius).toBeCloseTo(base[i], 2));
  });
});
