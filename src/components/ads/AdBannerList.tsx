import type { Information } from "@/types/informations";
import { AdBannerLink } from "./AdBannerLink";

/**
 * 広告バナーの並び（#481 / #485）
 *
 * フッター上の広告欄（`AdBannersView`）と、協賛・協力ページの「広告掲載」節で共有する。
 * 各バナーは入稿画像の大きさで出るので幅はバナーが決め、行は中央にそろえる
 * （1件だけのときや最後の行が埋まらないときに左へ寄らない。#483）。
 * フックを持たないので、サーバーコンポーネントからもそのまま使える。
 */
export function AdBannerList({ ads, newTabLabel }: { ads: Information[]; newTabLabel: string }) {
  return (
    <ul className="flex flex-wrap justify-center gap-4">
      {ads.map((ad) => (
        <li key={ad.id} className="max-w-full">
          <AdBannerLink ad={ad} newTabLabel={newTabLabel} />
        </li>
      ))}
    </ul>
  );
}
