"use client";

import { useScrollReveal, type UseScrollRevealOptions } from "@/lib/use-scroll-reveal";

const NEWS_MOTION: UseScrollRevealOptions = {
  revealAttribute: "data-news-reveal",
  staggerAttribute: "data-news-stagger",
};

export function NewsArticleMotion() {
  const markerRef = useScrollReveal(NEWS_MOTION);
  return <span ref={markerRef} hidden aria-hidden="true" />;
}
