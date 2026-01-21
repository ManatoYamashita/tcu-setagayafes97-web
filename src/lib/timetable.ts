import type { Event, EventDate } from "@/types/events";
import { extractStageId } from "@/data/stages";

/**
 * ステージ企画のみを抽出
 * type === "stage" かつ startTime と endTime が存在する企画のみ
 */
export function filterStageEvents(events: Event[]): Event[] {
  return events.filter((event) => event.type === "stage" && event.startTime && event.endTime);
}

/**
 * 日程とステージでフィルタリング
 */
export function filterEventsByDateAndStage(
  events: Event[],
  date: EventDate | "all",
  stageId: string | "all"
): Event[] {
  let filtered = events;

  // 日程フィルター
  if (date !== "all") {
    filtered = filtered.filter((event) => event.date === date || event.date === "both");
  }

  // ステージフィルター
  if (stageId !== "all") {
    filtered = filtered.filter((event) => {
      const eventStageId = extractStageId(event.place);
      return eventStageId === stageId;
    });
  }

  // 開始時刻でソート
  filtered.sort((a, b) => {
    if (!a.startTime || !b.startTime) return 0;
    return a.startTime.localeCompare(b.startTime);
  });

  return filtered;
}

/**
 * イベントの位置を計算（ガントチャート用）
 * @param startTime - 開始時刻 "HH:mm" 形式
 * @param endTime - 終了時刻 "HH:mm" 形式
 * @param startHour - タイムテーブルの開始時刻（デフォルト: 10）
 * @param endHour - タイムテーブルの終了時刻（デフォルト: 18）
 * @returns { top: number; height: number } - 上からの位置とイベントの高さ（パーセンテージ）
 */
export function calculateEventPosition(
  startTime: string,
  endTime: string,
  startHour: number = 10,
  endHour: number = 18
): { top: number; height: number } {
  try {
    // "HH:mm" 形式を時間（分）に変換
    const parseTime = (time: string): number => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startMinutes = parseTime(startTime);
    const endMinutes = parseTime(endTime);
    const rangeStartMinutes = startHour * 60;
    const rangeEndMinutes = endHour * 60;
    const totalMinutes = rangeEndMinutes - rangeStartMinutes;

    // 開始位置（上からのパーセンテージ）
    const top = ((startMinutes - rangeStartMinutes) / totalMinutes) * 100;

    // 高さ（パーセンテージ）
    const height = ((endMinutes - startMinutes) / totalMinutes) * 100;

    return {
      top: Math.max(0, Math.min(100, top)),
      height: Math.max(0, Math.min(100, height)),
    };
  } catch {
    // エラーが発生した場合はデフォルト値を返す
    return { top: 0, height: 10 };
  }
}

/**
 * ステージごとにイベントをグループ化
 */
export function groupEventsByStage(events: Event[]): Record<string, Event[]> {
  const grouped: Record<string, Event[]> = {};

  events.forEach((event) => {
    const stageId = extractStageId(event.place);
    if (stageId) {
      if (!grouped[stageId]) {
        grouped[stageId] = [];
      }
      grouped[stageId].push(event);
    }
  });

  return grouped;
}

/**
 * 時間軸の生成
 * @param startHour - 開始時刻（デフォルト: 10）
 * @param endHour - 終了時刻（デフォルト: 18）
 * @returns 時間軸の配列 ["10:00", "11:00", ...]
 */
export function generateTimeAxis(startHour: number = 10, endHour: number = 18): string[] {
  const axis: string[] = [];
  for (let hour = startHour; hour <= endHour; hour++) {
    axis.push(`${hour.toString().padStart(2, "0")}:00`);
  }
  return axis;
}
