import Image from "next/image";
import Link from "next/link";

import { specialBanner } from "@/data/special-banner";
import { SPECIAL_VISIBLE } from "@/data/site";
import { getSpecialEventById } from "@/lib/events";
import { cn } from "@/lib/utils";

/**
 * 著名人企画（スペシャル企画）の告知セクション
 *
 * 出演者ロゴ・バナー画像・チケット販売情報を見せ、著名人企画LPへ誘導します。
 * トップページ（Hero の直下）と企画一覧ページ（/events の最下部）の2箇所で使います。
 *
 * SPECIAL_VISIBLE が false の間はセクションごと非表示にします。著名人は解禁日が
 * 契約で決まっており、URL の先行露出が事故になるためです（src/data/site.ts のコメント参照）。
 * EVENTS_VISIBLE には依存しないため、著名人だけを先行公開する運用でも表示されます。
 * ただし /events 自体が EVENTS_VISIBLE=false のとき準備中表示で終わるため、
 * そちらのカードが出るのは両方が true のときだけです。
 *
 * 文言は microCMS ではなく src/data/special-banner.ts が持ちますが、リンク先が実在するか
 * どうかだけは getSpecialEventById() で確認します。ID が変わって LP に到達できない場合は、
 * リンク切れを見せずにセクションごと引っ込めます。
 *
 * レイアウトは画面幅で3段階に変わります。
 *
 * - 〜767px: 縦積み。画像が上、テキストが下
 * - 768〜1023px: 横並びで画像が右
 * - 1024px〜: 横並びで画像が左
 *
 * DOM 順は「見出し → 明細 → CTA → 画像」で固定し、見た目の入れ替えは
 * `lg:flex-row-reverse` と画像側の `order-first` だけで行います。DOM を並べ替えると
 * h2 より先に画像が読み上げられ、セクションの主題が伝わらなくなるためです。
 */

/**
 * 置き場所ごとの見た目
 *
 * - `hero`: トップページ用。Hero と ABOUT を包む `.hero-about-bg` の中に入るため、
 *   自前の背景を持たずグラデーションを透かします。
 * - `card`: /events 用。白いシートの中に角丸カードとして収まります。
 */
type SpecialGuestSectionVariant = "hero" | "card";

interface SpecialGuestSectionProps {
  variant?: SpecialGuestSectionVariant;
}

export async function SpecialGuestSection({ variant = "hero" }: SpecialGuestSectionProps = {}) {
  if (!SPECIAL_VISIBLE) {
    return null;
  }

  const event = await getSpecialEventById(specialBanner.eventId);

  if (!event) {
    return null;
  }

  const { label, name, nameLogo, image, details, ctaLabel } = specialBanner;
  const isCard = variant === "card";

  return (
    <section
      className={cn(
        isCard
          ? // 最下部にあるため描画を遅延させる。推定高さは globals.css の
            // `.deferred-section--special` にある
            "deferred-section deferred-section--special rounded-3xl bg-secondary px-6 py-12 sm:px-10 sm:py-14 lg:px-14 lg:py-16"
          : // z-10 は必須。直後の ABOUT が `-mt-48` でこのセクションへ 192px 潜り込み、
            // その中の装飾blob（`absolute inset-0`）が上に乗るため、Hero と同じ層へ上げる。
            // content-visibility はフォールド直下では効果が無く CLS だけ残るので付けない
            "relative z-10 py-20 lg:py-28"
      )}
    >
      <div className={isCard ? undefined : "container mx-auto px-4"}>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-10 md:flex-row md:items-center md:gap-12 lg:flex-row-reverse lg:gap-16">
          {/* テキスト側 */}
          <div className="w-full md:flex-1">
            {/* 見出し（トップページは Kaisei Opti を読み込まないため font-sans を明示する）。
                出演者名はロゴ画像で、alt が見出しのアクセシブル名を担う */}
            <h2 className="font-sans">
              <span className="block text-xs font-bold tracking-[0.2em] text-primary-700 sm:text-sm">
                {label}
              </span>
              <span className="mt-4 block">
                <Image
                  src={nameLogo.src}
                  alt={name}
                  width={nameLogo.width}
                  height={nameLogo.height}
                  sizes="(min-width: 1024px) 360px, (min-width: 640px) 300px, 240px"
                  quality={75}
                  className="h-auto w-full max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]"
                />
              </span>
            </h2>

            <dl className="mt-8 border-y border-dotted border-primary-700/30">
              {details.map((detail, index) => (
                <div
                  key={detail.term}
                  className={
                    index > 0 ? "border-t border-dotted border-primary-700/30 py-4" : "py-4"
                  }
                >
                  <dt className="font-sans text-xs font-bold tracking-[0.1em] text-primary-700 sm:text-sm">
                    {detail.term}
                  </dt>
                  <dd className="mt-2 font-sans text-sm leading-[1.75] text-gray-700 sm:text-base">
                    {detail.lines.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </dd>
                </div>
              ))}
            </dl>

            <Link
              href={`/special/${event.id}`}
              className="group mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
            >
              {ctaLabel}
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>

          {/* 画像側。縦積みのときだけ order で先頭へ出す */}
          <div className="order-first w-full max-w-sm shrink-0 overflow-hidden rounded-3xl md:order-none md:w-[42%] md:max-w-none lg:w-[45%]">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 1024px) 460px, (min-width: 768px) 42vw, min(384px, calc(100vw - 2rem))"
              quality={75}
              className="h-auto w-full"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
