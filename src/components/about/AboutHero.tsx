import Image from "next/image";
import { aboutConfig } from "@/data/about";

/**
 * About ページ専用ヒーロー — フォトコラージュレイアウト
 *
 * - デスクトップ: 3枚の写真を横一列に配置、下方にキャッチコピー
 * - モバイル: テキスト + 3枚縦積み
 * - Server Component
 */
export function AboutHero() {
  const { subtitle, heading, description, photos } = aboutConfig.heroCollage;

  return (
    <section className="relative w-full overflow-hidden bg-primary px-4 pb-12 pt-28 sm:px-6 lg:px-8 lg:pt-24">
      <div className="mx-auto max-w-7xl">
        {/* ── Mobile layout ── */}
        <div className="lg:hidden">
          {/* テキスト */}
          <div className="mb-6">
            <span className="mb-2 block text-sm font-semibold uppercase tracking-widest text-gray-600">
              {subtitle}
            </span>
            <h1 className="text-4xl font-bold leading-tight tracking-tight text-gray-900 sm:text-5xl">
              {heading.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
          </div>

          {/* 写真グリッド */}
          <div className="mb-4 space-y-3">
            {/* Photo 1 — 横長フル幅 */}
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl">
              <Image
                src={photos[0].src}
                alt={photos[0].alt}
                fill
                className="object-cover"
                sizes="100vw"
                priority
              />
            </div>

            {/* Photo 2 & 3 — 2カラム */}
            <div className="grid grid-cols-2 gap-3">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={photos[1].src}
                  alt={photos[1].alt}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image
                  src={photos[2].src}
                  alt={photos[2].alt}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-right text-sm text-gray-600">{description}</p>
        </div>

        {/* ── Desktop layout — 横一列フォトコラージュ ── */}
        <div className="hidden lg:block">
          {/* 写真行 — 同サイズ3枚横並び */}
          <div className="flex gap-4">
            {photos.slice(0, 3).map((photo, i) => (
              <div key={i} className="relative flex-1 overflow-hidden rounded-2xl">
                <div className="aspect-[4/3]">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    className="object-cover"
                    sizes="33vw"
                    priority={i === 0}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* テキスト行 — 写真の下方 */}
          <div className="mt-6 flex items-end justify-between">
            <h1 className="text-5xl font-bold leading-tight tracking-tight text-gray-900 xl:text-6xl">
              {heading.map((line, i) => (
                <span key={i} className="block">
                  {line}
                </span>
              ))}
            </h1>
            <p className="max-w-xs text-right text-sm leading-relaxed text-gray-600">
              {description}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
