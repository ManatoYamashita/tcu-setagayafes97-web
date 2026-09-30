/**
 * microCMS の select フィールドから値のキーを取り出す
 *
 * select は `["day1 : 10月31日（土）"]` のような「値 : ラベル」形式の配列で返ります
 * （`microcms/README.md`）。先頭要素の `:` より前を小文字にして返します。
 * 文字列1つで返る場合（`"day1"`）にも対応します。
 *
 * **ホワイトリストとの照合は呼び出し側で行ってください。** ここでは取り出すだけです。
 *
 * `src/lib/events.ts` から切り出してあるのは、`src/lib/event-sessions.ts`（開催枠の日程）からも
 * 使うためです。`events.ts` は `event-sessions.ts` を import しているので、逆向きに import すると循環します。
 *
 * @returns 取り出したキー。値が無い・文字列でないときは null
 */
export function readSelectKey(value: string[] | string | undefined): string | null {
  if (!value) return null;

  const raw = Array.isArray(value) ? value[0] : value;
  if (typeof raw !== "string") return null;

  const key = raw.split(":")[0].trim().toLowerCase();
  return key === "" ? null : key;
}
