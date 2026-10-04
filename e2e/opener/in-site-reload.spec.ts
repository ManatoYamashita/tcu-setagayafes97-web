import { test, expect, type Page } from "@playwright/test";

/**
 * サイト内の移動から落ちてきたフルロードでオープナーを再生しない（#402 の再発防止装置）
 *
 * ## なぜ要るのか
 *
 * オープナーはルートレイアウトにあり、クライアント遷移では再マウントされない。
 * それでも「検索したり、ページを移ったりすると、たまにオープナーが流れる」と報告された。
 *
 * Next.js は RSC 応答のビルドIDがクライアントと違うとき、遷移をブラウザのフルロードへ切り替える
 * （next/dist/client/components/router-reducer/fetch-server-response.js）。本番はデプロイのたびに
 * ビルドIDが変わるため、開いたままのタブで次にリンクを押すとフルロードになる。
 * 2026-10-04 に本番ビルドを2回作って実測し、`<Link>` 遷移がフルロードへ落ちて
 * オープナーが再生されることを確認した。
 *
 * 判定は `PerformanceNavigationTiming.type` と `document.referrer` に依存する
 * （`src/lib/motion.ts` の `isInSiteArrival`）。どちらも実ブラウザの遷移でしか値が決まらないため、
 * ユニットテストでは判定関数の表しか固定できない。ここでは実際の遷移で答えを確かめる。
 *
 * ビルドIDの不一致そのものは dev サーバで作れない。そこで、Next.js のフォールバックと同じく
 * `location.href` の代入で同一オリジンのフルロードを起こす。
 */

// playwright.config.ts は全テストを reduced-motion で走らせ、オープナーを読み込ませない。
// このファイルだけはオープナーが走る条件（デスクトップ幅・モーション軽減なし）に戻す。
test.use({ contextOptions: { reducedMotion: "no-preference" } });

/** `src/lib/motion.ts` の OPENER_DONE_KEY。オープナーが合図を撃つと true になる */
const OPENER_DONE_KEY = "__setagayafesOpenerDone";

const openerDone = (page: Page) =>
  page.evaluate(
    (key) => (window as unknown as Record<string, unknown>)[key] === true,
    OPENER_DONE_KEY
  );

/** `[data-opener-active]` が一度でも DOM に入ったかを記録するキー（下の addInitScript が立てる） */
const OPENER_MOUNTED_KEY = "__e2eOpenerMounted";

/**
 * オープナーが走らなかったことを確かめる。
 *
 * 「現れない」ことは待てないので、走るなら必ず済んでいるはずの時点まで進めてから見る。
 * Opener は OpenerLoader が `next/dynamic` でチャンクを取り、届いた直後に mount して
 * `[data-opener-active]` を描く。networkidle はそのチャンク取得から 500ms 後にしか来ない。
 *
 * その時点の DOM や合図フラグを見てはいけない。オープナーは約1.6秒で消え、
 * 合図は mount の0.8秒後に撃たれるため、どちらも「走ったのに見えない」瞬間がある
 * （退行注入で、DOM の検査が素通りすることを実測した）。mount の事実を記録して見る。
 */
const expectNoOpener = async (page: Page) => {
  await page.waitForLoadState("networkidle");
  const mounted = await page.evaluate(
    (key) => (window as unknown as Record<string, unknown>)[key] === true,
    OPENER_MOUNTED_KEY
  );
  expect(mounted).toBe(false);
  expect(await openerDone(page)).toBe(false);
};

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    const record = () => {
      if (document.querySelector("[data-opener-active]")) {
        (window as unknown as Record<string, unknown>)[key] = true;
      }
    };
    new MutationObserver(record).observe(document, { childList: true, subtree: true });
  }, OPENER_MOUNTED_KEY);
});

test("入口（直接アクセス・リロード）では再生し、サイト内からのフルロードでは再生しない", async ({
  page,
}) => {
  // 前提: オープナーが走る条件にあること。ここが偽だと下の「再生しない」が素通りする
  expect(page.viewportSize()?.width).toBeGreaterThanOrEqual(768);

  // 1. 直接アクセス（referrer なし）→ 再生する
  await page.goto("/access");
  await expect.poll(() => openerDone(page)).toBe(true);

  // 2. サイト内から同一オリジンのフルロード → 再生しない
  await page.evaluate(() => {
    window.location.href = "/about";
  });
  await page.waitForURL("**/about");
  const arrival = await page.evaluate(() => ({
    type: (performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming).type,
    referrer: document.referrer,
  }));
  // 本番のビルドID不一致で実測した値と同じ形であること
  expect(arrival.type).toBe("navigate");
  expect(new URL(arrival.referrer).pathname).toBe("/access");
  await expectNoOpener(page);

  // 3. リロード → referrer は同一オリジンのまま残るが、利用者の明示的な操作なので再生する
  await page.reload();
  await expect.poll(() => openerDone(page)).toBe(true);
});
