import { describe, expect, it } from "vitest";

import { LOCALIZED_PATHNAMES } from "@/i18n/localized-pathnames";
import { routing } from "@/i18n/routing";
import {
  buildStaticSitemapEntries,
  localizedStaticPathnames,
  STATIC_PAGES,
} from "@/lib/sitemap-entries";

/**
 * サイトマップの不変条件
 *
 * 2026-09-03 の本番サイトマップは静的13件すべての lastmod が同一のビルド時刻で、
 * 多言語URLが1件も載っていなかった（#33）。どちらも lint / build を通過する種類の
 * 欠陥なので、算術で固定する。
 */
const entries = buildStaticSitemapEntries({ specialVisible: false });

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

describe("ロケール別URL", () => {
  /**
   * `localized: true` を宣言してよいのは `LOCALIZED_PATHNAMES` の6パスだけ。
   * それ以外へ接頭辞を付けると `src/proxy.ts` の matcher 外になり、
   * サイトマップが 404 を宣言することになる。
   */
  it("localized の宣言が LOCALIZED_PATHNAMES に含まれる", () => {
    for (const pathname of localizedStaticPathnames()) {
      expect(LOCALIZED_PATHNAMES).toContain(pathname);
    }
  });

  it("多言語ページはロケール数だけURLを出す", () => {
    for (const pathname of localizedStaticPathnames()) {
      const matched = entries.filter(
        (entry) =>
          entry.url.endsWith(pathname) ||
          routing.locales.some((locale) => entry.url.endsWith(`/${locale}${pathname}`))
      );
      expect(matched.length).toBe(routing.locales.length);
    }
  });
});

describe("hreflang", () => {
  const localized = entries.filter((entry) => entry.alternates?.languages);

  it("多言語ページにだけ付く", () => {
    expect(localized.length).toBe(localizedStaticPathnames().length * routing.locales.length);
  });

  it("全ロケール + x-default を列挙する", () => {
    for (const entry of localized) {
      expect(Object.keys(entry.alternates!.languages!)).toHaveLength(routing.locales.length + 1);
    }
  });

  /**
   * Google は「各URLが自分自身を含む全言語版を列挙する」ことを要求する。
   * Next.js の直列化は自己参照を補完しないので、ここで固定する。
   */
  it("自分自身を含む（相互参照）", () => {
    for (const entry of localized) {
      const hrefs = Object.values(entry.alternates!.languages!).map(String);
      expect(hrefs).toContain(entry.url);
    }
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
      specialVisible: false,
      cmsLastModified: { "/about": cmsDate },
    });
    const about = withCms.find((entry) => entry.url.endsWith("/about"));
    expect(about?.lastModified).toEqual(cmsDate);
  });
});

describe("転送元の除外", () => {
  /**
   * SPECIAL_VISIBLE が真の間、/special は著名人企画LPへ302転送される。
   * 転送元を載せると Search Console が「リダイレクトあり」として除外する。
   */
  it("specialVisible のとき /special を落とす", () => {
    const visible = buildStaticSitemapEntries({ specialVisible: true });
    expect(visible.some((entry) => entry.url.endsWith("/special"))).toBe(false);
  });

  it("specialVisible でないとき /special を載せる", () => {
    expect(entries.some((entry) => entry.url.endsWith("/special"))).toBe(true);
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
      "https://setagayafes.org/ogp.webp",
      "https://setagayafes.org/images/brand/search-thumbnail-97.webp",
    ]);
  });

  it("全ロケールのaboutページは検索結果用画像をサイトマップへ載せる", () => {
    const aboutEntries = entries.filter((entry) => entry.url.endsWith("/about"));
    expect(aboutEntries).toHaveLength(routing.locales.length);
    for (const entry of aboutEntries) {
      expect(entry.images).toEqual([
        "https://setagayafes.org/images/brand/search-thumbnail-97.webp",
      ]);
    }
  });
});
