import { Metadata } from "next";
import { CountdownTimer } from "@/components/countdown/CountdownTimer";
import { siteConfig } from "@/data/site";
import Link from "next/link";

/**
 * メタデータ設定（SEO、OGP）
 */
export const metadata: Metadata = {
  title: `${siteConfig.name} | Coming Soon`,
  description: `${siteConfig.dates.day1}〜${siteConfig.dates.day2}開催！${siteConfig.description}`,
  openGraph: {
    title: `${siteConfig.name} | Coming Soon`,
    description: `${siteConfig.dates.day1}〜${siteConfig.dates.day2}開催！`,
    url: siteConfig.metadata.siteUrl,
    siteName: siteConfig.metadata.siteName,
    images: [
      {
        url: siteConfig.metadata.ogImage,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} | Coming Soon`,
    description: `${siteConfig.dates.day1}〜${siteConfig.dates.day2}開催！`,
    images: [siteConfig.metadata.ogImage],
  },
};

/**
 * カウントダウンページ
 * 2026年2月28日公開予定の簡易ページ
 */
export default function CountdownPage() {
  // 開催日時（2026年10月31日 00:00:00）
  const targetDate = `${siteConfig.dates.day1}T00:00:00+09:00`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-white via-purple-50 to-purple-100 px-4 py-8">
      <div className="max-w-6xl w-full text-center">
        {/* ロゴ・タイトルエリア */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            {siteConfig.shortName}
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-gray-700 font-medium">
            東京都市大学 第{siteConfig.edition}回 世田谷祭
          </p>
        </div>

        {/* カウントダウンタイマー */}
        <div className="mb-12 md:mb-16 bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 lg:p-16">
          <p className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 mb-8">
            開催まであと
          </p>
          <CountdownTimer targetDate={targetDate} />
        </div>

        {/* 開催概要 */}
        <div className="mb-12 md:mb-16 space-y-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">開催日程</h2>
            <p className="text-lg md:text-xl text-gray-700">2026年10月31日（土）〜 11月1日（日）</p>
            <p className="text-base md:text-lg text-gray-600 mt-2">
              {siteConfig.openTime} 〜 {siteConfig.closeTime}
            </p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 md:p-8 shadow-lg">
            <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4">会場</h2>
            <p className="text-lg md:text-xl text-gray-700">{siteConfig.venue}</p>
            <p className="text-base md:text-lg text-gray-600 mt-2">{siteConfig.address}</p>
          </div>
        </div>

        {/* SNSリンク */}
        <div className="flex items-center justify-center gap-6 mb-8">
          <Link
            href={siteConfig.sns.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-[#CD79EE] transition-colors duration-200"
            aria-label="Twitter"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
            </svg>
          </Link>

          <Link
            href={siteConfig.sns.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-[#CD79EE] transition-colors duration-200"
            aria-label="Instagram"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                clipRule="evenodd"
              />
            </svg>
          </Link>

          <Link
            href={siteConfig.sns.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-[#CD79EE] transition-colors duration-200"
            aria-label="Facebook"
          >
            <svg
              className="w-8 h-8 md:w-10 md:h-10"
              fill="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>

        {/* Coming Soon メッセージ */}
        <p className="text-sm md:text-base text-gray-600">詳細は2026年2月28日に公開予定です</p>
      </div>
    </main>
  );
}

// 静的生成（ISRは不要、カウントダウンページは頻繁に更新しない）
export const revalidate = 86400; // 24時間ごとに再検証
