import { test, expect, type Locator, type Page } from "@playwright/test";

/**
 * サイト内遷移の着地点が最上部であり、main が Header の裏へ潜らないこと（#429 の再発防止装置）
 *
 * ## なぜ要るのか
 *
 * Next.js（16.1 の `layout-router.js`）は、クライアント遷移の最後に、変化したセグメントの
 * **先頭 DOM 要素**へ `focus()` を呼ぶ。`preventScroll` は付いていない。このとき sticky と
 * fixed の要素、寸法0の要素（JSON-LD の `<script>`）は先頭として選ばれない。
 * ページの先頭が `<main id="content" tabIndex={-1}>` だと、その main にフォーカスが当たる。
 * ブラウザは main の上端をビューポート上端へ合わせ、ヒーローの上部が sticky Header の裏に隠れる。
 * 本番で `/about`・`/`・`/info/[id]` が y=77 に着地した（2026-10-07 実測）。
 *
 * **直接アクセスでは起きない**（focus を呼ぶのはクライアント遷移だけ）。
 * lint・型・ユニットテスト・build のどれも、スクロール位置もフォーカスの移動も見ていない。
 *
 * 対策は「main をフォーカスできない要素で包み、ページの先頭にしない」こと
 * （`docs/frontend/landmarks-and-skip-link.md`「ページの先頭要素を main にしない」）。
 *
 * ## 対象
 *
 * CMS 未設定の CI でも描画される静的ルートだけを使う（fork からの PR でも結果が出る）。
 * `/info/[id]`・`/special/[id]` と、そこから落ちる 404 は入稿データが要るため、ここには無い。
 * 包み方は同じなので、`/about` と `/` が守られていれば構造の退行は捕まる。
 */

/**
 * React がこの要素のハイドレーションを終えるまで待つ
 *
 * ハイドレーション前の `<a>` を押すと Link の onClick が無く、ブラウザのフルロードになる。
 * フルロードは focus を呼ばないため、このテストは何も検査しないまま緑になる。
 * 判定は `e2e/events/responsive-parity.spec.ts` の `waitForHydration` と同じ（#391）。
 */
async function waitForHydration(locator: Locator) {
  await expect
    .poll(
      () => locator.evaluate((el) => Object.keys(el).some((k) => k.startsWith("__reactFiber$"))),
      { message: "React のハイドレーションが終わらない" }
    )
    .toBe(true);
}

/** フルロードではなくクライアント遷移だったことを確かめるための目印 */
const MARKER_KEY = "__e2eClientNavMarker";

interface Case {
  readonly name: string;
  /** 遷移元。最下部までスクロールしてから押す */
  readonly from: string;
  /** 押す Link */
  readonly link: (page: Page) => Locator;
  /** 遷移先の pathname */
  readonly to: string;
}

const CASES: readonly Case[] = [
  {
    name: "/about/privacy → Footer の /about",
    from: "/about/privacy",
    link: (page) => page.locator('footer a[href="/about"]').first(),
    to: "/about",
  },
  {
    name: "/about → Header のロゴ（/）",
    from: "/about",
    link: (page) => page.locator('header a[href="/"]').first(),
    to: "/",
  },
  {
    // [locale] 配下の about（多言語レイアウト）も同じ page.tsx を通ることを確かめる
    name: "/en/about/privacy → Footer の /en/about",
    from: "/en/about/privacy",
    link: (page) => page.locator('footer a[href="/en/about"]').first(),
    to: "/en/about",
  },
];

for (const c of CASES) {
  test(`サイト内遷移で最上部に着地する: ${c.name}`, async ({ page }) => {
    await page.goto(c.from);
    await page.evaluate(() => document.fonts.ready);

    const link = c.link(page);
    await waitForHydration(link);

    // 前提: 遷移元を十分に下までスクロールできていること。浅いままだと
    // Next.js が scrollTop = 0 にする分岐へ入らず、検査が素通りする
    const startY = await page.evaluate(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" });
      return window.scrollY;
    });
    expect(startY, "遷移元が短く、スクロールの前提が成り立たない").toBeGreaterThan(500);

    await page.evaluate((key) => {
      (window as unknown as Record<string, unknown>)[key] = true;
    }, MARKER_KEY);

    await link.click();
    await page.waitForURL((url) => url.pathname === c.to);
    await expect(page.locator("main#content h1").first()).toBeVisible();

    // focus() は遷移を確定させたコミットのエフェクトで同期的に走る。2フレーム待てば済んでいる
    await page.evaluate(
      () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)))
    );

    const result = await page.evaluate((key) => {
      const header = document.querySelector("header");
      const main = document.querySelector("main#content");
      return {
        clientNav: (window as unknown as Record<string, unknown>)[key] === true,
        scrollY: window.scrollY,
        headerBottom: header?.getBoundingClientRect().bottom ?? Number.NaN,
        mainTop: main?.getBoundingClientRect().top ?? Number.NaN,
      };
    }, MARKER_KEY);

    // フルロードに落ちていたら focus は呼ばれず、下の判定が素通りする
    expect(result.clientNav, "クライアント遷移ではなくフルロードになった").toBe(true);
    expect(result.scrollY, "最上部に着地していない").toBe(0);
    expect(result.mainTop, "main の上端が Header の裏に潜っている").toBeGreaterThanOrEqual(
      result.headerBottom - 0.5
    );
  });
}
