import { OTHER_BUILDING_ID, resolveBuildingId } from "@/data/filter-options";
import { searchParticles, searchStopwords } from "@/data/search-stopwords";
import { normalizeText, stripHtml } from "./text";
import type { Event } from "@/types/events";

/**
 * 照合するフィールドと重み
 *
 * 「どのフィールドで当たったか」で並び順を変えるための係数です。タイトルで当たった企画は、
 * 本文の隅で当たった企画より上に来ます。
 */
const FIELD_WEIGHTS = {
  title: 5,
  organizer: 3,
  place: 3,
  building: 3,
  description: 2,
  content: 1,
} as const;

/** 先頭からでも区切ってよい語の最小長。これ未満は左に2文字以上残るときだけ区切る */
const SPLIT_ANYWHERE_MIN_LENGTH = 3;

/** 短い区切り語が、左側に残さなければならない文字数 */
const MIN_LEFT_LENGTH = 2;

/** 区切り語の暴走を止める上限（1クエリあたりの分割回数） */
const MAX_SPLITS = 50;

/** 正規化済みの区切り語。長いものから試す */
const separators = [...searchParticles, ...searchStopwords]
  .map(normalizeText)
  .filter(Boolean)
  .sort((a, b) => b.length - a.length);

/** 正規化済みの不要語。切り出したあとに捨てる判定へ使う */
const stopwords = new Set(
  [...searchParticles, ...searchStopwords].map(normalizeText).filter(Boolean)
);

/** 正規化済みの助詞 */
const particles = searchParticles.map(normalizeText).filter(Boolean);

/**
 * 検索語として捨てる語かどうか
 *
 * 単体の不要語に加えて、**先頭の助詞が不要語へ吸着した形**も捨てます。
 * `おすすめの企画を教えて` は `の企画` という、どの企画にも一致しえない語を作ります。
 * 助詞は「左に2文字以上残せるときだけ切る」規則（`のど自慢` を守るため）の副作用で、
 * 語頭に来ると切り離せないためです。
 *
 * **助詞を無条件に剥がしてはいけません。** `のど自慢` が `ど自慢` になります。
 * 剥がした残りが不要語だったときに限り、まとめて捨てます。
 */
function isNoiseToken(token: string): boolean {
  if (stopwords.has(token)) return true;
  return particles.some(
    (particle) => token.startsWith(particle) && stopwords.has(token.slice(particle.length))
  );
}

/** 照合対象のフィールド1つ */
interface SearchField {
  text: string;
  weight: number;
}

/**
 * 1つの語句を、区切り語で分割する
 *
 * 区切り語が3文字以上なら先頭からでも切ります（`やってるだんす` → `だんす`）。
 * 1〜2文字（助詞など）は、**左側に2文字以上を残せるときだけ**切ります。
 * この制限が無いと `のど自慢` が `ど自慢` に割れて、意図した企画が引けなくなります。
 */
function splitBySeparators(segment: string): string[] {
  const parts: string[] = [];
  let rest = segment;

  for (let i = 0; i < MAX_SPLITS && rest.length > 0; i++) {
    let cutAt = -1;
    let cutLength = 0;

    for (const separator of separators) {
      const from = separator.length >= SPLIT_ANYWHERE_MIN_LENGTH ? 0 : MIN_LEFT_LENGTH;
      const found = rest.indexOf(separator, from);
      // 同じ位置なら長い区切り語を優先する（separators は長い順）
      if (found >= from && (cutAt === -1 || found < cutAt)) {
        cutAt = found;
        cutLength = separator.length;
      }
    }

    if (cutAt === -1) break;

    parts.push(rest.slice(0, cutAt));
    rest = rest.slice(cutAt + cutLength);
  }

  parts.push(rest);
  return parts.filter(Boolean);
}

/**
 * 文章クエリを検索語へ分解する
 *
 * @param query 来場者が入力した文字列
 * @returns 正規化済みの検索語。重複は除く。意味のある語が無ければ空配列
 *
 * **空配列は「絞り込む条件が無い」という意味であって、「0件」ではありません。**
 * `searchEvents()` はこの場合に全件を返します。`おすすめの企画を教えて` のような
 * 中身の無いクエリで結果を空にすると、検索が壊れているように見えるためです。
 */
export function tokenizeQuery(query: string): string[] {
  const normalized = normalizeText(query);
  if (!normalized) return [];

  const raw = normalized.split(" ").flatMap(splitBySeparators);

  return [...new Set(raw.filter((token) => !isNoiseToken(token)))];
}

