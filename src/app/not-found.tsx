import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="mb-4 text-2xl font-bold">404 - ページが見つかりません</h2>
      <p className="mb-8 text-gray-600">お探しのページは見つかりませんでした。</p>
      <Link href="/" className="rounded-md bg-primary px-4 py-2 text-white hover:opacity-80">
        トップページへ戻る
      </Link>
    </div>
  );
}
