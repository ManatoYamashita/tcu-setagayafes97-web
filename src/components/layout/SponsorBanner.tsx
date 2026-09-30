import Link from "next/link";
import { sponsorBannerCta } from "@/data/sponsors";
import { getSponsorsList } from "@/lib/informations";
import { SponsorLogoLoopLoader } from "@/components/home/SponsorLogoLoopLoader";

/**
 * 協賛企業バナー（サーバーコンポーネント）
 * データ取得のみ担当し、表示はクライアントコンポーネントに委譲
 * ロゴ帯の下に一覧ページへの CTA を置く
 */
export async function SponsorBanner() {
  const sponsors = await getSponsorsList();

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="deferred-section deferred-section--sponsors overflow-hidden bg-white py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-10 text-center text-3xl font-bold">協賛・協力</h2>
      </div>
      <SponsorLogoLoopLoader sponsors={sponsors} />
      <div className="container mx-auto mt-10 flex justify-center px-4">
        <Link
          href={sponsorBannerCta.href}
          className="group inline-flex min-h-11 items-center gap-3 rounded-full border-2 border-gray-900 px-8 py-2.5 font-semibold text-gray-900 transition-colors hoverable:hover:bg-gray-900 hoverable:hover:text-white focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
        >
          <span>{sponsorBannerCta.label}</span>
          <svg
            className="h-5 w-5 transition-transform motion-safe:group-hover:translate-x-1"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 8l4 4m0 0-4 4m4-4H3"
            />
          </svg>
        </Link>
      </div>
    </section>
  );
}
