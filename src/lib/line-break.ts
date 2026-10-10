/**
 * 見出しの中で改行させない連なりの切り出し
 *
 * 「第97回」は「第」と数字の間が改行可能位置になる（UAX #14 で ID の後ろに NU が来る位置）。
 * Chrome の `word-break: auto-phrase` もこの位置を文節の切れ目として残すため、
 * `text-wrap: balance` が行長を揃えようとすると「…東京都市大学 第 / 97回…」を選ぶ
 * （2026-10-10 実測。#438）。CSS だけでは特定の位置を禁じられないので、
 * 該当する連なりを `white-space: nowrap` の要素で包んで改行可能位置そのものを消す。
 *
 * 対象は「第」＋数字（＋助数詞）だけに絞る。広げるほど長い連なりが1行に収まらず
 * はみ出す危険が増えるため、実際に割れたものを足していく。
 */
const UNBREAKABLE = /第[0-9０-９]+[回期代弾号部章]?/g;

export interface LineBreakSegment {
  text: string;
  /** true なら改行させない */
  keepTogether: boolean;
}

/**
 * テキストを「そのままの部分」と「改行させない部分」に分ける
 *
 * 連結すると必ず元のテキストに戻る。空文字の区間は返さない。
 */
export function splitUnbreakable(text: string): LineBreakSegment[] {
  const segments: LineBreakSegment[] = [];
  let cursor = 0;

  for (const match of text.matchAll(UNBREAKABLE)) {
    const start = match.index;
    if (start > cursor) segments.push({ text: text.slice(cursor, start), keepTogether: false });
    segments.push({ text: match[0], keepTogether: true });
    cursor = start + match[0].length;
  }

  if (cursor < text.length) segments.push({ text: text.slice(cursor), keepTogether: false });
  return segments;
}
