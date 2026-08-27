"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Information } from "@/types/informations";

// スポンサー欄はページ下部のため、LogoLoopのCSS/JSを初期レンダリングから分離する。
const SponsorLogoLoop = dynamic(
  () => import("./SponsorLogoLoop").then((module) => module.SponsorLogoLoop),
  {
    ssr: false,
    loading: () => null,
  }
);

function StaticSponsorLogos({ sponsors }: { sponsors: Information[] }) {
  const logos = sponsors
    .filter((sponsor) => sponsor.image?.url)
    .map((sponsor) => {
      const image = sponsor.image!;
      const width = image.width ?? 1;
      const height = image.height ?? 1;
      const displayWidth = Math.max(1, Math.round((width / Math.max(1, height)) * 40));
      return { sponsor, displayWidth };
    });

  if (logos.length === 0) return null;

  return (
    <ul className="flex h-10 items-center gap-12 overflow-hidden" aria-label="協賛企業ロゴ">
      {logos.map(({ sponsor, displayWidth }) => (
        <li key={sponsor.id} className="flex h-10 shrink-0 items-center">
          <Image
            src={sponsor.image!.url}
            alt={sponsor.title}
            width={displayWidth}
            height={40}
            sizes={`${displayWidth}px`}
            loading="lazy"
            draggable={false}
          />
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
    </div>
  );
}
