import type { Metadata } from "next";
import Link from "next/link";
import { AppImage } from "@/components/ui/AppImage";
import { notFoundPageContent } from "@/data/not-found";

/**
 * 404ページのメタデータ
 *
 * ルートレイアウトの `metadata` は `robots: { index: true, follow: true }` と
 * `alternates.canonical: "/"` を宣言しており、宣言の無いページはこれを継承する。
 * その結果このページは、Next.js が not-found へ自動付与する `noindex` と
 * ルート由来の `index, follow` という**矛盾する robots メタタグを2枚**出力し、
 * さらに存在しないURLからトップページの canonical を主張していた（2026-09-03 実測）。
 *
 * HTTPステータスは 404 なので実害は小さいが、矛盾したシグナルを送る理由はない。
 * `canonical: null` で継承を打ち消す。
 */
export const metadata: Metadata = {
  title: notFoundPageContent.metadataTitle,
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
};

export default function NotFound() {
  /*
   * スキップリンク（Header）の遷移先。Header は全ルートで描画されるため、この画面にも
   * 「本文へスキップ」が出る。main を出さないと押しても遷移先が無く、次の Tab が
   * ヘッダー先頭へ戻ってしまう（docs/frontend/landmarks-and-skip-link.md）。
   */
  return (
    <main
      id="content"
      tabIndex={-1}
      className="min-h-[calc(100svh-var(--header-height))] bg-primary-50 px-4 py-12 focus-visible:outline-none sm:px-6 sm:py-16 lg:px-8"
    >
      <section
        aria-labelledby="not-found-title"
        className="mx-auto grid w-full max-w-5xl items-start gap-x-16 gap-y-8 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:grid-rows-[auto_1fr]"
      >
        <h1 id="not-found-title" className="flex flex-col gap-6 lg:col-start-1 lg:row-start-1">
          <span
            data-not-found-code
            className="text-[clamp(6rem,24vw,11rem)] leading-[0.8] font-bold tracking-[-0.06em] text-primary-700"
          >
            {notFoundPageContent.code}
          </span>
          <span
            data-not-found-title
            className="max-w-xl text-2xl leading-tight font-bold text-balance text-gray-900 sm:text-3xl"
          >
            {notFoundPageContent.title}
          </span>
        </h1>

        <div
          data-not-found-illustration
          className="w-full max-w-56 justify-self-center lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:max-w-[28rem] lg:self-center"
        >
          <AppImage
            src={notFoundPageContent.illustration.src}
            alt={notFoundPageContent.illustration.alt}
            width={notFoundPageContent.illustration.width}
            height={notFoundPageContent.illustration.height}
            fetchPriority="high"
            priority
            className="h-auto w-full"
          />
        </div>

        <div className="flex flex-col items-start lg:col-start-1 lg:row-start-2">
          <p
            data-not-found-description
            className="max-w-xl leading-relaxed text-pretty text-gray-600"
          >
            {notFoundPageContent.description}
          </p>
          <Link
            data-not-found-cta
            href={notFoundPageContent.cta.href}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-md transition-[background-color,box-shadow,scale] duration-150 ease-out hoverable:hover:bg-primary-700 hoverable:hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {notFoundPageContent.cta.label}
          </Link>
        </div>
      </section>
    </main>
  );
}
