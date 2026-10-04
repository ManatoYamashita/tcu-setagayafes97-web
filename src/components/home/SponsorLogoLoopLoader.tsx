"use client";

import dynamic from "next/dynamic";
import { AppImage } from "@/components/ui/AppImage";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChromeNav } from "@/components/layout/useChromeNav";
import { SPONSOR_LOGO_HEIGHT, toSponsorLogos } from "@/lib/sponsor-logos";
import type { Information } from "@/types/informations";
import { SponsorWordmark } from "./SponsorWordmark";

// スポンサー欄はページ下部のため、LogoLoopのCSS/JSを初期レンダリングから分離する。
const SponsorLogoLoop = dynamic(
  () => import("./SponsorLogoLoop").then((module) => module.SponsorLogoLoop),
  {
    ssr: false,
    loading: () => null,
  }
);

function StaticSponsorLogos({ sponsors }: { sponsors: Information[] }) {
  const { messages } = useChromeNav();
  const logos = toSponsorLogos(sponsors);

  if (logos.length === 0) return null;

  return (
    <ul
      className="flex h-10 items-center gap-12 overflow-hidden"
      aria-label={messages.sponsors.logosLabel}
    >
      {logos.map((logo) => (
        <li key={logo.sponsor.id} className="flex h-10 shrink-0 items-center">
          {logo.kind === "image" ? (
            <AppImage
              src={logo.src}
              alt={logo.sponsor.title}
              width={logo.displayWidth}
              height={SPONSOR_LOGO_HEIGHT}
              sizes={`${logo.displayWidth}px`}
              loading="lazy"
              draggable={false}
            />
          ) : (
            <SponsorWordmark title={logo.sponsor.title} />
          )}
        </li>
      ))}
    </ul>
  );
}

export function SponsorLogoLoopLoader({ sponsors }: { sponsors: Information[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);
  const [isEnhanced, setIsEnhanced] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!("IntersectionObserver" in window)) {
      // 静的フォールバックをそのまま使い、古いブラウザでの同期再描画を避ける。
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "200px 0px" }
    );
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  const handleReady = useCallback(() => setIsEnhanced(true), []);

  return (
    <div ref={containerRef} className="relative h-10">
      <div
        className={`absolute inset-0 z-10 transition-opacity duration-200 ${
          isEnhanced ? "pointer-events-none opacity-0" : ""
        }`}
        aria-hidden={isEnhanced}
      >
        <StaticSponsorLogos sponsors={sponsors} />
      </div>
      {shouldLoad && (
        <div
          className={`relative transition-opacity duration-200 ${
            isEnhanced ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={!isEnhanced}
        >
          <SponsorLogoLoop sponsors={sponsors} onReady={handleReady} />
        </div>
      )}
      {/* 両端のフェード。静的フォールバックと LogoLoop 本体のどちらが表示されていても
          同じ見え方になるよう、ローダー側で1組だけ持つ。LogoLoop の fadeOut は使わない
          （同じグラデを2枚重ねると中間が濃くなる）。幅は LogoLoop.css の fade と揃えている。 */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-20 w-[clamp(24px,8%,120px)] bg-gradient-to-r from-white to-white/0"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-20 w-[clamp(24px,8%,120px)] bg-gradient-to-l from-white to-white/0"
        aria-hidden="true"
      />
    </div>
  );
}
