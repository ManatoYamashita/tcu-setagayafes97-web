import { AppImage } from "@/components/ui/AppImage";
import Link from "next/link";

import { specialBanner } from "@/data/special-banner";
import { getSpecialEventById } from "@/lib/events";
import { cn } from "@/lib/utils";

import { SpecialGuestMotion } from "./SpecialGuestMotion";

/**
 * 著名人企画（スペシャル企画）の告知セクション
 *
 * 出演者ロゴ・横長に切った写真・日時と会場を見せ、著名人企画LPへ誘導します。
 * トップページ（Hero の直下）と企画一覧ページ（/events の最下部）の2箇所で使います。
 * 券種や販売方法は載せず、LP のチケット表へ任せます（理由は src/data/special-banner.ts）。
 *
 * 文言は microCMS ではなく src/data/special-banner.ts が持ちますが、リンク先が実在するか
 * どうかだけは getSpecialEventById() で確認します。ID が変わって LP に到達できない場合は、
 * リンク切れを見せずにセクションごと引っ込めます。
 *
 * レイアウトは画面幅で2段階に変わります。
 *
 * - 〜767px: 縦積み。写真が上、テキストが下
 * - 768px〜: 12列グリッドで写真が左（md 7列 / lg 8列）、テキストが右。
 *   見出し（ロゴ＋横罫）だけを左へ引き出して写真の右端に重ねる
 *
 * 写真の右上は `.special-guest-notch`（globals.css）の mask で四分円に欠きます。
 *
 * DOM 順は「見出し → 本文 → CTA → 写真」で固定し、見た目の入れ替えは写真側の
 * `order-first` だけで行います。DOM を並べ替えると h2 より先に写真が読み上げられ、
 * セクションの主題が伝わらなくなるためです。
 */

/**
 * 置き場所ごとの見た目
 *
 * - `hero`: トップページ用。Hero と ABOUT を包む `.hero-about-bg` の中に入るため、
 *   自前の背景を持たずグラデーションを透かします。
 * - `sheet`: /events 用。白いシートの中へ地続きに置き、上の区切り線だけで前の要素と分けます。
 *
 * どちらも自前の背景を持ちません。`sheet` を囲まないのは、白いシート内のセクション区切りが
 * `/special/[id]` の流儀に揃っているためです。あちらは親の `divide-y divide-gray-200` と
 * 子の `py-8` だけで各セクションを分け、子には枠・影・背景を持たせません
 * （src/app/special/[id]/page.tsx）。単独のセクションである本コンポーネントでは、
 * その等価物が上端の `border-t border-gray-200` になります。
 * 色を `gray-200` にしているのは、白いシート内の罫線が例外なくこの不透明値だからです
 * （半透明の `border-gray-200/20` は暗色背景時代の名残で、白の上では見えません）。
 */
type SpecialGuestSectionVariant = "hero" | "sheet";

interface SpecialGuestSectionProps {
  variant?: SpecialGuestSectionVariant;
}

