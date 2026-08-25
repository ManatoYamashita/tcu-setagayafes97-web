import type { Metadata } from "next";
import { getSpecialEvents } from "@/lib/events";
import { EventCard } from "@/components/events/EventCard";
import { ComingSoon } from "@/components/common/ComingSoon";
import { PageSheetLayout } from "@/components/layout/PageSheetLayout";
import { pageHeroes } from "@/data/page-heroes";
import { SPECIAL_VISIBLE } from "@/data/site";
import { createPageMetadata } from "@/lib/metadata";

/**
 * メタデータ
 * SPECIAL_VISIBLE が false の間は準備中の文言を表示
 */
export const metadata: Metadata = SPECIAL_VISIBLE
  ? createPageMetadata({
      title: "著名人企画",
      description:
        "東京都市大学 第97回 世田谷祭にお招きするゲストのご紹介。出演情報、物販、チケット販売についてご案内します。",
      pathname: "/special",
    })
  : createPageMetadata({
      title: "著名人企画",
      description:
        "東京都市大学 第97回 世田谷祭の著名人企画は現在準備中です。発表までもうしばらくお待ちください。",
      pathname: "/special",
    });

/**
 * ISR設定: 1時間ごとに再検証
 */
export const revalidate = 3600;

/**
 * 著名人企画の一覧ページ
 *
 * 登録が1組でも成立します。URL を手で削って `/special` に到達したときに
 * 行き止まりにしないためのページでもあります。
 *
 * SPECIAL_VISIBLE が false の間は準備中表示（EVENTS_VISIBLE とは独立）。
 */
export default async function SpecialPage() {
  if (!SPECIAL_VISIBLE) {
    return (
      <PageSheetLayout hero={pageHeroes.special}>
        <ComingSoon
          title="著名人企画は準備中です"
          description="第97回 世田谷祭にお招きするゲストは現在調整中です。発表までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  const events = await getSpecialEvents();

  if (events.length === 0) {
    return (
      <PageSheetLayout hero={pageHeroes.special}>
        <ComingSoon
          title="著名人企画は準備中です"
          description="第97回 世田谷祭にお招きするゲストは現在調整中です。発表までもうしばらくお待ちください。"
        />
      </PageSheetLayout>
    );
  }

  return (
    <PageSheetLayout hero={pageHeroes.special}>
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
