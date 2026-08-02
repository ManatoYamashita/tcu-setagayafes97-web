import Image from "next/image";
import { aboutConfig } from "@/data/about";

/**
 * テーマ解説 + 委員長挨拶セクション — Grid散在レイアウト
 *
 * lg 以上では CSS Grid 12列を使い、各要素を独立した座標に配置してジグザグ・
 * スタガーで散在感を演出する。lg 未満は flex の通常フローで縦積みになるため、
 * グリッド座標に依存せず DOM 順がそのまま表示順になる。
 *
 * DOM 順は縦積み時の読み順（テーマ → 挨拶ヘッダー → 署名 → 本文）に合わせてあり、
 * lg 以上は全要素が col-start / row-start で明示配置されるため DOM 順の影響を受けない。
 */
export function ChairpersonSection() {
  const {
    themeLabel,
    heading,
    briefDescription,
    messageLabel,
    messageHeading,
    name,
    position,
    image,
    subImage,
    imageAlt,
    message,
  } = aboutConfig.chairpersonMessage;

  return (
    <section
      className="relative overflow-hidden bg-gray-50 py-24 lg:py-32"
      aria-labelledby="about-theme-heading"
    >
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
          {/* ── テーマラベル (THEME) ── col 7-10, row 1 */}
          <div className="lg:col-start-7 lg:col-end-10 lg:row-start-1">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-700">
              {themeLabel}
            </p>
          </div>

          {/* ── テーマ見出し ── col 7-13, row 2 */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-2 lg:mt-2 mb-8 lg:mb-12">
            <h2
              id="about-theme-heading"
              className="font-heading text-3xl font-bold leading-tight text-gray-900 whitespace-pre-line sm:text-4xl lg:text-5xl"
            >
              {heading}
            </h2>
          </div>

          {/*
            ── 世田谷祭の様子（1ノードで両レイアウトを兼ねる） ──
            lg 未満: 右端からはみ出す 4:3 の角丸。lg 以上: col 2-6 / row 2-4 の正円。
            形状差は Tailwind の lg バリアントのみで表現し、DOM を二重に持たない。

            - 負のマージンは左右パディング（px-8 sm:px-12）と対で増やす。揃えないと
              sm 以上で画面端まで届かず、角と影が縦帯として見えてしまう。
            - lg:max-h-none は必須。外すと 1152px 以上で正円が max-h-80 に潰れる
              （1024px では潰れないため見落としやすい）。
          */}
          <div className="-mr-8 ml-[20%] sm:-mr-12 lg:col-start-2 lg:col-end-6 lg:row-start-2 lg:row-end-5 lg:mr-0 lg:ml-0 lg:pt-8">
            <div className="relative aspect-[4/3] max-h-64 w-full overflow-hidden rounded-l-2xl shadow-lg sm:max-h-80 md:max-h-96 lg:aspect-square lg:max-h-none lg:rounded-full">
              <Image
                src={image}
                alt={imageAlt}
                fill
                className="object-cover object-[center_25%]"
                sizes="(min-width: 72rem) 330px, (min-width: 64rem) 30vw, 80vw"
              />
            </div>
          </div>

          {/*
            ── テーマ解説 ── col 7-13, row 4
            max-w-2xl は 768〜1023px 帯で1行が58字に伸びるのを抑えるためのもの。
            lg のカラム幅（最大500px）はこれを下回るため lg では効かない。
          */}
          <div className="lg:col-start-7 lg:col-end-13 lg:row-start-4">
            <p className="max-w-2xl text-base leading-[2] text-gray-600 whitespace-pre-line lg:max-w-none lg:text-lg">
              {briefDescription}
            </p>
          </div>

          {/*
            ── 挨拶ブロックのヘッダー ── col 3-7, row 5（テーマ解説との境界）
            lg は gap-y-0 なので row 6 の本文との間隔が生まれない。lg:pb-8 で
            lg 未満の gap-8 と同じリズムを確保する。
          */}
          <div className="border-t border-gray-200 pt-8 lg:col-start-3 lg:col-end-8 lg:row-start-5 lg:mt-24 lg:pt-10 lg:pb-8">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-700">
              {messageLabel}
            </p>
            <h3 className="mt-2 font-heading text-2xl font-bold text-gray-900 lg:text-3xl">
              {messageHeading}
            </h3>
          </div>

          {/*
            ── 署名（ポートレート + 名前・役職） ── col 8-11, row 6（本文と並行）
            lg 未満は本文の直上に置く署名カード（小さい丸アバターと名前の横並び）。
            lg 以上は従来どおり全幅の正円 + 右寄せの名前に戻る。
          */}
          <div className="lg:col-start-8 lg:col-end-12 lg:row-start-6 lg:mt-36">
            <div className="flex items-center gap-4 lg:block">
              {/* shrink-0 は必須。外すと役職名が長いときにアバターが縮み、
                  aspect-square の作用で高さまで一緒に縮む。 */}
              <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded-full shadow-lg sm:w-28 lg:w-full">
                {/* 氏名・役職が隣接して読み上げられるため alt は空にする（装飾扱い） */}
                <Image
                  src={subImage}
                  alt=""
                  fill
                  className="object-cover object-[center_25%]"
                  sizes="(min-width: 72rem) 330px, (min-width: 64rem) 30vw, 112px"
                />
              </div>
              <div className="min-w-0 lg:mt-4 lg:text-right">
                <p className="text-sm font-medium text-gray-700">{name}</p>
                <p className="mt-1 text-xs leading-relaxed text-gray-600">{position}</p>
              </div>
            </div>
          </div>

          {/* ── 挨拶本文 ── col 3-7, row 6（max-w-2xl の意図はテーマ解説と同じ） */}
          <div className="lg:col-start-3 lg:col-end-8 lg:row-start-6">
            <p className="max-w-2xl text-sm leading-[2] text-gray-600 whitespace-pre-wrap sm:text-base lg:max-w-none">
              {message}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
