/**
 * サイトの歯車モチーフの輪郭（2D）
 *
 * 3D 歯車（src/components/three/gear-geometry.ts）の歯形を、three に依存しない形で
 * ここへ置いています（単体テストを three なしで回すため）。
 * 著名人企画の写真の切り抜きにも使っていましたが、四角い写真へ戻したため現在は 3D 専用です。
 */

/** 歯形の既定値。半径の単位は 3D 側のワールド座標 */
export const GEAR_PROFILE = {
  teeth: 8,
  outerRadius: 2.0,
  innerRadius: 1.55,
  /** 1歯ぶんの角度に対する、歯先（外径の円弧）の割合 */
  toothTopRatio: 0.5,
  /** 1歯ぶんの角度に対する、歯底から歯先への立ち上がりの割合 */
  toothGapRatio: 0.045,
} as const;

export type GearPoint = readonly [x: number, y: number];

interface GearCornerParams {
  teeth?: number;
  outerRadius?: number;
  innerRadius?: number;
}

/**
 * 歯車の角の座標を返します（中心が原点）。
 *
 * 1歯を「歯底 → 歯先の立ち上がり → 歯先の終わり → 歯底へ戻る」の4点で表すため、
 * 点の数は `teeth * 4` になります。角の丸めは呼び出し側の責任です。
 */
export function gearCornerPoints({
  teeth = GEAR_PROFILE.teeth,
  outerRadius = GEAR_PROFILE.outerRadius,
  innerRadius = GEAR_PROFILE.innerRadius,
}: GearCornerParams = {}): GearPoint[] {
  const anglePerTooth = (Math.PI * 2) / teeth;
  const toothTop = anglePerTooth * GEAR_PROFILE.toothTopRatio;
  const toothGap = anglePerTooth * GEAR_PROFILE.toothGapRatio;
  const at = (radius: number, angle: number): GearPoint => [
    Math.cos(angle) * radius,
    Math.sin(angle) * radius,
  ];

  const points: GearPoint[] = [];
  for (let i = 0; i < teeth; i++) {
    const base = i * anglePerTooth;
    points.push(at(innerRadius, base));
    points.push(at(outerRadius, base + toothGap));
    points.push(at(outerRadius, base + toothGap + toothTop));
    points.push(at(innerRadius, base + toothGap + toothTop + toothGap));
  }
  return points;
}
