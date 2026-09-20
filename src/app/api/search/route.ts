import { NextResponse, type NextRequest } from "next/server";
import { EVENTS_VISIBLE } from "@/data/site";
import { getEventsList } from "@/lib/events";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";
import {
  buildSemanticRequest,
  interpretSemanticAnswers,
  normalizeSemanticQuery,
} from "@/lib/semantic-search";
import { askSystemOne, isTypeSafeConfigured, TypeSafeRequestError } from "@/lib/typesafe";

/**
 * 意味検索（キーワード検索の第4段）
 *
 * `GET /api/search?q=食べ物` に対して、**全企画のランキング**を返します。
 * 日程・種別・建物の絞り込みは受け取りません。既知のルールはコードの仕事であり、
 * 積集合はクライアントが取ります。そのぶんURLの種類が減り、CDN に載ります。
 *
 * > [!IMPORTANT]
 * > **ここは認証の無い従量課金口です。** 1リクエストがそのまま TypeSafe への課金
 * > （実測 0.097円）になります。Webhook と違い署名で守れないため、保護は4層に分けています。
 * >
 * > | 層 | 実装                                            | どこで効くか            |
 * > | -- | ----------------------------------------------- | ----------------------- |
 * > | 0  | 段1〜3で当たったら呼ばない（クライアント側）    | 大半のクエリが無料      |
 * > | 1  | Vercel WAF のレート制限（**ダッシュボードで手作業**） | 関数の起動前・エッジ    |
 * > | 2  | このファイルのトークンバケット                  | インスタンス単位の保険  |
 * > | 3  | クエリ長の上下限・CDN キャッシュ                | 素朴な多重発火          |
 * >
 * > **層1はコードではないので、このPRがマージされただけでは有効になりません。**
 * > 設置手順は docs/frontend/events-semantic-search.md を参照。
 *
 * 検証の順序に意味があります。**課金が発生する処理へ到達する前に、安い検査を全部終える**
 * ことで、公開フラグが落ちている間や鍵が未設定の間に1円も使わないようにしています。
 */

/**
 * 常に動的に扱う
 *
 * クエリ文字列で結果が変わるため、Next.js のフルルートキャッシュには載せません。
 * CDN 側のキャッシュは下の `Cache-Control` が受け持ちます（別の層です）。
 */
export const dynamic = "force-dynamic";

/** 母集団の取得件数。`/events` のページと同じ値にする */
const EVENTS_LIMIT = 200;

/**
 * CDN のキャッシュ
 *
 * `600` は本文の保険 ISR（各ページの `export const revalidate = 600`）と同じ値です。
 * 同じ要望で再訪した来場者には課金が発生しません。
 */
const CACHE_CONTROL = "public, s-maxage=600, stale-while-revalidate=3600";

/** 失敗時は絶対にキャッシュさせない。エラーを10分配り続けることになる */
const NO_STORE = "no-store";

/**
 * TypeSafe へ渡す生クエリの最大長
 *
 * 検証は正規化後の長さ（60字）で行いますが、モデルへは**正規化前の生入力**を渡します。
 * `normalizeText()` はカタカナをひらがなへ寄せるため、`ダンス` が `だんす` になり、
 * 意味の手がかりが減るからです。記号だけで長さを稼がれても困るので、ここでも切ります。
 */
const RAW_QUERY_MAX_LENGTH = 120;

/**
 * インスタンスあたりの上限
 *
 * 1クエリ = 1リクエストになる設計（クライアントは段1〜3が0件のときだけ呼ぶ）なので、
 * 絞り込みを変えながら探す来場者でも1分に12回には届きません。
 */
const limiter = createRateLimiter({ limit: 12, windowMs: 60_000 });

/** 失敗レスポンス。**キャッシュさせない** */
function failure(error: string, status: number) {
  return NextResponse.json(
    { success: false, error },
    { status, headers: { "Cache-Control": NO_STORE } }
  );
}

export async function GET(request: NextRequest) {
  try {
    // 1. 企画が非公開なら母集団が空。問い合わせる意味がない
    if (!EVENTS_VISIBLE) {
      return failure("Semantic search is disabled.", 503);
    }

    // 2. 鍵が無ければ fail closed。クライアントは段3の結果を出したまま静かに戻る
    if (!isTypeSafeConfigured()) {
      console.error("[search] TYPESAFE_API_KEY が未設定です。意味検索は無効です。");

      return failure("Semantic search is not configured.", 503);
    }

    // 3. クエリの検証。短すぎる・長すぎるものはここで落とす
    const raw = request.nextUrl.searchParams.get("q") ?? "";
    const normalized = normalizeSemanticQuery(raw);

    if (normalized === null) {
      return failure("Query must be between 2 and 60 normalized characters.", 400);
    }

    // 4. レート制限
    const ip = getClientIp(request.headers);

    if (!limiter.take(ip)) {
      console.error(`[search] レート制限に到達しました ip=${ip}`);

      return failure("Too many requests.", 429);
    }

    // 5. 母集団。#252 が入るまで fetch キャッシュを持たせない（Route Handler は revalidatePath が届かない）
    const events = await getEventsList(EVENTS_LIMIT);

    if (events.length === 0) {
      return NextResponse.json(
        { success: true, hasMatch: false, matchProbability: 0, ranking: [] },
        { headers: { "Cache-Control": NO_STORE } }
      );
    }

    // 6. 組み立て。Choice の選択肢上限を超える場合はここで RangeError になる
    let plan;

    try {
      plan = buildSemanticRequest(raw.slice(0, RAW_QUERY_MAX_LENGTH), events);
    } catch (error) {
      console.error(
        `[search] リクエストを組み立てられません events=${events.length}:`,
        error instanceof Error ? error.message : error
      );

      return failure("Too many events for semantic search.", 503);
    }

    // 7. 問い合わせ
    const startedAt = Date.now();
    const response = await askSystemOne({ state: plan.state, questions: plan.questions });
    const result = interpretSemanticAnswers(response.answers, plan.refToId);

    /*
     * 成功時も1行残す。Vercel の Functions ログで発火と費用を確認する唯一の手段になる。
     * **来場者が入力した文字列そのものは出さない。** 長さと結果だけで十分に追える。
     */
    console.log(
      `[search] len=${normalized.length} events=${events.length}` +
        ` has_match=${result.matchProbability.toFixed(2)} results=${result.ranking.length}` +
        ` tokens=${response.usage.input_tokens} ms=${Date.now() - startedAt}`
    );

    return NextResponse.json(
      { success: true, ...result },
      { headers: { "Cache-Control": CACHE_CONTROL } }
    );
  } catch (error) {
    if (error instanceof TypeSafeRequestError) {
      console.error(`[search] TypeSafe への問い合わせに失敗しました: ${error.message}`);

      return failure("Semantic search is temporarily unavailable.", 502);
    }

    console.error("[search] 意味検索でエラーが発生しました:", error);

    return failure("Semantic search failed.", 500);
  }
}
