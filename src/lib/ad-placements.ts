import { splitLocalePrefix } from "@/i18n/localized-pathnames";

/**
 * 広告掲載の出し方（#481）
 *
 * 広告は3か所に出る。全ページのフッター上の広告欄（`AdBanners`）、モバイルの画面下部の
 * 固定バナー（`MobileAdDock`）、協賛・協力ページの「広告掲載」節。設計は
 * docs/frontend/ad-placements.md を参照。
 */

/** 固定バナーを退かせる領域（フッター上の広告欄から下）の目印。Footer.tsx が付ける */
export const AD_DOCK_STOP_ATTRIBUTE = "data-ad-dock-stop";

/** 広告欄の見出し。固定バナーの閉じるボタンを押した後のフォーカスの行き先 */
export const AD_BANNERS_HEADING_ID = "ad-banners-heading";

/**
 * モバイルの固定バナーを出すページかどうか
 *
 * - `/`: Hero の上に重なるため出さない（参考にした明大祭サイトと同じ）
 * - `/special/[id]`: `MobileTicketCTA` が同じ位置に固定されるため出さない
 *
 * ロケール接頭辞（`/en/...`）を外してから判定する。
 */
export function shouldShowMobileAdDock(pathname: string): boolean {
  const { pathname: path } = splitLocalePrefix(pathname);
  if (path === "/") return false;
  if (/^\/special\/[^/]+\/?$/.test(path)) return false;
  return true;
}

/**
 * 固定バナーに出す1件を選ぶ
 *
 * 読み込むたびに1件を選び、表示中は切り替えない。自動で切り替えると、
 * WCAG 2.2.2 により一時停止の手段が要るため。
 * @param random 0 以上 1 未満の値（テストでは固定値を渡す）
 */
export function pickAd<T>(ads: readonly T[], random: number): T | null {
  if (ads.length === 0) return null;
  const index = Math.min(ads.length - 1, Math.max(0, Math.floor(random * ads.length)));
  return ads[index];
}
