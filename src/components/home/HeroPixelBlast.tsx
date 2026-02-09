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
      patternScale={2}
      patternDensity={1}
      pixelSizeJitter={0}
      enableRipples={true}
      rippleSpeed={0.4}
      rippleThickness={0.12}
      rippleIntensityScale={1.5}
      liquid={false}
      liquidStrength={0.12}
      liquidRadius={1.2}
      liquidWobbleSpeed={5}
      speed={0.5}
      edgeFade={0.2}
      transparent={true}
    />
  );
}
