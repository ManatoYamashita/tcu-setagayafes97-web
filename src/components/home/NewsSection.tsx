import Link from "next/link";
import { getNewsList } from "@/lib/news";
import { CircularText } from "@/components/ui/CircularText";
import { NewsFilter } from "./NewsFilter";

/**
 * お知らせセクション
 * 白シート + Type絞り込みタブ + 2段グリッド（Featured 2件 + Regular）+ 歯車装飾
 */
export async function NewsSection() {
  const newsList = await getNewsList(8);

  // データが取得できない場合の表示
  if (newsList.length === 0) {
    return (
      <section className="relative bg-secondary py-32">
        {/* CircularText装飾 */}
        <CircularText
          text="· SETAGAYA FES 97th · SETAGAYA FES 97th "
          spinDuration={20}
          className="pointer-events-none absolute right-0 top-32 z-0 w-72 -translate-y-1/2 translate-x-1/2 text-primary-400/60 md:w-80 lg:w-96"
        />
        <div className="container mx-auto px-4">
          <div className="relative">
            <div className="relative z-10 rounded-3xl bg-white px-6 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
              <div className="mb-12 flex items-center justify-between">
                <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
              </div>
              <div className="text-center text-gray-900/60">現在、お知らせはありません。</div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative bg-secondary py-32">
      {/* CircularText装飾 */}
      <CircularText
        text="· SETAGAYA FES 97th · SETAGAYA FES 97th "
        spinDuration={20}
        className="pointer-events-none absolute right-0 top-32 z-0 w-72 -translate-y-1/2 translate-x-1/2 text-primary-400/60 md:w-80 lg:w-96"
      />
      <div className="container mx-auto px-4">
        <div className="relative">
          {/* 白シート */}
          <div className="relative z-10 rounded-3xl bg-white px-6 py-12 sm:px-10 md:px-12 md:py-16 lg:px-16">
            {/* セクションヘッダー */}
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-5xl font-bold md:text-6xl">NEWS</h2>
              <Link
                href="/info"
                className="flex items-center gap-2 font-semibold text-gray-900 transition-opacity hover:opacity-60"
              >
                <span>NEWS ALL</span>
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>

            {/* タブ絞り込み + ニュース一覧 */}
            <NewsFilter newsList={newsList} />

            {/* CTA: お知らせ一覧へ */}
            <div className="mt-10 flex justify-center">
              <Link
                href="/info"
                className="group inline-flex items-center gap-3 rounded-full border-2 border-gray-900 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-gray-900 hover:text-white"
              >
                <span>お知らせ一覧を見る</span>
                <svg
                  className="h-5 w-5 transition-transform group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                  />
                </svg>
              </Link>
            </div>
          </div>

          {/* 歯車装飾: 右下（複数歯車） */}
          <img
            src="/materials/geers.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-8 right-8 z-20 w-28 select-none md:w-40 lg:w-48"
            loading="lazy"
            draggable={false}
          />

          {/* 歯車装飾: 左下（単体歯車） */}
          <img
            src="/materials/geer1.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-6 left-12 z-20 w-14 select-none md:w-20 lg:w-24"
            loading="lazy"
            draggable={false}
          />
        </div>
      </div>
    </section>
  );
}

// ISR設定: 1時間ごとに再検証
export const revalidate = 3600;
