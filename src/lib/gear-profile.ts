/**
 * サイトの歯車モチーフの輪郭（2D）
 *
 * 3D 歯車（src/components/three/gear-geometry.ts）と、著名人企画の写真の切り抜き
 * （SpecialGuestSection の clip-path）が同じ歯形を使うために、three に依存しない形で
 * ここへ置いています。歯の数や比率を変えると両方の見た目が変わります。
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

interface GearClipPathParams {
  /** 外径に対する倍率。0 で中心の1点に潰れ、1 で外径が箱の辺に接する */
  scale?: number;
  /** 回転角（度、時計回り）。0 で歯が真上・真下・真横を向く */
  rotationDeg?: number;
}

/** 歯形の点は固定なので一度だけ求め、外径 1 に正規化しておく */
const UNIT_GEAR_POINTS = gearCornerPoints().map(
  ([x, y]): GearPoint => [x / GEAR_PROFILE.outerRadius, y / GEAR_PROFILE.outerRadius]
);

/**
 * 1つ目の歯の中心の角度（度）。`gearCornerPoints` は歯底を 0° から始めるため、
 * そのままだと歯が軸から 13° ほど傾いて見える。これを打ち消して歯を真上・真横へ向ける
 */
const FIRST_TOOTH_CENTER_DEG =
  ((GEAR_PROFILE.toothGapRatio + GEAR_PROFILE.toothTopRatio / 2) * 360) / GEAR_PROFILE.teeth;

/**
 * 正方形の箱を歯車の形に切り抜く CSS `clip-path` の値を返します。
 *
 * 中心穴は付けません。写真の切り抜きに使うため、穴を開けると被写体の顔が抜けます。
 * 点の数は scale や回転によらず一定なので、アニメーション中に毎フレーム
 * 値を差し替えても形が飛びません。
 */
export function gearClipPath({ scale = 1, rotationDeg = 0 }: GearClipPathParams = {}): string {
  const rad = ((rotationDeg - FIRST_TOOTH_CENTER_DEG) * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const toPercent = (value: number) => `${(50 + value * 50 * scale).toFixed(3)}%`;

  const coords = UNIT_GEAR_POINTS.map(([x, y]) => {
    const rx = x * cos - y * sin;
    const ry = x * sin + y * cos;
    return `${toPercent(rx)} ${toPercent(ry)}`;
  });

  return `polygon(${coords.join(", ")})`;
}
