import { timingSafeEqual } from "node:crypto";
import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import {
  DRAFT_PREVIEW_COOKIE,
  isValidContentId,
  isValidDraftKey,
  resolveDraftPreviewPath,
  serializeDraftPreviewContext,
} from "@/lib/draft-preview";
import { getEventById } from "@/lib/events";
import { getNewsById } from "@/lib/news";
import { isMicrocmsApi, type MicrocmsApi } from "@/lib/revalidate-targets";

/**
 * microCMS「画面プレビュー」受け口（下書きの実機確認）
 *
 * microCMS の編集画面にある「画面プレビュー」ボタンから GET で叩かれる。
 * Draft Mode を有効にし、draftKey を cookie へ保存したうえで、そのコンテンツの
 * 詳細ページへリダイレクトする。以後、同じブラウザからのアクセスだけが下書きを見る。
 *
 * microCMS 側に登録するURL（API設定 > 画面プレビュー）:
 *
 * ```
 * https://setagayafes.org/api/draft?secret=<MICROCMS_DRAFT_SECRET>&api=events&id={CONTENT_ID}&draftKey={DRAFT_KEY}
 * ```
 *
 * **末尾スラッシュを付けないこと。** `/api/draft/` は `src/proxy.ts` の `"/:path+/"` に
 * 一致して 308 を1回挟む。`/api/draft` は proxy の matcher 外なので素通りする。
 *
 * 環境変数:
 * - MICROCMS_DRAFT_SECRET: 上記URLの `secret` と照合する値。`openssl rand -hex 32` で生成する。
 *   **未設定のときは 500 を返してすべてのリクエストを拒否する（fail closed）。**
 *   このエンドポイントは公開フラグを跨いで未公開コンテンツを見せる力を持つため、
 *   検証できない状態で素通しさせない。
 *   Vercel への登録は、microCMS 側のプレビューURLを設定する**前に**済ませること。
 *
 * 遷移先の対応表は `src/lib/draft-preview.ts`、設定手順と運用は
 * docs/dev/draft-preview.md を参照。
 */

/**
 * シークレットを検証する。
 *
 * 比較はタイミング攻撃を避けるため `timingSafeEqual` を使う。長さが違うと例外を投げる仕様なので
 * 先に弾く。`Buffer.from(x, "hex")` を使わないのは、不正な文字を黙って切り捨てる
 * （例外を投げない）ためで、UTF-8 のまま比較すれば解釈の余地が入らない。
 * `src/app/api/revalidate/route.ts` の署名検証と同じ扱いである。
 */
function verifySecret(given: string | null, expected: string): boolean {
  if (!given) {
    return false;
  }

  const received = Buffer.from(given, "utf8");
  const computed = Buffer.from(expected, "utf8");

  if (received.length !== computed.length) {
    return false;
  }

  return timingSafeEqual(received, computed);
}

/**
 * 下書きを実際に取得して、遷移先のパスを決める。
 *
 * ここで取得するのには2つの意味がある。
 *
 * 1. **存在確認**: 利用者の入力由来のIDをそのまま `redirect()` へ渡さない
 *    （オープンリダイレクトを作らない）。実在する下書きだけがパスになる。
 * 2. **type の解決**: 著名人企画の正規URLは `/special/[id]` だが、microCMS の
 *    プレビューURLからは type が分からない。正規化済みの値を見て初めて決まる。
 *
 * @returns 遷移先のパス。下書きが見つからない場合と、詳細ページを持たない API の場合は null
 */
async function resolveTargetPath(
  api: MicrocmsApi,
  id: string,
  draftKey: string
): Promise<string | null> {
  switch (api) {
    case "events": {
      const event = await getEventById(id, draftKey);
      if (!event) return null;
      return resolveDraftPreviewPath(api, id, event.type);
    }
    case "news": {
      const news = await getNewsById(id, draftKey);
      if (!news) return null;
      return resolveDraftPreviewPath(api, id);
    }
    case "informations":
      // 単一コンテンツの詳細ページを持たない（協賛一覧とFAQの構成要素にしかならない）。
      // この API には画面プレビューを設定しない運用だが、設定されても安全に断る
      return null;
  }
}

