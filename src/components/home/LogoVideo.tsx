"use client";

import { useRef, useCallback, useEffect } from "react";

interface LogoVideoProps {
  className?: string;
  /** オープナー完了を待ってから再生するか */
  waitForOpener?: boolean;
}

export function LogoVideo({
  className = "w-[45vw] md:w-[20vw]",
  waitForOpener = false,
}: LogoVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleEnded = useCallback(() => {
    if (videoRef.current) videoRef.current.pause();
  }, []);

  useEffect(() => {
    if (!waitForOpener) {
      videoRef.current?.play();
      return;
    }

    const play = () => {
      videoRef.current?.play();
    };

    window.addEventListener("opener-done", play);
    return () => {
      window.removeEventListener("opener-done", play);
    };
  }, [waitForOpener]);

  return (
    <video
      ref={videoRef}
      className={`${className} h-auto object-contain`}
      muted
      playsInline
      preload="auto"
      onEnded={handleEnded}
    >
      <source src="/videos/logo-animation.webm" type="video/webm" />
      <source src="/videos/logo-animation.mp4" type="video/mp4" />
      <picture>
        <source srcSet="/images/brand/logo.webp" type="image/webp" />
        <img
          src="/images/brand/logo.png"
          alt="世田谷祭ロゴ"
          className={`${className} h-auto object-contain`}
        />
      </picture>
    </video>
  );
}
