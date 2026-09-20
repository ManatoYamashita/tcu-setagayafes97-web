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
      <div className="mx-auto grid w-full max-w-5xl items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,28rem)] lg:gap-16">
        <section aria-labelledby="not-found-title" className="flex flex-col items-start">
          <h1 id="not-found-title" className="flex flex-col gap-3">
            <span className="text-[clamp(6rem,24vw,11rem)] leading-[0.8] font-bold tracking-[-0.06em] text-primary-700">
              {notFoundPageContent.code}
            </span>
            <span className="max-w-xl text-2xl leading-tight font-bold text-balance text-gray-900 sm:text-3xl">
              {notFoundPageContent.title}
            </span>
          </h1>
          <p className="mt-4 max-w-xl leading-relaxed text-pretty text-gray-600">
            {notFoundPageContent.description}
          </p>
          <Link
            href={notFoundPageContent.cta.href}
            className="mt-8 inline-flex min-h-12 items-center justify-center rounded-full bg-primary-600 px-6 py-3 font-semibold text-white shadow-md transition-[background-color,box-shadow,scale] duration-150 ease-out hoverable:hover:bg-primary-700 hoverable:hover:shadow-lg focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            {notFoundPageContent.cta.label}
          </Link>
        </section>

        <div className="w-full max-w-[28rem] justify-self-center rounded-[2.5rem] bg-white p-2 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
          <AppImage
            src={notFoundPageContent.illustration.src}
            alt={notFoundPageContent.illustration.alt}
            width={notFoundPageContent.illustration.width}
            height={notFoundPageContent.illustration.height}
            fetchPriority="high"
            priority
            className="h-auto w-full rounded-[2rem] outline outline-1 -outline-offset-1 outline-black/10"
          />
        </div>
      </div>
    </main>
  );
}
