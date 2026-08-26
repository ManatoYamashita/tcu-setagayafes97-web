"use client";

import dynamic from "next/dynamic";

const DeferredDecorativeFonts = dynamic(
  () => import("./DeferredDecorativeFonts").then((module) => module.DeferredDecorativeFonts),
  { ssr: false }
);

export function DeferredDecorativeFontsLoader() {
  return <DeferredDecorativeFonts />;
}
