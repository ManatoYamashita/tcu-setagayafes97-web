import { expect, test, type Page } from "@playwright/test";

/**
 * /events の絞り込み（#376）
 *
 * lg 未満では、追従するのはキーワード入力と「条件」ボタンの細いバーだけで、
 * 開催日・種別・建物はボトムシートで選ぶ。以前は全項目のパネルが sticky のまま開き、
 * 390x844 で 612px を占めていた。さらに条件付きURLでは自動展開していた。
 *
 * **企画の件数に依存させない。** Layout E2E は microCMS の資格情報を持たないため、
 * CI では一覧が0件になる。件数は「ボタンと件数表示が一致する」形でだけ使い、
 * 追従の検査に要る高さは一覧の側へ足す。
 *
 * 設計は docs/frontend/events-filter-sheet.md を参照。
 */

/** 追従するバーの高さの上限。入力欄とボタン（44px）＋上の余白（21px）＋下の余白（8px）＝73px */
const MAX_BAR_HEIGHT = 77;

/** 貼り付いたバーとピル型ヘッダーの間に空ける余白（1rem） */
const STUCK_GAP = 16;

async function gotoEvents(page: Page, query = "") {
  await page.goto(`/events${query}`);
  // Suspense の中身が本来の位置へ移されるまで待つ（#309。e2e/fixtures.ts の冒頭を参照）
  await expect(page.locator('div[hidden][id^="S:"]')).toHaveCount(0);
  await expect(page.locator("#keyword-search")).toBeVisible();
}

const sheet = (page: Page) => page.locator("aside dialog.slide-panel");
const trigger = (page: Page) => page.getByRole("button", { name: /^絞り込み条件/ });

/** ハイドレーション前の押下は何も起こさないため、開くまで押し直す */
async function openSheet(page: Page) {
  await expect(async () => {
    if (!(await sheet(page).evaluate((d: HTMLDialogElement) => d.open))) {
      await trigger(page).click();
    }
    expect(await sheet(page).evaluate((d: HTMLDialogElement) => d.open)).toBe(true);
  }).toPass({ timeout: 15_000 });
}

async function isSheetOpen(page: Page) {
  return sheet(page).evaluate((d: HTMLDialogElement) => d.open);
}

/** 「N 件の企画が見つかりました」の N */
async function statusCount(page: Page) {
  const text = await page
    .getByRole("status")
    .filter({ hasText: "件の企画が見つかりました" })
    .innerText();
  return Number(text.match(/(\d+)\s*件/)?.[1]);
}

