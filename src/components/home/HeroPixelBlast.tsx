"use client";

import dynamic from "next/dynamic";

const PixelBlast = dynamic(() => import("@/components/ui/PixelBlast"), {
  ssr: false,
});

export function HeroPixelBlast() {
  return (
    <PixelBlast
      variant="square"
      pixelSize={5}
      color="#B19EEF"
      patternScale={0.75}
      patternDensity={1.75}
      pixelSizeJitter={0}
      enableRipples={false}
      liquid={false}
      speed={0.5}
      edgeFade={0.2}
      transparent={true}
    />
  );
}
