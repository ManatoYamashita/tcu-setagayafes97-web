import { test as base, expect, type Page } from "@playwright/test";

/**
 * 盤面を測る前に「測定系が生きていること」を確かめる
 *
 * `docs/frontend/browser-observation-limits.md` の前提確認を、手順ではなくコードとして
 * 常設化したものです。これが無いと「盤面が 0px でない」という判定そのものが信用できません。
 * 幅が足りていないだけなのに #148 が直っているように見える、という偽陰性を塞ぎます。
 */

/** フィクスチャにしか存在しない企画名。dev サーバの取り違えを検出する */
const FIXTURE_MARKER = "軽音楽部 ライブステージ";

interface TimetableFixtures {
  /** 前提確認を済ませた /timetable。クエリを変えたいときは gotoTimetable を使う */
  timetablePage: Page;
  /** 任意のクエリで開き直す */
  gotoTimetable: (query: string) => Promise<void>;
}

export const test = base.extend<TimetableFixtures>({
  gotoTimetable: async ({ page }, use, testInfo) => {
    await use(async (query: string) => {
      await page.goto(`/timetable${query}`);

      // Suspense の中身が本来の位置へ移されるまで待つ（#309）。
      // dev は動的描画でストリーミングするため、中身はまず <body> 直下の
      // <div hidden id="S:n"> に届く。移される前でも DOM には接続しているので
      // toBeAttached() は通るが、幅も高さも 0 を返す。
      //
      // load を待つだけでは足りない。移すのはストリーム中の $RC ではなく、$RC が
      // 予約する $RV であり、load より後に走りうる。シェルの初回描画（$RT）より前なら
      // requestAnimationFrame、後なら $RT + 300ms まで setTimeout で待つ
      // （performance.now() が 2000〜2300ms なら 2300ms まで）。実測では 30〜335ms 後だった。
      //
      // 一方で goto() は load まで待ち、load はストリームの終端より後に来る。したがってこの時点で
      // 一時置き場はすべて DOM に揃っており、「0個になる」は中身の到着前に素通りしない。
      // 測る値（幅・高さ）とは独立した信号なので、下の「測ろうとしている値を待たない」にも反しない。
      await expect(
        page.locator('div[hidden][id^="S:"]'),
        "Suspense の中身がストリーミングの一時置き場から移されていない"
      ).toHaveCount(0);

      // 幅が project の指定どおりであること。1024px 未満だと盤面が display:none になり
      // getBoundingClientRect() が 0 を返すため、以降のアサーションが全部偽陰性になる
      const viewport = testInfo.project.use.viewport;
      expect(
        await page.evaluate(() => window.innerWidth),
        "ビューポート幅が project の指定と違う（測定条件が満たされていない）"
      ).toBe(viewport?.width);

      // スタイルが当たるまで待つ。dev サーバは CSS を JS で注入するため、
      // 素の DOM を測ると全要素が 0px になる。ヒーローは default / compact の
      // どちらも確定した高さを持つので、可視になった時点でスタイルの適用は完了している。
      //
      // **測ろうとしている値そのものを待ってはいけない**（盤面の高さを
      // waitForFunction で待つと、#148 は「検出できない」に化ける）。ここで待つのは
      // 盤面とは独立した信号である。
      const hero = page.locator("[data-page-hero]");
      await expect(hero, "ヒーローが可視にならない＝スタイルが適用されていない").toBeVisible();

      // svh が 0 に解決されていないこと。潰れていたら測定系そのものが壊れている
      const heroHeight = await hero.evaluate((el) => el.getBoundingClientRect().height);
      expect(heroHeight, "svh が 0 に解決されている＝測定系が壊れている").toBeGreaterThan(100);

      // フォントの確定を待つ（決定的なゲート。ポーリングではない）
      await page.evaluate(() => document.fonts.ready);
    });
  },

  timetablePage: async ({ page, gotoTimetable }, use) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(String(error)));

    await gotoTimetable("?date=day1&stage=all");

    // フィクスチャが効いていること。reuseExistingServer で
    // フラグ無しの dev サーバを掴んでいると、ここで止まる。
    //
    // 盤面と縦スタックの両方が DOM に存在する（片方が display:none）ため、
    // 同じ文字列が2箇所に当たる。visible ではなく attached で見る
    await expect(
      page.getByText(FIXTURE_MARKER).first(),
      "フィクスチャが無効です。NEXT_PUBLIC_TIMETABLE_FIXTURE=1 で dev を起動してください"
    ).toBeAttached();

    await use(page);

    // ハイドレーション不整合など、盤面の DOM 2枚持ちが抱える構造的リスクを拾う
    expect(pageErrors, "ページ内で未捕捉の例外が発生している").toEqual([]);
  },
});

export { expect };

/**
 * カードが属するステージ列の上端からの距離（px）
 *
 * `getBoundingClientRect()` はページ全体の座標なのでヒーローの高さが混ざります。
 * 盤面の座標は列の内側で決まるため、列を基準に測ります。
 */
export async function topWithinColumn(page: Page, title: string): Promise<number> {
  return page.evaluate((needle) => {
    const card = [...document.querySelectorAll("[data-timetable-event]")].find((el) =>
      (el.textContent ?? "").includes(needle)
    );
    if (!card) throw new Error(`カードが見つかりません: ${needle}`);
    const column = card.closest("[data-timetable-column]");
    if (!column) throw new Error(`列が見つかりません: ${needle}`);
    return Math.round(card.getBoundingClientRect().top - column.getBoundingClientRect().top);
  }, title);
}
