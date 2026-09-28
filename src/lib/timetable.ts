import type { Event, EventDate, EventSession } from "@/types/events";
import type { TimetableEntry } from "@/types/timetable";
import {
  stages,
  extractStageId,
  resolveStageId,
  isKnownStageId,
  OTHER_STAGE_ID,
  getStageName,
} from "@/data/stages";
import { parseTimeToMinutes } from "@/lib/timetable-layout";
import { matchesEventDate } from "@/lib/filters";
import { labelSessions } from "@/lib/event-sessions";

/**
 * タイムテーブルのデータ選択
 *
 * 盤面の幾何計算（高さ・座標・レーン分割）は `@/lib/timetable-layout` にあります。
 * このモジュールは「どの企画を、どの順で、どのステージに置くか」だけを扱います。
 */

/**
 * タイムテーブルに載せる企画を抽出し、開催枠ごとのブロックへ展開する
 *
 * type === "stage" または "special" の企画について、**"HH:mm" として解釈できる**開始・終了を持つ
 * 開催枠を1つずつ `TimetableEntry` にします。2部制の企画は2ブロックになります（#281）。
 * 1ブロックにまとめると、第1部の開始から第2部の終了までの空き時間も開催中として盤面を占めます。
 *
 * 時刻の形式検査をここで済ませるのは、ガント盤面と縦スタックで表示が食い違わないように
 * するためです。盤面は座標を計算できない企画を描けませんが、縦スタックは描けてしまうため、
 * 入口で揃えないと「デスクトップには無いのにモバイルには出る企画」が生まれます。
 * 読めない枠はその枠だけを落とし、同じ企画の他の枠は残します。
 *
 * 著名人企画（special）を含めるのは、それが開場・開演のあるステージイベントであり、
 * 来場者が「何時から」をタイムテーブルで探すためです。未解禁の著名人企画は
 * `getEventsList()` の時点で除外されるため、ここでの追加判定は不要です。
 */
export function filterStageEvents(events: Event[]): TimetableEntry[] {
  return events.flatMap((event) => {
    if (event.type !== "stage" && event.type !== "special") return [];

    // 時刻未定の企画は sessions が空なので、警告も出さずに落ちる。
    // ここで警告するのは、入力はあるのに読めない枠（入稿ミス）だけ
    const warnUnreadable = (session: EventSession, label: string | undefined) =>
      warnOnce(
        `[timetable] 企画「${event.title}」${label ? `の${label}` : ""}の時刻を解釈できません` +
          `（startTime: "${session.startTime}" / endTime: "${session.endTime}"）。` +
          `HH:mm 形式で、終了が開始より後になるよう入稿してください。タイムテーブルには出しません。`
      );

    // 開始の無い枠は labelSessions() が落とす（詳細ページにも出ない）。警告だけ出す
    for (const session of event.sessions) {
      if (session.startTime === "") warnUnreadable(session, undefined);
    }

    // 呼び名は詳細ページと同じ labelSessions() から取る。
    // 読めない枠を落とした後の数で付け直すと、詳細ページと「第n部」が食い違う
    return labelSessions(event.sessions).flatMap((session, index): TimetableEntry[] => {
      const start = parseTimeToMinutes(session.startTime);
      const end = parseTimeToMinutes(session.endTime);
      if (start === null || end === null || end <= start) {
        warnUnreadable(session, session.label);
        return [];
      }

      // Event 全体を展開しない。タイムテーブルは Client Component へ渡るため、
      // content（本文の HTML）や special まで枠の数だけ直列化されてしまう
      return [
        {
          id: event.id,
          type: event.type,
          date: event.date,
          title: event.title,
          place: event.place,
          organizer: event.organizer,
          startTime: session.startTime,
          endTime: session.endTime,
          entryKey: `${event.id}#${index}`,
          sessionLabel: session.label,
        },
      ];
    });
  });
}

/**
 * ブロックの集合に含まれる企画の数
 *
 * 2部制の企画はブロックが2つでも1企画です。`entries.length` で数えると、
 * 「n企画」「n件」の表示が開催枠の数だけ膨らみます。
 */
export function countDistinctEvents(entries: TimetableEntry[]): number {
  return new Set(entries.map((entry) => entry.id)).size;
}

/**
 * 日程でフィルタリング
 *
 * `both`（両日開催）は Day1 / Day2 のどちらにも出します。
 *
 * **判定そのものは `matchesEventDate()`（`src/lib/filters.ts`）が持ちます。**
 * 企画一覧の絞り込みと同じ規則を2箇所に書くと、片方だけ変えたときに
 * 「同じ日なのに件数が食い違う」が起きます。
 */
export function filterEventsByDate(
  events: TimetableEntry[],
  date: EventDate | "all"
): TimetableEntry[] {
  if (date === "all") return events;
  return events.filter((event) => matchesEventDate(event, date));
}

/**
 * ステージでフィルタリング
 *
 * **判定は必ず `resolveStageId()` を通すこと。** `extractStageId()`（null を返す）に戻すと、
 * グループ化では「その他」へ入る企画が、絞り込みでは `null !== "other"` で必ず外れるため、
 * 「その他」タブが常に空になります。
 */
