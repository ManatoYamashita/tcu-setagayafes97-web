import type { Event } from "@/types/events";
import { siteConfig } from "@/data/site";

/**
 * タイムテーブル盤面の幾何計算
 *
 * ## 縦方向の寸法は必ず px で持つこと
 *
 * このモジュールが px しか返さないのは意図的です。#148 では、盤面の高さを
 * `height: 100%` で親から受け取ろうとして、その親が `min-height` しか持たなかったため
 * `0px` に解決され、時刻による位置の振り分けが丸ごと無効化されました。
 *
 * CSS の百分率高さは、親の高さが確定しているときにしか解決されません
 * （`min-height` は親の高さを確定させません）。盤面の高さを
 * `(endHour - startHour) × HOUR_HEIGHT_PX` の数値として持ち、カードの `top` / `height` も
 * px で与えれば、親の解決に依存する箇所がゼロになり、この事故は構造的に起きなくなります。
 *
 * 横方向のレーン分割だけは `%` を使いますが、これは CSS Grid のトラック幅が
 * 確定しているため安全です。縦と横で扱いが違う理由がここにあります。
 */

/** 1時間あたりの高さ（px）。30分企画がタイトル＋時刻の2行を保てる下限として選定 */
export const HOUR_HEIGHT_PX = 96;

/**
 * カードの下限高さ（px）
 *
 * 15分企画は本来 24px になりますが、それではリンクとして押しづらくなります。
 * カード内側の余白（4px）を引いた実寸が 24px を下回らないよう 28px を下限にしています
 * （WCAG 2.5.8 ターゲットサイズ AA の 24×24）。
 * **この値は描画にのみ使い、重なり判定には使わないこと。** クランプ後の高さで重なりを見ると、
 * 隣接しているだけの短時間企画が偽の重なりとして検出されます。
 */
export const MIN_EVENT_HEIGHT_PX = 28;

/** 時間軸カラムの幅（px） */
export const TIME_COL_WIDTH_PX = 72;

/** ステージ列の最小幅（px）。「10:30 - 12:00」と2行タイトルが読める下限 */
export const MIN_STAGE_COL_WIDTH_PX = 180;

export interface TimeRange {
  /** 盤面の開始時刻（時。0-23） */
  startHour: number;
  /** 盤面の終了時刻（時。startHour より後） */
  endHour: number;
}

const TIME_PATTERN = /^(\d{1,2}):(\d{2})$/;

/**
 * "HH:mm" を 0時からの分に変換する
 *
 * 形式が不正なら `null` を返します。**`NaN` を返しません。**
 * 旧実装は `Number("ab")` が例外を投げないことを見落としており、`try/catch` をすり抜けた
 * `NaN` がそのまま CSS の値として出力されていました。
 */
export function parseTimeToMinutes(time: string | undefined | null): number | null {
  if (!time) return null;

  const matched = TIME_PATTERN.exec(time.trim());
  if (!matched) return null;

  const hours = Number(matched[1]);
  const minutes = Number(matched[2]);
  if (hours > 23 || minutes > 59) return null;

  return hours * 60 + minutes;
}

function hourFloorOf(time: string, fallback: number): number {
  const minutes = parseTimeToMinutes(time);
  return minutes === null ? fallback : Math.floor(minutes / 60);
}

function hourCeilOf(time: string, fallback: number): number {
  const minutes = parseTimeToMinutes(time);
  return minutes === null ? fallback : Math.ceil(minutes / 60);
}

/**
 * 企画が1件も無い / 全ての時刻が不正なときに使うレンジ
 *
 * 開催時間（`siteConfig`）から導出します。旧実装は `10` / `18` を
 * `TimetableChart` と `TimeAxis` の2箇所に別々にベタ書きしており、
 * 閉場時刻（19:30）とも食い違っていました。
 */
