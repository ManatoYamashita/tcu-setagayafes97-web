import { expect, test } from "../fixtures";

/**
 * カードの実寸と内容の収まり
 *
 * ユニットテストは `getCardDensity()` の算術を固定しますが、
 * 「その密度の内容が実際に収まるか」はブラウザが文字を組んでみないと分かりません。
 */
test.describe("カードの実寸", () => {
  test("すべてのカードが 24×24 以上（WCAG 2.5.8）", async ({ timetablePage: page }) => {
    const sizes = await page.locator("[data-timetable-event] a").evaluateAll((els) =>
      els.map((el) => {
        const rect = el.getBoundingClientRect();
        return { w: Math.round(rect.width), h: Math.round(rect.height) };
      })
    );

    expect(sizes.length).toBeGreaterThan(0);
    for (const size of sizes) {
      expect(size.h).toBeGreaterThanOrEqual(24);
      expect(size.w).toBeGreaterThanOrEqual(24);
    }
  });

  test("内容がカードから溢れていない", async ({ timetablePage: page }) => {
    // 密度の閾値が「枠」ではなく「カード実寸」を基準にしているかの検算。
    // 許容できる 1px は、WCAG 下限の 24px カード（minimal）でだけ生じる下余白の圧縮。
    const overflows = await page
      .locator("[data-timetable-event] a")
      .evaluateAll((els) => els.map((el) => el.scrollHeight - el.clientHeight));

    expect(Math.max(...overflows)).toBeLessThanOrEqual(1);

    // 許容値の範囲が広がっていないこと。1px を持ってよいのは 15分企画の1枚だけ
    expect(overflows.filter((overflow) => overflow === 1)).toHaveLength(1);
  });
});
