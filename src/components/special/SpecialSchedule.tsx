import { siteConfig } from "@/data/site";
import type { EventDate } from "@/types/events";

interface SpecialScheduleProps {
  date: EventDate;
  /** 開場時刻（SpecialDetail.openTime） */
  openTime?: string;
  /** 開演時刻（Event.startTime） */
  startTime?: string;
  endTime?: string;
  /** 建物名 */
  building?: string;
  /** 場所 */
  place: string;
}

/**
 * 開催日の select 値を日本語表記へ変換する
 * 日付は siteConfig.dates を唯一の出典とし、年次更新時の修正箇所を1か所に保つ
 */
function formatEventDate(date: EventDate): string {
  const toJa = (iso: string) => {
    const [, month, day] = iso.split("-");
    const weekday = new Date(`${iso}T00:00:00+09:00`).toLocaleDateString("ja-JP", {
      weekday: "short",
      timeZone: "Asia/Tokyo",
    });
    return `${Number(month)}月${Number(day)}日（${weekday}）`;
  };

  switch (date) {
    case "day1":
      return toJa(siteConfig.dates.day1);
    case "day2":
      return toJa(siteConfig.dates.day2);
    case "both":
      return `${toJa(siteConfig.dates.day1)}・${toJa(siteConfig.dates.day2)}`;
    default:
      return "日程調整中";
  }
}

/**
 * 開催日時と会場の定義リスト
 *
 * 未入力の項目は行ごと出力しません（開場時刻が未定の年もあるため）。
 */
export function SpecialSchedule({
  date,
  openTime,
  startTime,
  endTime,
  building,
  place,
}: SpecialScheduleProps) {
  const venue = [building, place].filter(Boolean).join(" ");
  const performance = startTime && endTime ? `${startTime} 〜 ${endTime}` : startTime;

  return (
    <section aria-labelledby="special-schedule" className="py-8">
      <h2 id="special-schedule" className="mb-4 text-xl font-bold text-gray-900 md:text-2xl">
        開催日時・会場
      </h2>

      <dl className="divide-y divide-gray-200 rounded-xl border border-gray-200">
        <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
          <dt className="w-32 shrink-0 text-sm font-semibold text-gray-900/70">日程</dt>
          <dd className="text-sm text-gray-900">{formatEventDate(date)}</dd>
        </div>

        {openTime && (
          <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 text-sm font-semibold text-gray-900/70">開場</dt>
            <dd className="text-sm text-gray-900">{openTime}</dd>
          </div>
        )}

        {performance && (
          <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 text-sm font-semibold text-gray-900/70">開演</dt>
            <dd className="text-sm text-gray-900">{performance}</dd>
          </div>
        )}

        {venue && (
          <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:gap-4">
            <dt className="w-32 shrink-0 text-sm font-semibold text-gray-900/70">会場</dt>
            <dd className="text-sm text-gray-900">{venue}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
