import {
  dateFilterOptions,
  OTHER_BUILDING_ID,
  resolveBuildingId,
  typeFilterOptions,
} from "@/data/filter-options";
import { searchEvents } from "./search";
import { normalizeText, stripHtml } from "./text";
import type { ChoiceQuestion, NoulQuestion, TypeSafeAnswer } from "./typesafe";
import type { Event } from "@/types/events";

/**
 * 意味検索（キーワード検索の第4段）の純粋部分
 *
 * ここには**ネットワークも環境変数も入れません。** リクエストの組み立てと答えの解釈だけを
 * 置き、実際の通信は `src/lib/typesafe.ts` が、公開の判断は `src/app/api/search/route.ts`
 * が持ちます。分けているのは、**実測レスポンスを fixture にしてユニットテストで固定する**
 * ためです（`docs/dev/testing.md`「純粋関数は Vitest」）。
 *
 * 設計と実測は docs/frontend/events-semantic-search.md を参照。
 */

/** Choice 質問のID。答えは同じIDで返る */
export const SEMANTIC_CHOICE_ID = "best_match";

/** Noul 質問のID */
export const SEMANTIC_NOUL_ID = "has_match";

/**
 * 「該当がある」と見なす `has_match` の下限
 *
 * **Choice の `confidence` を足切りに使ってはいけません。** Choice は該当が無くても
 * 必ず1件選び、高い confidence で間違えます。本番データ98件・12クエリでの実測
 * （2026-09-20、`jev-1.13.0`、`scripts/measure-semantic-search.mjs`）:
 *
 * | クエリ             | Choice 第1位確率 | confidence | has_match |
 * | ------------------ | ---------------- | ---------- | --------- |
 * | `プールで泳ぎたい` | 0.34             | 0.32       | **0.05**  |
 * | `スキー場`         | **0.81**         | **0.79**   | **0.24**  |
 * | `確定申告の相談`   | **0.80**         | **0.79**   | **0.06**  |
 *
 * 該当なし群の confidence 0.79 は、該当あり群（`体を動かしたい` 0.39、`食べ物` 0.41、
 * `静かに座って見られる企画` 0.45）を**上回ります**。confidence で足切りをすると、
 * 実在しない企画を自信満々に出しながら、実在する企画を捨てることになります。
 *
 * `has_match` は該当あり群 **0.82〜0.98** / 該当なし群 **0.05〜0.24** に分かれ、
 * 0.5 はその谷の真ん中に落ちます。
 *
 * > [!IMPORTANT]
 * > **Issue #253 が挙げていた「該当なし群 0.02〜0.06、10倍以上のマージン」は再現しません。**
 * > `スキー場` は 0.24 まで上がりました（同じ足切りで正しく落ちるものの、余裕は約3.4倍）。
 * > 閾値を 0.2 付近まで下げてはいけません。
 *
 * 公式も「Choice は相対（どれか）、Noul は絶対（そもそもあるか）で別の問い」と明記しています
 * （https://docs.typesafe.ai/model-jaggedness/jev-1.13.md）。
 */
export const SEMANTIC_MATCH_THRESHOLD = 0.5;

/**
 * 結果に載せる Choice 確率の下限
 *
 * Choice の確率は全選択肢で合計1になるため、98件へ分散すると個々の値は小さくなります。
 * 均等配分なら 1/98 ≒ 0.0102 なので、1% は「均等配分より上」という意味になります。
 *
 * この値で実測（2026-09-20）の結果件数は次のとおりで、クエリの広さに素直に追従します。
 * `たこ焼き` 1件 / `9号館のダンス` 2件 / `のど自慢` 4件 / `体を動かしたい` 12件 /
 * `静かに座って見られる企画` 17件 / `食べ物` 24件（上限に到達）。
 */
export const SEMANTIC_MIN_PROBABILITY = 0.01;

/**
 * 結果として返す最大件数
 *
 * `食べ物` のように母集団の広い要望はここで頭打ちになります（実測で唯一到達した）。
 * 一覧の初期表示が12件（`EVENTS_PER_PAGE`）なので、その2ページ分を上限とします。
 */
export const SEMANTIC_MAX_RESULTS = 24;

