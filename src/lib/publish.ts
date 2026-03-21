/**
 * データ公開状態ユーティリティ
 *
 * NEXT_PUBLIC_SETAGAYAFES_DATA_PUBLISH=true の場合のみ
 * データ依存ページを公開する。
 */

/** 非公開時に隠すパス一覧（唯一の管理場所） */
const HIDDEN_PATHS = ["/events", "/timetable", "/map", "/info/pamphlet", "/about/sponsors"];

/** データ公開済みかどうか */
export const isDataPublished = process.env.NEXT_PUBLIC_SETAGAYAFES_DATA_PUBLISH === "true";

/** 指定パスが非公開対象かどうかを判定 */
export function isPathHidden(path: string): boolean {
  if (isDataPublished) return false;
  return HIDDEN_PATHS.some((hp) => path === hp || path.startsWith(hp + "/"));
}
