"use client";

import dynamic from "next/dynamic";

const GearScene = dynamic(() => import("@/components/three/GearScene"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-primary-400 border-t-transparent rounded-full animate-spin" />
    </div>
  ),
});

export function FeaturedGearScene() {
  return (
    <div className="w-full h-full">
      <GearScene />
    </div>
  );
}
