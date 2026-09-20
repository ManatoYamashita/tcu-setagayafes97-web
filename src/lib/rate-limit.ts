/**
 * インメモリのトークンバケット
 *
 * > [!WARNING]
 * > **これは第一の防壁ではありません。** サーバーレスではインスタンスごとに別の Map を
 * > 持つため、実効の上限は「設定値 × 同時に生きているインスタンス数」になります。
 * > 素朴な多重発火とプレビュー環境を守るための保険であり、悪意ある連打に対する
 * > 一次防壁は Vercel WAF のレート制限（エッジ・関数起動前）です。
 * > 設置手順は docs/frontend/events-semantic-search.md を参照。
 *
 * `src/app/api/contact/route.ts` にも同種の実装がありますが、あちらは**期限切れの
 * エントリを一度も消しません**（`delete` がどこにも無い）。IP が増え続けるとメモリが
 * 単調に増えるため、ここでは踏襲せず掃除を入れています。
 */

interface Bucket {
  /** 残りトークン */
  tokens: number;
  /** 最後に補充した時刻 */
  updatedAt: number;
}

export interface RateLimiterOptions {
  /** ウィンドウあたりに許す回数 */
  limit: number;
  /** トークンが満タンまで回復するのにかかる時間（ミリ秒） */
  windowMs: number;
  /** 現在時刻。テストから差し替える */
  now?: () => number;
}

export interface RateLimiter {
  /** 1回ぶん消費する。許されたら true */
  take(key: string): boolean;
  /** 保持しているキーの数。掃除が効いているかの確認用 */
  size(): number;
}

/**
 * 掃除を走らせる間隔（`take` の呼び出し回数）
 *
 * 毎回全件を走査するとキー数に比例して遅くなります。逆に間隔を空けすぎると、
 * その間だけメモリが伸びます。実用上どちらも問題にならない粒度として 256 回に1度。
 */
const SWEEP_INTERVAL = 256;

/**
 * トークンバケットを作る
 *
 * 固定ウィンドウと違い、境界をまたいだ瞬間に上限の2倍を通してしまうことがありません。
 * トークンは時間に比例して連続的に戻ります。
 */
export function createRateLimiter({
  limit,
  windowMs,
  now = Date.now,
}: RateLimiterOptions): RateLimiter {
  const buckets = new Map<string, Bucket>();
  let sinceLastSweep = 0;

  /** 満タンまで戻りきってから、さらに1ウィンドウ触られていないキーを捨てる */
  function sweep(at: number) {
    for (const [key, bucket] of buckets) {
      if (at - bucket.updatedAt > windowMs * 2) buckets.delete(key);
    }
  }

  return {
    take(key) {
      const at = now();

      if (++sinceLastSweep >= SWEEP_INTERVAL) {
        sinceLastSweep = 0;
        sweep(at);
      }

      const bucket = buckets.get(key);

      if (!bucket) {
        buckets.set(key, { tokens: limit - 1, updatedAt: at });
        return true;
      }

      const refilled = Math.min(
        limit,
        bucket.tokens + ((at - bucket.updatedAt) * limit) / windowMs
      );

      /*
       * 拒否するときも `updatedAt` を必ず進める。
       *
       * 端数の補充（0.4 トークン等）を `tokens` へ書きながら `updatedAt` を止めると、
       * 次の計算が同じ経過時間をもう一度数えます。0.4 秒ごとに拒否され続けた場合、
       * 0.8 秒の時点で 1.2 トークン回復したことになり、上限より早く通ります。
       */
      bucket.updatedAt = at;

      if (refilled < 1) {
        bucket.tokens = refilled;
        return false;
      }

      bucket.tokens = refilled - 1;
      return true;
    },

    size() {
      return buckets.size;
    },
  };
}

/**
 * リクエスト元のIPを取り出す
 *
 * **`x-forwarded-for` は詐称できます。** 上限を厳密に守る手段ではありません
 * （その役割は WAF にあります）。フォールバックの `"unknown"` は全員で1つの
 * バケットを共有するため、ヘッダを落とす経路が増えると巻き添えが出ます。
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() || headers.get("x-real-ip") || "unknown"
  );
}
