import { describe, expect, it } from "vitest";

import { routing } from "@/i18n/routing";
import { buildStaticSitemapEntries, STATIC_PAGES } from "@/lib/sitemap-entries";

/**
 * サイトマップの不変条件
 *
 * 2026-09-03 の本番サイトマップは静的13件すべての lastmod が同一のビルド時刻で、
 * 多言語URLが1件も載っていなかった（#33）。どちらも lint / build を通過する種類の
 * 欠陥なので、算術で固定する。
 *
 * その後 #433 で方針が反転し、外国語ページは noindex になった。いまはサイトマップに
 * 外国語URLと hreflang が「無いこと」を固定する。
 */
const entries = buildStaticSitemapEntries();

describe("URL", () => {
  it("重複が無い", () => {
    const urls = entries.map((entry) => entry.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it("すべて絶対URLである", () => {
    for (const entry of entries) {
      expect(entry.url).toMatch(/^https?:\/\//);
    }
  });
});

describe("索引対象ロケール", () => {
  /**
   * en / zh / ko は noindex（#433）。noindex のURLを載せると Search Console が
   * 「送信されたURLに noindex タグが追加されています」として警告する。
   */
  it("外国語ロケールのURLを載せない", () => {
    const foreignPrefixes = routing.locales
      .filter((locale) => locale !== routing.defaultLocale)
      .map((locale) => `/${locale}/`);
    for (const entry of entries) {
      const pathname = new URL(entry.url).pathname;
      expect(foreignPrefixes.some((prefix) => `${pathname}/`.startsWith(prefix))).toBe(false);
    }
  });

  it("hreflang を出さない", () => {
    expect(entries.filter((entry) => entry.alternates?.languages)).toEqual([]);
  });
});

describe("lastModified", () => {
  it("Invalid Date を出さない", () => {
    for (const entry of entries) {
      if (entry.lastModified === undefined) continue;
      expect(Number.isNaN(new Date(entry.lastModified).getTime())).toBe(false);
    }
  });

  /**
   * 全件が同一値だと Google は lastmod をまるごと無視する。
   * 「常に現在時刻」をやめることが目的なので、値そのものではなく多様性を見る。
   */
  it("全件が同一値ではない", () => {
    const values = entries
      .map((entry) => entry.lastModified)
      .filter((value): value is Date | string => value !== undefined)
      .map((value) => new Date(value).getTime());
    expect(new Set(values).size).toBeGreaterThan(1);
  });

  it("CMS 由来の日付を渡すと静的な既定値より優先される", () => {
    const cmsDate = new Date("2030-01-02T03:04:05.000Z");
    const withCms = buildStaticSitemapEntries({
      cmsLastModified: { "/about": cmsDate },
    });
    const about = withCms.find((entry) => entry.url.endsWith("/about"));
    expect(about?.lastModified).toEqual(cmsDate);
  });
});

describe("転送元の除外", () => {
  it("/special の転送元を載せない", () => {
    expect(entries.some((entry) => entry.url.endsWith("/special"))).toBe(false);
  });
});

describe("STATIC_PAGES", () => {
  it("pathname が重複しない", () => {
    const paths = STATIC_PAGES.map((page) => page.pathname);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("priority が 0 より大きく 1 以下である", () => {
    for (const page of STATIC_PAGES) {
      expect(page.priority).toBeGreaterThan(0);
      expect(page.priority).toBeLessThanOrEqual(1);
    }
  });

  it("トップページはOGP画像と検索結果用画像をサイトマップへ載せる", () => {
    const home = entries.find((entry) => entry.url === "https://setagayafes.org");
    expect(home?.images).toEqual([
      "https://setagayafes.org/ogp-v3.webp",
      "https://setagayafes.org/images/brand/search-thumbnail-97.webp",
    ]);
  });

  it("aboutページは検索結果用画像をサイトマップへ載せる", () => {
    const about = entries.find((entry) => entry.url === "https://setagayafes.org/about");
    expect(about?.images).toEqual([
      "https://setagayafes.org/images/brand/search-thumbnail-97.webp",
    ]);
  });
});
