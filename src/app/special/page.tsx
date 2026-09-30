import type { Metadata } from "next";
import { getSpecialEvents } from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 */
export const metadata: Metadata = createPageMetadata({
  title: "著名人企画",
  description:
    "第97回東京都市大学世田谷祭にお招きするゲストのご紹介。出演情報、物販、チケット販売についてご案内します。",
  pathname: "/special",
});

/**
 * ISR設定: 10分ごとに再検証
 */
export const revalidate = 600;

/**
 * 著名人企画の一覧ページ
 *
 * 登録が1組でも成立します。URL を手で削って `/special` に到達したときに
 * 行き止まりにしないためのページでもあります。
 *
 * 2組目が公開されたら `next.config.ts` の `/special` エントリを削除すれば、
 * このページが一覧として復帰します。
 */
export default async function SpecialPage() {
  const events = await getSpecialEvents();

  if (events.length === 0) {
    return (
      <PageSheetLayout hero={pageHeroes.special} heroSize="default">
        <ComingSoon
          title="著名人企画は準備中です"
          description="第97回東京都市大学世田谷祭にお招きするゲストは現在調整中です。発表までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  return (
    <PageSheetLayout hero={pageHeroes.special} heroSize="default">
      <ul className="grid grid-cols-1 gap-6 py-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <li key={event.id}>
            <EventCard event={event} variant="featured" />
          </li>
        ))}
      </ul>
    </PageSheetLayout>
  );
}
