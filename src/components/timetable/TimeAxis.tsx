import { generateTimeAxis } from "@/lib/timetable";

/**
 * 時間軸コンポーネント
 * タイムテーブルの左側に表示される時間軸
 */
export function TimeAxis() {
  const timeAxis = generateTimeAxis(10, 18);

  return (
    <div className="relative h-full">
      {timeAxis.map((time, index) => (
        <div
          key={time}
          className="absolute left-0 w-full border-t border-gray-200"
          style={{
            top: `${(index / (timeAxis.length - 1)) * 100}%`,
          }}
        >
          <span className="absolute -top-3 left-0 bg-white px-2 text-sm font-medium text-gray-600">
            {time}
          </span>
        </div>
      ))}
    </div>
  );
}
