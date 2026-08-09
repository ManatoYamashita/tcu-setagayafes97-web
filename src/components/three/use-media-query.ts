"use client";

import { useEffect, useState } from "react";

/**
 * メディアクエリの一致状態を購読する。
 *
 * 初期値は常に false を返し、マウント後の effect で実際の値へ同期する。
 * この歯車シーンは `ssr: false` の dynamic import で読み込まれるため
 * ハイドレーション不整合は起きないが、初回描画の1フレームだけ
 * 「未一致」として扱われる点には注意すること。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