export async function SpecialGuestSection({ variant = "hero" }: SpecialGuestSectionProps = {}) {
  const event = await getSpecialEventById(specialBanner.eventId);

  if (!event) {
    return null;
  }

  const { category, name, nameLogo, image, headline, ctaLabel } = specialBanner;
  const isSheet = variant === "sheet";

  /*
   * 写真の実描画幅は variant で変わる。/events は PageSheetLayout の `mx-*` `px-*` と
   * 呼び出し側の container の `px-4` が重なり、横方向の余白がトップページより
   * 片側 32px（lg では 48px）多い。同じ sizes を使うと srcset の過大な候補を掴むので分ける。
   * 写真の列幅は md で 7/12（≒ 0.584）、lg で 8/12（≒ 0.667）、max-w-6xl で 768px に頭打ち。
   */
  const imageSizes = isSheet
    ? "(min-width: 1024px) min(768px, calc((100vw - 10rem) * 0.667)), (min-width: 768px) calc((100vw - 8rem) * 0.584), calc(100vw - 6rem)"
    : "(min-width: 1024px) min(768px, calc((100vw - 2rem) * 0.667)), (min-width: 768px) calc((100vw - 2rem) * 0.584), calc(100vw - 2rem)";

  return (
    <section
      className={cn(
        isSheet
          ? // 白いシートの白をそのまま使い、上の区切り線だけで前の要素と分ける。
            // 左右の余白は親の container が持つため、ここでは上下だけ。
            // 最下部にあるため描画を遅延させる（推定高さは globals.css の
            // `.deferred-section--special`）
            "deferred-section deferred-section--special border-t border-gray-200 pt-12 sm:pt-14 lg:pt-16"
          : // z-10 は必須。直後の ABOUT が `-mt-48` でこのセクションへ 192px 潜り込み、
            // その中の装飾blob（`absolute inset-0`）が上に乗るため、Hero と同じ層へ上げる。
            // content-visibility はフォールド直下では効果が無く CLS だけ残るので付けない
            "relative z-10 py-20 lg:py-28"
      )}
    >
      {/* 入場モーション。DOM は出さず、下の data 属性を探して animate する */}
      <SpecialGuestMotion />

      <div className={isSheet ? undefined : "container mx-auto px-4"}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-y-0">
          {/* テキスト側。直下の子（見出し → 本文 → CTA）が入場の stagger 単位になる。
              写真より前面に置くため relative z-10。見出しだけが写真へ重なる */}
          <div
            className="relative z-10 md:col-start-8 md:col-end-13 md:row-start-1 md:self-end md:pl-6 lg:col-start-9 lg:pl-8"
            data-special-guest-stagger
          >
            {/* 見出し（トップページは Kaisei Opti を読み込まないため font-sans を明示する）。
                出演者名はロゴ画像で、alt が見出しのアクセシブル名を担う。
                md 以上では左の余白（pl）より大きく引き出し、ロゴの頭を写真の右端へ重ねる。
                重なった部分は暗い衣装の上に乗るため、md 以上だけ白い光彩で輪郭を保つ */}
            <h2 className="flex items-center gap-4 font-sans md:-ml-12 lg:-ml-16">
              <AppImage
                src={nameLogo.src}
                alt={name}
                width={nameLogo.width}
                height={nameLogo.height}
                sizes="(min-width: 1024px) 260px, (min-width: 768px) 200px, 220px"
                className="h-auto w-[220px] shrink-0 md:w-[200px] md:drop-shadow-[0_0_6px_rgba(255,255,255,0.9)] lg:w-[260px]"
              />
              <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-gray-900" />
            </h2>

            {/* 本文。左に縦書きの分類ラベル、右に日時と会場。
                会場名（14字）が1行に収まるよう列幅に合わせて文字を詰める。
                収まらないと「アリー｜ナ」のように語の途中で折り返す（768px / 1024px で実測） */}
            <div className="mt-6 flex gap-4 lg:mt-8 lg:gap-5">
              <p className="font-sans text-xs font-bold tracking-[0.2em] text-primary-700 [writing-mode:vertical-rl] sm:text-sm">
                {category}
              </p>
              <p className="font-sans text-lg leading-[1.6] font-bold text-gray-900 md:text-base lg:text-lg xl:text-xl">
                {headline.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </p>
            </div>

            <div className="mt-4 flex justify-end lg:mt-6">
              <Link
                href={`/special/${event.id}`}
                className="group inline-flex min-h-12 items-center gap-2 font-sans text-sm font-semibold text-gray-900 hover:text-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
              >
                <span className="border-b border-current pb-0.5">{ctaLabel}</span>
                <svg
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 12h14M13 6l6 6-6 6"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* 写真側。縦積みのときだけ order で先頭へ出す。正方形の原画を横長に切るため、
              顔が入るよう切り抜き位置を上寄せにする */}
          <div
            className="special-guest-notch relative order-first aspect-[4/3] w-full overflow-hidden md:order-none md:col-start-1 md:col-end-8 md:row-start-1 md:aspect-[3/2] lg:col-end-9"
            data-special-guest-reveal
          >
            <AppImage
              src={image.src}
              alt={image.alt}
              fill
              sizes={imageSizes}
              className="object-cover object-[50%_30%]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
