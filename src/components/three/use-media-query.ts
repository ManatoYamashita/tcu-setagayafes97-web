"use client";

import { useEffect, useState } from "react";

/**
 * メディアクエリの一致状態を購読する。
 *
 * 初期値を初回レンダーの時点で `matchMedia` から読む。固定 `false` にすると、
 * モーション軽減設定でも effect が走るまでの1フレームは `frameloop="always"` かつ
 * `useFrame` の早期 return も効かず、歯車が一瞬回ってしまう。
 *
 * IMPORTANT: このフックは `ssr: false` のツリー専用である。初期値がクライアントの
 * 実測値になるため、SSR されるコンポーネントで使うとサーバーの HTML（常に false 相当）
 * と一致せず hydration mismatch になる。SSR 側でも使うなら、初期値を false に戻すか
 * `useSyncExternalStore` の server snapshot へ切り替えること。
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches
  );

  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);

    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
