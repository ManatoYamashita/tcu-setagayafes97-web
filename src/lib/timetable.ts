import type { Event, EventDate } from "@/types/events";
import {
  stages,
  extractStageId,
  resolveStageId,
  OTHER_STAGE_ID,
  getStageName,
} from "@/data/stages";
import { parseTimeToMinutes } from "@/lib/timetable-layout";

/**
 * タイムテーブルのデータ選択
 *
 * 盤面の幾何計算（高さ・座標・レーン分割）は `@/lib/timetable-layout` にあります。
 * このモジュールは「どの企画を、どの順で、どのステージに置くか」だけを扱います。
 */

/**
 * タイムテーブルに載せる企画を抽出
 *
 * type === "stage" または "special" で、かつ **"HH:mm" として解釈できる** startTime と
 * endTime を持つ企画のみ。
 *
 * 時刻の形式検査をここで済ませるのは、ガント盤面と縦スタックで表示が食い違わないように
 * するためです。盤面は座標を計算できない企画を描けませんが、縦スタックは描けてしまうため、
 * 入口で揃えないと「デスクトップには無いのにモバイルには出る企画」が生まれます。
 *
 * 著名人企画（special）を含めるのは、それが開場・開演のあるステージイベントであり、
 * 来場者が「何時から」をタイムテーブルで探すためです。未解禁の著名人企画は
 * `getEventsList()` の時点で除外されるため、ここでの追加判定は不要です。
 */
export function filterStageEvents(events: Event[]): Event[] {
  return events.filter((event) => {
    if (event.type !== "stage" && event.type !== "special") return false;

    const start = parseTimeToMinutes(event.startTime);
    const end = parseTimeToMinutes(event.endTime);
    if (start !== null && end !== null && end > start) return true;

    // startTime が空の企画（時刻未定）は正常な状態なので黙って落とす。
    // 入力はあるのに読めない場合だけ、入稿ミスとして知らせる
    if (event.startTime || event.endTime) {
      warnOnce(
        `[timetable] 企画「${event.title}」の時刻を解釈できません` +
          `（startTime: "${event.startTime ?? ""}" / endTime: "${event.endTime ?? ""}"）。` +
          `HH:mm 形式で、終了が開始より後になるよう入稿してください。タイムテーブルには出しません。`
      );
    }
    return false;
  });
}

/**
 * 日程でフィルタリング
 *
 * `both`（両日開催）は Day1 / Day2 のどちらにも出します。
 */
export function filterEventsByDate(events: Event[], date: EventDate | "all"): Event[] {
  if (date === "all") return events;
  return events.filter((event) => event.date === date || event.date === "both");
}

/**
 * ステージでフィルタリング
 *
 * **判定は必ず `resolveStageId()` を通すこと。** `extractStageId()`（null を返す）に戻すと、
 * グループ化では「その他」へ入る企画が、絞り込みでは `null !== "other"` で必ず外れるため、
 * 「その他」タブが常に空になります。
 */
export function filterEventsByStage(events: Event[], stageId: string | "all"): Event[] {
  if (stageId === "all") return events;
  return events.filter((event) => resolveStageId(event.place) === stageId);
}

/**
 * ステージ1つぶんの企画群
 */
export interface StageGroup {
  id: string;
  name: string;
  events: Event[];
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
export function groupEventsByStage(events: Event[]): StageGroup[] {
  const byStage = new Map<string, Event[]>();

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
      events: [...byStage.get(stageId)!].sort((a, b) =>
        (a.startTime ?? "").localeCompare(b.startTime ?? "")
      ),
    }));
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

export function warnUnresolvedStagePlaces(events: Event[]): void {
  if (process.env.NODE_ENV === "production") return;

  for (const event of events) {
    if (extractStageId(event.place) !== null) continue;

    warnOnce(
      `[timetable] place "${event.place}" がどのステージにも一致しません（企画: ${event.title}）。` +
        `「その他」列へ入れています。src/data/stages.ts の id / name を確認してください。`
    );
  }
}
