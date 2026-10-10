"use client";

import { useEffect } from "react";
import { PHRASE_SEPARATOR, stripPhraseBreaks } from "@/lib/phrase-break";
import { breakPhrasesIn, loadJapaneseParse } from "@/lib/phrase-break-dom";

/**
 * サイト内の日本語テキストを BudouX の文節で改行させる（設計は src/lib/phrase-break.ts）
 *
 * ハイドレーションの後、ブラウザが空いた時点で始める。以後の差し替え（画面遷移・
 * 絞り込み・入稿の再検証）は MutationObserver で追う。React がテキストを書き換えると
 * 区切りは消えるが、同じ経路で入れ直される。
 */
export function PhraseBreaker() {
  useEffect(() => {
    let cancelled = false;
    let observer: MutationObserver | undefined;
    let retryTimer: number | undefined;

    const start = async () => {
      const parse = await loadJapaneseParse();
      if (cancelled) return;

      // ハイドレーションは DOM を変えないので MutationObserver では気づけない。見送りが
      // あれば間隔を空けて歩き直す。回数に上限があるのは、React の外で作られた要素
      // （SplitText の行など）が持ち主を持たず、永久に見送られるため
      let attempts = 0;
      const rewalk = () => {
        retryTimer = undefined;
        if (breakPhrasesIn(document.body, parse) && attempts++ < 20) {
          retryTimer = window.setTimeout(rewalk, 500);
        }
      };
      const scheduleRewalk = () => {
        if (retryTimer !== undefined) return;
        attempts = 0;
        retryTimer = window.setTimeout(rewalk, 500);
      };

      observer = new MutationObserver((records) => {
        let deferred = false;
        for (const record of records) {
          if (record.type === "characterData") {
            deferred = breakPhrasesIn(record.target, parse) || deferred;
          } else {
            record.addedNodes.forEach((node) => {
              deferred = breakPhrasesIn(node, parse) || deferred;
            });
          }
        }
        if (deferred) scheduleRewalk();
      });
      observer.observe(document.body, { childList: true, subtree: true, characterData: true });
      if (breakPhrasesIn(document.body, parse)) scheduleRewalk();
    };

    const idle =
      window.requestIdleCallback ?? ((callback: () => void) => window.setTimeout(callback, 1));
    const cancelIdle = window.cancelIdleCallback ?? window.clearTimeout;
    const handle = idle(() => void start().catch(() => {}), { timeout: 2000 });

    // 区切りはコピーした文字列（住所の貼り付けなど）へ持ち出さない
    const handleCopy = (event: ClipboardEvent) => {
      const selected = window.getSelection()?.toString() ?? "";
      if (!selected.includes(PHRASE_SEPARATOR) || !event.clipboardData) return;
      event.clipboardData.setData("text/plain", stripPhraseBreaks(selected));
      event.preventDefault();
    };
    document.addEventListener("copy", handleCopy);

    return () => {
      cancelled = true;
      cancelIdle(handle);
      observer?.disconnect();
      window.clearTimeout(retryTimer);
      document.removeEventListener("copy", handleCopy);
    };
  }, []);

  return null;
}
