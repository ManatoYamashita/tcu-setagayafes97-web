import { expect, test } from "../fixtures";

const PANEL = "dialog.slide-panel";
const CARD = "[data-timetable-event] a";
const TITLE = "軽音楽部 ライブステージ";

/**
 * 企画詳細パネル
 *
 * カードを押してもページ遷移せず、`<dialog>` のパネルが開く。状態は `?event=` が持つ。
 * e2e は `reducedMotion: "reduce"` で走るため、動きは透明度のみ（120ms）。
 * 位置（右端・下端）はアニメーション後の最終形を測る。
 */
test.describe("企画詳細パネル", () => {
  test("カードを押すとページ遷移せず、右端にパネルが開く", async ({ timetablePage: page }) => {
    const card = page.locator(CARD).filter({ hasText: TITLE });
    await card.click();

    const panel = page.locator(PANEL);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: TITLE })).toBeVisible();
    await expect(page).toHaveURL(/\/timetable\?.*event=/);

    // 右端に接地し、画面の高さいっぱいに出る
    await expect
      .poll(async () =>
        panel.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return {
            right: Math.round(r.right) === window.innerWidth,
            full: Math.round(r.height) === window.innerHeight,
            width: Math.round(r.width),
          };
        })
      )
      .toEqual({ right: true, full: true, width: 448 });
  });

  test("Esc・×・背景のどれでも閉じ、フォーカスが元のカードへ戻る", async ({
    timetablePage: page,
  }) => {
    const card = page.locator(CARD).filter({ hasText: TITLE });
    const panel = page.locator(PANEL);

    await card.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    await expect(page).not.toHaveURL(/event=/);
    await expect(card).toBeFocused();

    await card.click();
    await panel.getByRole("button", { name: "企画詳細を閉じる" }).click();
    await expect(panel).toBeHidden();

    await card.click();
    await expect(panel).toBeVisible();
    // 背景（パネルの左側の余白）を押す
    await page.mouse.click(10, 300);
    await expect(panel).toBeHidden();
  });

  test("次の企画・前の企画へ移る。履歴は積まない", async ({ timetablePage: page }) => {
    await page.locator(CARD).filter({ hasText: TITLE }).click();
    const panel = page.locator(PANEL);
    await expect(panel).toBeVisible();

    const title = panel.locator("#timetable-panel-title");
    const first = await title.textContent();
    const firstUrl = page.url();

    await panel.locator('[data-timetable-panel-nav="next"]').click();
    await expect(title).not.toHaveText(first ?? "");
    await expect(page).not.toHaveURL(firstUrl);

    await panel.locator('[data-timetable-panel-nav="prev"]').click();
    await expect(title).toHaveText(first ?? "");

    // 開いてから2回移動したが、戻る1回でパネルの外（/timetable）へ出る
    await page.goBack();
    await expect(panel).toBeHidden();
    await expect(page).toHaveURL(/\/timetable/);
  });

  test("一覧の両端では、その向きのボタンが押せない", async ({ timetablePage: page }) => {
    // 9:30 開始の体育館（オープニングセレモニー）が day1 の最初の企画
    await page.locator(CARD).filter({ hasText: "オープニングセレモニー" }).click();
    const panel = page.locator(PANEL);
    await expect(panel).toBeVisible();

    await expect(panel.locator('[data-timetable-panel-nav="prev"]')).toHaveAttribute(
      "aria-disabled",
      "true"
    );
    await expect(panel.locator('[data-timetable-panel-nav="next"]')).toHaveAttribute(
      "aria-disabled",
      "false"
    );
  });

  test("?event= 付きの直リンクでパネルが開く。閉じると event が消える", async ({
    page,
    gotoTimetable,
  }) => {
    await gotoTimetable("?date=day1&stage=all");
    await page.locator(CARD).filter({ hasText: TITLE }).click();
    // push は click の完了より後に URL へ反映される
    await expect(page).toHaveURL(/event=/);
    const url = page.url();

    await gotoTimetable(new URL(url).search);
    const panel = page.locator(PANEL);
    await expect(panel).toBeVisible();
    await expect(panel.getByRole("heading", { name: TITLE })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(panel).toBeHidden();
    // 直リンクで来たので back() ではなく URL の書き換えで閉じる（サイトの外へ出ない）
    await expect(page).toHaveURL(/\/timetable\?date=day1&stage=all$/);
  });

  test("絞り込みの外・存在しない event はパネルを出さない", async ({ gotoTimetable, page }) => {
    await gotoTimetable("?date=day1&stage=all&event=nothing%230");
    await expect(page.locator(PANEL)).toBeHidden();
  });

  test("日程タブを切り替えると閉じる", async ({ timetablePage: page }) => {
    // パネルが開くと背面は inert なので、タブを押すには先に閉じる必要がある。
    // ここでは URL 側の契約（タブのリンクが event を引き継がない）だけを見る
    await page.locator(CARD).filter({ hasText: TITLE }).click();
    await expect(page.locator(PANEL)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.locator(PANEL)).toBeHidden();
    await page.locator("[data-timetable-date-tabs] button").nth(1).click();
    await expect(page).toHaveURL(/date=day2/);
    await expect(page).not.toHaveURL(/event=/);
  });

  test("修飾キー付きのクリックではパネルを開かない", async ({ timetablePage: page }) => {
    const card = page.locator(CARD).filter({ hasText: TITLE });
    // Shift+クリックは新しいウィンドウ。現在のページは動かない
    const popup = page.context().waitForEvent("page");
    await card.click({ modifiers: ["Shift"] });
    const opened = await popup;
    await expect(opened).toHaveURL(/\/events\/fx-7a-1/);
    await expect(page.locator(PANEL)).toBeHidden();
  });

  test("狭い画面では下端にボトムシートが開く", async ({ timetablePage: page }) => {
    await page.setViewportSize({ width: 390, height: 780 });
    await page.locator("[data-timetable-list-item] a").filter({ hasText: TITLE }).click();

    const panel = page.locator(PANEL);
    await expect(panel).toBeVisible();
    await expect
      .poll(async () =>
        panel.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return {
            bottom: Math.round(r.bottom) === window.innerHeight,
            fullWidth: Math.round(r.width) === window.innerWidth,
            withinLimit: r.height <= window.innerHeight * 0.85 + 1,
          };
        })
      )
      .toEqual({ bottom: true, fullWidth: true, withinLimit: true });

    // 前後のボタンは内部スクロールしても見えている
    await expect(panel.locator('[data-timetable-panel-nav="next"]')).toBeInViewport();
  });
});
