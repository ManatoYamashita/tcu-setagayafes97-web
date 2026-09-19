/**
 * 禁止している色トークンの一次定義（#230）
 *
 * ここが唯一の定義で、2つのガードが両方ともこのファイルを読む。
 *
 * - `eslint.config.mjs` — AST の文字列リテラルとテンプレート文字列を見る
 * - `scripts/assert-no-restricted-colors.mjs` — `src/` の生テキストを見る（コメントを含む）
 *
 * ## なぜ共有するのか
 *
 * #227 では禁止リストが `eslint.config.mjs` の中に4つの正規表現として直接置かれていた。
 * 検査を1本足すと同じ表現が2箇所に増え、**片方だけ直したときに片方をすり抜ける。**
 * `docs/frontend/design.md` は「`@theme` へ段を足したら禁止リストから外すこと」と
 * 書いているが、外す場所が2箇所あると「外したつもりで外れていない」が起こる。
 *
 * **`@theme` へ段を足したときに触るのは、このファイル1箇所だけである。**
 */

/**
 * ブランド紫（`primary-*`）と色相差 7.5–11.6°。15° 未満は同一色として知覚されるうえ、
 * 彩度が約40%高いため「ブランド紫を出そうとして外した色」に見える（#179 B）。
 */
export const RESTRICTED_PURPLE = {
  id: "purple",
  /** `50` / `100`〜`900` / `950`。`(?![0-9])` は `purple-5000` のような別語への誤爆を防ぐ */
  pattern: "(?:purple|violet|fuchsia)-(?:50|950|[1-9]00)(?![0-9])",
  message:
    "Tailwind 既定の purple / violet / fuchsia は使えません。ブランドと色相差が 15° 未満で、別色として認識されないためです。primary-* の同じ段へ置き換えてください（docs/frontend/design.md「紫はすべて primary-* を使う」）。",
};

/**
 * `@theme` のニュートラルは 50/100/200/400/500/600/700/900 の8段。
 * 300 / 800 / 950 は欠番で、書くと既定の青みがかったスレートへ落ちる。
 */
export const RESTRICTED_GRAY = {
  id: "gray",
  pattern: "gray-(?:300|800|950)(?![0-9])",
  message:
    "gray-300 / gray-800 / gray-950 は @theme に定義がなく、既定の青みがかったスレートへ落ちます。gray-200 など定義済みの段へ寄せるか、globals.css の @theme へ段を足してこの規則から外してください（docs/frontend/design.md「Tailwind 既定パレットを直接使わない」）。",
};

/** 両ガードが参照する禁止トークンの全件 */
export const RESTRICTED_COLOR_TOKENS = [RESTRICTED_PURPLE, RESTRICTED_GRAY];

/**
 * Tailwind が**実際にユーティリティとして出力しうる形**へ絞った正規表現を返す
 *
 * 色のユーティリティは必ず名前空間の接頭辞を伴う（`text-` `bg-` `from-` `ring-` …）。
 * 接頭辞の無い裸のトークン（説明文の「旧 purple-500」など）からは何も出力されない。
 *
 * **接頭辞を列挙しない。** 一覧を持つと、載せ忘れた接頭辞がそのまま死角になる
 * ——このファイルが存在する理由そのものである。`hover:from-` や `md:bg-` のような
 * 変種も、直前が英小文字とハイフン以外なら接頭辞部分だけが一致する。
 *
 * @param {{pattern: string}} token
 * @returns {RegExp}
 */
export function emittableUtilityRegex(token) {
  return new RegExp(`(?:^|[^a-z-])[a-z][a-z-]*-(?:${token.pattern})`, "g");
}
