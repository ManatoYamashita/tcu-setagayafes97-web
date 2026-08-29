import Image from "next/image";
import type { MicroCMSImage } from "microcms-js-sdk";

interface SpecialHeroProps {
  title: string;
  organizer: string;
  /** アーティストロゴ（透過PNGを想定） */
  logo?: MicroCMSImage;
  /** メインビジュアル（Event.thumbnail） */
  photo?: MicroCMSImage;
}

/**
 * 著名人企画LPのヒーロー
 *
 * ロゴ・タイトルは左下に置き、オーバーレイも左下が最も濃くなるグラデーションにしています。
 * ロゴは透過PNGで入稿される可能性が高く、白ロゴが背景に溶ける事故を防ぐためです。
 * グラデーションの定義は globals.css の `.special-hero-overlay` にあります。
 *
 * 配置は PageHero（`flex items-end` + `container mx-auto px-4`）と同じ構造に揃えており、
 * 白いシート内の本文と左端が一致します。
 *
 * 高さは画面幅によらず「ヘッダーを除いた1画面ぶん」で固定します。
 * ヘッダーは sticky でフロー上に高さを占有するため、単純に 100svh とすると
 * 下端がヘッダーの高さぶん折り返し線の下へ沈み、下寄せしたロゴと主催者名が
 * 初期表示で切れます。HeroSection / AboutHero と同じ計算式に揃えています。
 * 長いタイトルで内容がはみ出す場合に伸びるよう、h ではなく min-h を使います。
 *
 * ロゴの有無にかかわらず h1 は出力します（ロゴがある場合は画像の alt が見出しになります）。
 */
export function SpecialHero({ title, organizer, logo, photo }: SpecialHeroProps) {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-var(--header-height))] items-end overflow-hidden bg-primary-dark pb-10 pt-20 md:pb-16">
      {/* 背景写真 */}
      {photo && (
        <>
          <Image
            src={photo.url}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
            aria-hidden="true"
          />
          <div
            className="special-hero-overlay pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
        </>
      )}

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex max-w-2xl flex-col gap-4">
          {logo ? (
            <h1 className="flex">
              <Image
                src={logo.url}
                alt={title}
                width={logo.width ?? 480}
                height={logo.height ?? 160}
                priority
                className="h-auto w-full max-w-[320px] object-contain object-left md:max-w-[480px]"
              />
            </h1>
          ) : (
            <h1 className="text-3xl font-bold text-white md:text-5xl">{title}</h1>
          )}

          <p className="text-sm text-white/80 md:text-base">{organizer}</p>
        </div>
      </div>
    </section>
  );
}
