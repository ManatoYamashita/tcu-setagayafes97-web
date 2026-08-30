import { createHmac, timingSafeEqual } from "node:crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isMicrocmsApi, REVALIDATE_TARGETS } from "@/lib/revalidate-targets";

/**
 * microCMS Webhook 受け口（オンデマンド再検証）
 *
 * microCMS の「カスタム通知」Webhook から POST を受け取り、該当ページのキャッシュを破棄する。
 * 対応表は `src/lib/revalidate-targets.ts` にある。
 *
 * 各ページの `export const revalidate` は削除していない。microCMS の Webhook は
 * **失敗しても再送されない**ため、通知の取りこぼしを時間ベース ISR が拾う二段構えにしている。
 *
 * 環境変数:
 * - MICROCMS_WEBHOOK_SECRET: microCMS の Webhook 設定で入力したシークレット。
 *   `x-microcms-signature`（HMAC-SHA256 の16進文字列）の検証に使う。
 *   **未設定のときは 500 を返してすべてのリクエストを拒否する（fail closed）。**
 *   キャッシュ破棄という副作用を持つ以上、検証できない状態で素通しさせない。
 *   Vercel への登録は、microCMS 側の Webhook を作成する**前に**済ませること。
 *   順序を逆にすると、最初の数回の入稿が 500 で静かに失われる。
 *
 * 運用手順・障害切り分けは docs/dev/content-revalidation.md を参照。
 */

/** microCMS が署名を載せてくるヘッダー名 */
const SIGNATURE_HEADER = "x-microcms-signature";

/**
 * Webhook ペイロード。
 *
 * 意図的に緩くしてある。「並び替え」「コンテンツIDの変更」「APIの設定変更」など
 * `id` を持たない通知タイミングが存在するため、`id` を必須にするとそれらが 400 で弾かれ、
 * 一覧の並び順が更新されなくなる。このエンドポイントが実際に使うのは `api` だけである。
 */
const webhookPayloadSchema = z.object({
  api: z.string().min(1),
  id: z.string().optional(),
  type: z.string().optional(),
  service: z.string().optional(),
  contents: z.unknown().optional(),
});

/**
 * 署名を検証する。
 *
 * microCMS は「シークレットで生のリクエストボディを HMAC-SHA256 した16進文字列」を
 * `x-microcms-signature` に載せてくる。
 *
 * 比較はタイミング攻撃を避けるため `timingSafeEqual` を使う。長さが違うと例外を投げる仕様なので
 * 先に弾く。16進文字列のまま比較しているのは、`Buffer.from(x, "hex")` が不正な文字を
 * 黙って切り捨てる（例外を投げない）ためで、文字列同士なら解釈の余地が入らない。
 */
function verifySignature(rawBody: Buffer, signature: string | null, secret: string): boolean {
  if (!signature) {
    return false;
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const received = Buffer.from(signature, "utf8");
  const computed = Buffer.from(expected, "utf8");

  if (received.length !== computed.length) {
    return false;
  }

  return timingSafeEqual(received, computed);
}

/**
 * POST: microCMS からの通知を受けて再検証する
 *
 * 順序に意味がある。署名の検証を JSON のパースより先に置くことで、
 * 認証されていないリクエストに対してパース処理を一切走らせない。
 */
export async function POST(request: NextRequest) {
  try {
    const secret = process.env.MICROCMS_WEBHOOK_SECRET;

    if (!secret) {
      console.error(
        "[revalidate] MICROCMS_WEBHOOK_SECRET が未設定です。署名を検証できないため、リクエストを受け付けません。"
      );

      return NextResponse.json(
        { success: false, error: "Webhook is not configured." },
        { status: 500 }
      );
    }

    /*
     * 署名は「送られてきたバイト列そのもの」に対して計算されている。
     * request.json() で読むと再シリアライズで空白やキー順が変わり、署名は必ず一致しなくなる。
     * request.text() でも UTF-8 のデコードと再エンコードを経るため、バイト列を直接扱う。
     *
     * ボディサイズのガードは置いていない。ここへ到達した時点で本文は既にバッファ済みであり、
     * 事後のチェックは保護になっていない。実際の上限は Vercel の 4.5MB が担保する。
     */
    const rawBody = Buffer.from(await request.arrayBuffer());

    if (!verifySignature(rawBody, request.headers.get(SIGNATURE_HEADER), secret)) {
      console.error("[revalidate] 署名の検証に失敗しました。リクエストを破棄します。");

      return NextResponse.json({ success: false, error: "Invalid signature." }, { status: 401 });
    }

    let json: unknown;

    try {
      json = JSON.parse(rawBody.toString("utf8"));
    } catch {
      console.error("[revalidate] ボディが JSON として解釈できません。");

      return NextResponse.json({ success: false, error: "Invalid JSON body." }, { status: 400 });
    }

    const parsed = webhookPayloadSchema.safeParse(json);

    if (!parsed.success) {
      console.error("[revalidate] 想定外のペイロードです:", parsed.error.flatten().fieldErrors);

      return NextResponse.json(
        { success: false, error: "Unexpected webhook payload." },
        { status: 400 }
      );
    }

    const { api, id, type } = parsed.data;

    /*
     * 未知の API は 400 で返す。microCMS の Webhook 実行履歴にエラーとして残るため、
     * API を増やしたのに src/lib/revalidate-targets.ts の対応表を更新し忘れたことに気づける。
     */
    if (!isMicrocmsApi(api)) {
      console.error(`[revalidate] 未知の api です: ${api}`);

      return NextResponse.json({ success: false, error: `Unknown api: ${api}` }, { status: 400 });
    }

    const targets = REVALIDATE_TARGETS[api];

    for (const target of targets) {
      revalidatePath(target.path, target.type);
    }

    const revalidated = targets.map((target) => target.path);

    // Vercel の Functions ログで発火を確認する唯一の手段になるため、成功時も必ず1行残す。
    console.log(
      `[revalidate] api=${api} id=${id ?? "-"} type=${type ?? "-"} paths=${revalidated.join(",")}`
    );

    return NextResponse.json({ success: true, api, revalidated, now: Date.now() });
  } catch (error) {
    console.error("[revalidate] 再検証中にエラーが発生しました:", error);

    return NextResponse.json({ success: false, error: "Revalidation failed." }, { status: 500 });
  }
}
