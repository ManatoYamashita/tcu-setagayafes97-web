import { Fragment } from "react";

/**
 * 文節の切れ目でだけ改行させてテキストを描く
 *
 * 分割は `splitPhrases()`（src/lib/phrase-break.ts）でサーバー側に済ませておく。
 * `keep-all` で文節の内側の改行を禁じ、`<wbr>` で文節の間を改行可能にする。
 * 1文節が行幅より長いときだけ `overflow-wrap: anywhere` で途中から折る（はみ出し防止）。
 */
export function PhraseText({ phrases }: { phrases: string[] }) {
  return (
    <span className="[word-break:keep-all] [overflow-wrap:anywhere]">
      {phrases.map((phrase, index) => (
        <Fragment key={index}>
          {index > 0 && <wbr />}
          {phrase}
        </Fragment>
      ))}
    </span>
  );
}
