/**
 * シード付きのシャッフル
 *
 * 企画一覧（`/events`）の表示順を来場者ごとに変えるために使います（#409）。
 * 公開日順のままだと、入稿が新しい企画ほど先頭に出続けて団体間の露出に差が出るためです。
 *
 * **`Math.random()` で直接並べ替えてはいけません。** 再レンダリングのたびに順番が変わり、
 * 絞り込みを変えるだけで一覧が並び替わります。シードを1つ決めておけば、同じ入力に対して
 * 何度呼んでも同じ順番になります。
 */

/**
 * mulberry32 擬似乱数生成器
 *
 * 暗号用途ではありません。表示順を散らすのに十分な一様性を、状態32bitだけで得られます。
 *
 * @param seed 32bit 符号なし整数として扱われるシード
 * @returns 呼ぶたびに [0, 1) の値を返す関数
 */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 配列をシードに従って並べ替える（Fisher–Yates）
 *
 * @param items 並べ替える配列。変更しません
 * @param seed シード。同じ値なら同じ順番になります
 * @returns 並べ替えた新しい配列
 */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const result = [...items];
  const random = mulberry32(seed);

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
}

/**
 * シャッフル用のシードを1つ作る
 *
 * @returns 32bit 符号なし整数
 */
export function createShuffleSeed(): number {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
