import type { Metadata } from "next";
import Image from "next/image";
import { Download, FileText, AlertCircle } from "lucide-react";

/**
 * メタデータ
 */
export const metadata: Metadata = {
  title: "パンフレットダウンロード | 東京都市大学 第97回 世田谷祭",
  description:
    "東京都市大学 第97回 世田谷祭の公式パンフレットをダウンロードいただけます。企画情報、タイムテーブル、マップなどを掲載しています。",
  openGraph: {
    title: "パンフレットダウンロード | 東京都市大学 第97回 世田谷祭",
    description:
      "東京都市大学 第97回 世田谷祭の公式パンフレットをダウンロードいただけます。企画情報、タイムテーブル、マップなどを掲載しています。",
    type: "website",
  },
};

/**
 * パンフレット情報
 * TODO: 将来的に /src/data/pamphlet.ts に移行
 */
const pamphlets = [
  {
    id: "main",
    title: "第97回 世田谷祭 公式パンフレット",
    description:
      "企画一覧、タイムテーブル、キャンパスマップなど、世田谷祭を楽しむための情報が満載です。",
    coverImage: "/images/pamphlet-cover-placeholder.jpg",
    fileUrl: "/pamphlets/setagayafes97_pamphlet_placeholder.pdf",
    fileSize: "5.2MB",
    pages: 24,
    isAvailable: false, // 準備中フラグ
  },
];

/**
 * パンフレットダウンロードページ
 */
export default function PamphletPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ページヘッダー */}
      <div className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-3">
            <FileText className="h-10 w-10 md:h-12 md:w-12" />
            <h1 className="text-4xl font-bold md:text-5xl">パンフレット</h1>
          </div>
          <p className="mt-4 text-center text-lg opacity-90">
            第97回 世田谷祭の公式パンフレットをダウンロード
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* 準備中のお知らせ */}
          <div className="mb-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
              <div>
                <p className="font-semibold text-blue-900">パンフレット準備中</p>
                <p className="mt-1 text-sm text-blue-700">
                  現在、パンフレットを準備中です。公開まで今しばらくお待ちください。
                  <br />
                  最新情報は
                  <a href="/info" className="underline hover:text-blue-900">
                    お知らせ
                  </a>
                  でご確認いただけます。
                </p>
              </div>
            </div>
          </div>

          {/* パンフレット一覧 */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-1">
            {pamphlets.map((pamphlet) => (
              <article
                key={pamphlet.id}
                className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm"
              >
                <div className="lg:flex">
                  {/* 表紙画像 */}
                  <div className="relative aspect-[3/4] lg:w-64 lg:flex-shrink-0">
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary to-purple-600">
                      <div className="text-center text-white">
                        <FileText className="mx-auto mb-2 h-16 w-16 opacity-50" />
                        <p className="text-sm font-semibold">表紙画像準備中</p>
                      </div>
                    </div>
                    {/* 準備中バッジ */}
                    {!pamphlet.isAvailable && (
                      <div className="absolute right-2 top-2 rounded-full bg-gray-900 px-3 py-1 text-xs font-bold text-white">
                        準備中
                      </div>
                    )}
                  </div>

                  {/* パンフレット情報 */}
                  <div className="flex flex-1 flex-col justify-between p-6">
                    <div>
                      <h2 className="mb-3 text-2xl font-bold text-gray-900">{pamphlet.title}</h2>
                      <p className="mb-4 text-gray-700">{pamphlet.description}</p>

                      {/* メタ情報 */}
                      <dl className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <dt className="font-semibold text-gray-500">ページ数</dt>
                          <dd className="text-gray-900">{pamphlet.pages}ページ</dd>
                        </div>
                        <div>
                          <dt className="font-semibold text-gray-500">ファイルサイズ</dt>
                          <dd className="text-gray-900">{pamphlet.fileSize}</dd>
                        </div>
                      </dl>
                    </div>

                    {/* ダウンロードボタン */}
                    <div className="mt-6">
                      {pamphlet.isAvailable ? (
                        <a
                          href={pamphlet.fileUrl}
                          download
                          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-lg md:w-auto"
                        >
                          <Download className="h-5 w-5" />
                          <span>PDFをダウンロード</span>
                        </a>
                      ) : (
                        <button
                          disabled
                          className="inline-flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-gray-300 px-6 py-3 font-semibold text-gray-500 md:w-auto"
                        >
                          <Download className="h-5 w-5" />
                          <span>準備中</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* 補足情報 */}
          <div className="mt-8 rounded-lg border border-gray-200 bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">パンフレットについて</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>パンフレットはPDF形式で提供しています。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>印刷してご来場いただくと便利です。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>紙のパンフレットは当日、各案内所にて配布しています。</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary"></span>
                <span>
                  内容は予告なく変更される場合があります。最新情報は当サイトでご確認ください。
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
