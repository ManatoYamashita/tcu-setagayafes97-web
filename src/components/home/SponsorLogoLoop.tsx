"use client";

import { useMemo, useState, useCallback } from "react";
import { LogoLoop, type LogoItem } from "@/components/ui/LogoLoop";
import { SponsorModal } from "./SponsorModal";
import type { Information } from "@/types/informations";

interface SponsorLogoLoopProps {
  sponsors: Information[];
}

/**
 * 協賛企業ロゴの無限スクロールアニメーション（クライアントコンポーネント）
 * ロゴクリックでスポンサー詳細モーダルを表示
 */
export function SponsorLogoLoop({ sponsors }: SponsorLogoLoopProps) {
  const [selectedSponsor, setSelectedSponsor] = useState<Information | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSponsors = useMemo(() => sponsors.filter((s) => s.image?.url), [sponsors]);

  const logos = useMemo(
    () =>
      filteredSponsors.map((s) => ({
        src: s.image!.url,
        alt: s.title,
      })),
    [filteredSponsors]
  );

  const handleSponsorClick = useCallback(
    (index: number) => {
      const sponsor = filteredSponsors[index];
      if (sponsor) {
        setSelectedSponsor(sponsor);
        setIsModalOpen(true);
      }
    },
    [filteredSponsors]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const renderItem = useCallback(
    (item: LogoItem, key: string) => {
      const itemIndex = Number(key.split("-")[1]);
      const imgItem = item as { src: string; alt?: string };
      const src = imgItem.src;
      const alt = imgItem.alt ?? "";

      return (
        <button
          type="button"
          onClick={() => handleSponsorClick(itemIndex)}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${alt || "協賛企業"}の詳細を見る`}
        >
          <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />
        </button>
      );
    },
    [handleSponsorClick]
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
        fadeOut
        fadeOutColor="oklch(68% 0.175 314deg)"
        ariaLabel="協賛企業ロゴ"
        renderItem={renderItem}
      />
      <SponsorModal sponsor={selectedSponsor} isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
}
