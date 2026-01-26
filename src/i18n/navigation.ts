import { createNavigation } from "next-intl/navigation";
import { routing } from "./routing";

/**
 * next-intl ナビゲーションAPI
 *
 * - Link: ロケール対応リンクコンポーネント
 * - redirect: ロケール対応リダイレクト関数
 * - usePathname: 現在のパス名を取得
 * - useRouter: ロケール対応ルーター
 * - getPathname: パス名を取得（サーバーサイド用）
 */
export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing);
