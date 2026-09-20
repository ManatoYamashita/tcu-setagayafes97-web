import { expect, test } from "@playwright/test";

const CONTENT_ORDER = [
  "[data-not-found-code]",
  "[data-not-found-title]",
  "[data-not-found-illustration]",
  "[data-not-found-description]",
  "[data-not-found-cta]",
] as const;

test.describe("404ページのモバイル配置", () => {
  test.beforeEach(async ({ page }) => {
    const response = await page.goto("/e2e-no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.locator("[data-not-found-code]")).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
  });

  test("内容が読み順どおりに縦へ並ぶ", async ({ page }) => {
    const boxes = await Promise.all(
      CONTENT_ORDER.map((selector) =>
        page.locator(selector).evaluate((element) => {
          const rect = element.getBoundingClientRect();
          return { top: Math.round(rect.top), bottom: Math.round(rect.bottom) };
        })
      )
    );

    for (let index = 1; index < boxes.length; index += 1) {
      expect(
        boxes[index].top,
        `${CONTENT_ORDER[index]} が直前の要素より上にあります`
      ).toBeGreaterThanOrEqual(boxes[index - 1].bottom);
    }

    expect(boxes[1].top - boxes[0].bottom, "404と見出しの間隔が狭すぎます").toBeGreaterThanOrEqual(
      20
    );
  });

  test("イラストを224px以下で表示する", async ({ page }) => {
    const width = await page
      .locator("[data-not-found-illustration]")
      .evaluate((element) => Math.round(element.getBoundingClientRect().width));

    expect(width).toBeLessThanOrEqual(224);
  });
});