/**
 * 1リクエストへ載せられる企画の上限
 *
 * Choice の選択肢は最大255個です（https://docs.typesafe.ai/api.md）。
 * 実測時の母集団は98件で、入力トークンは 15,455（$0.000649 ≒ 0.097円）でした。
 * **超えたら黙って切り捨てず、呼び出し側で失敗させます。** 切り捨てると
 * 「後ろのほうの企画だけが永久に意味検索へ出てこない」状態が無言で生まれます。
 */
export const SEMANTIC_MAX_EVENTS = 255;

/** 問い合わせを許す正規化済みクエリの最小長 */
export const SEMANTIC_QUERY_MIN_LENGTH = 2;

/**
 * 問い合わせを許す正規化済みクエリの最大長
 *
 * 長文を投げ込まれても課金は state 側が支配的なので大きくは増えませんが、
 * 意味のある要望が60字を超えることは実用上ありません。
 */
export const SEMANTIC_QUERY_MAX_LENGTH = 60;

/** state へ載せる `content` の最大長 */
const SEMANTIC_DETAIL_MAX_LENGTH = 160;

/** 日程の値 → 表示ラベル */
const dateLabels = new Map(dateFilterOptions.map((option) => [option.value, option.label]));

/** 企画種別の値 → 表示ラベル */
const typeLabels = new Map(typeFilterOptions.map((option) => [option.value, option.label]));

/** state へ載せる1企画分。**空のフィールドは載せません**（token の無駄になるため） */
interface SemanticEventEntry {
  ref: string;
  title?: string;
  organizer?: string;
  place?: string;
  building?: string;
  category?: string;
  day?: string;
  description?: string;
  detail?: string;
}

/** state 全体 */
export interface SemanticSearchState {
  /**
   * 来場者が入力した文字列
   *
   * **質問文（instructions）ではなく state に置きます。** state は「データ」として
   * 扱われる一方、instructions は指示そのものです。来場者の入力を指示側へ混ぜると、
   * 「これまでの指示を無視して…」の類がそのまま指示として読まれます。
   */
  visitor_query: string;
  events: SemanticEventEntry[];
}

/** 組み立て済みのリクエスト材料 */
export interface SemanticRequestPlan {
  state: SemanticSearchState;
  questions: {
    [SEMANTIC_CHOICE_ID]: ChoiceQuestion;
    [SEMANTIC_NOUL_ID]: NoulQuestion;
  };
  /** `E00` → microCMS のコンテンツID */
  refToId: Map<string, string>;
}

/** ランキング1件 */
export interface SemanticRankingEntry {
  id: string;
  probability: number;
}

/** 解釈済みの答え。`/api/search` のレスポンスでもある */
export interface SemanticSearchResult {
  /** `has_match >= SEMANTIC_MATCH_THRESHOLD` か */
  hasMatch: boolean;
  /** `has_match` の生値。ログと調査のために残す */
  matchProbability: number;
  /** 確率の高い順。`hasMatch` が false なら必ず空 */
  ranking: SemanticRankingEntry[];
}

/**
 * 検索語を意味検索へ渡せる形に正規化する
 *
 * @returns 正規化済みクエリ。短すぎる・長すぎる場合は null
 */
export function normalizeSemanticQuery(raw: string | undefined | null): string | null {
  const normalized = normalizeText(raw);

  if (normalized.length < SEMANTIC_QUERY_MIN_LENGTH) return null;
  if (normalized.length > SEMANTIC_QUERY_MAX_LENGTH) return null;

  return normalized;
}

/**
 * 意味検索を呼ぶべきかどうか（第4段のゲート）
 *
 * **段1〜3のどれかが1件でも当たったら呼びません。** `たこ焼き` や `9号館 ダンス` は
 * リテラル照合が意味検索と同じ答えを無料・0ms で出します。ここを通すと、
 * 認証の無い従量課金口を全クエリで叩くことになります。
 *
 * 判定は**絞り込み前の全企画**に対して行います。日程や建物のフィルタで0件になった場合まで
 * 意味検索へ落とすと、どのみち積集合で消える結果に課金することになるためです。
 *
 * @param allEvents 絞り込み前の全企画
 * @param keyword 来場者が入力した文字列
 */
