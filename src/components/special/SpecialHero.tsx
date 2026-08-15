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
 * ロゴは透過PNGで入稿される可能性が高いため、必ず暗色の背景を敷いた上に配置します。
 * 白いロゴが白背景に溶けて見えなくなる事故を防ぐためです。
 *
 * ロゴの有無にかかわらず h1 は出力します（ロゴがある場合は画像の alt が見出しになります）。
 */
export function SpecialHero({ title, organizer, logo, photo }: SpecialHeroProps) {
  return (
    <section className="relative isolate flex min-h-[60vh] items-center justify-center overflow-hidden bg-primary-dark px-4 py-20">
      {/* 背景写真。ロゴの可読性を確保するため暗くオーバーレイする */}
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
          <div className="absolute inset-0 bg-primary-dark/70" aria-hidden="true" />
        </>
      )}

      <div className="relative flex flex-col items-center gap-6 text-center">
        {logo ? (
          <h1 className="flex justify-center">
            <Image
              src={logo.url}
              alt={title}
              width={logo.width ?? 480}
              height={logo.height ?? 160}
              priority
              className="h-auto w-full max-w-[320px] object-contain md:max-w-[480px]"
            />
          </h1>
        ) : (
          <h1 className="text-3xl font-bold text-white md:text-5xl">{title}</h1>
        )}

        <p className="text-sm text-white/80 md:text-base">{organizer}</p>
      </div>
    </section>
  );
}
