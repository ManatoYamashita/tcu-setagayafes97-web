"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { Group } from "three";
import type { ThreeElements } from "@react-three/fiber";
import { GEAR_DEFAULTS, createGearGeometry, createHubRingGeometry } from "./gear-geometry";

/**
 * ピンク紫クレイ風歯車メッシュ（ハブリング付き）
 * Z軸回転 + マウス追従チルトアニメーション
 */
export function Gear(props: ThreeElements["group"]) {
  const groupRef = useRef<Group>(null);
  const gearGeometry = useMemo(() => createGearGeometry(), []);
  const hubGeometry = useMemo(() => createHubRingGeometry(), []);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(max-width: 768px)").matches);
    check();
    const mql = window.matchMedia("(max-width: 768px)");
    mql.addEventListener("change", check);
    return () => mql.removeEventListener("change", check);
  }, []);

  useFrame((state, delta) => {
    if (!groupRef.current) return;
    // Z軸回転（0.15 rad/s）
    groupRef.current.rotation.z += 0.15 * delta;

    if (isMobile) return;

    // マウス追従チルト（lerpで滑らかに補間）
    const tiltStrength = 0.3;
    const lerpFactor = 0.05;

    const targetX = 0.4 - state.pointer.y * tiltStrength;
    const targetY = 0.2 + state.pointer.x * tiltStrength;

    groupRef.current.rotation.x = THREE.MathUtils.lerp(
      groupRef.current.rotation.x,
      targetX,
      lerpFactor
    );
    groupRef.current.rotation.y = THREE.MathUtils.lerp(
      groupRef.current.rotation.y,
      targetY,
      lerpFactor
    );
  });

  return (
    <group ref={groupRef} rotation={[0.4, 0.2, 0]} {...props}>
      {/* 歯車本体 */}
      <mesh geometry={gearGeometry}>
        <meshPhysicalMaterial
          color="#FFA8CC"
          roughness={0.75}
          metalness={0}
          clearcoat={0.05}
          clearcoatRoughness={0.8}
          sheen={0}
        />
      </mesh>
      {/* 中央ハブリング（ExtrudeGeometryはz=0→depth押出のため中心をdepth/2ずらす） */}
      <mesh
        geometry={hubGeometry}
        rotation={[Math.PI / 2, 0, 0]}
        position={[0, 0, GEAR_DEFAULTS.depth / 2]}
      >
        <meshPhysicalMaterial
          color="#FFA8CC"
          roughness={0.75}
          metalness={0}
          clearcoat={0.05}
          clearcoatRoughness={0.8}
          sheen={0}
        />
      </mesh>
    </group>
  );
}
