import type { Event } from "@/types/events";
import { calculateEventPosition } from "@/lib/timetable";
import { TimeAxis } from "./TimeAxis";
import { TimetableEventCard } from "./TimetableEventCard";

interface TimetableChartProps {
  events: Event[];
}

/**
 * タイムテーブルチャートコンポーネント
 * ガントチャート形式でイベントを表示
 */
export function TimetableChart({ events }: TimetableChartProps) {
  if (!events || events.length === 0) {
    return (
      <div className="rounded-lg bg-gray-100 p-8 text-center">
        <p className="text-gray-600">企画が見つかりませんでした。</p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg bg-white p-6 shadow-md">
      {/* デスクトップ: ガントチャート */}
      <div className="hidden md:block">
        <div className="relative" style={{ minHeight: "600px" }}>
          {/* 時間軸 */}
          <div className="absolute left-0 top-0 w-20 h-full">
            <TimeAxis />
          </div>

          {/* イベント表示エリア */}
          <div className="ml-24 relative h-full">
            {events.map((event) => {
              if (!event.startTime || !event.endTime) return null;

              const position = calculateEventPosition(event.startTime, event.endTime, 10, 18);

              return (
                <div
                  key={event.id}
                  className="absolute w-full px-2"
                  style={{
                    top: `${position.top}%`,
                    height: `${position.height}%`,
                  }}
                >
                  <TimetableEventCard event={event} />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* モバイル: 縦スタック */}
      <div className="md:hidden space-y-4">
        {events.map((event) => (
          <TimetableEventCard key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}
