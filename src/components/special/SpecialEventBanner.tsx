import Link from "next/link";

import { AppImage } from "@/components/ui/AppImage";
import { specialBanner } from "@/data/special-banner";

/** 企画一覧の冒頭から著名人企画LPへ誘導するバナー。 */
export function SpecialEventBanner() {
  return (
    <Link
      href={`/special/${specialBanner.eventId}`}
      className="group relative mb-8 block min-h-[236px] isolate overflow-hidden rounded-3xl bg-primary-900 text-white focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary-600 sm:min-h-[280px] lg:min-h-[320px]"
    >
      <span className="absolute inset-y-0 right-0 w-[53%] sm:w-1/2" aria-hidden="true">
        <AppImage
          src={specialBanner.image.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 600px, (min-width: 640px) 50vw, 53vw"
          className="object-cover object-[49%_38%] transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none"
        />
      </span>
      <span
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-primary-900 from-[38%] via-primary-900/85 via-[52%] to-transparent to-[78%]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-[236px] max-w-[69%] flex-col items-start justify-between gap-5 p-5 sm:min-h-[280px] sm:max-w-[66%] sm:p-8 lg:min-h-[320px] lg:max-w-[62%] lg:p-10">
        <p className="border-l-2 border-primary-300 pl-3 text-xs font-bold tracking-[0.08em] text-primary-100 sm:text-sm">
          著名人企画
        </p>

        <h2 className="font-sans">
          <span className="block text-[clamp(2.25rem,8vw,5.5rem)] font-black leading-none tracking-[-0.06em]">
            {specialBanner.name}
          </span>
          <span className="mt-3 block text-base font-bold leading-[1.35] tracking-[0.04em] sm:text-xl lg:text-2xl">
            <span className="block lg:inline">スペシャル</span>
            <span className="block lg:inline">パフォーマンス</span>
          </span>
        </h2>

        <span className="inline-flex items-center gap-2 border-b border-primary-200 pb-1 text-xs font-semibold sm:text-sm">
          公演情報を見る
          <svg
            className="size-4 transition-transform group-hover:translate-x-1 motion-reduce:transition-none"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14m-6-6 6 6-6 6" />
          </svg>
        </span>
      </div>
    </Link>
  );
}
