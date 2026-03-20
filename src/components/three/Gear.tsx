"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import type { Mesh, Group } from "three";
import { GEAR_DEFAULTS, createGearGeometry, createHubRingGeometry } from "./gear-geometry";

/**
 * ピンク紫クレイ風歯車メッシュ（ハブリング付き）
 * Z軸回転 + Y軸微揺れアニメーション
 */
export function Gear() {
  const groupRef = useRef<Group>(null);
  const gearGeometry = useMemo(() => createGearGeometry(), []);
  const hubGeometry = useMemo(() => createHubRingGeometry(), []);

  useFrame((_state, delta) => {
    if (!groupRef.current) return;
    // Z軸回転（0.15 rad/s）
    groupRef.current.rotation.z += 0.15 * delta;
    // Y軸微揺れ
    groupRef.current.rotation.y = Math.sin(groupRef.current.rotation.z * 0.5) * 0.15;
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0.2, 0]}>
      {/* 歯車本体 */}
      <mesh geometry={gearGeometry}>
        <meshPhysicalMaterial
          color="#DDA8D0"
          roughness={0.45}
          metalness={0}
          clearcoat={0.1}
          clearcoatRoughness={0.6}
          sheen={0.3}
          sheenColor="#F0D0E8"
        />
      </mesh>
      {/* 中央ハブリング（ExtrudeGeometryはz=0→depth押出のため中心をdepth/2ずらす） */}
      <mesh
        geometry={hubGeometry}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, GEAR_DEFAULTS.depth / 2]}
      >
        <meshPhysicalMaterial
          color="#DDA8D0"
          roughness={0.45}
          metalness={0}
          clearcoat={0.1}
          clearcoatRoughness={0.6}
          sheen={0.3}
          sheenColor="#F0D0E8"
        />
      </mesh>
    </group>
  );
}
