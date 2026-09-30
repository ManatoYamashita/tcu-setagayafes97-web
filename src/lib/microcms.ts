import { createClient } from "microcms-js-sdk";

const serviceDomain = process.env.MICROCMS_SERVICE_DOMAIN ?? "";
const apiKey = process.env.MICROCMS_API_KEY ?? "";

/**
 * microCMS の認証情報が設定されているか
 * CI等で未設定の場合、API呼び出しは空データを返す（問い合わせ自体をしない）
 */
export const isMicrocmsConfigured = !!(serviceDomain && apiKey);

if (!isMicrocmsConfigured) {
  console.warn(
    "[microcms] MICROCMS_SERVICE_DOMAIN / MICROCMS_API_KEY が未設定です。API呼び出しは空データを返します。"
  );
}

/**
 * microCMS クライアント
 *
 * 取得には直接使わず `microcmsGet()` を通すこと（一時的な失敗の再試行がそちらにある）。
 *
 * SDK 内蔵の `retry: true` は使わない。**Next.js の描画中は効かない**からである。
 * Next.js は描画1回の中で同じ URL への GET を `React.cache` で重複排除しており
 * （`next/dist/server/lib/dedupe-fetch.js`）、SDK が同じ URL で再試行すると
 * 最初の 429 の応答がそのまま返ってくる。2026-09-30 に、詳細取得の初回だけ 429 を
 * 返す注入でビルドしたところ、SDK の再試行は2回とも 429 を受けてビルドが落ちた
 * （素の Node では同じ注入で2回目に成功する）。
 */
export const client = createClient({
  serviceDomain: serviceDomain || "dummy",
  apiKey: apiKey || "dummy",
});

type MicrocmsGetRequest = Parameters<typeof client.get>[0];

/**
 * 再試行までの待ち時間（ミリ秒）。要素数が再試行の回数になる
 *
 * 合計7秒に抑えているのは、実行時（ISR の再生成・Route Handler）が Vercel Free Plan の
 * 関数実行時間10秒の中で動くためである。
 */
const RETRY_DELAYS_MS = [2_000, 5_000] as const;

/**
 * 再試行すれば回復しうる失敗か（429 / 5xx / ネットワークエラー）
 *
 * メッセージの形式は SDK 3.2.0 のもの（`isMicrocmsNotFound` と同じ理由でメッセージを読む）。
 */
export function isMicrocmsRetryable(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  if (error.message.startsWith("Network Error.")) return true;
  const status = readStatus(error);
  return status === 429 || (status !== null && status >= 500);
}

/**
 * 一時的な失敗を再試行する
 *
 * 取得関数から切り離してあるのは、待ち時間を差し替えてユニットテストするためである。
 *
 * @param fetchOnce 1回分の取得。`attempt` は 0 始まりで、0 が初回
 * @param sleep 待機関数（テストでは即時に解決するものを渡す）
 */
export async function withMicrocmsRetry<T>(
  fetchOnce: (attempt: number) => Promise<T>,
  sleep: (ms: number) => Promise<void> = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
): Promise<T> {
  for (let attempt = 0; ; attempt += 1) {
    try {
      return await fetchOnce(attempt);
    } catch (error) {
      const delay = RETRY_DELAYS_MS[attempt];
      if (delay === undefined || !isMicrocmsRetryable(error)) throw error;
      console.warn(
        `[microcms] 一時的な失敗のため ${delay}ms 後に再試行します（${attempt + 1}/${RETRY_DELAYS_MS.length}）:`,
        error instanceof Error ? error.message.split("\n")[0] : error
      );
      await sleep(delay);
    }
  }
}

/**
 * microCMS から1件または一覧を取得する（一時的な失敗は再試行する）
 *
 * 再試行の2回目以降は、使い捨ての `AbortSignal` を付けて Next.js の重複排除を迂回する。
 * `dedupe-fetch.js` は `signal` を持つリクエストを重複排除の対象から外す。
 * 初回には付けない。`generateMetadata` とページ本体が同じ詳細を読むため、
 * 初回まで迂回すると microCMS へのリクエストが倍になり、かえって 429 を招く。
 *
 * 再試行しても回復しなければ例外のまま投げる。**呼び出し側で `null` や `[]` に
 * 潰してよいのは `isMicrocmsNotFound()` が true のときだけ**（#287）。
 */
export function microcmsGet<T>(request: MicrocmsGetRequest): Promise<T> {
  return withMicrocmsRetry((attempt) =>
    client.get<T>(
      attempt === 0
        ? request
        : {
            ...request,
            customRequestInit: {
              ...request.customRequestInit,
              signal: new AbortController().signal,
            },
          }
    )
  );
}

/**
 * 「そのコンテンツは存在しない」を意味する HTTP ステータス
 *
 * 2026-09-30 に実測した値（詳細取得 `GET /api/v1/<endpoint>/<id>`）:
 *
 * | 入力                                  | ステータス |
 * | ------------------------------------- | ---------- |
 * | 実在しない ID（英数・日本語とも）     | 404        |
 * | 無効な draftKey                       | 404        |
 * | `..%2F..` のような ID として不正な値  | 400        |
 * | 不正な API キー                       | 401        |
 *
 * 400 も含めるのは、URL から来た不正な ID を 500 にしないためである。
 * 401 は設定の誤りであって「存在しない」ではないので含めない。
 */
const NOT_FOUND_STATUSES = new Set([400, 404]);

/**
 * microCMS の例外が「コンテンツが存在しない」ことを表すか
 *
 * SDK はステータスをプロパティで渡さず、`fetch API response status: 404` という
 * メッセージでしか表現しない（SDK 3.2.0）。そのためメッセージの先頭を読む。
 *
 * これが false の例外（429 / 5xx / ネットワーク / 401 など）は「一時的に取れなかった」
 * または「設定が壊れている」であり、**呼び出し側で `null` や `[]` にしてはいけない。**
 * 握りつぶすと、実在する企画が 404 として静的生成されたままビルドが成功する（#287）。
 */
export function isMicrocmsNotFound(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const status = readStatus(error);
  return status !== null && NOT_FOUND_STATUSES.has(status);
}

/** SDK の例外メッセージ `fetch API response status: <code>` から HTTP ステータスを読む */
function readStatus(error: Error): number | null {
  const match = /^fetch API response status: (\d{3})(?!\d)/.exec(error.message);
  return match ? Number(match[1]) : null;
}

/**
 * microCMS のベース URL
 */
export const MICROCMS_BASE_URL = serviceDomain ? `https://${serviceDomain}.microcms.io` : "";
