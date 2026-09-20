/**
 * TypeSafe System One API（Jev）の薄いラッパ
 *
 * 公式 SDK（`@typesafe-ai/sdk`）は導入しません。エンドポイントは
 * `POST https://api.typesafe.ai/v1/systemone` の1本だけで、`fetch()` で足ります。
 * バンドル増分もサプライチェーンの面積も 0 に保つための判断です。
 *
 * **このモジュールはサーバー専用です。** `TYPESAFE_API_KEY` を読むため、
 * Client Component から import してはいけません。
 *
 * API 仕様: https://docs.typesafe.ai/api.md
 */

/** 評価エンドポイント */
const SYSTEM_ONE_ENDPOINT = "https://api.typesafe.ai/v1/systemone";

/**
 * 使用するモデル
 *
 * **エイリアス（`jev-latest`）ではなくバージョンを固定します。** エイリアスは新しい
 * リリースが出ると指す先が動き、こちらの変更なしに答えが変わります。足切りの閾値は
 * このバージョンの実測値に対して決めてあるため、動かすときは測り直します。
 */
export const TYPESAFE_MODEL = "jev-1.13.0";

/**
 * 1リクエストの打ち切り時間
 *
 * レイテンシの実測は測った日で揺れます。Issue #253 は 348〜1,614ms（中央値 約720ms）、
 * 2026-09-20 に 98件・12クエリで測り直したときは 261〜933ms（中央値 303ms）でした。
 *
 * **Issue #253 が当初挙げていた 1,500ms は、その Issue 自身の実測最遅値 1,614ms を
 * 切り落とします。** 揺れ幅が倍近くある以上、最遅値へ張り付いた値は置けません。
 * 来場者を待たせすぎない範囲で、観測された最遅値の約2倍を取って 3,000ms とします。
 */
export const TYPESAFE_TIMEOUT_MS = 3000;

/** Noul（はい/いいえの確率）を尋ねる質問 */
export interface NoulQuestion {
  type: "noul";
  instructions: string | Record<string, unknown>;
  criteria?: {
    true: string;
    false: string;
  };
}

/** Choice（定義した選択肢から1つ）を尋ねる質問 */
export interface ChoiceQuestion {
  type: "choice";
  instructions: string | Record<string, unknown>;
  /** 選択肢 → 説明。説明が不要なら null。**選択肢は最大255個** */
  criteria: Record<string, string | null>;
}

export type TypeSafeQuestion = NoulQuestion | ChoiceQuestion;

/** Noul の答え */
export interface NoulAnswer {
  type: "noul";
  /** はい（1）〜いいえ（0）の確率 */
  noul: number;
}

/** Choice の答え */
export interface ChoiceAnswer {
  type: "choice";
  /** 最も確率の高い選択肢 */
  choice: string;
  /** 全選択肢の確率（合計1） */
  probabilities: Record<string, number>;
  /** 確率分布の尖り具合。**「当たっているか」ではない** */
  confidence: number;
}

export type TypeSafeAnswer = NoulAnswer | ChoiceAnswer;

/** 評価エンドポイントのレスポンス */
export interface SystemOneResponse {
  /** 実際に評価したモデルのバージョン付きID */
  model: string;
  answers: Record<string, TypeSafeAnswer | undefined>;
  usage: {
    input_tokens: number;
    output_tokens: number;
  };
}

/** TypeSafe への問い合わせが失敗したことを表す */
export class TypeSafeRequestError extends Error {
  /** HTTP ステータス。ネットワーク障害やタイムアウトでは undefined */
  readonly status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "TypeSafeRequestError";
    this.status = status;
  }
}

/**
 * API キーが設定されているか
 *
 * **呼び出しのたびに読みます。** モジュール読み込み時に固定すると、テストで
 * `vi.stubEnv()` が効かず、ビルド時の値が実行時まで焼き付きます。
 */
export function isTypeSafeConfigured(): boolean {
  return !!process.env.TYPESAFE_API_KEY;
}

interface AskSystemOneParams {
  /** 評価対象。文字列でもオブジェクトでもよい */
  state: unknown;
  /** 質問。同じ state に対する複数の質問は1リクエストにまとめる（state は1度しか送られない） */
  questions: Record<string, TypeSafeQuestion>;
  /** 打ち切り時間。既定は TYPESAFE_TIMEOUT_MS */
  timeoutMs?: number;
}

/**
 * System One へ問い合わせる
 *
 * **429 / 529 を再試行しません。** 公式 SDK は指数バックオフで再試行しますが、この経路は
 * 来場者が検索結果を待っている同期パスです。待たせるくらいなら失敗させて、
 * 呼び出し側（`/api/search`）が既存のリテラル検索の結果へ静かに戻ります。
 *
 * @throws {TypeSafeRequestError} キー未設定・HTTP エラー・タイムアウト・JSON 不正のとき
 */
export async function askSystemOne({
  state,
  questions,
  timeoutMs = TYPESAFE_TIMEOUT_MS,
}: AskSystemOneParams): Promise<SystemOneResponse> {
  const apiKey = process.env.TYPESAFE_API_KEY;

  if (!apiKey) {
    throw new TypeSafeRequestError("TYPESAFE_API_KEY is not configured.");
  }

  let response: Response;

  try {
    response = await fetch(SYSTEM_ONE_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ state, model: TYPESAFE_MODEL, questions }),
      signal: AbortSignal.timeout(timeoutMs),
      // 検索語ごとに内容が変わる。Next.js のデータキャッシュへ載せる意味がない
      cache: "no-store",
    });
  } catch (error) {
    const reason = error instanceof Error ? error.message : String(error);
    throw new TypeSafeRequestError(`TypeSafe request failed: ${reason}`);
  }

  if (!response.ok) {
    throw new TypeSafeRequestError(`TypeSafe responded with ${response.status}.`, response.status);
  }

  try {
    return (await response.json()) as SystemOneResponse;
  } catch {
    throw new TypeSafeRequestError("TypeSafe response was not valid JSON.", response.status);
  }
}
