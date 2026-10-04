"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { AppImage } from "@/components/ui/AppImage";
import { useChromeNav } from "@/components/layout/useChromeNav";
import { LogoLoop, type LogoItem } from "@/components/ui/LogoLoop";
import { SponsorModal } from "./SponsorModal";
import { SponsorWordmark } from "./SponsorWordmark";
import { SPONSOR_LOGO_HEIGHT, toSponsorLogos } from "@/lib/sponsor-logos";
import type { Information } from "@/types/informations";

interface SponsorLogoLoopProps {
  sponsors: Information[];
  onReady?: () => void;
}

/**
 * 協賛企業ロゴの無限スクロールアニメーション（クライアントコンポーネント）
 * ロゴクリックでスポンサー詳細モーダルを表示
 */
export function SponsorLogoLoop({ sponsors, onReady }: SponsorLogoLoopProps) {
  const { messages } = useChromeNav();
  const [selectedSponsor, setSelectedSponsor] = useState<Information | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 画像の無い協賛も捨てない（#332）。renderItem は logos と同じ添字でこの配列を引く
  const sponsorLogos = useMemo(() => toSponsorLogos(sponsors), [sponsors]);

  const logos = useMemo<LogoItem[]>(
    () =>
      sponsorLogos.map((logo) =>
        logo.kind === "image"
          ? {
              src: logo.src,
              alt: logo.sponsor.title,
              width: logo.displayWidth,
              height: SPONSOR_LOGO_HEIGHT,
            }
          : { node: logo.sponsor.title, ariaLabel: logo.sponsor.title }
      ),
    [sponsorLogos]
  );

  const handleSponsorClick = useCallback(
    (index: number) => {
      const sponsor = sponsorLogos[index]?.sponsor;
      if (sponsor) {
        setSelectedSponsor(sponsor);
        setIsModalOpen(true);
      }
    },
    [sponsorLogos]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const renderItem = useCallback(
    (_item: LogoItem, key: string) => {
      const [copyIndexText, itemIndexText] = key.split("-");
      const copyIndex = Number(copyIndexText);
      const itemIndex = Number(itemIndexText);
      const logo = sponsorLogos[itemIndex];
      if (!logo) return null;
      const title = logo.sponsor.title;
      const logoContent =
        logo.kind === "image" ? (
          <AppImage
            src={logo.src}
            alt={copyIndex === 0 ? title : ""}
            width={logo.displayWidth}
            height={SPONSOR_LOGO_HEIGHT}
            sizes={`${logo.displayWidth}px`}
            loading="lazy"
            draggable={false}
          />
        ) : (
          <SponsorWordmark title={title} />
        );

      // 無限スクロール用の複製列は aria-hidden。操作要素を内包すると
      // Lighthouse違反になるため、先頭列だけをボタンにする。
      if (copyIndex > 0) {
        return (
          <span
            className="inline-flex cursor-pointer"
            onClick={() => handleSponsorClick(itemIndex)}
            aria-hidden="true"
          >
            {logoContent}
          </span>
        );
      }

      return (
        <button
          type="button"
          onClick={() => handleSponsorClick(itemIndex)}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${title || "協賛企業"}の詳細を見る`}
        >
          {logoContent}
        </button>
      );
    },
    [sponsorLogos, handleSponsorClick]
  );

  if (logos.length === 0) {
    return null;
  }

  return (
    <>
      <LogoLoop
        logos={logos}
        speed={30}
        direction="left"
        pauseOnHover
        logoHeight={40}
        gap={48}
        ariaLabel={messages.sponsors.logosLabel}
        renderItem={renderItem}
      />
      <SponsorModal sponsor={selectedSponsor} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