export function shouldAskSemanticSearch(allEvents: Event[], keyword: string): boolean {
  if (allEvents.length === 0) return false;
  if (normalizeSemanticQuery(keyword) === null) return false;

  // searchEvents はトークンを取り出せないクエリに対して全件を返す（「条件が無い」の意味）。
  // 0件になるのは「リテラルがどこにも当たらなかった」ときだけ
  return searchEvents(allEvents, keyword).length === 0;
}

/** `E00` 形式の参照名。件数の桁数へゼロ詰めする */
function toRef(index: number, width: number): string {
  return `E${String(index).padStart(width, "0")}`;
}

/** 空文字なら undefined。JSON から消えるのでトークンを食わない */
function omitEmpty(value: string): string | undefined {
  return value.length > 0 ? value : undefined;
}

/**
 * 1件の企画を state のエントリへ落とす
 *
 * **開始・終了時刻は載せません。** Jev は数値と日付の比較が苦手だと公式に明記されており
 * （https://docs.typesafe.ai/model-jaggedness/jev-1.13.md）、時刻の判定は
 * 既存のタイムテーブル側のコードが持っています。
 */
function toEntry(event: Event, ref: string): SemanticEventEntry {
  const buildingId = resolveBuildingId(event.place, event.building);

  return {
    ref,
    title: omitEmpty((event.title ?? "").trim()),
    organizer: omitEmpty((event.organizer ?? "").trim()),
    place: omitEmpty((event.place ?? "").trim()),
    // 「その他」は建物名ではなく振り分け先の名前なので渡さない（src/lib/search.ts と同じ判断）
    building: buildingId === OTHER_BUILDING_ID ? undefined : buildingId,
    category: typeLabels.get(event.type),
    day: dateLabels.get(event.date),
    description: omitEmpty((event.description ?? "").trim()),
    detail: omitEmpty(stripHtml(event.content).slice(0, SEMANTIC_DETAIL_MAX_LENGTH)),
  };
}

/**
 * 1リクエスト分の state と質問を組み立てる
 *
 * 選択肢には **microCMS のコンテンツIDを使いません。** 選択肢名はモデルへ送られるため、
 * 意味を持たないランダムな文字列に token を払う理由がなく、内部IDを外部サービスへ
 * 渡す理由もありません。`E00` 形式の連番にし、対応表はコード側が持ちます。
 *
 * @param query 来場者が入力した文字列（正規化前の生入力を渡してよい）
 * @param events 絞り込み前の全企画
 * @throws {RangeError} 企画が0件、または SEMANTIC_MAX_EVENTS を超えるとき
 */
export function buildSemanticRequest(query: string, events: Event[]): SemanticRequestPlan {
  if (events.length === 0) {
    throw new RangeError("意味検索へ渡す企画が0件です。");
  }

  if (events.length > SEMANTIC_MAX_EVENTS) {
    throw new RangeError(
      `意味検索へ渡せる企画は ${SEMANTIC_MAX_EVENTS} 件までです（${events.length} 件）。`
    );
  }

  const width = String(events.length - 1).length;
  const refToId = new Map<string, string>();
  const entries: SemanticEventEntry[] = [];
  const criteria: Record<string, string | null> = {};

  events.forEach((event, index) => {
    const ref = toRef(index, width);
    refToId.set(ref, event.id);
    entries.push(toEntry(event, ref));
    // 説明は state 側の同じ ref に載っている。ここへ書くと同じ文字列を2度送ることになる
    criteria[ref] = null;
  });

  return {
    state: { visitor_query: query, events: entries },
    questions: {
      [SEMANTIC_CHOICE_ID]: {
        type: "choice",
        instructions:
          "`visitor_query` は大学の学園祭に来場する人が検索欄へ入力した要望です。`events` の各企画のうち、その要望に最もよく応えるものはどれですか。",
        criteria,
      },
      [SEMANTIC_NOUL_ID]: {
        type: "noul",
        instructions: "`events` の中に、`visitor_query` の要望に実際に応えられる企画がありますか。",
        criteria: {
          true: "少なくとも1つの企画が、その要望を満たすか、要望に直接関係している",
          false: "どの企画も、その要望とは関係がない",
        },
      },
    },
    refToId,
  };
}

interface InterpretOptions {
  matchThreshold?: number;
  minProbability?: number;
  maxResults?: number;
}