test.describe("/events の絞り込み（lg 未満）", () => {
  test("条件付きURLでも開かず、細いバーだけが出る。選択数はバッジで示す", async ({ page }) => {
    await gotoEvents(page, "?type=stage");

    const barHeight = await page
      .locator("aside")
      .evaluate((el) => Math.round(el.getBoundingClientRect().height));
    expect(barHeight, "絞り込みのバーが高すぎる（全項目が展開されている）").toBeLessThanOrEqual(
      MAX_BAR_HEIGHT
    );
    expect(await isSheetOpen(page), "条件付きURLでシートが自動で開いている").toBe(false);
    await expect(trigger(page)).toHaveAccessibleName("絞り込み条件（1件を選択中）");
    await expect(page.locator("[data-filter-count]")).toHaveText("1");
  });

  test("スクロールしてもバーが画面上部に貼り付く", async ({ page }) => {
    await gotoEvents(page);
    // CI では一覧が0件で、ページが短く追従を観測できない。一覧の側へ高さを足す
    await page.locator("aside + div").evaluate((el) => {
      const spacer = document.createElement("div");
      spacer.style.height = "4000px";
      el.append(spacer);
    });
    await page.evaluate(() => window.scrollTo(0, 3000));

    await expect(async () => {
      const top = await page
        .locator("aside")
        .evaluate((el) => Math.round(el.getBoundingClientRect().top));
      // top-[calc(var(--header-height)-1rem)] = 72px
      expect(top).toBe(72);
    }).toPass();

    // 隙間は aside の padding で取る。top を下げるとカードが透けるため、上と合わせて両方を見る。
    // ヘッダーはピル型へ 300ms かけて縮むので、縮み終わるまで待つ
    await expect(async () => {
      const gap = await page.evaluate(() => {
        const pill = document.querySelector("header > div")!.getBoundingClientRect();
        const bar = document.querySelector("aside > div")!.getBoundingClientRect();
        return Math.round(bar.top - pill.bottom);
      });
      expect(gap, "貼り付いたバーがヘッダーに密着している").toBe(STUCK_GAP);
    }).toPass();
  });

  test("シートは下端に接地し、選ぶと即時に反映される。件数のボタンで閉じる", async ({ page }) => {
    await gotoEvents(page, "?type=stage");
    await openSheet(page);

    const box = await sheet(page).evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { top: r.top, bottom: Math.round(r.bottom), vh: window.innerHeight };
    });
    expect(box.bottom, "シートが下端に接地していない").toBe(box.vh);
    expect(box.top, "シートが画面を覆い尽くしている（背後の一覧が見えない）").toBeGreaterThan(0);
    expect(
      await page.evaluate(() => getComputedStyle(document.body).overflow),
      "開いている間に背面がスクロールできる"
    ).toBe("hidden");

    await sheet(page).getByRole("button", { name: "1日目", exact: true }).click();
    await expect(page).toHaveURL(/[?&]date=day1/);
    await expect(page).toHaveURL(/[?&]type=stage/);
    await expect(page.locator("[data-filter-count]")).toHaveText("2");
    expect(await isSheetOpen(page), "選んだだけでシートが閉じた").toBe(true);

    const showButton = sheet(page).getByRole("button", { name: /件の企画を表示$/ });
    const buttonCount = Number((await showButton.innerText()).match(/(\d+)/)?.[1]);
    expect(buttonCount, "ボタンの件数が一覧の件数と食い違う").toBe(await statusCount(page));

    await showButton.click();
    await expect.poll(() => isSheetOpen(page)).toBe(false);
    await expect(trigger(page)).toBeFocused();
  });

  test("Esc・×・背景のどれでも閉じる", async ({ page }) => {
    await gotoEvents(page);

    await openSheet(page);
    await page.keyboard.press("Escape");
    await expect.poll(() => isSheetOpen(page)).toBe(false);

    await openSheet(page);
    await sheet(page).getByRole("button", { name: "閉じる" }).click();
    await expect.poll(() => isSheetOpen(page)).toBe(false);

    await openSheet(page);
    // シートは下端にあるので、上端付近は背景（::backdrop）
    await page.mouse.click(10, 10);
    await expect.poll(() => isSheetOpen(page)).toBe(false);
  });

  test("クリアは開催日・種別・建物だけを戻し、何も選んでいなければ押せない", async ({ page }) => {
    await gotoEvents(page, "?date=day2&type=stage");
    await openSheet(page);

    const clear = sheet(page).getByRole("button", { name: "クリア" });
    await clear.click();
    await expect(page).not.toHaveURL(/date=|type=/);
    await expect(clear).toBeDisabled();
    await expect(page.locator("[data-filter-count]")).toHaveCount(0);
  });
});

test.describe("/events の絞り込み（lg 以上）", () => {
  test.use({ viewport: { width: 1280, height: 900 } });

  test("サイドバーに全項目が並び、シートの入口は出ない", async ({ page }) => {
    await gotoEvents(page, "?type=stage");

    await expect(page.locator("aside").getByRole("heading", { name: "絞り込み" })).toBeVisible();
    await expect(
      page.locator("aside").getByRole("button", { name: "ステージ企画", exact: true })
    ).toBeVisible();
    await expect(page.getByRole("combobox", { name: "建物" })).toBeVisible();
    await expect(trigger(page)).toBeHidden();
    expect(await isSheetOpen(page)).toBe(false);
  });
});
