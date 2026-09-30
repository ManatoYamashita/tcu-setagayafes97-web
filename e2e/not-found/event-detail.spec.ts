import { expect, test } from "@playwright/test";

/**
 * 企画詳細の404（`src/app/events/[id]/not-found.tsx`）に歯車のイラストが出ること
 *
 * この画面はグローバル404と別ファイルで、歯車だけが欠けていた。
 * 画像の欠落・パスの誤り・読み込み失敗はいずれも lint / 型 / build を通過するため、
 * 実ブラウザで「表示されて、デコードまで済んでいる」ことを確かめる。
 *
 * microCMS 未設定の CI でも `getEventById()` は `null` を返すので、この画面へ落ちる。
 */
test("企画詳細の404に歯車のイラストが表示される", async ({ page }) => {
  const response = await page.goto("/events/e2e-no-such-event");
  expect(response?.status()).toBe(404);

  // notFound() の中身はシェル送出後に差し込まれるため、自動リトライする locator で待つ
  const image = page.locator("[data-event-not-found-illustration] img");
  await expect(image).toBeVisible();

  const naturalWidth = await image.evaluate(async (element) => {
    const img = element as HTMLImageElement;
    // lazy 読み込みでも可視範囲にあれば読まれる。decode() で読み込み完了まで待つ
    await img.decode();
    return img.naturalWidth;
  });
  expect(naturalWidth, "イラストが読み込めていない").toBeGreaterThan(0);
});
