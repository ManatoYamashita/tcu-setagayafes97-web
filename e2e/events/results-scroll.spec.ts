import { expect, test, type Page } from "@playwright/test";

/**
 * /events の絞り込み後のスクロール位置（#392）
 *
 * 絞り込みは `{ scroll: false }` で URL を書き換えるため、一覧を読み進めた状態で
 * キーワードを入れると、文書の高さが縮んだぶん件数次第の位置へ着地していた。
 * `EventResults` が「結果の先頭が隠れていれば追従バーの直下へ寄せる」ことを実測する。
 *
 * **企画の件数に依存させない。** Layout E2E は microCMS の資格情報を持たず一覧が0件になるため、
 * スクロールに要る高さは一覧の側へ足す（responsive-parity.spec.ts と同じ）。
 *
 * 設計は docs/frontend/events-filter-sheet.md「絞り込み後のスクロール位置」を参照。
 */

/** どの企画にも当たらない語。結果が変わることだけが要る */
const KEYWORD = "zzzz";

async function gotoEvents(page: Page) {
  await page.goto("/events");
  // Suspense の中身が本来の位置へ移されるまで待つ（#309。e2e/fixtures.ts の冒頭を参照）
  await expect(page.locator('div[hidden][id^="S:"]')).toHaveCount(0);
  await expect(page.locator("#keyword-search")).toBeVisible();
}

/** 結果ブロックの後ろへ高さを足し、ページを下まで読み進めた状態を作る */
async function scrollDeep(page: Page) {
  await page.locator("aside + div").evaluate((el) => {
    const spacer = document.createElement("div");
    spacer.style.height = "4000px";
    el.append(spacer);
  });
  await page.evaluate(() => window.scrollTo(0, 3000));
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
}

/** ハイドレーション前の入力は URL へ届かないため、届くまで入れ直す */
async function typeKeyword(page: Page) {
  const input = page.locator("#keyword-search");
  await expect(async () => {
    await input.fill("");
    await input.fill(KEYWORD);
    await expect(page).toHaveURL(new RegExp(`keyword=${KEYWORD}`), { timeout: 3_000 });
  }).toPass({ timeout: 15_000 });
  // 意味検索（第4段）の応答待ちが終わり、件数表示が出るまで待つ
  await expect(
    page.getByRole("status").filter({ hasText: "件の企画が見つかりました" })
  ).toBeVisible();
}

const rect = (page: Page, selector: string) =>
  page.locator(selector).evaluate((el) => {
    const r = el.getBoundingClientRect();
    return { top: Math.round(r.top), bottom: Math.round(r.bottom) };
  });

test.describe("絞り込み後のスクロール位置（lg 未満）", () => {
  test("読み進めた状態で検索すると、結果の先頭が追従バーの直下に来る", async ({ page }) => {
    await gotoEvents(page);
    await scrollDeep(page);
    await typeKeyword(page);

    // スムーズスクロールが終わるまで待つ
    await expect(async () => {
      const bar = await rect(page, "aside");
      const results = await rect(page, "aside + div");
      expect(
        Math.abs(results.top - bar.bottom),
        `結果の先頭（${results.top}px）が追従バーの下端（${bar.bottom}px）に揃っている`
      ).toBeLessThanOrEqual(1);
    }).toPass();
  });

  test("結果の先頭が見えているときは動かさない", async ({ page }) => {
    await gotoEvents(page);
    // 320x640 では入力欄が画面外にあり、フォーカスでブラウザが入力欄を画面内へ動かす。
    // その位置を基準にする（それ以後に結果の先頭が引き寄せられていないことを見る）
    await page.locator("#keyword-search").focus();
    const before = await rect(page, "aside + div");
    expect(before.top, "前提: 結果の先頭が追従バーより下に見えている").toBeGreaterThan(
      (await rect(page, "aside")).bottom
    );

    await typeKeyword(page);
    const after = await rect(page, "aside + div");
    expect(Math.abs(after.top - before.top)).toBeLessThanOrEqual(1);
  });
});

test.describe("絞り込み後のスクロール位置（lg 以上）", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("読み進めた状態で検索すると、結果の先頭がサイドバーの上端に揃う", async ({ page }) => {
    await gotoEvents(page);
    await scrollDeep(page);
    await typeKeyword(page);

    // lg ではバーは横に並ぶ。結果の先頭はヘッダー + 1rem（= 貼り付いたサイドバーの top）
    await expect(async () => {
      const sidebar = await rect(page, "aside");
      const results = await rect(page, "aside + div");
      expect(Math.abs(results.top - sidebar.top)).toBeLessThanOrEqual(1);
    }).toPass();
  });
});
