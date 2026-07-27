"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

export function AccessHeroMedia() {
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePlayback = () => setShouldPlayVideo(!mediaQuery.matches);

    updatePlayback();
    mediaQuery.addEventListener("change", updatePlayback);

    return () => mediaQuery.removeEventListener("change", updatePlayback);
  }, []);

  return (
    <div className="absolute inset-0 bg-white">
      <Image
        src="/images/video-posters/access-tcu-setagaya.webp"
        alt=""
        fill
        priority
        sizes="(min-width: 1440px) 1376px, (min-width: 1024px) calc(100vw - 128px), calc(100vw - 48px)"
        className="object-cover"
      />
      {shouldPlayVideo && (
        <video
          autoPlay
          muted
          playsInline
          preload="metadata"
          poster="/images/video-posters/access-tcu-setagaya.webp"
          width={1920}
          height={1080}
          aria-hidden="true"
          tabIndex={-1}
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src="/videos/access-tcu-setagaya.webm" type="video/webm" />
        </video>
      )}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-1/5 bg-gradient-to-b from-white via-white/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-1/5 bg-gradient-to-t from-white via-white/70 to-transparent"
      />
    </div>
  );
}
