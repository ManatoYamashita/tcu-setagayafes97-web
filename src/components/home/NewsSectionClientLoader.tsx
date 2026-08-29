"use client";

import dynamic from "next/dynamic";
import type { News } from "@/types/news";

const NewsSectionInteractive = dynamic(
  () => import("./NewsSectionInteractive").then((module) => module.NewsSectionInteractive),
  { loading: () => null }
);

export function NewsSectionClientLoader({ newsList }: { newsList: News[] }) {
  return <NewsSectionInteractive newsList={newsList} />;
}
