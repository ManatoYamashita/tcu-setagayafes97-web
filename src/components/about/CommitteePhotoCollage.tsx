import { AppImage } from "@/components/ui/AppImage";
import { aboutConfig } from "@/data/about";

import { CommitteeCollageMotion } from "./CommitteeCollageMotion";

/**
 * 委員会の写真コラージュ — FestivalIntroSection の「組織構成」と「関連ページ」の間
 *
 * 3列（左・中央・右）に縦長の写真を2枚ずつ置き、列ごとに縦位置をずらす。
 * 画面に出すテキストは持たず、写真だけで委員会の雰囲気を伝える。
 *
 * - 列幅の比は 1 : 1.5 : 1。中央列だけ大きくして視線の中心を作る。
 * - 縦のずれは `margin-top` の `%` で持つ。`%` は親（列）の**幅**が基準なので、
 *   画面幅が変わっても列の幅に比例してずれ、形が崩れない。
 * - モバイルでも3列のまま縮める。列を組み替えると参考にした形が保てない。
 *
 * 写真の差し替え・並べ替えは `aboutConfig.committeeCollage`（パス）と
 * `festivalIntroContents[*].collageAlts`（alt）の2箇所で済む。alt の並びは
 * 左列の上から → 中央列 → 右列の順。
 */
const COLUMN_OFFSETS = ["mt-[40%]", "mt-0", "mt-[110%]"] as const;

/**
 * 表示幅は、コンテナ（max-w-4xl から左右余白を引いた最大 800px）を 1 : 1.5 : 1 と
 * 列間の余白で割って出している。public/ の画像は unoptimized で1種類しか無いため、
 * ここはブラウザの先読みの優先度にしか効かない。
 */
const COLUMN_SIZES = [
  "(min-width: 56rem) 220px, 26vw",
  "(min-width: 56rem) 330px, 40vw",
  "(min-width: 56rem) 220px, 26vw",
] as const;

export function CommitteePhotoCollage({ label, alts }: { label: string; alts: readonly string[] }) {
  const { columns } = aboutConfig.committeeCollage;
  // alt は全列を通した通し番号で引く。各列の先頭が何枚目かを先に出しておく
  const columnStarts = columns.map((_, columnIndex) =>
    columns.slice(0, columnIndex).reduce((count, column) => count + column.length, 0)
  );

  return (
    <div className="relative">
      <CommitteeCollageMotion />

      <div
        role="group"
        aria-label={label}
        className="grid grid-cols-[1fr_1.5fr_1fr] items-start gap-3 sm:gap-5"
      >
        {columns.map((column, columnIndex) => (
          <div
            key={column[0]}
            className={`${COLUMN_OFFSETS[columnIndex]} flex flex-col gap-3 sm:gap-5`}
            data-committee-collage-stagger
          >
            {column.map((src, rowIndex) => (
              <div key={src} className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                <AppImage
                  src={src}
                  alt={alts[columnStarts[columnIndex] + rowIndex] ?? ""}
                  fill
                  sizes={COLUMN_SIZES[columnIndex]}
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
