import { describe, expect, it } from "vitest";

import { siteConfig } from "@/data/site";
import { routing } from "@/i18n/routing";
import { buildLocalePath, createPageMetadata, isIndexableLocale } from "@/lib/metadata";

/**
 * canonical と索引対象ロケールの不変条件
 *
 * ここが壊れても lint / type-check / build は通る。実際、404ページがトップの
 * canonical を継承し、実在しないIDのページが自己参照 canonical を出していた
 * （#164、2026-09-03 実測）。ロケール規則とURL絶対化を算術として固定する。
 *
 * ロケール一覧は `routing.locales` から導く。ベタ書きすると言語を増減したときに
 * 「守るもの」ではなく「年次更新の税」になる。
 */
const base = { title: "見出し", description: "説明", pathname: "/about" };

describe("buildLocalePath", () => {
  it("デフォルトロケールには接頭辞を付けない", () => {
    expect(buildLocalePath("/about", routing.defaultLocale)).toBe("/about");
  });

  it("デフォルト以外のロケールには接頭辞を付ける", () => {
    for (const locale of routing.locales.filter((l) => l !== routing.defaultLocale)) {
      expect(buildLocalePath("/about", locale)).toBe(`/${locale}/about`);
    }
  });

  it("ルートはデフォルトロケールで / になる", () => {
    expect(buildLocalePath("/", routing.defaultLocale)).toBe("/");
  });
});

describe("createPageMetadata の canonical", () => {
  it("常に絶対URLになる", () => {
    const meta = createPageMetadata(base);
    expect(String(meta.alternates?.canonical)).toMatch(
      new RegExp(`^${siteConfig.metadata.siteUrl.replace(/\/$/, "")}/`)
    );
  });

  it("日本語では自分自身を指す", () => {
    const meta = createPageMetadata({ ...base, locale: routing.defaultLocale });
    expect(String(meta.alternates?.canonical)).toMatch(/\/about$/);
  });
});

/**
 * 日本語以外は検索に載せない（#433）
 *
 * hreflang で対応づけていた間も、日本語のクエリのサイトリンクに中国語ページが混ざった。
 * 外国語ページは noindex にし、hreflang も出さない。
 */
describe("createPageMetadata の索引対象ロケール", () => {
  const foreignLocales = routing.locales.filter((locale) => locale !== routing.defaultLocale);

  it("日本語以外は noindex で canonical を出さない", () => {
    expect(foreignLocales.length).toBeGreaterThan(0);
    for (const locale of foreignLocales) {
      const meta = createPageMetadata({ ...base, locale });
      expect(meta.robots).toMatchObject({ index: false, follow: true });
      expect(meta.alternates?.canonical).toBeNull();
    }
  });

  it("日本語は索引させる", () => {
    expect(createPageMetadata({ ...base, locale: routing.defaultLocale }).robots).toBeUndefined();
  });

  it("どのロケールでも hreflang を出さない", () => {
    for (const locale of routing.locales) {
      expect(createPageMetadata({ ...base, locale }).alternates?.languages).toBeUndefined();
    }
  });

  it("isIndexableLocale は日本語だけを通す", () => {
    expect(routing.locales.filter(isIndexableLocale)).toEqual([routing.defaultLocale]);
  });
});

describe("createPageMetadata の noindex", () => {
  it("robots を noindex にする", () => {
    const meta = createPageMetadata({ ...base, noindex: true });
    expect(meta.robots).toMatchObject({ index: false });
  });

  /**
   * 存在しないURLへ自己参照 canonical を与えると、Google にそのURLを正規版として
   * 宣言することになる。noindex と canonical は排他でなければならない。
   */
  it("canonical を出さない", () => {
    const meta = createPageMetadata({ ...base, noindex: true });
    expect(meta.alternates?.canonical).toBeNull();
    expect(meta.alternates?.languages).toBeUndefined();
  });

  it("既定では noindex にしない", () => {
    expect(createPageMetadata(base).robots).toBeUndefined();
  });
});

describe("createPageMetadata の OG画像", () => {
  it("microCMS の画像は 1200x630 のレターボックスへ整える", () => {
    const meta = createPageMetadata({
      ...base,
      image: {
        url: "https://images.microcms-assets.io/assets/x/y/thumb.png",
        width: 1280,
        height: 1280,
      },
    });
    const image = (meta.openGraph?.images as { url: string; width?: number; height?: number }[])[0];
    expect(image.url).toContain("fit=fill");
    expect(image.width).toBe(1200);
    expect(image.height).toBe(630);
  });

  it("microCMS 以外の画像は変換せず実寸を保つ", () => {
    const meta = createPageMetadata({
      ...base,
      image: { url: "/ogp-v3.webp", width: 800, height: 400 },
    });
    const image = (meta.openGraph?.images as { url: string; width?: number; height?: number }[])[0];
    expect(image.url).not.toContain("fit=fill");
    expect(image.width).toBe(800);
    expect(image.height).toBe(400);
  });
});

describe("createPageMetadata のタイトル", () => {
  it("サイト名を二重に付けない", () => {
    const meta = createPageMetadata({ ...base, title: siteConfig.metadata.siteName });
    expect(meta.title).toEqual({ absolute: siteConfig.metadata.siteName });
  });

  it("日本語以外ではサイト名の接尾辞もロケール別になる", () => {
    const meta = createPageMetadata({ ...base, title: "Contact", locale: "en" });
    expect(meta.title).toEqual({
      absolute: "Contact | The 97th Tokyo City University Setagaya Festival",
    });
    expect(meta.title).not.toEqual(
      expect.objectContaining({ absolute: expect.stringMatching(/[ぁ-んァ-ヶ一-龥]/) })
    );
  });

  it("日本語のサイト名は siteConfig と一致する（chrome JSON の出典と食い違わない）", () => {
    const meta = createPageMetadata({ ...base, title: "お問い合わせ" });
    expect(meta.title).toEqual({ absolute: `お問い合わせ | ${siteConfig.metadata.siteName}` });
    expect(meta.openGraph?.siteName).toBe(siteConfig.metadata.searchSiteName);
  });
});
