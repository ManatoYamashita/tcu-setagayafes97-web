import Link from "next/link";
import type { Event } from "@/types/events";

interface TimetableEventCardProps {
  event: Event;
}

/**
 * タイムテーブル用イベントカードコンポーネント
 * タイムテーブルに表示されるイベントカード
 */
export function TimetableEventCard({ event }: TimetableEventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block h-full rounded-lg bg-white p-3 border border-gray-200 transition-colors hover:border-primary border-l-4 border-l-primary"
    >
      {/* タイトル */}
      <h3 className="mb-1 text-sm font-bold text-gray-900 line-clamp-2">{event.title}</h3>

      {/* 時刻 */}
      <p className="mb-1 text-xs font-medium text-primary">
        {event.startTime} - {event.endTime}
      </p>

      {/* 場所 */}
      <p className="text-xs text-gray-600">{event.place}</p>

      {/* 主催 */}
      {event.organizer && (
        <p className="mt-1 text-xs text-gray-500 line-clamp-1">{event.organizer}</p>
      )}
    </Link>
  );
}
