"use client";

import dynamic from "next/dynamic";
import type { Information } from "@/types/informations";

// スポンサー欄はページ下部のため、LogoLoopのCSS/JSを初期レンダリングから分離する。
const SponsorLogoLoop = dynamic(
  () => import("./SponsorLogoLoop").then((module) => module.SponsorLogoLoop),
  {
    ssr: false,
    loading: () => null,
  }
);

export function SponsorLogoLoopLoader({ sponsors }: { sponsors: Information[] }) {
  return <SponsorLogoLoop sponsors={sponsors} />;
}
