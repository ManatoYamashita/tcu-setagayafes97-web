import Image from "next/image";
import { aboutConfig } from "@/data/about";

/**
 * 委員長挨拶セクション — Grid散在レイアウト
 *
 * CSS Grid 12列を使い、各要素を独立した座標に配置。
 * ジグザグ・スタガーで散在感を演出する。
 * モバイルは通常フローで縦積み。
 */
export function ChairpersonSection() {
  const { sectionLabel, heading, briefDescription, name, position, image, subImage, message } =
    aboutConfig.chairpersonMessage;

  return (
    <section className="relative overflow-hidden bg-gray-50 py-24 lg:py-32">
      {/* ── 装飾三角形 ×6（lg以上のみ） ── */}
      <div
        className="hidden lg:block absolute z-0 top-16 right-[5%] w-20 h-20 bg-primary-200 rotate-[15deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute z-0 top-[12%] left-[8%] w-8 h-8 bg-primary-100 -rotate-[10deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute z-0 top-[42%] right-[30%] w-12 h-12 bg-primary-200/60 rotate-[40deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute z-0 top-[58%] left-[4%] w-6 h-6 bg-primary-200 rotate-[25deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute z-0 bottom-[18%] right-[8%] w-14 h-14 bg-primary-100 -rotate-[20deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />
      <div
        className="hidden lg:block absolute z-0 bottom-[8%] left-[20%] w-10 h-10 bg-primary-200/40 rotate-[55deg]"
        style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-8 sm:px-12 lg:px-16">
        {/* === モバイル: 通常フロー縦積み / デスクトップ: Grid 12列 === */}
        <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:gap-x-6 lg:gap-y-0">
          {/* ── ラベル (MESSAGE) ── col 7-10, row 1 */}
          <div className="lg:col-start-7 lg:col-end-10 lg:row-start-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">
              {sectionLabel}
            </p>
          </div>

          {/* ── 見出し ── col 7-13, row 2 */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-2 lg:mt-2 mb-8 lg:mb-12">
            <h2 className="font-heading text-3xl font-bold leading-tight text-gray-900 whitespace-pre-line lg:text-5xl">
              {heading}
            </h2>
          </div>

          {/* ── モバイル専用: 右端からはみ出す画像 ── */}
          <div className="relative -mr-16 ml-auto w-3/4 sm:-mr-20 sm:w-2/3 lg:hidden">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-l-2xl shadow-lg">
              <Image
                src={image}
                alt="委員長メイン写真"
                fill
                className="object-cover"
                sizes="75vw"
              />
            </div>
          </div>

          {/* ── briefDescription ── col 7-13, row 4 */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-4">
            <p className="text-base leading-[2] text-gray-600 whitespace-pre-line lg:text-lg">
              {briefDescription}
            </p>
          </div>

          {/* ── メイン画像 ── col 2-6, row 2-4 (span 3) */}
          <div className="lg:col-start-2 lg:col-end-6 lg:row-start-2 lg:row-end-5 lg:pt-8">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={image}
                alt="委員長メイン写真"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </div>

          {/* ── メッセージ本文 ── col 3-7, row 6 */}
          <div className="lg:col-start-3 lg:col-end-8 lg:row-start-6 lg:mt-24">
            <p className="text-sm leading-[2] text-gray-600 whitespace-pre-wrap lg:text-base">
              {message}
            </p>
          </div>

          {/* ── サブ画像 + 名前・役職 ── col 8-11, row 6（本文と並行） */}
          <div className="lg:col-start-8 lg:col-end-12 lg:row-start-6 lg:mt-36">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl shadow-lg">
              <Image
                src={subImage}
                alt="委員長サブ写真"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 25vw"
              />
            </div>
            <div className="mt-4 text-right">
              <p className="text-sm font-medium text-gray-700">{name}</p>
              <p className="mt-1 text-xs text-gray-400">{position}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
