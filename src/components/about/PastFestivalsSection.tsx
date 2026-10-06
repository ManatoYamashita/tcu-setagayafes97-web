import { AppImage } from "@/components/ui/AppImage";
import { pastFestivalSites, type PastFestivalsContent } from "@/data/past-festivals";

/**
 * 過去の世田谷祭 — /about の最下部（開催概要の後ろ、共通 Footer の協賛バーの直前）
 *
 * 歴代の公式サイトのスクリーンショットを、同じ大きさのサムネイルで格子状に並べる。
 * 各サムネイルは当時のサイト（archive.setagayafes.org など）へのリンクで、新しいタブで開く。
 *
 * - サムネイルは焼き直しの段階で 4:3 に切り抜いてある（上端基準）。CSS 側でも
 *   `aspect-[4/3]` を指定し、画像の読み込み前から枠の高さを確保する。
 * - 画像は回数・年のキャプションと同じ情報しか持たないため、alt は空にして
 *   リンク名の重複読み上げを避ける。リンク名は「第89回 2018年（新しいタブで開きます）」になる。
 * - 列数は 2 → 3（sm）→ 4（md）→ 5（lg）。
 */

/**
 * 表示幅の目安。2列は viewport 639px で最大の約272px、lg 以上は約200px
 * （サムネイルの box 560x420 はこの最大値の2倍から決めている）。public/ の画像は
 * unoptimized で1種類しか無いため、ここはブラウザの先読みの優先度にしか効かない。
 */
const THUMBNAIL_SIZES =
  "(min-width: 64rem) 210px, (min-width: 48rem) 22vw, (min-width: 40rem) 29vw, 44vw";

export function PastFestivalsSection({ content }: { content: PastFestivalsContent }) {
  const { heading, lead, editionLabel, yearLabel, opensInNewTab } = content;

  return (
    <section className="pb-16 lg:pb-24" aria-labelledby="past-festivals-heading">
      <div className="mx-auto max-w-6xl px-6 sm:px-8 lg:px-12">
        <h2
          id="past-festivals-heading"
          className="text-center font-heading text-2xl font-bold text-gray-900 lg:text-3xl"
        >
          {heading}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-sm leading-7 text-pretty text-gray-700 sm:text-base">
          {lead}
        </p>

        <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pastFestivalSites.map((site) => (
            <li key={site.edition}>
              <a
                href={site.href}
                target="_blank"
                rel="noopener noreferrer"
                className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
              >
                <AppImage
                  src={site.image.src}
                  alt=""
                  width={site.image.width}
                  height={site.image.height}
                  sizes={THUMBNAIL_SIZES}
                  className="aspect-[4/3] h-auto w-full bg-gray-100 object-cover outline-1 -outline-offset-1 outline-gray-900/10 transition-opacity duration-200 hoverable:group-hover:opacity-80"
                />
                <span className="mt-3 flex items-baseline justify-between gap-2">
                  <span className="text-sm font-bold text-gray-900 underline-offset-4 hoverable:group-hover:underline sm:text-base">
                    {editionLabel(site.edition)}
                  </span>{" "}
                  {/* 空白はリンク名で回数と年を区切るため（flex の中なので見た目には影響しない） */}
                  <span className="text-xs text-gray-700 tabular-nums sm:text-sm">
                    {yearLabel(site.year)}
                  </span>
                </span>
                <span className="sr-only">{opensInNewTab}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
