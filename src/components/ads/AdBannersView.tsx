"use client";

import { useChromeNav } from "@/components/layout/useChromeNav";
import { AD_BANNERS_HEADING_ID } from "@/lib/ad-placements";
import type { Information } from "@/types/informations";
import { AdBannerList } from "./AdBannerList";

/**
 * 全ページのフッター上の広告欄（#481）
 *
 * 見出しで広告だと分かるようにする。並びは `priority` 順のまま（並べ替えない）。
 * バナーは入稿画像の大きさで出し、行は中央にそろえる（`AdBannerList`。#483 / #485）。
 * 文言はロケール別なのでクライアント側で引く（SponsorBannerText と同じ理由）。
 */
export function AdBannersView({ ads }: { ads: Information[] }) {
  const { messages } = useChromeNav();

  return (
    <section aria-labelledby={AD_BANNERS_HEADING_ID} className="bg-white pt-16">
      <div className="container mx-auto max-w-6xl px-4">
        <h2
          id={AD_BANNERS_HEADING_ID}
          // 固定バナーを閉じた後のフォーカスの行き先（MobileAdDock）
          tabIndex={-1}
          className="mb-8 text-center text-2xl font-bold text-gray-900"
        >
          {messages.ads.heading}
        </h2>
        <AdBannerList ads={ads} newTabLabel={messages.ads.newTab} />
      </div>
    </section>
  );
}
