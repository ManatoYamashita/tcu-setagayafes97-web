"use client";

import React, { useCallback, useLayoutEffect, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { gsap } from "gsap";
import { X } from "lucide-react";
import { getFilteredHeaderNav } from "@/data/navigation";
import { siteConfig } from "@/data/site";

/**
 * StaggeredMobileMenu
 *
 * GSAPによるスタガーアニメーション付きフルスクリーンオーバーレイ。
 * 外部から isOpen / onClose で制御するパッシブコンポーネント。
 * lg (1024px) 以上では非表示。
 */

interface MenuItem {
  label: string;
  ariaLabel: string;
  link: string;
}

interface SocialItem {
  label: string;
  link: string;
}

const menuItems: MenuItem[] = getFilteredHeaderNav().map((item) => ({
  label: item.label,
  ariaLabel: `${item.label}ページへ`,
  link: item.href,
}));

const socialItems: SocialItem[] = [
  { label: "X (Twitter)", link: siteConfig.sns.twitter },
  { label: "Instagram", link: siteConfig.sns.instagram },
  { label: "Facebook", link: siteConfig.sns.facebook },
];

const PRE_COLORS = ["#E1C0EE", "#CD79EE"];
const ACCENT_COLOR = "#CD79EE";

interface StaggeredMobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function StaggeredMobileMenu({ isOpen, onClose }: StaggeredMobileMenuProps) {
  const router = useRouter();
  const prevOpenRef = useRef(false);

  const panelRef = useRef<HTMLDivElement | null>(null);
  const preLayersRef = useRef<HTMLDivElement | null>(null);
  const preLayerElsRef = useRef<HTMLElement[]>([]);

  const openTlRef = useRef<gsap.core.Timeline | null>(null);
  const closeTweenRef = useRef<gsap.core.Tween | null>(null);
  const busyRef = useRef(false);
  const itemEntranceTweenRef = useRef<gsap.core.Tween | null>(null);

  // スクロールロック
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // GSAP初期化
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panel = panelRef.current;
      const preContainer = preLayersRef.current;

      if (!panel) return;

      let preLayers: HTMLElement[] = [];
      if (preContainer) {
        preLayers = Array.from(preContainer.querySelectorAll(".sm-prelayer")) as HTMLElement[];
      }
      preLayerElsRef.current = preLayers;

      gsap.set([panel, ...preLayers], { xPercent: 100 });
    });
    return () => ctx.revert();
  }, []);

  const buildOpenTimeline = useCallback(() => {
    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return null;

    openTlRef.current?.kill();
    if (closeTweenRef.current) {
      closeTweenRef.current.kill();
      closeTweenRef.current = null;
    }
    itemEntranceTweenRef.current?.kill();

    const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
    const numberEls = Array.from(
      panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
    ) as HTMLElement[];
    const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
    const socialLinks = Array.from(panel.querySelectorAll(".sm-socials-link")) as HTMLElement[];

    const layerStates = layers.map((el) => ({
      el,
      start: Number(gsap.getProperty(el, "xPercent")),
    }));
    const panelStart = Number(gsap.getProperty(panel, "xPercent"));

    if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });
    if (numberEls.length) gsap.set(numberEls, { ["--sm-num-opacity" as string]: 0 });
    if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
    if (socialLinks.length) gsap.set(socialLinks, { y: 25, opacity: 0 });

    const tl = gsap.timeline({ paused: true });

    layerStates.forEach((ls, i) => {
      tl.fromTo(
        ls.el,
        { xPercent: ls.start },
        { xPercent: 0, duration: 0.5, ease: "power4.out" },
        i * 0.07
      );
    });

    const lastTime = layerStates.length ? (layerStates.length - 1) * 0.07 : 0;
    const panelInsertTime = lastTime + (layerStates.length ? 0.08 : 0);
    const panelDuration = 0.65;

    tl.fromTo(
      panel,
      { xPercent: panelStart },
      { xPercent: 0, duration: panelDuration, ease: "power4.out" },
      panelInsertTime
    );

    if (itemEls.length) {
      const itemsStartRatio = 0.15;
      const itemsStart = panelInsertTime + panelDuration * itemsStartRatio;

      tl.to(
        itemEls,
        {
          yPercent: 0,
          rotate: 0,
          duration: 1,
          ease: "power4.out",
          stagger: { each: 0.1, from: "start" },
        },
        itemsStart
      );

      if (numberEls.length) {
        tl.to(
          numberEls,
          {
            duration: 0.6,
            ease: "power2.out",
            ["--sm-num-opacity" as string]: 1,
            stagger: { each: 0.08, from: "start" },
          },
          itemsStart + 0.1
        );
      }
    }

    if (socialTitle || socialLinks.length) {
      const socialsStart = panelInsertTime + panelDuration * 0.4;

      if (socialTitle) {
        tl.to(socialTitle, { opacity: 1, duration: 0.5, ease: "power2.out" }, socialsStart);
      }
      if (socialLinks.length) {
        tl.to(
          socialLinks,
          {
            y: 0,
            opacity: 1,
            duration: 0.55,
            ease: "power3.out",
            stagger: { each: 0.08, from: "start" },
            onComplete: () => {
              gsap.set(socialLinks, { clearProps: "opacity" });
            },
          },
          socialsStart + 0.04
        );
      }
    }

    openTlRef.current = tl;
    return tl;
  }, []);

  const playOpen = useCallback(() => {
    if (busyRef.current) return;
    busyRef.current = true;
    const tl = buildOpenTimeline();
    if (tl) {
      tl.eventCallback("onComplete", () => {
        busyRef.current = false;
      });
      tl.play(0);
    } else {
      busyRef.current = false;
    }
  }, [buildOpenTimeline]);

  const playClose = useCallback(() => {
    openTlRef.current?.kill();
    openTlRef.current = null;
    itemEntranceTweenRef.current?.kill();

    const panel = panelRef.current;
    const layers = preLayerElsRef.current;
    if (!panel) return;

    const all: HTMLElement[] = [...layers, panel];
    closeTweenRef.current?.kill();

    closeTweenRef.current = gsap.to(all, {
      xPercent: 100,
      duration: 0.32,
      ease: "power3.in",
      overwrite: "auto",
      onComplete: () => {
        const itemEls = Array.from(panel.querySelectorAll(".sm-panel-itemLabel")) as HTMLElement[];
        if (itemEls.length) gsap.set(itemEls, { yPercent: 140, rotate: 10 });

        const numberEls = Array.from(
          panel.querySelectorAll(".sm-panel-list[data-numbering] .sm-panel-item")
        ) as HTMLElement[];
        if (numberEls.length) gsap.set(numberEls, { ["--sm-num-opacity" as string]: 0 });

        const socialTitle = panel.querySelector(".sm-socials-title") as HTMLElement | null;
        const socialLinksEls = Array.from(
          panel.querySelectorAll(".sm-socials-link")
        ) as HTMLElement[];
        if (socialTitle) gsap.set(socialTitle, { opacity: 0 });
        if (socialLinksEls.length) gsap.set(socialLinksEls, { y: 25, opacity: 0 });

        busyRef.current = false;
      },
    });
  }, []);

  // isOpen の変化を検知して開閉アニメーション実行
  useEffect(() => {
    if (isOpen === prevOpenRef.current) return;
    prevOpenRef.current = isOpen;

    if (isOpen) {
      playOpen();
    } else {
      playClose();
    }
  }, [isOpen, playOpen, playClose]);

  // メニューアイテムクリック → ナビゲーション＋メニュー閉じ
  const handleItemClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, link: string) => {
      e.preventDefault();
      onClose();
      router.push(link);
    },
    [onClose, router]
  );

  // パネル外クリックで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Escapeキーで閉じる
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      className="sm-scope fixed inset-0 z-50 overflow-hidden lg:hidden"
      style={{ pointerEvents: isOpen ? "auto" : "none" }}
    >
      <div
        className="staggered-menu-wrapper pointer-events-none relative z-50 h-full w-full"
        style={{ ["--sm-accent" as string]: ACCENT_COLOR } as React.CSSProperties}
        data-position="right"
        data-open={isOpen || undefined}
      >
        {/* プレレイヤー */}
        <div
          ref={preLayersRef}
          className="sm-prelayers pointer-events-none absolute top-0 right-0 bottom-0 z-[5]"
          aria-hidden="true"
        >
          {PRE_COLORS.map((c, i) => (
            <div
              key={i}
              className="sm-prelayer absolute top-0 right-0 h-full w-full translate-x-0"
              style={{ background: c }}
            />
          ))}
        </div>

        {/* メニューパネル */}
        <aside
          id="staggered-menu-panel"
          ref={panelRef}
          className="staggered-menu-panel pointer-events-auto absolute top-0 right-0 z-10 flex h-full flex-col overflow-y-auto bg-white p-[4em_2em_2em_2em] backdrop-blur-[12px]"
          style={{ WebkitBackdropFilter: "blur(12px)" }}
          aria-hidden={!isOpen}
        >
          {/* 閉じるボタン */}
          <button
            className="absolute top-4 right-4 z-20 flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-gray-900"
            aria-label="メニューを閉じる"
            onClick={onClose}
            type="button"
          >
            <X size={24} />
          </button>

          <div className="sm-panel-inner flex flex-1 flex-col gap-5">
            <ul
              className="sm-panel-list m-0 flex list-none flex-col gap-2 p-0"
              role="list"
              data-numbering=""
            >
              {menuItems.map((it, idx) => (
                <li
                  className="sm-panel-itemWrap relative overflow-hidden leading-none"
                  key={it.link}
                >
                  <a
                    className="sm-panel-item relative inline-block cursor-pointer pr-[1.4em] text-[2.5rem] font-semibold leading-none tracking-[-1px] text-black no-underline transition-[background,color] duration-150 ease-linear"
                    href={it.link}
                    aria-label={it.ariaLabel}
                    data-index={idx + 1}
                    onClick={(e) => handleItemClick(e, it.link)}
                  >
                    <span className="sm-panel-itemLabel inline-block origin-[50%_100%] will-change-transform">
                      {it.label}
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            {/* SNSリンク */}
            <div className="sm-socials mt-auto flex flex-col gap-3 pt-8" aria-label="SNSリンク">
              <h3
                className="sm-socials-title m-0 text-base font-medium"
                style={{ color: ACCENT_COLOR }}
              >
                SNS
              </h3>
              <ul
                className="sm-socials-list m-0 flex list-none flex-row flex-wrap items-center gap-4 p-0"
                role="list"
              >
                {socialItems.map((s) => (
                  <li key={s.label} className="sm-socials-item">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="sm-socials-link relative inline-block py-[2px] text-[1.2rem] font-medium text-[#111] no-underline transition-[color,opacity] duration-300 ease-linear"
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {/* scoped styles */}
      <style>{`
.sm-scope .staggered-menu-panel {
  width: 100%;
  left: 0;
  right: 0;
}
.sm-scope .sm-prelayers {
  width: 100%;
  left: 0;
  right: 0;
}
.sm-scope .sm-panel-item:hover {
  color: var(--sm-accent, #CD79EE);
}
.sm-scope .sm-panel-list[data-numbering] {
  counter-reset: smItem;
}
.sm-scope .sm-panel-list[data-numbering] .sm-panel-item::after {
  counter-increment: smItem;
  content: counter(smItem, decimal-leading-zero);
  position: absolute;
  top: 0.1em;
  right: 0;
  font-size: 14px;
  font-weight: 400;
  color: var(--sm-accent, #CD79EE);
  letter-spacing: 0;
  pointer-events: none;
  user-select: none;
  opacity: var(--sm-num-opacity, 0);
}
.sm-scope .sm-socials-list:hover .sm-socials-link:not(:hover) {
  opacity: 0.35;
}
.sm-scope .sm-socials-link:hover {
  color: var(--sm-accent, #CD79EE);
}
.sm-scope .sm-socials-link:focus-visible {
  outline: 2px solid var(--sm-accent, #CD79EE);
  outline-offset: 3px;
}
      `}</style>
    </div>
  );
}
