/**
 * Draft Mode の状態を読むサーバー専用ヘルパ。
 *
 * ## 静的生成を壊さないための呼び出し順序（重要）
 *
 * Next.js 16.1 の実装（`next/dist/server/request/draft-mode.js`）では、
 * `draftMode()` が返すオブジェクトのうち **`enable()` と `disable()` だけが
 * `trackDynamicDraftMode()` を呼び、そのルートの静的生成を無効化する**。
 * `isEnabled` の読み取りは追跡対象ではない。
 *
 * 一方 `cookies()` は読んだ時点でルートを動的化する。そのため
 * **`isEnabled` が false のときは `cookies()` に到達させない**ことが必須になる。
 * ビルド時（静的生成時）は常に false なので、下の早期 return によって
 * 詳細ページのプリレンダリングはこれまでどおり成立する。
 *
 * この順序を崩すと `pnpm build` の `scripts/assert-events-static-html.mjs` まで
 * 到達せずにビルドが落ちるか、詳細ページが静的HTMLを失う。
 */

import { cookies, draftMode } from "next/headers";

import {
  DRAFT_PREVIEW_COOKIE,
  parseDraftPreviewContext,
  type DraftPreviewContext,
} from "./draft-preview";
import { type MicrocmsApi } from "./revalidate-targets";

/**
 * 現在のリクエストが、指定したコンテンツの下書きプレビューかどうかを返す。
 *
 * cookie に入っている api と id が引数と一致するときだけコンテキストを返す。
 * 一致しない場合（別の企画のプレビュー cookie を持ったまま他のページを開いた場合）は
 * null を返し、呼び出し側は通常どおり公開コンテンツを表示する。
 *
 * @param api 表示しようとしているページが属する microCMS API
 * @param id 表示しようとしているコンテンツID
 * @returns プレビュー中ならコンテキスト、そうでなければ null
 */
export async function readDraftPreviewContext(
  api: MicrocmsApi,
  id: string
): Promise<DraftPreviewContext | null> {
  const { isEnabled } = await draftMode();
  // ここで返すことで、通常のリクエストとビルド時は cookies() に触れない
  if (!isEnabled) return null;

  const context = parseDraftPreviewContext((await cookies()).get(DRAFT_PREVIEW_COOKIE)?.value);
  if (!context) return null;
  if (context.api !== api || context.id !== id) return null;

  return context;
}
