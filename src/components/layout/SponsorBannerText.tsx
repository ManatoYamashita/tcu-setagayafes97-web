"use client";

import { useChromeNav } from "@/components/layout/useChromeNav";

/**
 * 協賛バナーの見出しと CTA 文言
 *
 * SponsorBanner は Footer 内のサーバーコンポーネントでロケールを知らないため、
 * ロケール解決が要る文言だけをここへ切り出している（FooterNav と同じ理由）。
 */
export function SponsorBannerHeading() {
  const { messages } = useChromeNav();

  return <>{messages.sponsors.heading}</>;
}

export function SponsorBannerCtaLabel() {
  const { messages } = useChromeNav();

  return <>{messages.sponsors.viewAll}</>;
}
