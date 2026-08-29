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
 * オープナー各フェーズの尺（秒）。GSAP の duration にそのまま渡す。
 *
 * 合計を変えたら OPENER_SAFETY_MS と OPENER_FAILSAFE_MS も追随する。
 * ずれた場合は Opener.tsx の開発ビルド用アサーションが警告する。
 */
export const OPENER_SEC = {
  /** 白アイコンのフェードイン */
  iconIn: 0.22,
  /** 白→カラー + 紫レイヤーを濃紫へ（3本同時） */
  crossFade: 0.3,
  /** アイコンのフェードアウト。合図と同時に始まり、スライドアウトの内側に収まる */
  iconOut: 0.2,
  /** 合図からスライドアウト開始までの間 */
  slideDelay: 0.05,
  /** 紫レイヤーのスライドアウト */
  slideOut: 0.55,
} as const;

/** `opener-done` を発火する時刻（秒）。アイコンのフェードアウト開始と同時。 */
export const OPENER_HERO_CUE_SEC = OPENER_SEC.iconIn + OPENER_SEC.crossFade;

/** タイムライン合計（秒）。iconOut は内側に収まるため合計に効かない。 */
export const OPENER_TOTAL_SEC = OPENER_HERO_CUE_SEC + OPENER_SEC.slideDelay + OPENER_SEC.slideOut;

/**
 * オープナーの保険。タイムラインが完走しなかった場合に覆いを外す上限。
 * 保険しているのは「timeline が組まれない / 進まない」ケース（ref が揃わない、
 * バックグラウンドタブで rAF が止まる等）で、チャンク到着の遅れではない
 * （このタイマーは Opener の mount 後に張られるため）。
 *
 * 短すぎるとタイムラインの途中で覆いが消え、紫レイヤーがスライドアウトせず
 * ハードカットになる。合計の約2.8倍を確保している。
 */
export const OPENER_SAFETY_MS = Math.round(OPENER_TOTAL_SEC * 1000) + 2000;

/**
 * ページ側の保険。`opener-done` が届かなかった場合に入場を開始する上限。
 * HeroSection は初期状態の opacity:0 を SSR HTML に焼いているため、
 * これが発火しないと見出しが不可視のまま残る。
 */
export const OPENER_FAILSAFE_MS = Math.round(OPENER_HERO_CUE_SEC * 1000) + 2000;

/**
 * トップのヒーロー入場（h1 / 日付 / 最新ニュースの3要素）。
 * ロゴ画像は LCP 候補のため入場の対象に含めない。
 */
export const HERO_ENTRANCE = {
  duration: 0.5,
  stagger: 0.08,
  ease: "power4.out",
} as const;

/**
 * `opener-done` を既に撃ち終えたかを記録するキー。
 *
 * このイベントはワンショットで、登録前に飛ぶと永久に失われる。そして実際に
 * 取りこぼす。オープナーは `<body>` 直下ですぐ動き出すが、`{children}` 側は
 * データ取得を挟んだストリーミングの後にハイドレートされるため、リスナー登録が
 * 1秒以上遅れることがある（本番ビルド実測: オープナー 1243ms / ヒーロー 2773ms）。
 *
 * モジュールスコープの変数ではなく `window` に置くのは、このモジュールが
 * 初期チャンクと遅延チャンクの両方から参照され、バンドラがインライン複製すると
 * 別インスタンスになりうるため。
 */
const OPENER_DONE_KEY = "__setagayafesOpenerDone";

/** オープナーが合図を撃ったことを記録する。`opener-done` の発火と必ず対で呼ぶ。 */
export const markOpenerDone = () => {
  if (typeof window === "undefined") return;
  (window as unknown as Record<string, boolean>)[OPENER_DONE_KEY] = true;
};

/** 合図が既に撃たれたか。リスナーを張る前に必ず確認すること。 */
export const hasOpenerFinished = () =>
  typeof window !== "undefined" &&
  (window as unknown as Record<string, boolean>)[OPENER_DONE_KEY] === true;

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

/**
 * 入場アニメーションが `opener-done` を待つべきか。
 *
 * 入場を持つページはすべてこれを使うこと。「オープナーが走る環境か」と
 * 「合図が既に撃たれたか」の両方を見る必要があり、片方だけの判定は必ず壊れる。
 * - 環境だけ見る → 合図の後にハイドレートされたページが永久に待つ
 * - DOM マーカーだけ見る → Opener が dynamic(ssr:false) のため常に「居ない」
 */
export const shouldWaitForOpener = () => willRunOpener() && !hasOpenerFinished();
