import { AppImage } from "@/components/ui/AppImage";
import type { Information } from "@/types/informations";

interface AdBannerLinkProps {
  ad: Information;
  /** `AppImage` の sizes。置き場所ごとに表示幅が違う */
  sizes: string;
  /** 外部リンクに添える「新しいタブで開きます」（ロケール別） */
  newTabLabel: string;
  className?: string;
}

/**
 * 広告バナー1枚（#481）
 *
 * 横長の枠（9:2）に `image` を収める。画像が無ければ団体名を文字で出す。
 * `url` があれば外部リンクにし、無ければただの枠にする。リンクの名前は団体名。
 * 広告欄（`AdBannersView`）とモバイルの固定バナー（`MobileAdDock`）で共有する。
 */
export function AdBannerLink({ ad, sizes, newTabLabel, className = "" }: AdBannerLinkProps) {
  const face = ad.image?.url ? (
    <AppImage src={ad.image.url} alt={ad.title} fill className="object-contain" sizes={sizes} />
  ) : (
    <span className="px-3 text-center text-sm font-bold text-balance [overflow-wrap:anywhere] text-gray-900 md:text-base">
      {ad.title}
    </span>
  );

  const frameClassName = `relative flex aspect-[9/2] w-full items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white ${className}`;

  if (!ad.url) {
    return <div className={frameClassName}>{face}</div>;
  }

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${frameClassName} transition-[border-color,box-shadow] hoverable:hover:border-primary-300 hoverable:hover:shadow-md focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600`}
    >
      {face}
      <span className="sr-only">{newTabLabel}</span>
    </a>
  );
}
