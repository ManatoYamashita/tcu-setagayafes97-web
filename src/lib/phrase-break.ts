/**
 * 日本語の文節の境目へ改行候補（ゼロ幅スペース）を差し込む
 *
 * `word-break: auto-phrase` は Chrome にしか無く、iOS（WebKit）では漢字の間の
 * どこでも改行可能になる（「東京都市大 / 学」。#453）。BudouX で文節を求め、
 * 境目へ U+200B を入れたうえで `word-break: keep-all` を当てると、
 * どのブラウザでも文節の境目でだけ折れる。DOM への適用は PhraseBreaker が行う。
 *
 * `<wbr>` ではなく文字を差し込むのは、React が持っているテキストノードを分割しないため。
 * 分割すると React の次の更新が先頭の断片だけを書き換え、文字列が壊れる。
 */
export const PHRASE_SEPARATOR = "​";

const JAPANESE = /[぀-ヿ㐀-䶿一-鿿]/;
const SEPARATORS = /​/g;

export function hasJapanese(text: string): boolean {
  return JAPANESE.test(text);
}

export function stripPhraseBreaks(text: string): string {
  return text.replace(SEPARATORS, "");
}

/**
 * 文節の境目へ PHRASE_SEPARATOR を入れた文字列を返す
 *
 * 何度適用しても同じ結果になる（既存の区切りを外してから分け直す）。
 * 日本語を含まない文字列はそのまま返す。
 */
export function insertPhraseBreaks(text: string, parse: (text: string) => string[]): string {
  if (!hasJapanese(text)) return text;
  return parse(stripPhraseBreaks(text)).join(PHRASE_SEPARATOR);
}
