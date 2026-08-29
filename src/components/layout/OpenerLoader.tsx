"use client";

import dynamic from "next/dynamic";
import { useSyncExternalStore } from "react";
import { willRunOpener } from "@/lib/motion";

// オープナーは初期描画後の演出なので、GSAPを含む本体を初期JSから分離する。
const Opener = dynamic(() => import("./Opener").then((module) => module.Opener), {
  ssr: false,
  loading: () => <div className="opener-container" aria-hidden="true" />,
});

const subscribeToMediaQueries = () => () => {};
const getServerDesktopMotionPreference = () => false;

export function OpenerLoader() {
  const shouldLoad = useSyncExternalStore(
    subscribeToMediaQueries,
    willRunOpener,
    getServerDesktopMotionPreference
  );

  // モバイルでは演出を無効にするため、空のシェルだけを残してOpener/GSAPチャンクを取得しない。
  if (!shouldLoad) {
    return <div className="opener-container" aria-hidden="true" />;
  }

  return <Opener />;
}
