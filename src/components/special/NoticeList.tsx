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
    <section aria-labelledby="special-notices" className="py-8">
      <h2 id="special-notices" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        注意事項
      </h2>

      <div className="space-y-4">
        {notices.map((notice, index) => (
          <article
            key={`${notice.heading}-${index}`}
            className="rounded-xl border border-gray-200 p-4 md:p-5"
          >
            <h3 className="mb-2 font-bold text-gray-900">{notice.heading}</h3>
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
