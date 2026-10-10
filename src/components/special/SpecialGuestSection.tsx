import { AppImage } from "@/components/ui/AppImage";
import Link from "next/link";

import { specialBanner } from "@/data/special-banner";
import { getSpecialEventById } from "@/lib/events";
import { cn } from "@/lib/utils";

import { SpecialGuestMotion } from "./SpecialGuestMotion";

/**
 * 著名人企画（スペシャル企画）の告知セクション
 *
 * 企画名・出演者ロゴ・写真・日時と会場・チケットの要点・入場の条件を見せ、
 * 著名人企画LPへ誘導します。トップページ（Hero の直下）と企画一覧ページ（/events の最下部）の
 * 2箇所で使います。チケットは券種を必ず両方載せます（理由は src/data/special-banner.ts）。
 *
 * 文言は microCMS ではなく src/data/special-banner.ts が持ちますが、リンク先が実在するか
 * どうかだけは getSpecialEventById() で確認します。ID が変わって LP に到達できない場合は、
 * リンク切れを見せずにセクションごと引っ込めます。
 *
 * レイアウトは画面幅で2段階に変わります。
 *
 * - 〜767px: 縦積み。写真が上、テキストが下
 * - 768px〜: 12列グリッドで写真が左 6列、テキストが右 6列。
 *   見出し（ロゴ＋横罫）だけを左へ引き出して写真の右端に重ねる
 *
 * 写真は切り抜かない四角形です。トップページ（`hero`）では画面の左端まで広げます
 * （下の「写真を画面の左端へ広げる」）。入場モーション（SpecialGuestMotion）は窓を左端から
 * 右へ開きます。モーション軽減時や JS が無いときは最初から全体が見えます。
 *
 * DOM 順は「見出し → 本文 → チケット → 注記 → CTA → 写真」で固定し、見た目の入れ替えは写真側の
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

  const { category, title, name, nameLogoFilled, image, headline, tickets, notes, ctaLabel } =
    specialBanner;
  const isSheet = variant === "sheet";

  /*
   * 写真の実描画幅は variant で変わる。
   * - hero: 画面の左端から広げるので、md 以上は画面の半分、縦積みでは画面幅から右の余白を引いた幅。
   * - sheet: /events は PageSheetLayout の `mx-*` `px-*` と呼び出し側の container の `px-4` が重なる。
   *   写真の列幅は md 以上で 6/12（= 0.5）、max-w-6xl で 576px に頭打ち。縦積みは max-w-sm（384px）。
   */
  const imageSizes = isSheet
    ? "(min-width: 1024px) min(576px, calc((100vw - 10rem) * 0.5)), (min-width: 768px) calc((100vw - 8rem) * 0.5), min(384px, calc(100vw - 6rem))"
    : "(min-width: 768px) 50vw, 100vw";

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
            // overflow-x-clip は、写真を左へ広げる `50vw` がクラシックなスクロールバーの幅だけ
            // 画面からはみ出して横スクロールを生むのを防ぐため（y 方向は切らない）
            "relative z-10 overflow-x-clip py-20 lg:py-28"
      )}
    >
      {/* 入場モーション。DOM は出さず、下の data 属性を探して animate する */}
      <SpecialGuestMotion />

      <div className={isSheet ? undefined : "container mx-auto px-4"}>
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-y-8 md:grid-cols-12 md:gap-y-0">
          {/* テキスト側。直下の子（見出し → 本文 → チケット → 注記 → CTA）が入場の stagger 単位になる。
              写真より前面に置くため relative z-10。見出しだけが写真へ重なる */}
          <div
            className="relative z-10 md:col-start-7 md:col-end-13 md:row-start-1 md:self-center md:pl-6 lg:pl-8"
            data-special-guest-stagger
          >
            {/* 見出し（トップページは Kaisei Opti を読み込まないため font-sans を明示する）。
                1行目が企画名の文字、2行目が出演者名のロゴ。見出しは1つに保ち、
                アクセシブル名は「企画名 + ロゴの alt」になる。
                md 以上ではロゴの行だけを左の余白（pl）より大きく引き出し、ロゴの頭を写真の右端へ重ねる。
                企画名まで引き出すと、白で塗れない文字が暗い写真の上に乗って読めなくなる。
                ロゴは内側を白で塗った版なので、暗い写真の上でも文字の中身が抜けない */}
            <h2 className="font-sans">
              <span className="block text-sm font-bold tracking-[0.12em] text-primary-700 sm:text-base">
                {title}
              </span>
              <span className="mt-2 flex items-center gap-4 md:-ml-12 lg:-ml-16">
                <AppImage
                  src={nameLogoFilled.src}
                  alt={name}
                  width={nameLogoFilled.width}
                  height={nameLogoFilled.height}
                  sizes="(min-width: 1024px) 260px, (min-width: 768px) 200px, 220px"
                  className="h-auto w-[220px] shrink-0 md:w-[200px] lg:w-[260px]"
                />
                <span aria-hidden="true" className="h-px min-w-8 flex-1 bg-gray-900" />
              </span>
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

            {/* チケットの要点。券種は必ず両方並べる（片方だけだと購入資格を誤読される） */}
            <dl className="mt-5 border-y border-dotted border-primary-700/30 lg:mt-6">
              {tickets.map((ticket, index) => (
                <div
                  key={ticket.term}
                  className={cn(
                    "grid grid-cols-[3.5rem_1fr] gap-x-3 py-3 sm:grid-cols-[4.5rem_1fr]",
                    index > 0 && "border-t border-dotted border-primary-700/30"
                  )}
                >
                  <dt className="font-sans text-xs font-bold tracking-[0.1em] text-primary-700 sm:text-sm">
                    {ticket.term}
                  </dt>
                  <dd className="font-sans text-sm leading-[1.7] text-gray-700">
                    {ticket.lines.map((line, lineIndex) => (
                      <span
                        key={line}
                        className={cn("block", lineIndex === 0 && "font-bold text-gray-900")}
                      >
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            {/* 入場の条件 */}
            <ul className="mt-3 space-y-0.5 font-sans text-xs leading-[1.7] text-gray-600">
              {notes.map((note) => (
                <li key={note} className="text-pretty">
                  ※{note}
                </li>
              ))}
            </ul>

            <div className="mt-2 flex justify-end lg:mt-4">
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

          {/* 写真側。縦積みのときだけ order で先頭へ出す。
              入場モーションが data-special-guest-wipe を目印に clip-path を書き換える（SSR では持たない）。

              写真を画面の左端へ広げる（hero のみ）:
              グリッドは中央寄せなので、グリッドの左端から画面の左端までは (100vw - グリッド幅) / 2。
              グリッドアイテムの % マージンはそのグリッド領域の幅が基準になるため、
              - 縦積み（1列 = グリッド幅 G）: ml = 50% - 50vw、幅 = G + 余白 = 50% + 50vw
              - md 以上（6/12 列 = G/2）: ml = 100% - 50vw。幅は auto（stretch）で画面のちょうど半分
              右端は列の境界のまま動かさない。
              md 以上の高さはテキスト側の行の高さに合わせ、正方形の原画を横長に切り抜く。
              顔が上寄りにあるので object-position は上から 30%。

              sheet（/events）は白いシートの内側なので広げない */}
          <div
            className={cn(
              "relative order-first aspect-square md:order-none md:col-start-1 md:col-end-7 md:row-start-1",
              isSheet
                ? "mx-auto w-full max-w-sm md:max-w-none"
                : "ml-[calc(50%-50vw)] w-[calc(50%+50vw)] md:ml-[calc(100%-50vw)] md:aspect-auto md:min-h-[28rem] md:w-auto"
            )}
            data-special-guest-wipe
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
