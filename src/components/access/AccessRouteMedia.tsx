"use client";

import { AppImage } from "@/components/ui/AppImage";
import { useEffect, useRef, useState } from "react";

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** 動画の半分が画面に入った時点で再生を始める */
const PLAY_THRESHOLD = 0.5;

/**
 * 会場までの経路を示す路線図イラストの動画
 *
 * 装飾目的のため無音・1回再生とし、動きを減らす設定ではポスター画像のみを表示する。
 * マウント時に再生するとスマホでは画面に入る前に終わってしまうため、画面に入ってから
 * 再生する（#411）。
 */
export function AccessRouteMedia() {
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updatePlayback = () => setShouldPlayVideo(!mediaQuery.matches);

    updatePlayback();
    mediaQuery.addEventListener("change", updatePlayback);

    return () => mediaQuery.removeEventListener("change", updatePlayback);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!shouldPlayVideo || !video) return;

    const play = () => {
      // React は muted を属性ではなくプロパティで反映するため、iOS の自動再生条件を確実に満たすよう明示する
      video.muted = true;
      // 低電力モードなどで拒否された場合は、下に敷いたポスター画像のまま残す
      video.play().catch(() => {});
    };

    if (!("IntersectionObserver" in window)) {
      play();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        play();
      },
      { threshold: PLAY_THRESHOLD }
    );
    observer.observe(video);

    return () => observer.disconnect();
  }, [shouldPlayVideo]);

  return (
    <div className="absolute inset-0 bg-white">
      <AppImage
        src="/images/video-posters/access-tcu-setagaya.webp"
        alt=""
        fill
        sizes="(min-width: 864px) 768px, (min-width: 640px) calc(100vw - 96px), calc(100vw - 64px)"
        className="object-cover"
      />
      {shouldPlayVideo && (
        <video
          ref={videoRef}
          muted
          playsInline
          preload="none"
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
