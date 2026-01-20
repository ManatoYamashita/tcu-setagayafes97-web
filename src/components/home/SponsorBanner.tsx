import Image from "next/image";
import Link from "next/link";
import { getSponsorsList } from "@/lib/informations";

/**
 * 協賛企業バナーセクション
 * 協賛企業のロゴを表示
 */
export async function SponsorBanner() {
  const sponsors = await getSponsorsList();

  // データが取得できない場合は表示しない
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="border-t bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="mb-3 text-3xl font-bold">協賛企業</h2>
          <p className="text-gray-600">第97回世田谷祭を応援してくださっている企業様</p>
        </div>

        <div className="mx-auto max-w-6xl">
          {/* スポンサーロゴグリッド */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="group flex items-center justify-center rounded-lg bg-white p-6 shadow-sm transition-all hover:shadow-md"
              >
                {sponsor.url ? (
                  <Link
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center"
                  >
                    {sponsor.logo ? (
                      <div className="relative h-20 w-full">
                        <Image
                          src={sponsor.logo.url}
                          alt={sponsor.sponsorName || sponsor.title}
                          fill
                          className="object-contain transition-opacity group-hover:opacity-80"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">
                          {sponsor.sponsorName || sponsor.title}
                        </p>
                      </div>
                    )}
                  </Link>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {sponsor.logo ? (
                      <div className="relative h-20 w-full">
                        <Image
                          src={sponsor.logo.url}
                          alt={sponsor.sponsorName || sponsor.title}
                          fill
                          className="object-contain"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 200px"
                        />
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="font-semibold text-gray-800">
                          {sponsor.sponsorName || sponsor.title}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* 協賛募集メッセージ */}
          <div className="mt-12 text-center">
            <p className="mb-4 text-sm text-gray-600">
              第97回世田谷祭では協賛企業様を募集しております
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg border-2 border-primary px-6 py-2 font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <span>協賛についてのお問い合わせ</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ISR設定: 24時間ごとに再検証（協賛企業は頻繁に変わらないため）
export const revalidate = 86400;
