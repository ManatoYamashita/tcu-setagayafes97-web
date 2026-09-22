"use client";

import { useEffect, useState } from "react";
import type { MobileTicketCtaTarget } from "@/lib/special-ticket-cta";

interface MobileTicketCTAProps {
  target: MobileTicketCtaTarget;
}

/**
 * モバイル専用の固定チケット購入導線。
 *
 * 本文側の購入ボタンが見える時は同じ操作を重ねず、フッターではリンクを覆わないよう退避する。
 * IntersectionObserver が使えない環境では、購入導線を失うより表示継続を優先する。
 */
export function MobileTicketCTA({ target }: MobileTicketCTAProps) {
  const [isCoveredSurfaceVisible, setIsCoveredSurfaceVisible] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;

    const targets = [
      ...document.querySelectorAll<HTMLElement>("[data-special-ticket-purchase]"),
      document.querySelector<HTMLElement>("footer"),
    ].filter((element): element is HTMLElement => element !== null);

    if (targets.length === 0) return;

    const visibleTargets = new Set<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleTargets.add(entry.target);
          } else {
            visibleTargets.delete(entry.target);
          }
        }
        setIsCoveredSurfaceVisible(visibleTargets.size > 0);
      },
      {
        // 固定ドック自身の高さを除いた領域へ購入ボタンが入った時点で、本文側へ役割を渡す。
        rootMargin: "0px 0px -96px 0px",
        threshold: 0.01,
      }
    );

    for (const element of targets) observer.observe(element);

    return () => observer.disconnect();
  }, []);

  if (isCoveredSurfaceVisible && !hasFocusWithin) return null;

  return (
    <aside
      aria-label="チケット購入"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] shadow-[0_-8px_24px_rgba(29,4,40,0.16)] md:hidden"
      data-mobile-ticket-cta
      onFocus={() => setHasFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocusWithin(false);
      }}
    >
      <a
        href={target.href}
        target={target.external ? "_blank" : undefined}
        rel={target.external ? "noopener noreferrer" : undefined}
        className="mx-auto flex min-h-14 w-full max-w-lg touch-manipulation items-center gap-3 rounded-2xl bg-primary-600 py-2.5 ps-4 pe-3.5 text-white transition-[background-color,scale] duration-150 ease-out hover:bg-primary-700 active:scale-[0.96] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-700 motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <svg
          className="size-6 shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.75 8.25A2.25 2.25 0 0 1 6 6h12a2.25 2.25 0 0 1 2.25 2.25v1.07a2.625 2.625 0 0 0 0 5.36v1.07A2.25 2.25 0 0 1 18 18H6a2.25 2.25 0 0 1-2.25-2.25v-1.07a2.625 2.625 0 0 0 0-5.36V8.25Z"
          />
          <path strokeLinecap="round" strokeWidth={2} d="M13.5 6v12" />
        </svg>

        <span className="min-w-0 flex-1 text-start">
          <span className="block text-xs leading-tight text-white/80">{target.ticketName}</span>
          <span className="mt-0.5 block text-base font-bold leading-snug">{target.label}</span>
        </span>

        {target.external ? (
          <svg
            className="size-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13.5 4.5H19.5V10.5M19.125 4.875 10.5 13.5M18 13.5v4.125A1.875 1.875 0 0 1 16.125 19.5h-9.75A1.875 1.875 0 0 1 4.5 17.625v-9.75A1.875 1.875 0 0 1 6.375 6H10.5"
            />
          </svg>
        ) : (
          <svg
            className="size-5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m6 9 6 6 6-6" />
          </svg>
        )}

        {target.external && <span className="sr-only">（外部サイトが開きます）</span>}
      </a>
    </aside>
  );
}
