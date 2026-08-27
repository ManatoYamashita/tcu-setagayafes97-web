"use client";

import dynamic from "next/dynamic";

// オープナーは初期描画後の演出なので、GSAPを含む本体を初期JSから分離する。
const Opener = dynamic(() => import("./Opener").then((module) => module.Opener), {
  ssr: false,
  loading: () => <div className="opener-container" aria-hidden="true" />,
});

export function OpenerLoader() {
  return <Opener />;
}
