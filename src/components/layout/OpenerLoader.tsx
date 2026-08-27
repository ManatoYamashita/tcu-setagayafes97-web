"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";

// オープナーは初期描画後の演出なので、GSAPを含む本体を初期JSから分離する。
const Opener = dynamic(() => import("./Opener").then((module) => module.Opener), {
  ssr: false,
  loading: () => <div className="opener-container" aria-hidden="true" />,
});

const getDesktopMotionPreference = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const subscribeToMediaQueries = () => () => {};
const getServerDesktopMotionPreference = () => false;

export function OpenerLoader() {
  const shouldLoad = useSyncExternalStore(
    subscribeToMediaQueries,
    getDesktopMotionPreference,
    getServerDesktopMotionPreference
  );

  // モバイルでは演出を無効にするため、空のシェルだけを残してOpener/GSAPチャンクを取得しない。
  if (!shouldLoad) {
    return <div className="opener-container" aria-hidden="true" />;
  }

  return <Opener />;
}
