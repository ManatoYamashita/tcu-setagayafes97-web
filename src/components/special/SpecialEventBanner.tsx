import Link from "next/link";

import { AppImage } from "@/components/ui/AppImage";
import { specialBanner } from "@/data/special-banner";

/** 企画一覧の冒頭から著名人企画LPへ誘導するバナー。 */
export function SpecialEventBanner() {
  return (
    <Link
      href={`/special/${specialBanner.eventId}`}
      className="group relative isolate block overflow-hidden rounded-t-lg bg-primary-900 text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
    >
      <span className="absolute inset-y-0 right-0 w-[52%] [clip-path:polygon(20%_0,100%_0,100%_100%,0_100%)] sm:w-[48%]">
        <AppImage
          src={specialBanner.image.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 584px, (min-width: 640px) 48vw, 52vw"
          className="object-cover object-[49%_38%]"
        />
      </span>

      <div className="relative z-10 flex min-h-[172px] w-[57%] flex-col items-start justify-center px-4 py-4 sm:min-h-[196px] sm:w-[60%] sm:px-8 sm:py-5 lg:min-h-[202px] lg:px-10">
        <p className="text-[11px] font-semibold text-primary-100 sm:text-xs">著名人企画</p>

        <h2 className="mt-1 font-sans sm:mt-0">
          <AppImage
            src={specialBanner.nameLogo.src}
            alt={specialBanner.name}
            width={specialBanner.nameLogo.width}
            height={specialBanner.nameLogo.height}
            sizes="(min-width: 1024px) 330px, (min-width: 640px) 260px, 128px"
            className="h-auto w-full max-w-32 brightness-0 invert sm:max-w-65 lg:max-w-[330px]"
          />
          <span className="mt-1 block text-[13px] font-semibold leading-[1.4] sm:text-lg">
            <span className="whitespace-nowrap">スペシャル</span>
            <wbr />
            <span className="whitespace-nowrap">パフォーマンス</span>
          </span>
        </h2>

        <span className="mt-4 self-start border-b border-white pb-0.5 text-[11px] font-medium group-hover:text-primary-100 sm:mt-5 sm:text-xs">
          公演情報を見る
        </span>
      </div>
    </Link>
  );
}
