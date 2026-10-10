import { expect, test, type Page } from "@playwright/test";

const languageButton = "言語を選択 / Select language";

function watchHydration(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error" && /hydration|did not match/i.test(message.text())) {
      errors.push(message.text());
    }
  });
  return errors;
}

async function selectJapanese(page: Page, mobile: boolean) {
  if (mobile) {
    await page.locator('header button[aria-controls="staggered-menu-panel"]').click();
    await page.locator('#staggered-menu-panel a[lang="ja"]').click();
  } else {
    await page.getByRole("button", { name: languageButton }).click();
    await page.locator('header a[lang="ja"]').click();
  }
}

for (const mobile of [false, true]) {
  test.describe(mobile ? "モバイル" : "デスクトップ", () => {
    test.use({ viewport: { width: mobile ? 390 : 1280, height: 900 } });

    for (const locale of ["en", "zh", "ko"]) {
      test(`${locale}: 日本語専用ページと再読み込みを経ても言語を保持し、日本語へ戻せる`, async ({
        page,
      }) => {
        const errors = watchHydration(page);
        await page.goto(`/${locale}/info/guide`);
        await expect(page.locator("html")).toHaveAttribute("lang", locale);
        await page.locator('footer a[href="/events"]').click();
        await expect(page).toHaveURL(/\/events$/);
        await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute(
          "href",
          `/${locale}/access`
        );
        await expect(page.locator("html")).toHaveAttribute("lang", "ja");
        await page.reload();
        await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute(
          "href",
          `/${locale}/access`
        );

        if (mobile) {
          await page
            .locator(
              "header button[aria-label][aria-expanded='false']:not([aria-label='言語を選択 / Select language'])"
            )
            .click();
          await expect(
            page.locator('#staggered-menu-panel a[href$="/access"]').first()
          ).toHaveAttribute("href", `/${locale}/access`);
          await page.locator('#staggered-menu-panel a[href$="/access"]').first().click();
        } else {
          await page.getByRole("button", { name: languageButton }).click();
          const currentLanguage = page.locator(`header a[lang="${locale}"]`);
          await expect(currentLanguage).toHaveAttribute("href", `/${locale}/info/guide`);
          await expect(currentLanguage).toContainText(/Japanese only|仅提供日语版|일본어로만/);
          await page.keyboard.press("Escape");
          await page.locator('header a[href$="/access"]').first().click();
        }
        await expect(page).toHaveURL(new RegExp(`/${locale}/access$`));
        await page.locator('footer a[href="/events"]').click();
        await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute(
          "href",
          `/${locale}/access`
        );
        await selectJapanese(page, mobile);
        await expect(page).toHaveURL(/\/events$/);
        await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/access");
        await page.reload();
        await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/access");
        expect(errors).toEqual([]);
      });
    }
  });
}

test("言語を選んでいないタブはブラウザ言語が英語でも日本語のまま", async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, locale: "en-US" });
  try {
    const page = await context.newPage();
    await page.goto("/events");
    await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/access");
    await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  } finally {
    await context.close();
  }
});

test("sessionStorageが利用できなくても同じページ読み込み内では言語を保持する", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "sessionStorage", {
      get() {
        throw new DOMException("Storage blocked", "SecurityError");
      },
    });
  });
  const errors = watchHydration(page);
  await page.goto("/en/info/guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.locator('footer a[href="/events"]').click();
  await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/en/access");
  await selectJapanese(page, false);
  await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/access");
  expect(errors).toEqual([]);
});

test("多言語対応ページでは記憶よりURLの言語を優先する", async ({ page }) => {
  const errors = watchHydration(page);
  await page.goto("/en/info/guide");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/ko/access");
  await expect(page.locator("html")).toHaveAttribute("lang", "ko");
  await page.locator('footer a[href="/events"]').click();
  await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/ko/access");
  await page.goto("/access");
  await expect(page.locator("html")).toHaveAttribute("lang", "ja");
  await page.locator('footer a[href="/events"]').click();
  await expect(page.locator('footer a[href$="/access"]')).toHaveAttribute("href", "/access");
  expect(errors).toEqual([]);
});
