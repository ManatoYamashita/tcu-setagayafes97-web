import type { Event } from "@/types/events";
import { getEventsList } from "@/lib/events";
import { OTHER_BUILDING_ID, resolveBuildingId } from "@/data/filter-options";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { EventGrid } from "./EventGrid";

interface RelatedEventsProps {
  currentEvent: Event;
}

/**
 * 関連企画セクション
 * 同じカテゴリまたは同じ建物の企画を3件表示
 */
export async function RelatedEvents({ currentEvent }: RelatedEventsProps) {
  // 全企画を取得
  const allEvents = await getEventsList(200);

  // 現在の企画を除外
  const otherEvents = allEvents.filter((e) => e.id !== currentEvent.id);

  // 建物は microCMS では全件未入力なので、place から導出したIDで比べる。
  // 素の building 同士を比べると "" === "" で全件が「同じ建物」になり、
  // 並べ替えの第2基準として機能しない
  const currentBuilding = resolveBuildingId(currentEvent.place, currentEvent.building);

  // 関連企画を抽出（優先順位: 同じ種別 > 同じ建物）
  const relatedEvents = otherEvents
    .sort((a, b) => {
      // 同じ種別の企画を優先
      const aTypeMatch = a.type === currentEvent.type;
      const bTypeMatch = b.type === currentEvent.type;

      if (aTypeMatch && !bTypeMatch) return -1;
      if (!aTypeMatch && bTypeMatch) return 1;

      // 同じ建物の企画を次に優先。どちらも解決できなかった場合（「その他」同士）は
      // 「同じ建物」とは見なさない
      const aBuildingMatch =
        currentBuilding !== OTHER_BUILDING_ID &&
        resolveBuildingId(a.place, a.building) === currentBuilding;
      const bBuildingMatch =
        currentBuilding !== OTHER_BUILDING_ID &&
        resolveBuildingId(b.place, b.building) === currentBuilding;

      if (aBuildingMatch && !bBuildingMatch) return -1;
      if (!aBuildingMatch && bBuildingMatch) return 1;

      return 0;
    })
    .slice(0, 3);

  // 関連企画が0件の場合は表示しない
  if (relatedEvents.length === 0) {
    return null;
  }

  return (
    <section className="event-detail-entrance-related mx-4 bg-transparent py-16 sm:mx-6 sm:py-20 lg:mx-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              関連企画
            </h2>
          </div>
          <Link
            href="/events"
            className="group inline-flex items-center gap-2 text-sm font-semibold text-primary-700 underline-offset-4 transition-colors hover:text-primary-900 hover:underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-primary-600"
          >
            企画一覧を見る
            <ArrowRight
              className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
        <EventGrid events={relatedEvents} variant="compact" />
      </div>
    </section>
  );
}