/**
 * 答えをランキングへ解釈する
 *
 * `has_match` が閾値未満のときは**1件も返しません。** Choice が何かを選んでいても、
 * それは「最も近い1件」であって「該当」ではないためです。
 *
 * @throws {TypeError} 期待した型の答えが返っていないとき
 */
export function interpretSemanticAnswers(
  answers: Record<string, TypeSafeAnswer | undefined>,
  refToId: ReadonlyMap<string, string>,
  options: InterpretOptions = {}
): SemanticSearchResult {
  const {
    matchThreshold = SEMANTIC_MATCH_THRESHOLD,
    minProbability = SEMANTIC_MIN_PROBABILITY,
    maxResults = SEMANTIC_MAX_RESULTS,
  } = options;

  const noul = answers[SEMANTIC_NOUL_ID];
  const choice = answers[SEMANTIC_CHOICE_ID];

  if (noul?.type !== "noul") {
    throw new TypeError(`${SEMANTIC_NOUL_ID} の答えが noul ではありません。`);
  }

  if (choice?.type !== "choice") {
    throw new TypeError(`${SEMANTIC_CHOICE_ID} の答えが choice ではありません。`);
  }

  const matchProbability = noul.noul;
  const hasMatch = matchProbability >= matchThreshold;

  if (!hasMatch) {
    return { hasMatch: false, matchProbability, ranking: [] };
  }

  const ranking = Object.entries(choice.probabilities)
    .filter(([ref, probability]) => probability >= minProbability && refToId.has(ref))
    .sort((a, b) => b[1] - a[1])
    .slice(0, maxResults)
    .map(([ref, probability]) => ({ id: refToId.get(ref) as string, probability }));

  return { hasMatch: true, matchProbability, ranking };
}

/**
 * 来場者へ何を伝えるか
 *
 * | 値             | 意味                                                       |
 * | -------------- | ---------------------------------------------------------- |
 * | `loading`      | 問い合わせ中                                                |
 * | `no-match`     | 意味検索も「該当なし」と判定した                            |
 * | `filtered-out` | **近い企画はあるが、現在の絞り込みで全部消えた**             |
 * | `replaced`     | 近い企画を表示している                                      |
 */
export type SemanticOutcome = "loading" | "no-match" | "filtered-out" | "replaced";

/**
 * 第4段の結果を、来場者への案内文の種類へ落とす
 *
 * > [!IMPORTANT]
 * > **「表示できる件数が0」と「意味検索も該当なし」を混ぜてはいけません。**
 * > 日程や建物の絞り込みで消えただけなのに「別の言葉でお試しください」と案内すると、
 * > 来場者は**存在する企画を探し続けることになります。** 正しい助言は「絞り込みを外す」です。
 *
 * @param status 問い合わせの状態
 * @param hasMatch モデルが「該当あり」と判定したか
 * @param matchedCount 現在の絞り込みを適用したあとに残った件数
 * @returns 案内の種類。何も出さないときは null
 */
export function resolveSemanticOutcome(
  status: "idle" | "loading" | "done" | "failed",
  hasMatch: boolean,
  matchedCount: number
): SemanticOutcome | null {
  if (status === "loading") return "loading";

  // 失敗は表に出さない。既存のリテラル検索の結果を出したまま静かに戻る
  if (status !== "done") return null;

  if (!hasMatch) return "no-match";

  return matchedCount > 0 ? "replaced" : "filtered-out";
}

/**
 * ランキングを手元の企画へ引き当てる
 *
 * **知らないIDは黙って捨てます。** `/api/search` は毎回 microCMS を読み直すため、
 * クライアントが持っている一覧（最大10分古い）より新しい企画を返すことがあります。
 * 逆に、削除された企画のIDが返ることもあります。どちらも異常ではありません。
 *
 * @param ranking `/api/search` が返したランキング（確率の高い順）
 * @param events 引き当て先の企画。フィルタ適用後の配列を渡すと積集合になる
 * @returns ランキング順に並んだ企画
 */
export function selectSemanticEvents(
  ranking: readonly SemanticRankingEntry[],
  events: Event[]
): Event[] {
  const byId = new Map(events.map((event) => [event.id, event]));

  return ranking
    .map((entry) => byId.get(entry.id))
    .filter((event): event is Event => event !== undefined);
}
