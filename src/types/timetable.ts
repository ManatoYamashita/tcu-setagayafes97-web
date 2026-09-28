import type { Event } from "@/types/events";

/**
 * タイムテーブルの1ブロック（企画の開催枠1つ）
 *
 * 2部制の企画は、`filterStageEvents()` が開催枠ごとに1つずつ作るため2つになります（#281）。
 * 盤面・縦スタック・カードはこの型を受け取り、`startTime` / `endTime` にはその枠の時刻が入ります。
 * `startTime` / `endTime` は HH:mm として読めることを確認済みで、終了は開始より後です。
 *
 * `Event` から、タイムテーブルが描画と絞り込みに使う項目だけを取り出しています。
 * この型は Client Component（`TimetableContent`）へ直列化されるため、本文の HTML などを
 * 持たせると、2部制の企画ではそれが枠の数だけペイロードに載ります。
 *
 * **同じ企画のブロックは `id` を共有します。** React の key には `entryKey` を使い、
 * 件数（「n企画」「n件」）は `id` の重複を除いて数えてください。
 */
export type TimetableEntry = Pick<
  Event,
  "id" | "type" | "date" | "title" | "place" | "organizer"
> & {
  startTime: string;
  endTime: string;
  /** `${id}#${開催枠の番号}`。同じ企画の別の枠と重ならない */
  entryKey: string;
  /** 開催枠が2つ以上ある企画だけ「第1部」などが入る */
  sessionLabel?: string;
};
