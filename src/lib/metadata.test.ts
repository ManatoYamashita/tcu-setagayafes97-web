import { describe, expect, it } from "vitest";

import { siteConfig } from "@/data/site";
import { routing } from "@/i18n/routing";
import { buildLocalePath, createPageMetadata } from "@/lib/metadata";

/**
 * canonical と hreflang の不変条件
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

  it("ロケールに追随する", () => {
    for (const locale of routing.locales) {
      const meta = createPageMetadata({ ...base, locale });
      expect(String(meta.alternates?.canonical)).toContain(buildLocalePath("/about", locale));
    }
  });
});

describe("createPageMetadata の hreflang", () => {
  it("localized のとき全ロケール + x-default を出す", () => {
    const languages = createPageMetadata({ ...base, localized: true }).alternates?.languages;
    expect(Object.keys(languages ?? {})).toHaveLength(routing.locales.length + 1);
    for (const locale of routing.locales) {
      expect(languages).toHaveProperty(locale);
    }
    expect(languages).toHaveProperty("x-default");
  });

  it("x-default はデフォルトロケールのURLと一致する", () => {
    const languages = createPageMetadata({ ...base, localized: true }).alternates?.languages;
    expect(languages?.["x-default"]).toBe(languages?.[routing.defaultLocale]);
  });

  it("全ての値が絶対URLである", () => {
    const languages = createPageMetadata({ ...base, localized: true }).alternates?.languages ?? {};
    for (const value of Object.values(languages)) {
      expect(String(value)).toMatch(/^https?:\/\//);
    }
  });

  it("localized でないときは出さない", () => {
    expect(createPageMetadata(base).alternates?.languages).toBeUndefined();
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
    const meta = createPageMetadata({ ...base, noindex: true, localized: true });
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
      image: { url: "/ogp.webp", width: 800, height: 400 },
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
});
