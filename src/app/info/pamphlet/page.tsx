import type { Metadata } from "next";
import { Download } from "lucide-react";
import Link from "next/link";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { FactList } from "@/components/ui/FactList";
import { pageHeroes } from "@/data/page-heroes";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 */
export const metadata: Metadata = createPageMetadata({
  title: "パンフレットダウンロード",
  description:
    "第97回東京都市大学世田谷祭の公式パンフレットをダウンロードいただけます。企画情報、タイムテーブル、マップなどを掲載しています。",
  pathname: "/info/pamphlet",
});

/**
 * パンフレット情報
 * TODO: 将来的に /src/data/pamphlet.ts に移行
 */
interface Pamphlet {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  /** PDF 確定前の容量・ページ数は null（未定） */
  fileSize: string | null;
  pages: number | null;
  isAvailable: boolean;
}

const pamphlets: Pamphlet[] = [
  {
    id: "main",
    title: "第97回東京都市大学世田谷祭 公式パンフレット",
    description:
      "企画一覧、タイムテーブル、キャンパスマップなど、世田谷祭を楽しむための情報が満載です。",
    fileUrl: "/pamphlets/setagayafes97_pamphlet_placeholder.pdf",
    fileSize: null,
    pages: null,
    isAvailable: false, // 準備中フラグ
  },
];

const notes = [
  "パンフレットはPDF形式で提供しています。",
  "印刷してご来場いただくと便利です。",
  "紙のパンフレットは当日、入場門でのみ配布しています。",
  "内容は予告なく変更される場合があります。最新情報は当サイトでご確認ください。",
];

/** 文中のリンク。色ではなく下線で示し、ホバーは hoverable でゲートする（docs/frontend/interaction-states.md） */
const linkClassName =
  "font-semibold text-gray-900 underline decoration-gray-400 underline-offset-4 hoverable:hover:text-primary-700 hoverable:hover:decoration-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";

/**
 * パンフレットダウンロードページ
 *
 * `<main id="content">` は PageSheetLayout が出す。
 */
export default function PamphletPage() {
  // 準備中の案内は、公開前のパンフレットが1つでも残っている間だけ出す
  const hasPending = pamphlets.some((pamphlet) => !pamphlet.isAvailable);

  return (
    <PageSheetLayout hero={pageHeroes.pamphlet}>
      <div className="mx-auto max-w-3xl space-y-14 sm:space-y-16">
        {hasPending && (
          <section aria-labelledby="pamphlet-pending-heading">
            <h2 id="pamphlet-pending-heading" className="mb-3 text-2xl font-bold text-gray-900">
              パンフレット準備中
            </h2>
            <p className="leading-8 text-gray-700">
              現在、パンフレットを準備中です。公開まで今しばらくお待ちください。
              <br />
              最新情報は
              <Link href="/info" className={linkClassName}>
                お知らせ
              </Link>
              でご確認いただけます。
            </p>
          </section>
        )}

        {pamphlets.map((pamphlet) => (
          <section key={pamphlet.id} aria-labelledby={`pamphlet-${pamphlet.id}-heading`}>
            <h2
              id={`pamphlet-${pamphlet.id}-heading`}
              className="mb-3 text-2xl font-bold text-gray-900"
            >
              {pamphlet.title}
            </h2>
            <p className="mb-6 leading-8 text-gray-700">{pamphlet.description}</p>
            <FactList
              items={[
                {
                  label: "ページ数",
                  value: pamphlet.pages === null ? "未定" : `${pamphlet.pages}ページ`,
                },
                { label: "ファイルサイズ", value: pamphlet.fileSize ?? "未定" },
                // 公開前は操作できるものが無いので、ボタンではなく状態として示す
                ...(pamphlet.isAvailable ? [] : [{ label: "ダウンロード", value: "準備中" }]),
              ]}
            />
            {pamphlet.isAvailable && (
              <a
                href={pamphlet.fileUrl}
                download
                className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-600 px-6 py-3 font-semibold text-white hoverable:hover:bg-primary-700 focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600"
              >
                <Download aria-hidden="true" className="h-5 w-5" />
                <span>PDFをダウンロード</span>
              </a>
            )}
          </section>
        ))}

        <section aria-labelledby="pamphlet-about-heading">
          <h2 id="pamphlet-about-heading" className="mb-5 text-2xl font-bold text-gray-900">
            パンフレットについて
          </h2>
          <ul className="list-disc space-y-1.5 pl-5 leading-8 text-gray-700 marker:text-gray-400">
            {notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </div>
    </PageSheetLayout>
  );
}
