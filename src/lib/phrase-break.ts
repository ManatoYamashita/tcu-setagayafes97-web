import { loadDefaultJapaneseParser } from "budoux";

/**
 * 見出しを文節に分ける（BudouX）
 *
 * `word-break: auto-phrase` は Chrome にしか無く、iOS（WebKit）では漢字の間の
 * どこでも改行可能になる。`text-balance` と組み合わさると「東京都市大 / 学」のように
 * 語の途中で折れるため、文節をサーバーで求めて `<wbr>` + `keep-all` で描く（PhraseText）。
 *
 * パッケージの入口は全言語のモデル（約 200 KB）を読み込むので、Client Component から import してはいけない。
 * 取得関数の正規化で呼び、分割済みの配列だけを渡す。
 */
const parser = loadDefaultJapaneseParser();

export function splitPhrases(text: string): string[] {
  if (text === "") return [];
  return parser.parse(text);
}
