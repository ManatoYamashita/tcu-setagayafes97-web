"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { LogoLoop, type LogoItem } from "@/components/ui/LogoLoop";
import { SponsorModal } from "./SponsorModal";
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
  const [selectedSponsor, setSelectedSponsor] = useState<Information | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredSponsors = useMemo(() => sponsors.filter((s) => s.image?.url), [sponsors]);

  const logos = useMemo(
    () =>
      filteredSponsors.map((s) => ({
        src: s.image!.url,
        alt: s.title,
        width: s.image!.width,
        height: s.image!.height,
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

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const renderItem = useCallback(
    (item: LogoItem, key: string) => {
      const [copyIndexText, itemIndexText] = key.split("-");
      const copyIndex = Number(copyIndexText);
      const itemIndex = Number(itemIndexText);
      const imgItem = item as { src: string; alt?: string; width: number; height: number };
      const src = imgItem.src;
      const alt = imgItem.alt ?? "";
      const displayWidth = Math.max(1, Math.round((imgItem.width / imgItem.height) * 40));
      const logoImage = (
        <Image
          src={src}
          alt={copyIndex === 0 ? alt : ""}
          width={displayWidth}
          height={40}
          sizes={`${displayWidth}px`}
          loading="lazy"
          draggable={false}
        />
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
            {logoImage}
          </span>
        );
      }

      return (
        <button
          type="button"
          onClick={() => handleSponsorClick(itemIndex)}
          className="cursor-pointer border-0 bg-transparent p-0"
          aria-label={`${alt || "協賛企業"}の詳細を見る`}
        >
          {logoImage}
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
