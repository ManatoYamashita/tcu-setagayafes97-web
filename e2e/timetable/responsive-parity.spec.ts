import { expect, test } from "../fixtures";

/**
 * lg 未満では盤面ではなく縦スタックが出る（DOM 2枚持ちの例外）
 *
 * 盤面は最小 972px を要求するため 1024px 未満では縦スタックへ切り替わります。
 * **両者に出る企画は一致していなければなりません。** 盤面は時刻を解釈できない企画を
 * 描けませんが、縦スタックは描けてしまうためです。
 */
test.describe("モバイル幅", () => {
  test("盤面ではなく縦スタックを出す", async ({ timetablePage: page }) => {
    await expect(page.locator("[data-timetable-scroller]")).toBeHidden();
    await expect(page.locator("[data-timetable-list]")).toBeVisible();
  });

  test("盤面と同じ9件を出す（時刻不正の企画を含めない）", async ({ timetablePage: page }) => {
    // デスクトップの盤面も 9 件。入口の filterStageEvents() で揃えているため一致する。
    // 著名人企画のカードは /special/[id] を指すため、両方のプレフィックスを数える
    await expect(
      page.locator(
        "[data-timetable-list] a[href^='/events/'], [data-timetable-list] a[href^='/special/']"
      )
    ).toHaveCount(9);
    await expect(page.locator("[data-timetable-list]")).not.toContainText("時刻が壊れている企画");
  });

  test("横スクロールがページ全体へ漏れていない", async ({ timetablePage: page }) => {
    const metrics = await page.evaluate(() => ({
      documentScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    }));
    expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
  });
});
