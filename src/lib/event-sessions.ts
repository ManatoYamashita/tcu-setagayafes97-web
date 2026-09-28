import type { EventSession, RawEvent } from "@/types/events";
import { parseTimeToMinutes } from "@/lib/timetable-layout";

/**
 * 企画の開催枠（#281）
 *
 * 2部制の企画を表すため、企画の時刻は `Event.sessions` の配列で持ちます。
 * 正規化・表示文字列・構造化データの規則をこのモジュールへ集めているのは、
 * 詳細ページ・カード・著名人企画LPが別々に先頭の枠だけを読み、第2部以降を落とさないようにするためです。
 */

function toSession(startTime: string | undefined, endTime: string | undefined): EventSession {
  return { startTime: startTime?.trim() ?? "", endTime: endTime?.trim() ?? "" };
}

function isBlank(session: EventSession): boolean {
  return session.startTime === "" && session.endTime === "";
}

/**
 * microCMS の生データから開催枠を作る
 *
 * - 繰り返しフィールド `sessions` に、開始・終了のどちらかが入った行が1つでもあればそれを使う。
 *   このとき `startTime` / `endTime` は**読まない**
 * - 無ければ `startTime` / `endTime` から1枠を作る（`sessions` 導入前に入稿された企画はこちら）
 * - どちらも空なら空配列（時刻未定）
 *
 * 開始時刻の昇順に並べます。HH:mm として読めない枠は末尾に置き、それらどうしは入稿順を保ちます。
 *
 * 値を入れていない行を落とすのは、管理画面で行を追加しただけの状態が「開催枠あり」と扱われ、
 * `startTime` / `endTime` の値まで黙って無視されるのを防ぐためです。
 */
export function normalizeEventSessions(
  rawEvent: Pick<RawEvent, "sessions" | "startTime" | "endTime">
): EventSession[] {
  const fromRepeater = (rawEvent.sessions ?? [])
    .map((session) => toSession(session.startTime, session.endTime))
    .filter((session) => !isBlank(session));

  const sessions =
    fromRepeater.length > 0 ? fromRepeater : [toSession(rawEvent.startTime, rawEvent.endTime)];

  return sessions
    .filter((session) => !isBlank(session))
    .map((session, index) => ({ session, index, start: parseTimeToMinutes(session.startTime) }))
    .sort(
      (a, b) =>
        (a.start ?? Number.POSITIVE_INFINITY) - (b.start ?? Number.POSITIVE_INFINITY) ||
        a.index - b.index
    )
    .map(({ session }) => session);
}

/**
 * 開催枠の呼び名
 *
 * 枠が2つ以上ある企画だけ「第1部」「第2部」と呼びます。1枠の企画に「第1部」と付けると、
 * 続きがあるように読めてしまいます。
 */
export function getSessionLabel(index: number, count: number): string | undefined {
  return count >= 2 ? `第${index + 1}部` : undefined;
}

/** 呼び名を付けた開催枠 */
export interface LabelledSession extends EventSession {
  /** 枠が2つ以上あるときだけ「第1部」などが入る */
  label?: string;
}

/**
 * 表示する開催枠を選び、「第n部」を付ける
 *
 * 開始時刻の無い枠はどこにも表示しないので、ここで落としてから数えます。
 * 落とす前の数で呼び名を決めると、実際には1枠しか見えないのに「第1部」と付いてしまいます。
 *
 * 開始時刻が入っていれば、HH:mm として読めなくても数に入れます。詳細ページはそれを入稿どおりに
 * 表示するためです。タイムテーブルはその枠を描けませんが、呼び名は詳細ページと揃えます
 * （`filterStageEvents()`）。
 */
export function labelSessions(sessions: EventSession[]): LabelledSession[] {
  const shown = sessions.filter((session) => session.startTime !== "");
  return shown.map((session, index) => ({
    ...session,
    label: getSessionLabel(index, shown.length),
  }));
}

interface FormatSessionsOptions {
  /** 開始と終了の間に置く文字。既定は「 〜 」 */
  separator?: string;
  /** true なら終了時刻の無い枠を出さない（カードのように幅が限られる場所向け） */
  requireEnd?: boolean;
  /** false なら「第1部」を付けない。既定は付ける */
  withLabel?: boolean;
}

/**
 * 開催枠を表示用の文字列へ変換する
 *
 * 1枠なら `["10:40 〜 11:25"]`、2枠なら `["第1部 10:40 〜 11:25", "第2部 14:45 〜 15:45"]`。
 * 開始だけの枠は `10:40〜`、開始の無い枠は出しません（従来の「開始だけなら ○○〜」を踏襲）。
 * 表示できる枠が無ければ空配列を返すので、「時間未定」などの代替表示は呼び出し側で決めてください。
 */
