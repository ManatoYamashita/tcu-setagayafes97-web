import * as THREE from "three";

interface GearParams {
  teeth?: number;
  outerRadius?: number;
  innerRadius?: number;
  holeRadius?: number;
  depth?: number;
}

export const GEAR_DEFAULTS = {
  teeth: 8,
  outerRadius: 2.0,
  innerRadius: 1.55,
  holeRadius: 0.65,
  depth: 1.1,
} as const;

/**
 * 歯車の2Dプロファイルを THREE.Shape で生成し、
 * ExtrudeGeometry で3D化して返す純粋関数
 */
export function createGearGeometry({
  teeth = GEAR_DEFAULTS.teeth,
  outerRadius = GEAR_DEFAULTS.outerRadius,
  innerRadius = GEAR_DEFAULTS.innerRadius,
  holeRadius = GEAR_DEFAULTS.holeRadius,
  depth = GEAR_DEFAULTS.depth,
}: GearParams = {}): THREE.ExtrudeGeometry {
  const shape = new THREE.Shape();
  const anglePerTooth = (Math.PI * 2) / teeth;
  // 歯1つを4分割: 歯底→歯先立ち上がり→歯先→歯先立ち下がり
  const toothTop = anglePerTooth * 0.5;
  const toothGap = anglePerTooth * 0.045;

  // 全コーナー座標を収集（1歯あたり4点）
  const pts: [number, number][] = [];
  for (let i = 0; i < teeth; i++) {
    const base = i * anglePerTooth;
    pts.push([Math.cos(base) * innerRadius, Math.sin(base) * innerRadius]);
    pts.push([Math.cos(base + toothGap) * outerRadius, Math.sin(base + toothGap) * outerRadius]);
    pts.push([
      Math.cos(base + toothGap + toothTop) * outerRadius,
      Math.sin(base + toothGap + toothTop) * outerRadius,
    ]);
    pts.push([
      Math.cos(base + toothGap + toothTop + toothGap) * innerRadius,
      Math.sin(base + toothGap + toothTop + toothGap) * innerRadius,
    ]);
  }

  const n = pts.length;
  const r = 0.04; // コーナーをほぼ直角に（角張った台形歯）
  const lerp = (a: [number, number], b: [number, number], t: number): [number, number] => [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
  ];

  // 最初のコーナーの丸め後から開始
  const start = lerp(pts[0], pts[1], r);
  shape.moveTo(start[0], start[1]);

  for (let i = 1; i <= n; i++) {
    const prev = pts[(i - 1) % n];
    const curr = pts[i % n];
    const next = pts[(i + 1) % n];
    const before = lerp(prev, curr, 1 - r);
    const after = lerp(curr, next, r);
    shape.lineTo(before[0], before[1]);
    shape.quadraticCurveTo(curr[0], curr[1], after[0], after[1]);
  }
  shape.closePath();

  // 中心穴
  const hole = new THREE.Path();
  hole.absellipse(0, 0, holeRadius, holeRadius, 0, Math.PI * 2, true, 0);
  shape.holes.push(hole);

  return new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.35,
    bevelSize: 0.25,
    bevelSegments: 1,
    curveSegments: 48,
  });
}

/**
 * 中央ハブリング（穴の周囲に突出したリム）のジオメトリを生成
 * LatheGeometryで断面を回転させてリング形状を作る
 */
export function createHubRingGeometry({
  holeRadius = GEAR_DEFAULTS.holeRadius,
  ringWidth = 0.55,
  gearDepth = GEAR_DEFAULTS.depth,
  protrusion = 0.38,
  chamfer = 0.18,
}: {
  holeRadius?: number;
  ringWidth?: number;
  gearDepth?: number;
  protrusion?: number;
  chamfer?: number;
} = {}): THREE.LatheGeometry {
  const innerR = holeRadius;
  const outerR = holeRadius + ringWidth;
  const totalHeight = gearDepth + protrusion * 2;
  const halfH = totalHeight / 2;

  // 断面プロファイル（回転軸=Y軸、右半分の断面を定義）
  // 内径下端 → 内径上端 → 外径上端（面取り）→ 外径本体上 → 外径本体下 → 外径下端（面取り）→ 内径下端
  const points: THREE.Vector2[] = [
    new THREE.Vector2(innerR, -halfH),
    new THREE.Vector2(innerR, halfH),
    new THREE.Vector2(outerR - chamfer, halfH),
    new THREE.Vector2(outerR, halfH - chamfer),
    new THREE.Vector2(outerR, -halfH + chamfer),
    new THREE.Vector2(outerR - chamfer, -halfH),
    new THREE.Vector2(innerR, -halfH),
  ];

  return new THREE.LatheGeometry(points, 64);
}
