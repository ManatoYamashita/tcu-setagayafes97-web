import { Eye } from "lucide-react";

/**
 * 下書きプレビュー中であることを知らせる帯。
 *
 * 表示中の画面が「まだ公開されていない内容」であることを取り違えると、
 * 入稿の確認そのものが成り立たなくなるため、プレビュー中は必ず出す。
 *
 * 解除リンクが `<a>` なのは意図的である。遷移先が Route Handler
 * （`/api/draft/disable`）であり、`next/link` のクライアント遷移では
 * cookie を消すレスポンスを受け取れない。
 */
export function DraftPreviewBanner() {
  return (
    <div
      // 下端に固定する。ヘッダーと重なる位置を避けつつ、スクロールしても見失わない
      className="fixed inset-x-0 bottom-0 z-50 bg-primary-900 text-white shadow-[0_-2px_12px_rgba(0,0,0,0.25)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-3 text-sm sm:px-6 lg:px-8">
        <p className="flex items-center gap-2 font-semibold">
          <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>下書きプレビュー表示中</span>
        </p>
        <p className="text-white/80">この内容はまだ公開されていません</p>
        <a
          href="/api/draft/disable"
          className="rounded-full bg-white/15 px-4 py-1.5 font-semibold underline-offset-4 transition-colors hover:bg-white/25 hover:underline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          プレビューを解除
        </a>
      </div>
    </div>
  );
}