export function formatSessions(
  sessions: EventSession[],
  { separator = " 〜 ", requireEnd = false, withLabel = true }: FormatSessionsOptions = {}
): string[] {
  return labelSessions(sessions).flatMap((session) => {
    if (requireEnd && !session.endTime) return [];

    const range = session.endTime
      ? `${session.startTime}${separator}${session.endTime}`
      : `${session.startTime}〜`;
    const label = withLabel ? session.label : undefined;

    return [label ? `${label} ${range}` : range];
  });
}

interface EventScheduleJsonLdInput {
  title: string;
  sessions: EventSession[];
  /** 開催日（YYYY-MM-DD） */
  dateIso: string;
  /** 子の Event にも親と同じ場所を入れる */
  location: unknown;
  /** 開始時刻が1つも読めないときの `startDate`。省略すると出さない */
  fallbackStartDate?: string;
}

interface TimedSession {
  label?: string;
  startMinutes: number;
  endMinutes: number | null;
}

/**
 * 0時からの分を ISO 8601 の日時にする
 *
 * 入稿値の文字列をそのまま埋め込まないのは、`9:30` のような1桁の時も `parseTimeToMinutes()` が
 * 受け付けるためです。そのまま使うと `T9:30:00` という不正な日時になります。分から組み立て直して
 * 必ず2桁にします。
 */
function toIsoDateTime(dateIso: string, minutes: number): string {
  const hh = String(Math.floor(minutes / 60)).padStart(2, "0");
  const mm = String(minutes % 60).padStart(2, "0");
  return `${dateIso}T${hh}:${mm}:00+09:00`;
}

/**
 * JSON-LD（schema.org/Event）の日時部分を作る
 *
 * 親の `startDate` は最初の枠の開始、`endDate` は最後に終わる枠の終了です。
 * 2部制のように枠が2つ以上あると、親の範囲には空き時間も含まれてしまいます。
 * そのため、各枠を `subEvent` として別に出します。
 *
 * HH:mm として読めない時刻は出しません。`2026-10-31T1000:00+09:00` のような
 * 不正な日時を検索エンジンへ渡すより、欠けているほうが安全です。
 * 同じ理由で、親の `endDate` が最後の枠の開始より前になるとき（最後の枠に終了が無い）は、
 * 親の `endDate` を出しません。出すと subEvent が親の期間からはみ出します。
 */
export function buildEventScheduleJsonLd({
  title,
  sessions,
  dateIso,
  location,
  fallbackStartDate,
}: EventScheduleJsonLdInput): { startDate?: string; endDate?: string; subEvent?: object[] } {
  const timed = labelSessions(sessions).flatMap((session): TimedSession[] => {
    const startMinutes = parseTimeToMinutes(session.startTime);
    if (startMinutes === null) return [];
    const endMinutes = parseTimeToMinutes(session.endTime);
    return [
      {
        label: session.label,
        startMinutes,
        // 終了が開始以前なら読めないものとして扱う
        endMinutes: endMinutes !== null && endMinutes > startMinutes ? endMinutes : null,
      },
    ];
  });

  if (timed.length === 0) {
    return fallbackStartDate ? { startDate: fallbackStartDate } : {};
  }

  // sessions は開始時刻の昇順だが、終了は昇順とは限らない（長い第1部と短い第2部など）。
  // 比較は分で行う。文字列で比べると "9:50" が "11:00" より後になる
  const ends = timed.flatMap(({ endMinutes }) => (endMinutes === null ? [] : [endMinutes]));
  const latestEnd = ends.length > 0 ? Math.max(...ends) : null;
  const latestStart = Math.max(...timed.map(({ startMinutes }) => startMinutes));
  const endDate =
    latestEnd !== null && latestEnd > latestStart ? toIsoDateTime(dateIso, latestEnd) : undefined;

  const subEvent =
    timed.length >= 2
      ? timed.map(({ label, startMinutes, endMinutes }) => ({
          "@type": "Event",
          name: label ? `${title}（${label}）` : title,
          startDate: toIsoDateTime(dateIso, startMinutes),
          endDate: endMinutes === null ? undefined : toIsoDateTime(dateIso, endMinutes),
          location,
        }))
      : undefined;

  return { startDate: toIsoDateTime(dateIso, timed[0].startMinutes), endDate, subEvent };
}
