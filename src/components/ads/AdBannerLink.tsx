import type { CSSProperties, ReactNode } from "react";
import { AppImage } from "@/components/ui/AppImage";
import { adImageSize } from "@/lib/ad-placements";
import type { Information } from "@/types/informations";

interface AdLinkProps {
  ad: Information;
  /** 外部リンクに添える「新しいタブで開きます」（ロケール別） */
  newTabLabel: string;
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

/**
 * 広告1件の外枠。`url` があれば外部リンク、無ければただの枠にする
 *
 * 広告欄のバナー（`AdBannerLink`）とモバイルの固定バナー（`MobileAdDock`）で共有する。
 */
export function AdLink({ ad, newTabLabel, className = "", style, children }: AdLinkProps) {
  if (!ad.url) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    );
  }

  return (
    <a
      href={ad.url}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={`${className} focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600`}
      style={style}
    >
      {children}
      <span className="sr-only">{newTabLabel}</span>
    </a>
  );
}

interface AdBannerLinkProps {
  ad: Information;
  newTabLabel: string;
}

/**
 * 広告バナー1枚（#481 / #485）
 *
 * 入稿された画像の大きさ（縦横比）のまま出す。拡大はせず、狭い画面では親の幅まで縮める。
 * 広告そのもののデザインを崩さないよう、画像には枠線を付けない。
 * 画像が無ければ、団体名を横長（9:2）の枠に文字で出す。リンクの名前は団体名。
 */
export function AdBannerLink({ ad, newTabLabel }: AdBannerLinkProps) {
  if (!ad.image?.url) {
    return (
      <AdLink
        ad={ad}
        newTabLabel={newTabLabel}
        className="flex aspect-[9/2] w-[360px] max-w-full items-center justify-center rounded-lg border border-gray-200 bg-white px-3 transition-[border-color,box-shadow] hoverable:hover:border-primary-300 hoverable:hover:shadow-md"
      >
        <span className="text-center text-sm font-bold text-balance [overflow-wrap:anywhere] text-gray-900 md:text-base">
          {ad.title}
        </span>
      </AdLink>
    );
  }

  const { width, height } = adImageSize(ad.image);

  return (
    <AdLink
      ad={ad}
      newTabLabel={newTabLabel}
      className="relative block max-w-full overflow-hidden rounded-lg transition-shadow hoverable:hover:shadow-md"
      style={{ width, aspectRatio: `${width} / ${height}` }}
    >
      <AppImage
        src={ad.image.url}
        alt={ad.title}
        fill
        className="object-contain"
        sizes={`${width}px`}
      />
    </AdLink>
  );
}
