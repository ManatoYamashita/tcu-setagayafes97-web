import type { Event } from "@/types/events";
import { getEventsList } from "@/lib/events";
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

  // 関連企画を抽出（優先順位: 同じ種別 > 同じ建物）
  const relatedEvents = otherEvents
    .sort((a, b) => {
      // 同じ種別の企画を優先
      const aTypeMatch = a.type === currentEvent.type;
      const bTypeMatch = b.type === currentEvent.type;

      if (aTypeMatch && !bTypeMatch) return -1;
      if (!aTypeMatch && bTypeMatch) return 1;

      // 同じ建物の企画を次に優先
      const aBuildingMatch = a.building === currentEvent.building;
      const bBuildingMatch = b.building === currentEvent.building;

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
    <section className="border-t border-gray-200 bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">関連企画</h2>
        <EventGrid events={relatedEvents} />
      </div>
    </section>
  );
}
