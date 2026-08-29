/**
 * 初期表示モーション（オープナー → トップのヒーロー入場）の共有タイミング。
 *
 * ここを触るときの前提:
 * - gsap を import しないこと。HeroSection（初期チャンク）から参照されるため、
 *   ここに gsap が入ると OpenerLoader による Opener の遅延ロード分離が壊れる。
 * - About / Special の入場尺はここに置かない。トップは `/` 直打ちの入口で
 *   オープナーが先に乗るため体感予算が違い、下層ページとは役割が異なる。
 */

/**
 * オープナーの保険。タイムラインが完走しなかった場合に覆いを外す上限。
 * 保険しているのは「timeline が組まれない / 進まない」ケース（ref が揃わない、
 * バックグラウンドタブで rAF が止まる等）で、チャンク到着の遅れではない
 * （このタイマーは Opener の mount 後に張られるため）。
 */
export const OPENER_SAFETY_MS = 6000;

/**
 * ページ側の保険。`opener-done` が届かなかった場合に入場を開始する上限。
 * HeroSection は初期状態の opacity:0 を SSR HTML に焼いているため、
 * これが発火しないと見出しが不可視のまま残る。
 */
export const OPENER_FAILSAFE_MS = 5000;

/**
 * この閲覧環境でオープナーが走るか。OpenerLoader のロード条件と同一の述語。
 *
 * DOM の [data-opener-active] を見る方式では判定できない。Opener は
 * dynamic(ssr:false) なので SSR HTML にマーカーが出ず、各ページの useEffect は
 * useSyncExternalStore の再レンダー → チャンク取得 → Opener の mount より
 * 必ず先に走るため、初回表示では常に「オープナーは居ない」と誤判定される。
 */
export const willRunOpener = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(min-width: 768px)").matches &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