export function filterEventsByStage(
  events: TimetableEntry[],
  stageId: string | "all"
): TimetableEntry[] {
  if (stageId === "all") return events;
  return events.filter((event) => resolveStageId(event.place) === stageId);
}

/**
 * ステージ1つぶんの企画群
 */
export interface StageGroup {
  id: string;
  name: string;
  /** 開催枠ごとのブロック。2部制の企画は2つ入る */
  events: TimetableEntry[];
}

/**
 * ステージごとに企画をまとめる
 *
 * `stages` の宣言順に並べ、最後に「その他」を置きます。企画が1件も無いステージは含めません。
 * 各グループの中身は開始時刻の昇順です。
 *
 * **どの企画も落としません。** 旧実装は `extractStageId()` が null を返した企画を
 * 黙って捨てており、`place` が想定外の表記だと「企画はあるのに盤面ごと出ない」状態になっていました。
 *
 * 返り値が `Record` ではなく配列なのは、呼び出し側が `Object.keys()` の順序に
 * 依存しないようにするためです。
 */
export function groupEventsByStage(events: TimetableEntry[]): StageGroup[] {
  const byStage = new Map<string, TimetableEntry[]>();

  for (const event of events) {
    const stageId = resolveStageId(event.place);
    const bucket = byStage.get(stageId);
    if (bucket) {
      bucket.push(event);
    } else {
      byStage.set(stageId, [event]);
    }
  }

  const order = [...stages.map((stage) => stage.id), OTHER_STAGE_ID];

  return order
    .filter((stageId) => byStage.has(stageId))
    .map((stageId) => ({
      id: stageId,
      name: getStageName(stageId),
      // 引数の配列を破壊しないよう複製してから並べ替える。
      // 旧実装は props で受け取った配列をそのまま sort しており、呼び出し元の順序を変えていた。
      // 時刻は filterStageEvents() で検査済みなので null にはならない
      events: [...byStage.get(stageId)!].sort(
        (a, b) => (parseTimeToMinutes(a.startTime) ?? 0) - (parseTimeToMinutes(b.startTime) ?? 0)
      ),
    }));
}

/** タブへ出すステージ。`StageGroup` から企画本体を落としたもの */
export type StageOption = Pick<StageGroup, "id" | "name">;

/**
 * ステージタブの一覧を作る
 *
 * 基本は「表示中の日程に企画があるステージ」です。**ステージで絞り込む前**の集合を
 * 渡してください。絞り込み後から作ると、7A を選んだ瞬間に他のタブが消えて
 * 「すべて」を経由しないと移動できなくなります。
 *
 * それに加えて、選択中のステージは当日0件でも必ず含めます。含めないと、その日に
 * 企画が無いステージIDをURLで直接開いたときタブが一覧から落ち、「すべて」も含めて
 * どのタブも `aria-pressed` にならず、何で絞り込まれているのか画面から読めなくなります
 * （#154 のレビュー指摘）。
 *
 * 実在しないステージIDは無視します。`getStageName()` は未知のIDをそのまま返すため、
 * 素通しにするとURLの任意の文字列がタブのラベルとして表示されます。
 */
export function listStageTabs(events: TimetableEntry[], selectedStageId: string): StageOption[] {
  const withEvents: StageOption[] = groupEventsByStage(events).map(({ id, name }) => ({
    id,
    name,
  }));

  if (
    selectedStageId === "all" ||
    !isKnownStageId(selectedStageId) ||
    withEvents.some((stage) => stage.id === selectedStageId)
  ) {
    return withEvents;
  }

  // 差し込んだあとも `groupEventsByStage()` と同じ並び（stages の宣言順 → その他）にする
  const order = [...stages.map((stage) => stage.id), OTHER_STAGE_ID];
  return [...withEvents, { id: selectedStageId, name: getStageName(selectedStageId) }].sort(
    (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
  );
}

/**
 * ステージに紐付けられなかった `place` を開発時に警告する
 *
 * 「その他」の受け皿があるため企画が消えることはありませんが、入稿の表記ゆれは
 * 気付ける場所で知らせないと直りません。本番では何もしません。
 *
 * 同じ `place` は何度呼ばれても1回しか出しません（React の再レンダや StrictMode の
 * 二重実行でログが増えないようにするため）。
 */
const warnedMessages = new Set<string>();

/** 開発時のみ、同じ文言を1回だけ出す */
function warnOnce(message: string): void {
  if (process.env.NODE_ENV === "production") return;
  if (warnedMessages.has(message)) return;

  warnedMessages.add(message);
  console.warn(message);
}

export function warnUnresolvedStagePlaces(events: Pick<Event, "place" | "title">[]): void {
  if (process.env.NODE_ENV === "production") return;

  for (const event of events) {
    if (extractStageId(event.place) !== null) continue;

    warnOnce(
      `[timetable] place "${event.place}" がどのステージにも一致しません（企画: ${event.title}）。` +
        `「その他」列へ入れています。src/data/stages.ts の id / name を確認してください。`
    );
  }
}
