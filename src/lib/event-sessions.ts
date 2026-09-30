import type { EventSession, RawEvent, RawEventSession, SessionDate } from "@/types/events";
import { parseTimeToMinutes } from "@/lib/timetable-layout";
import { readSelectKey } from "@/lib/microcms-select";
import { dateFilterOptions } from "@/data/filter-options";

/**
 * 企画の開催枠（#281）
 *
 * 2部制の企画を表すため、企画の時刻は `Event.sessions` の配列で持ちます。
 * 正規化・表示文字列・構造化データの規則をこのモジュールへ集めているのは、
 * 詳細ページ・カード・著名人企画LPが別々に先頭の枠だけを読み、第2部以降を落とさないようにするためです。
 */

function toSession(
  startTime: string | undefined,
  endTime: string | undefined,
  rawDate?: RawEventSession["date"]
): EventSession {
  const date = normalizeSessionDate(rawDate);
  const times = { startTime: startTime?.trim() ?? "", endTime: endTime?.trim() ?? "" };
  // 値の無い枠には date キーを持たせない（「未指定」と「undefined が入っている」を区別しないため）
  return date ? { date, ...times } : times;
}

/**
 * 枠の日程（select）を正規化する
 *
 * `day1` / `day2` 以外（`both` / `other` / 未入力 / 想定外の値）は「日程の指定なし」として扱います。
 * 「両日」の枠は企画の `date` に従えば表せるため、枠の側で持つ意味がありません。
 */
function normalizeSessionDate(rawDate: RawEventSession["date"]): SessionDate | undefined {
  const key = readSelectKey(rawDate);
  return key === "day1" || key === "day2" ? key : undefined;
}

