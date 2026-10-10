import { Fragment } from "react";

import { splitUnbreakable } from "@/lib/line-break";

/**
 * 「第97回」のような連なりの途中で改行させずにテキストを描く
 *
 * 理由と対象は src/lib/line-break.ts。読み上げは元の文字列のまま変わらない。
 */
export function UnbreakableText({ text }: { text: string }) {
  return splitUnbreakable(text).map((segment, index) =>
    segment.keepTogether ? (
      <span key={index} className="whitespace-nowrap">
        {segment.text}
      </span>
    ) : (
      <Fragment key={index}>{segment.text}</Fragment>
    )
  );
}
