"use client";

import { useMemo } from "react";
import { LogoLoop } from "@/components/ui/LogoLoop";
import type { Information } from "@/types/informations";

interface SponsorLogoLoopProps {
  sponsors: Information[];
}

/**
 * 協賛企業ロゴの無限スクロールアニメーション（クライアントコンポーネント）
 */
export function SponsorLogoLoop({ sponsors }: SponsorLogoLoopProps) {
  const logos = useMemo(
    () =>
      sponsors
        .filter((s) => s.logo?.url)
        .map((s) => ({
          src: s.logo!.url,
          alt: s.sponsorName || s.title,
          href: s.url,
        })),
    [sponsors]
  );

  if (logos.length === 0) {
    return null;
  }

  return (
    <LogoLoop
      logos={logos}
      speed={80}
      direction="left"
      pauseOnHover
      logoHeight={40}
      gap={48}
      fadeOut
      fadeOutColor="#E1C0EE"
      ariaLabel="協賛企業ロゴ"
    />
  );
}
