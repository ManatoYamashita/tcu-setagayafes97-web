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
  // 著名人企画は専用LP（/special/[id]）が正規URL
  const href = event.type === "special" ? `/special/${event.id}` : `/events/${event.id}`;

  // 左アクセントは primary-600（白いシート上で 7.45:1）。primary-light は 2.43:1 しかなく、
  // 装飾線としても読めない（docs/frontend/design.md「アクセントラインは primary-600」）。
  // hover:border-* は border-color を全辺へ当てて border-left-color を上書きするため、
  // ホバー時の左色も明示している。
  // 面も bg-white で不透明に持つ。bg-white/10 は白いシート上では結果的に同じ色になるが、
  // 淡紫背景を前提にしたトークンであり、下地が変わったときに黙って崩れる。
  return (
    <Link
      href={href}
      className="block h-full rounded-lg bg-white p-3 border border-gray-200 transition-colors hover:border-gray-400 border-l-4 border-l-primary-600 hover:border-l-primary-700"
    >
      {/* タイトル */}
      <h3 className="mb-1 text-sm font-bold text-gray-900 line-clamp-2">{event.title}</h3>

      {/* 時刻 */}
      <p className="mb-1 text-xs font-medium text-primary-700">
        {event.startTime} - {event.endTime}
      </p>

      {/* 場所 */}
      <p className="text-xs text-gray-900/80">{event.place}</p>

      {/* 主催 */}
      {event.organizer && (
        <p className="mt-1 text-xs text-gray-900/60 line-clamp-1">{event.organizer}</p>
      )}
    </Link>
  );
}
