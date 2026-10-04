import Link from "next/link";

import { AppImage } from "@/components/ui/AppImage";
import { specialBanner } from "@/data/special-banner";

/** 企画一覧の冒頭から著名人企画LPへ誘導するバナー。 */
export function SpecialEventBanner() {
  return (
    <Link
      href={`/special/${specialBanner.eventId}`}
      className="mb-8 grid grid-cols-[minmax(0,1fr)_40%] overflow-hidden border-y border-primary-700 bg-primary-50 text-primary-900 hover:bg-primary-100 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary-600 sm:grid-cols-[minmax(0,1fr)_38%]"
    >
      <div className="flex min-h-[172px] min-w-0 flex-col justify-center px-4 py-4 sm:min-h-[198px] sm:px-8 lg:min-h-[208px] lg:px-10">
        <p className="text-[11px] font-semibold text-primary-700 sm:text-xs">著名人企画</p>

        <h2 className="mt-3 font-sans sm:mt-4">
          <AppImage
            src={specialBanner.nameLogo.src}
            alt={specialBanner.name}
            width={specialBanner.nameLogo.width}
            height={specialBanner.nameLogo.height}
            sizes="(min-width: 1024px) 280px, (min-width: 640px) 220px, 128px"
            className="h-auto w-full max-w-32 sm:max-w-56 lg:max-w-70"
          />
          <span className="mt-2 block text-[13px] font-semibold leading-snug sm:mt-3 sm:text-lg">
            スペシャルパフォーマンス
          </span>
        </h2>

        <span className="mt-3 self-start border-b border-primary-700 pb-0.5 text-[11px] font-medium sm:mt-4 sm:text-xs">
          公演情報を見る
        </span>
      </div>

      <span className="relative block min-h-[172px] border-l border-primary-700 sm:min-h-[198px] lg:min-h-[208px]">
        <AppImage
          src={specialBanner.image.src}
          alt=""
          fill
          sizes="(min-width: 640px) 38vw, 40vw"
          className="object-cover object-[49%_38%]"
        />
      </span>
    </Link>
  );
}
