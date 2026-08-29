import { AlertTriangle } from "lucide-react";
import type { NoticeSection } from "@/types/events";

interface NoticeListProps {
  notices?: NoticeSection[];
}

/**
 * 注意事項
 *
 * 年齢制限・車椅子でのご来場・不正転売の禁止など、見出し単位のブロックを並べます。
 * 来場者が読み落とすと当日のトラブルに直結する情報のため、折りたたまず常に開いた状態で出します。
 *
 * 1件も無い場合はセクションごと出力しません。
 */
export function NoticeList({ notices }: NoticeListProps) {
  if (!notices || notices.length === 0) return null;

  return (
    <section aria-labelledby="special-notices" className="py-8" data-special-reveal="up">
      <h2 id="special-notices" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        注意事項
      </h2>

      <div className="space-y-4" data-special-stagger>
        {notices.map((notice, index) => (
          <article
            key={`${notice.heading}-${index}`}
            className="rounded-xl border border-gray-200 p-4 md:p-5"
          >
            {/* アイコンは装飾。見出しテキストだけを読み上げさせる */}
            <h3 className="mb-2 flex items-start gap-2 font-bold text-gray-900">
              <AlertTriangle
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600"
                aria-hidden="true"
              />
              {notice.heading}
            </h3>
            {notice.body && (
              <div
                className="prose prose-sm max-w-none prose-p:text-gray-900/80 prose-a:text-primary"
                dangerouslySetInnerHTML={{ __html: notice.body }}
              />
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
