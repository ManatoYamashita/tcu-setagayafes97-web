"use client";

import { useChromeNav } from "@/components/layout/useChromeNav";
import { AD_BANNERS_HEADING_ID } from "@/lib/ad-placements";
import type { Information } from "@/types/informations";
import { AdBannerLink } from "./AdBannerLink";

/**
 * 全ページのフッター上の広告欄（#481）
 *
 * 見出しで広告だと分かるようにする。並びは `priority` 順のまま（並べ替えない）。
 * 1件だけのときや最後の行が埋まらないときは、その行を中央にそろえる（#483）。
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
        {/* grid ではなく flex-wrap で並べ、幅は2列 / 3列のときと同じにする。
            1件だけのときや最後の行が埋まらないときに、左へ寄らず中央にそろう（#483） */}
        <ul className="flex flex-wrap justify-center gap-4">
          {ads.map((ad) => (
            <li
              key={ad.id}
              className="w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]"
            >
              <AdBannerLink
                ad={ad}
                sizes="(min-width: 64rem) 360px, (min-width: 40rem) 50vw, 100vw"
                newTabLabel={messages.ads.newTab}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
