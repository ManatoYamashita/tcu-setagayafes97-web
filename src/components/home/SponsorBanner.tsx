import Image from "next/image";
import Link from "next/link";
import { getSponsorsList } from "@/lib/informations";

/**
 * 協賛企業バナーセクション
 * 協賛企業のロゴをシンプルなグリッドで表示
 */
export async function SponsorBanner() {
  const sponsors = await getSponsorsList();

  // データが取得できない場合は表示しない
  if (sponsors.length === 0) {
    return null;
  }

  return (
    <section className="border-t bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold">協賛企業</h2>
        </div>

        <div className="mx-auto max-w-6xl">
          {/* スポンサーロゴグリッド */}
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {sponsors.map((sponsor) => (
              <div key={sponsor.id} className="flex items-center justify-center p-6">
                {sponsor.url ? (
                  <Link
                    href={sponsor.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-full w-full items-center justify-center opacity-70 hover:opacity-100"
                  >
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
                      <p className="font-semibold text-gray-800">
                        {sponsor.sponsorName || sponsor.title}
                      </p>
                    )}
                  </Link>
                ) : (
                  <div className="flex h-full w-full items-center justify-center opacity-70">
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
                      <p className="font-semibold text-gray-800">
                        {sponsor.sponsorName || sponsor.title}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ISR設定: 24時間ごとに再検証（協賛企業は頻繁に変わらないため）
export const revalidate = 86400;
