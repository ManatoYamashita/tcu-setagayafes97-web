"use client";

import { Canvas } from "@react-three/fiber";
import { Gear } from "./Gear";

/**
 * R3F Canvas + 3点照明
 * 背景透過、dpr制限でパフォーマンス最適化
 */
export default function GearScene() {
  return (
    <Canvas
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
      camera={{ position: [0, 0, 7.5], fov: 45 }}
      style={{ width: "100%", height: "100%" }}
    >
      {/* メインライト（右上、白） */}
      <directionalLight position={[4, 4, 5]} intensity={1.15} color="#ffffff" />
      {/* フィルライト（左下、ピンク系） */}
      <directionalLight position={[-3, -2, 3]} intensity={0.6} color="#EEC0D8" />
      {/* バックライト（背面、ピンク系） */}
      <directionalLight position={[0, 0, -4]} intensity={0.4} color="#D880C0" />
      {/* 環境光 */}
      <ambientLight intensity={0.45} />

      <Gear />
    </Canvas>
  );
}
