"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useChromeNav } from "@/components/layout/useChromeNav";
import { AppImage } from "@/components/ui/AppImage";
import {
  AD_BANNERS_HEADING_ID,
  AD_DOCK_STOP_ATTRIBUTE,
  adImageSize,
  pickAd,
  shouldShowMobileAdDock,
} from "@/lib/ad-placements";
import type { Information } from "@/types/informations";
import { AdLink } from "./AdBannerLink";

/**
 * 閉じた状態の記憶。寿命はタブ1つ分（`sessionStorage`）。
 * 読み書きの作法は src/i18n/use-preferred-locale.ts と同じ。
 */
const DISMISSED_KEY = "setagayafes:ad-dock-dismissed";
const DISMISS_EVENT = "setagayafes:ad-dock-dismissed-change";

function getDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(DISMISSED_KEY) === "1";
  } catch {
    return false;
  }
}

function subscribeDismissed(onChange: () => void): () => void {
  window.addEventListener(DISMISS_EVENT, onChange);
  return () => window.removeEventListener(DISMISS_EVENT, onChange);
}

/**
 * 1回の読み込みにつき1つの乱数。サーバー描画と hydrate の間は null を返し、
 * hydrate の後に選ぶ（サーバーとクライアントで別の広告になり HTML が食い違うのを避ける）。
 * クライアント遷移では選び直さない（表示中は切り替えない。WCAG 2.2.2）。
 */
let pageLoadRandom: number | null = null;

function getRandom(): number {
  pageLoadRandom ??= Math.random();
  return pageLoadRandom;
}

function subscribeNothing(): () => void {
  return () => {};
}

function getNull(): null {
  return null;
}

/**
 * モバイル（md 未満）の画面下部に固定する広告バナー（#481）
 *
 * - `/` と `/special/[id]` では出さない（`shouldShowMobileAdDock`）
 * - フッター上の広告欄から下が画面に入ったら、画面の下へ退かせる（MobileTicketCTA と同じ判定）
 * - 閉じたら、そのタブの間は出さない。sessionStorage が使えなければ、その表示の間だけ閉じる
 * - 出ている間は `<html>` に scroll-padding-bottom を付け、Tab で移ったフォーカスが
 *   バナーの下に隠れないようにする（WCAG 2.4.11）
 *
 * **退かせるときもアンマウントしない。** DOM の位置はフッターの広告欄の直前なので、Tab で
 * ここへ来るころにはフッター側が見えている。アンマウントしていると閉じるボタンへキーボードで
 * 一度も届かない（マウスでは押せるのに）。画面外へ退かせたまま Tab の順に残し、
 * 中にフォーカスが来たら引き上げる（スキップリンクと同じ考え方）。
 */
export function MobileAdDock({ ads }: { ads: Information[] }) {
  const { messages } = useChromeNav();
  const pathname = usePathname();
  const dockRef = useRef<HTMLElement>(null);
  const random = useSyncExternalStore(subscribeNothing, getRandom, getNull);
  const storedDismissed = useSyncExternalStore(subscribeDismissed, getDismissed, () => false);
  const [dismissedHere, setDismissedHere] = useState(false);
  const [isStopAreaVisible, setIsStopAreaVisible] = useState(false);
  const [hasFocusWithin, setHasFocusWithin] = useState(false);

  const ad = random === null ? null : pickAd(ads, random);
  const isMounted =
    ad !== null && shouldShowMobileAdDock(pathname) && !storedDismissed && !dismissedHere;
  const isVisible = isMounted && (!isStopAreaVisible || hasFocusWithin);

  useEffect(() => {
    if (!("IntersectionObserver" in window)) return;
    const stopArea = document.querySelector<HTMLElement>(`[${AD_DOCK_STOP_ATTRIBUTE}]`);
    if (!stopArea) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsStopAreaVisible(entry.isIntersecting),
      // 固定バナー自身の高さぶん手前で、フッター側の広告欄へ役割を渡す
      { rootMargin: "0px 0px -96px 0px", threshold: 0.01 }
    );
    observer.observe(stopArea);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const dock = dockRef.current;
    if (!isVisible || !dock) return;
    // md 以上では display:none なので高さは 0 になり、余白も付かない
    const root = document.documentElement;
    root.style.scrollPaddingBottom = `${dock.offsetHeight}px`;
    return () => {
      root.style.scrollPaddingBottom = "";
    };
  }, [isVisible]);

  if (!isMounted || ad === null) return null;

  const imageSize = adImageSize(ad.image ?? {});

  const dismiss = () => {
    setDismissedHere(true);
    // 押したボタンが消えるとフォーカスが文書の先頭へ戻るため、続きの広告欄の見出しへ移す
    document.getElementById(AD_BANNERS_HEADING_ID)?.focus({ preventScroll: true });
    try {
      window.sessionStorage.setItem(DISMISSED_KEY, "1");
    } catch {
      return;
    }
    window.dispatchEvent(new Event(DISMISS_EVENT));
  };

  return (
    <aside
      ref={dockRef}
      aria-label={messages.ads.label}
      className={`fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_rgba(29,4,40,0.16)] motion-safe:transition-transform motion-safe:duration-200 motion-safe:ease-out md:hidden ${
        isVisible ? "" : "pointer-events-none translate-y-[calc(100%+24px)]"
      }`}
      onFocus={() => setHasFocusWithin(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setHasFocusWithin(false);
      }}
    >
      <div className="mx-auto flex max-w-md items-center gap-2 py-2 ps-3 pe-1">
        {/* 画像は入稿された縦横比のまま高さ 96px に縮め、横に社名を並べる（#485）。
            300×250 のような広告をそのまま出すと画面の約3分の1を覆うため */}
        <AdLink
          ad={ad}
          newTabLabel={messages.ads.newTab}
          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg"
        >
          {ad.image?.url && (
            <span
              className="relative h-24 max-w-[40vw] shrink-0 overflow-hidden rounded"
              style={{ aspectRatio: `${imageSize.width} / ${imageSize.height}` }}
            >
              <AppImage src={ad.image.url} alt="" fill className="object-contain" sizes="40vw" />
            </span>
          )}
          <span className="flex min-w-0 flex-col items-start gap-1">
            <span
              aria-hidden="true"
              className="rounded bg-gray-700 px-1.5 py-0.5 text-xs leading-none font-bold text-white"
            >
              {messages.ads.label}
            </span>
            <span className="text-sm leading-snug font-bold [overflow-wrap:anywhere] text-gray-900">
              {ad.title}
            </span>
          </span>
        </AdLink>
        <button
          type="button"
          onClick={dismiss}
          aria-label={messages.ads.close}
          className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-gray-700 transition-colors hoverable:hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}
