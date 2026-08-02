"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/**
 * 会場までの経路を示す路線図イラストの動画
 *
 * 装飾目的のため無音・1回再生とし、動きを減らす設定ではポスター画像のみを表示する。
 */
export function AccessRouteMedia() {
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
        sizes="(min-width: 864px) 768px, (min-width: 640px) calc(100vw - 96px), calc(100vw - 64px)"
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
          <source src="/videos/access-tcu-setagaya.mp4" type="video/mp4" />
        </video>
      )}
    </div>
  );
}
