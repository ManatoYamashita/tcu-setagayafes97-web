import { expect, test } from "../fixtures";

test("横スクロールが盤面の中で完結している", async ({ timetablePage: page }) => {
  const metrics = await page.evaluate(() => {
    const scroller = document.querySelector("[data-timetable-scroller]");
    if (!scroller) throw new Error("スクローラが見つかりません");
    return {
      scrollerScrollWidth: scroller.scrollWidth,
      scrollerClientWidth: scroller.clientWidth,
      documentScrollWidth: document.documentElement.scrollWidth,
      innerWidth: window.innerWidth,
    };
  });

  // 「そもそも溢れていないから通った」という空振りを排除する。
  // 盤面は最小 1152px を要求するので、1280px のビューポートでは必ず溢れる
  expect(
    metrics.scrollerScrollWidth,
    "盤面が溢れていない。この幅では横スクロールの検証にならない"
  ).toBeGreaterThan(metrics.scrollerClientWidth);

  // 溢れがページ全体へ漏れていないこと
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(metrics.innerWidth + 1);
});