export const DEFAULT_TIME_RANGE: TimeRange = {
  startHour: hourFloorOf(siteConfig.openTime, 10),
  endHour: hourCeilOf(siteConfig.closeTime, 20),
};

/**
 * 表示対象の企画から時間レンジを算出する
 *
 * 最早開始を切り捨て、最遅終了を切り上げて時間単位に丸めます。
 *
 * **1つの盤面の全ステージ列は、同一のレンジを共有しなければなりません。**
 * 列ごとにレンジが変わると縦のスケールが揃わず、ステージ間の比較ができなくなります。
 * 同じ理由で、レンジは「ステージで絞り込む前」の集合から算出してください
 * （絞り込み後だとタブを切り替えるたびにスケールが動きます）。
 */
export function calculateTimeRange(
  events: Event[],
  fallback: TimeRange = DEFAULT_TIME_RANGE
): TimeRange {
  let earliest: number | null = null;
  let latest: number | null = null;

  for (const event of events) {
    const start = parseTimeToMinutes(event.startTime);
    const end = parseTimeToMinutes(event.endTime);
    if (start === null || end === null || end <= start) continue;

    if (earliest === null || start < earliest) earliest = start;
    if (latest === null || end > latest) latest = end;
  }

  if (earliest === null || latest === null) return fallback;

  const startHour = Math.floor(earliest / 60);
  const endHour = Math.ceil(latest / 60);

  // 全企画が同一の正時内に収まる場合でも、最低1時間ぶんの高さを確保する
  return { startHour, endHour: Math.max(endHour, startHour + 1) };
}

/** 盤面の高さ（px）。この数値がそのまま `style={{ height }}` に載る */
export function calculateBoardHeight(
  range: TimeRange,
  hourHeightPx: number = HOUR_HEIGHT_PX
): number {
  return Math.max(0, range.endHour - range.startHour) * hourHeightPx;
}

/**
 * 企画の縦位置（px）
 *
 * レンジと全く重ならない企画、時刻が不正な企画は `null` を返します。
 * 旧実装は壊れた入力に対して `{ top: 0, height: 10 }` という既定値を黙って返していましたが、
 * それでは「10:00 開始の企画」と区別が付きません。**描画しないほうが誤情報より安全です。**
 */
export function calculateEventOffset(
  startTime: string | undefined,
  endTime: string | undefined,
  range: TimeRange,
  hourHeightPx: number = HOUR_HEIGHT_PX
): { topPx: number; heightPx: number } | null {
  const start = parseTimeToMinutes(startTime);
  const end = parseTimeToMinutes(endTime);
  if (start === null || end === null || end <= start) return null;

  const rangeStart = range.startHour * 60;
  const rangeEnd = range.endHour * 60;
  if (end <= rangeStart || start >= rangeEnd) return null;

  const pxPerMinute = hourHeightPx / 60;
  const boardHeight = (rangeEnd - rangeStart) * pxPerMinute;

  const clampedStart = Math.max(start, rangeStart);
  const clampedEnd = Math.min(end, rangeEnd);

  const rawHeight = (clampedEnd - clampedStart) * pxPerMinute;
  const heightPx = Math.min(Math.max(rawHeight, MIN_EVENT_HEIGHT_PX), boardHeight);
  const topPx = Math.min((clampedStart - rangeStart) * pxPerMinute, boardHeight - heightPx);

  return { topPx, heightPx };
}

export interface PositionedEvent {
  event: Event;
  topPx: number;
  heightPx: number;
  /** 0 始まりのレーン番号。重なりが無ければ常に 0 */
  laneIndex: number;
  /** 同じ重なりクラスタのレーン総数。重なりが無ければ常に 1 */
  laneCount: number;
}

interface LayoutCandidate {
  event: Event;
  offset: { topPx: number; heightPx: number };
  startMinutes: number;
  endMinutes: number;
}