/**
 * GET: 画面プレビューから下書き表示を開始する
 *
 * 順序に意味がある。シークレットの検証をクエリの解釈や microCMS への問い合わせより先に置き、
 * 認証されていないリクエストに対して外部APIを一切叩かない。
 */
export async function GET(request: NextRequest) {
  let targetPath: string;

  try {
    const secret = process.env.MICROCMS_DRAFT_SECRET;

    if (!secret) {
      console.error(
        "[draft] MICROCMS_DRAFT_SECRET が未設定です。リクエストを検証できないため、下書きプレビューを受け付けません。"
      );

      return NextResponse.json(
        { success: false, error: "Draft preview is not configured." },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);

    if (!verifySecret(searchParams.get("secret"), secret)) {
      console.error("[draft] シークレットが一致しません。");

      return NextResponse.json({ success: false, error: "Invalid secret." }, { status: 401 });
    }

    const api = searchParams.get("api");
    if (!api || !isMicrocmsApi(api)) {
      console.error(`[draft] 未知の api です: ${api ?? "(なし)"}`);

      return NextResponse.json(
        { success: false, error: `Unknown api: ${api ?? ""}` },
        { status: 400 }
      );
    }

    const id = searchParams.get("id");
    if (!id || !isValidContentId(id)) {
      console.error("[draft] contentId が不正です。");

      return NextResponse.json({ success: false, error: "Invalid id." }, { status: 400 });
    }

    // draftKey をログへ出さない。これ1つで未公開コンテンツが読めてしまう
    const draftKey = searchParams.get("draftKey");
    if (!draftKey || !isValidDraftKey(draftKey)) {
      console.error(`[draft] draftKey が不正です。api=${api} id=${id}`);

      return NextResponse.json({ success: false, error: "Invalid draftKey." }, { status: 400 });
    }

    const resolved = await resolveTargetPath(api, id, draftKey);

    if (!resolved) {
      /*
       * microCMS の draftKey は**コンテンツを保存するたびに変わる**。
       * プレビューを開いたまま編集を続けて再度このURLを踏むと、ここへ来る。
       * 異常ではなく通常の寿命であり、利用者は編集画面から押し直せばよい。
       */
      console.error(
        `[draft] 下書きを取得できませんでした（draftKey の失効、または詳細ページを持たない api）。api=${api} id=${id}`
      );

      return NextResponse.json({ success: false, error: "Draft not found." }, { status: 404 });
    }

    const draft = await draftMode();
    draft.enable();

    /*
     * Draft Mode の `__prerender_bypass` cookie は有効・無効しか表現できないため、
     * draftKey は別の cookie で運ぶ（設計の理由は src/lib/draft-preview.ts）。
     * 寿命は `__prerender_bypass` と揃えてセッション cookie にする。
     * 明示的な解除は /api/draft/disable が行う。
     */
    (await cookies()).set(
      DRAFT_PREVIEW_COOKIE,
      serializeDraftPreviewContext({ api, id, draftKey }),
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
      }
    );

    console.log(`[draft] api=${api} id=${id} path=${resolved}`);

    targetPath = resolved;
  } catch (error) {
    console.error("[draft] 下書きプレビューの開始に失敗しました:", error);

    return NextResponse.json(
      { success: false, error: "Failed to start draft preview." },
      { status: 500 }
    );
  }

  /*
   * redirect() は NEXT_REDIRECT を throw して制御を移す仕組みである。
   * 上の try の中で呼ぶと直上の catch がそれを掴み、リダイレクトが 500 に化ける。
   * try を抜けてから呼ぶこと。
   */
  redirect(targetPath);
}
