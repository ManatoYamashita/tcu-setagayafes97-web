import { cookies, draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";
import { DRAFT_PREVIEW_COOKIE } from "@/lib/draft-preview";

/**
 * 下書きプレビューの解除
 *
 * `/api/draft` で有効にした Draft Mode を切り、draftKey の cookie を消す。
 * プレビュー中に表示される `DraftPreviewBanner` の「解除」リンクが叩く。
 *
 * **シークレットを要求しない。** ここでできるのは自分のブラウザのプレビューを
 * 終わらせることだけで、何かを見せる力は無い。むしろ「プレビュー状態のまま
 * 放置される」ほうが実害がある（そのブラウザでは全ページが動的レンダリングになり、
 * 古い draftKey を持ち回ることになる）ため、いつでも解除できることを優先する。
 *
 * 解除後はトップページへ送る。プレビューしていたページへ戻すと、下書きが公開前の場合に
 * 404 を見せることになるため。
 */
export async function GET(_request: NextRequest) {
  try {
    const draft = await draftMode();
    draft.disable();

    (await cookies()).delete(DRAFT_PREVIEW_COOKIE);

    console.log("[draft] プレビューを解除しました。");
  } catch (error) {
    console.error("[draft] プレビューの解除に失敗しました:", error);

    return NextResponse.json(
      { success: false, error: "Failed to disable draft preview." },
      { status: 500 }
    );
  }

  // redirect() は NEXT_REDIRECT を throw するため、必ず try の外で呼ぶ（/api/draft と同じ理由）
  redirect("/");
}
