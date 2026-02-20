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
      className="block h-full rounded-lg bg-white/10 p-3 border border-white/20 transition-colors hover:border-white border-l-4 border-l-primary-light"
    >
      {/* タイトル */}
      <h3 className="mb-1 text-sm font-bold text-white line-clamp-2">{event.title}</h3>

      {/* 時刻 */}
      <p className="mb-1 text-xs font-medium text-primary-light">
        {event.startTime} - {event.endTime}
      </p>

      {/* 場所 */}
      <p className="text-xs text-white/80">{event.place}</p>

      {/* 主催 */}
      {event.organizer && (
        <p className="mt-1 text-xs text-white/60 line-clamp-1">{event.organizer}</p>
      )}
    </Link>
  );
}