/** 並び替え用の日の順序。日程の無い枠は 1日目の側に置く */
function dayOrder(session: EventSession): number {
  return session.date === "day2" ? 1 : 0;
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
 * **日程（1日目 → 2日目）、開始時刻の順**に並べます。日程の無い枠は1日目の側に置きます。
 * 同じ日の中で HH:mm として読めない枠は末尾に置き、それらどうしは入稿順を保ちます。
 * 開始時刻だけで並べると、両日とも 11:00 開始の枠（#305 の Jazz Festival）の順序が入稿順任せになります。
 *
 * 値を入れていない行を落とすのは、管理画面で行を追加しただけの状態が「開催枠あり」と扱われ、
 * `startTime` / `endTime` の値まで黙って無視されるのを防ぐためです。
 */
export function normalizeEventSessions(
  rawEvent: Pick<RawEvent, "sessions" | "startTime" | "endTime">
): EventSession[] {
  const fromRepeater = (rawEvent.sessions ?? [])
    .map((session) => toSession(session.startTime, session.endTime, session.date))
    .filter((session) => !isBlank(session));

  const sessions =
    fromRepeater.length > 0 ? fromRepeater : [toSession(rawEvent.startTime, rawEvent.endTime)];

  return sessions
    .filter((session) => !isBlank(session))
    .map((session, index) => ({ session, index, start: parseTimeToMinutes(session.startTime) }))
    .sort(
      (a, b) =>
        dayOrder(a.session) - dayOrder(b.session) ||
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
  /** 同じ日の枠が2つ以上あるときだけ「第1部」などが入る */
  label?: string;
  /** 表示する枠の日程が2種類以上あるときだけ「1日目」などが入る */
  dayLabel?: string;
}

function getDayLabel(date: SessionDate): string {
  return dateFilterOptions.find((option) => option.value === date)?.label ?? date;
}

/**
 * 表示する開催枠を選び、「第n部」と「n日目」を付ける
 *
 * 開始時刻の無い枠はどこにも表示しないので、ここで落としてから数えます。
 * 落とす前の数で呼び名を決めると、実際には1枠しか見えないのに「第1部」と付いてしまいます。
 *
 * 開始時刻が入っていれば、HH:mm として読めなくても数に入れます。詳細ページはそれを入稿どおりに
 * 表示するためです。タイムテーブルはその枠を描けませんが、呼び名は詳細ページと揃えます
 * （`filterStageEvents()`）。
 *
 * **「第n部」は同じ日の枠の中で数えます**（#305）。両日開催で各日1枠の企画は2部制ではないので、
 * 企画全体で数えると「第1部 / 第2部」と誤って付きます。
 * 「n日目」は、表示する枠の日程が2種類以上あるときだけ付けます。1日だけの企画に付けても情報が増えません。
 */
export function labelSessions(sessions: EventSession[]): LabelledSession[] {
  const shown = sessions.filter((session) => session.startTime !== "");
  const distinctDates = new Set(shown.flatMap((session) => (session.date ? [session.date] : [])));
  const countOf = (date: SessionDate | undefined) =>
    shown.filter((session) => session.date === date).length;

  return shown.map((session, index) => {
    const indexInDay = shown.slice(0, index).filter((other) => other.date === session.date).length;
    const dayLabel =
      distinctDates.size >= 2 && session.date ? getDayLabel(session.date) : undefined;

    return {
      ...session,
      label: getSessionLabel(indexInDay, countOf(session.date)),
      ...(dayLabel ? { dayLabel } : {}),
    };
  });
}

interface FormatSessionsOptions {
  /** 開始と終了の間に置く文字。既定は「 〜 」 */
  separator?: string;
  /** true なら終了時刻の無い枠を出さない（カードのように幅が限られる場所向け） */
  requireEnd?: boolean;
  /**
   * false なら「第1部」を付けない。既定は付ける。
   * **「1日目」は false でも付けます。** 付けないと `11:00 - 16:00 / 11:00 - 15:00` となり、
   * どちらが何日目か読めません（#305）
   */
  withLabel?: boolean;
}

/**
 * 開催枠を表示用の文字列へ変換する
 *
 * 1枠なら `["10:40 〜 11:25"]`、2枠なら `["第1部 10:40 〜 11:25", "第2部 14:45 〜 15:45"]`。
 * 日ごとの枠なら `["1日目 11:00 〜 16:00", "2日目 11:00 〜 15:00"]`。
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
    const prefix = [session.dayLabel, withLabel ? session.label : undefined]
      .filter(Boolean)
      .join(" ");

    return [prefix ? `${prefix} ${range}` : range];
  });
}

interface EventScheduleJsonLdInput {
  title: string;
  sessions: EventSession[];
  /** 日ごとの開催日（YYYY-MM-DD）。日程を持つ枠はここから日付を取る（`siteConfig.dates`） */
  dates: Record<SessionDate, string>;
  /** 日程を持たない枠の開催日（YYYY-MM-DD） */
  defaultDateIso: string;
  /** 子の Event にも親と同じ場所を入れる */
  location: unknown;
  /** 開始時刻が1つも読めないときの `startDate`。省略すると出さない */
  fallbackStartDate?: string;
}

interface TimedSession {
  /** subEvent の名前に添える呼び名（「1日目 第1部」など） */
  suffix: string;
  start: string;
  end: string | null;
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
 * 日程を持つ枠はその日の日付で、持たない枠は `defaultDateIso` で組み立てます（#305）。
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
  dates,
  defaultDateIso,
  location,
  fallbackStartDate,
}: EventScheduleJsonLdInput): { startDate?: string; endDate?: string; subEvent?: object[] } {
  const timed = labelSessions(sessions).flatMap((session): TimedSession[] => {
    const startMinutes = parseTimeToMinutes(session.startTime);
    if (startMinutes === null) return [];
    const endMinutes = parseTimeToMinutes(session.endTime);
    const dateIso = session.date ? dates[session.date] : defaultDateIso;
    return [
      {
        suffix: [session.dayLabel, session.label].filter(Boolean).join(" "),
        start: toIsoDateTime(dateIso, startMinutes),
        // 終了が開始以前なら読めないものとして扱う
        end:
          endMinutes !== null && endMinutes > startMinutes
            ? toIsoDateTime(dateIso, endMinutes)
            : null,
      },
    ];
  });

  if (timed.length === 0) {
    return fallbackStartDate ? { startDate: fallbackStartDate } : {};
  }

  // 比較は日付込みの ISO 文字列で行う。toIsoDateTime() が桁を揃えているので、文字列の順序が
  // 時刻の順序と一致する（入稿値の "9:50" を直接比べると "11:00" より後になるので、そちらは使わない）。
  // 開始の最小を並び順に頼らず取るのは、日程の無い枠が defaultDateIso（2日目のこともある）へ
  // 寄るため、並び順（日程の無い枠は1日目の側）と日付の順が一致しないことがあるから
  const starts = timed.map(({ start }) => start).sort();
  const ends = timed.flatMap(({ end }) => (end === null ? [] : [end])).sort();
  const earliestStart = starts[0];
  const latestStart = starts[starts.length - 1];
  const latestEnd = ends.length > 0 ? ends[ends.length - 1] : null;
  const endDate = latestEnd !== null && latestEnd > latestStart ? latestEnd : undefined;

  const subEvent =
    timed.length >= 2
      ? timed.map(({ suffix, start, end }) => ({
          "@type": "Event",
          name: suffix ? `${title}（${suffix}）` : title,
          startDate: start,
          endDate: end ?? undefined,
          location,
        }))
      : undefined;

  return { startDate: earliestStart, endDate, subEvent };
}