/**
 * 企画から照合対象のフィールドを組み立てる
 *
 * すべて `normalizeText()` を通します。**未入力フィールドは空文字になる**ため、
 * `undefined` に対する `.toLowerCase()` が起きません（#166）。
 */
function toSearchFields(event: Event): SearchField[] {
  const buildingId = resolveBuildingId(event.place, event.building);

  return [
    { text: normalizeText(event.title), weight: FIELD_WEIGHTS.title },
    { text: normalizeText(event.organizer), weight: FIELD_WEIGHTS.organizer },
    { text: normalizeText(event.place), weight: FIELD_WEIGHTS.place },
    {
      // 「その他」は建物名ではなく振り分け先の名前なので検索対象にしない。
      // 対象にすると「その他」で検索したときに解決できなかった企画が全部出る
      text: buildingId === OTHER_BUILDING_ID ? "" : normalizeText(buildingId),
      weight: FIELD_WEIGHTS.building,
    },
    { text: normalizeText(event.description), weight: FIELD_WEIGHTS.description },
    { text: normalizeText(stripHtml(event.content)), weight: FIELD_WEIGHTS.content },
  ];
}

/** 並べ替えのために保持する1件分 */
interface ScoredRow {
  event: Event;
  /** 元の並び順。同点のときに `-publishedAt` 順を保つために使う */
  index: number;
  fields: SearchField[];
}

/** 語がどれかのフィールドに含まれるか */
function hasToken(row: ScoredRow, token: string): boolean {
  return row.fields.some((field) => field.text.includes(token));
}

/**
 * 一致した語の数とスコアで並べ替える
 *
 * 第1基準は**一致した語の数**です。文章クエリでは意味のない語が混ざるため、
 * 「多くの語に当たった企画」を先に出すほうが体感に合います。
 */
function rank(rows: ScoredRow[], tokens: string[]): Event[] {
  return rows
    .map((row) => {
      let score = 0;
      let matched = 0;

      for (const token of tokens) {
        let hit = false;
        for (const field of row.fields) {
          if (field.text.includes(token)) {
            score += field.weight;
            hit = true;
          }
        }
        if (hit) matched += 1;
      }

      return { row, score, matched };
    })
    .sort((a, b) => b.matched - a.matched || b.score - a.score || a.row.index - b.row.index)
    .map((scored) => scored.row.event);
}

/**
 * 企画をキーワードで検索する
 *
 * 3段のカスケードで判定し、**上の段で1件でも当たったらそこで打ち切ります。**
 *
 * | 段 | 判定                             | 意図                                             |
 * | -- | -------------------------------- | ------------------------------------------------ |
 * | 1  | 正規化済みクエリ**全体**の部分一致 | `のど自慢` や `こ` のような、割ってはいけない語   |
 * | 2  | 全ての語を含む（AND）            | `9号館 ダンス` のような明示的な複数語            |
 * | 3  | いずれかの語を含む（OR）         | `9号館でやってるダンスのやつ` のような文章       |
 *
 * 段3まで落ちても、一致した語の数で並ぶため、意味のある語に多く当たった企画が先頭に来ます。
 *
 * @param events 検索対象の企画（この配列は変更しません）
 * @param query 来場者が入力した文字列
 * @returns 関連度順の企画。クエリが空なら入力をそのまま返す
 */
export function searchEvents(events: Event[], query: string): Event[] {
  const normalized = normalizeText(query);
  if (!normalized) return events;

  const rows: ScoredRow[] = events.map((event, index) => ({
    event,
    index,
    fields: toSearchFields(event),
  }));

  // 段1: クエリ全体の部分一致
  const whole = rows.filter((row) => hasToken(row, normalized));
  if (whole.length > 0) return rank(whole, [normalized]);

  const tokens = tokenizeQuery(query);
  // 検索語を1つも取り出せなかった = 絞り込む条件が無い。
  // 段1で当たらなかった時点で literal な一致も無いので、全件を返す
  if (tokens.length === 0) return events;

  // 段2: 全ての語を含む
  const all = rows.filter((row) => tokens.every((token) => hasToken(row, token)));
  if (all.length > 0) return rank(all, tokens);

  // 段3: いずれかの語を含む
  const any = rows.filter((row) => tokens.some((token) => hasToken(row, token)));
  return rank(any, tokens);
}
