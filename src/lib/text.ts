/**
 * 検索・照合のためのテキスト正規化
 *
 * **キーワード検索と建物の導出は、必ず同じ関数を通してください。** 片方だけ正規化すると
 * 「検索ではヒットするのに建物フィルタでは落ちる」という食い違いが起きます。
 *
 * microCMS の `place` は自由入力で、実データには次の揺れが同居しています（2026-09-06 実測）。
 *
 * | 実値                             | 揺れの種類           |
 * | -------------------------------- | -------------------- |
 * | `9号館アリーナ` / `９号館アリーナ` | 半角数字と全角数字   |
 * | `世田谷キャンパス第１アリーナ　`   | 全角数字＋末尾全角空白 |
 * | `テント１`                        | 全角数字             |
 * | `SAKURA GARDEN`                   | 英大文字             |
 */

/** ひらがなへ寄せるカタカナの範囲（U+30A1 ァ 〜 U+30F6 ヶ） */
const KATAKANA_START = 0x30a1;
const KATAKANA_END = 0x30f6;

/** ひらがなとカタカナのコードポイント差 */
const KANA_OFFSET = 0x60;

/**
 * 照合の邪魔にしかならない記号
 *
 * 長音符（`ー`）も落とします。`ホール` と `ホル`、`メンバー` と `メンバ` のような
 * 入稿揺れを同一視するためです。同音異義の衝突（`コーラ` と `コラ`）は起こりえますが、
 * 学園祭の企画名という母集団では、揺れを吸収できる利得のほうが大きいと判断しています。
 */
const IGNORED_SYMBOLS = /[・･ー〜~（）()「」『』【】[\]{}<>／/\\|,、.。:：;；!！?？"'`^*#&+_-]/g;

/**
 * 検索・照合用にテキストを正規化する
 *
 * 1. NFKC 正規化 — `９`→`9`、`ＴＣＵ`→`TCU`、`ﾎｰﾙ`→`ホール`、全角空白→半角空白
 * 2. 小文字化 — `SAKURA` と `sakura` を同一視
 * 3. カタカナ→ひらがな — `ダンス` と `だんす` を同一視
 * 4. 記号の除去と空白の畳み込み
 *
 * @param input 正規化するテキスト（`undefined` / `null` を許容する）
 * @returns 正規化済みテキスト。入力が空なら空文字
 *
 * **欠落フィールドを空文字として返すのが要点です。** microCMS は未入力フィールドを
 * キーごと返さないため、`Event` の型宣言が実行時に守られていない箇所があります（#166）。
 * 呼び出し側へ `?.` を撒く代わりに、境界であるこの関数で吸収します。
 */
export function normalizeText(input: string | undefined | null): string {
  if (!input) return "";

  const folded = input.normalize("NFKC").toLowerCase();

  let kana = "";
  for (const char of folded) {
    const code = char.codePointAt(0) as number;
    kana +=
      code >= KATAKANA_START && code <= KATAKANA_END
        ? String.fromCodePoint(code - KANA_OFFSET)
        : char;
  }

  return kana.replace(IGNORED_SYMBOLS, "").replace(/\s+/g, " ").trim();
}

/**
 * リッチエディタの HTML から本文テキストだけを取り出す
 *
 * `content` は microCMS の richEditorV2 で、`<p>` や `<a>` を含みます。タグを残したまま
 * 照合すると `a` や `p` のような1文字クエリが全件にヒットするため、先に落とします。
 *
 * @param html リッチエディタの HTML
 * @returns タグと主要な実体参照を除いたテキスト
 */
export function stripHtml(html: string | undefined | null): string {
  if (!html) return "";

  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}