/**
 * 1ステージ列ぶんのレイアウトを組む
 *
 * 時間帯が重なる企画はレーンへ分割して左右に並べます。ステージは物理的に1つなので
 * 重なりは基本的に入稿ミスですが、後勝ちで隠してしまうと誰も気付けません。
 * 分割して両方見せることで異常が可視化されます。
 *
 * 重なり判定は実時刻（分）で行い、`MIN_EVENT_HEIGHT_PX` でクランプした描画高さは使いません。
 *
 * 返り値は開始時刻の昇順です。絶対配置でも Tab 順・読み上げ順は DOM 順に従うため、
 * この順序がそのまま操作順の保証になります。
 */
export function layoutStageEvents(
  events: Event[],
  range: TimeRange,
  hourHeightPx: number = HOUR_HEIGHT_PX
): PositionedEvent[] {
  const candidates: LayoutCandidate[] = [];

  for (const event of events) {
    const offset = calculateEventOffset(event.startTime, event.endTime, range, hourHeightPx);
    const startMinutes = parseTimeToMinutes(event.startTime);
    const endMinutes = parseTimeToMinutes(event.endTime);
    if (!offset || startMinutes === null || endMinutes === null) continue;

    candidates.push({ event, offset, startMinutes, endMinutes });
  }

  candidates.sort((a, b) => a.startMinutes - b.startMinutes || b.endMinutes - a.endMinutes);

  const positioned: PositionedEvent[] = [];
  let cluster: Array<{ candidate: LayoutCandidate; laneIndex: number }> = [];
  let laneEnds: number[] = [];
  let clusterMaxEnd = Number.NEGATIVE_INFINITY;

  const flushCluster = () => {
    const laneCount = Math.max(laneEnds.length, 1);
    for (const { candidate, laneIndex } of cluster) {
      positioned.push({
        event: candidate.event,
        topPx: candidate.offset.topPx,
        heightPx: candidate.offset.heightPx,
        laneIndex,
        laneCount,
      });
    }
    cluster = [];
    laneEnds = [];
    clusterMaxEnd = Number.NEGATIVE_INFINITY;
  };

  for (const candidate of candidates) {
    // 直前までのクラスタと一切重ならなければ、そこでレーンの割当をリセットする
    if (cluster.length > 0 && candidate.startMinutes >= clusterMaxEnd) flushCluster();

    let laneIndex = laneEnds.findIndex((end) => end <= candidate.startMinutes);
    if (laneIndex === -1) {
      laneIndex = laneEnds.length;
      laneEnds.push(candidate.endMinutes);
    } else {
      laneEnds[laneIndex] = candidate.endMinutes;
    }

    cluster.push({ candidate, laneIndex });
    clusterMaxEnd = Math.max(clusterMaxEnd, candidate.endMinutes);
  }
  flushCluster();

  return positioned;
}

/**
 * 時間軸の目盛りを生成
 * @returns `["10:00", "11:00", ...]`（endHour を含む）
 */
export function generateTimeAxis(range: TimeRange): string[] {
  const axis: string[] = [];
  for (let hour = range.startHour; hour <= range.endHour; hour++) {
    axis.push(`${String(hour % 24).padStart(2, "0")}:00`);
  }
  return axis;
}

export type EventCardDensity = "full" | "compact" | "minimal";

/**
 * カードの高さから表示密度を決める
 *
 * 30分企画は 48px しかなく、タイトル・時刻・場所・主催の4行は入りません。
 * 溢れさせて切るのではなく、優先度の低い情報から落とします。
 */
export function getCardDensity(heightPx: number): EventCardDensity {
  // 閾値は実際に収まる行数から決めている。
  // full    = 内側余白 24 + タイトル2行 36 + 時刻 15 + 場所 15 = 90px
  // compact = 内側余白  8 + タイトル1行 18 + 時刻 15          = 41px
  if (heightPx >= 92) return "full";
  if (heightPx >= 44) return "compact";
  return "minimal";
}
