import type { Metadata } from "next";
import Link from "next/link";

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
  title: "ページが見つかりません",
  robots: {
    index: false,
    follow: true,
  },
  alternates: {
    canonical: null,
  },
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="mb-4 text-2xl font-bold">404 - ページが見つかりません</h2>
      <p className="mb-8 text-gray-900/80">お探しのページは見つかりませんでした。</p>
      <Link href="/" className="rounded-md bg-white px-4 py-2 text-primary hover:opacity-80">
        トップページへ戻る
      </Link>
    </div>
  );
}
