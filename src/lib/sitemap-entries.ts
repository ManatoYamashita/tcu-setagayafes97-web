import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/site";

/**
 * 静的ページのサイトマップ項目
 *
 * `src/app/sitemap.ts` から切り出してある。`docs/dev/testing.md` のとおり
 * `src/app/` 配下にはテストを置けない（ルートとして解釈される）ため、
 * 検査したい組み立て処理はここへ置く。
 *
 * **日本語のURLだけを載せる。** en / zh / ko のページは noindex にしてあり
 * （`src/lib/metadata.ts` の `isIndexableLocale`。#433）、noindex のURLを
 * サイトマップへ載せると Search Console が「送信されたURLに noindex タグが追加されています」
 * として警告する。hreflang（`xhtml:link`）も同じ理由で出さない。
 */
export interface StaticPageEntry {
  pathname: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  images?: readonly string[];
}

/**
 * 静的ページの最終更新日
 *
 * **ビルド時刻（`new Date()`）を使わないこと。** 全13件が毎ビルドで同じ現在時刻に
 * なっていると、Google は lastmod が信用できないと判断してサイトマップの lastmod を
 * まるごと無視する（2026-09-03 の本番サイトマップは実際に全件が同一値だった）。
 * 過去回サイトの整理にあわせて第97回サイトの再クロールを促したい局面では、
 * これは直接の足枷になる。
 *
 * 文面を意味のある形で更新したら、そのページの日付を手で上げること。
 * CMS を読むページ（`/`・`/info`・`/events`・`/about/sponsors`）はここに書かず、
 * 呼び出し側が一覧の `updatedAt` の最大値を渡す。
 */
export const STATIC_PAGE_LAST_MODIFIED: Readonly<Record<string, string>> = {
  "/about": "2026-10-06",
  "/about/privacy": "2026-02-01",
  "/access": "2026-08-09",
  "/info/guide": "2026-08-15",
  "/info/faq": "2026-08-15",
  "/info/contact": "2026-08-15",
  "/info/pamphlet": "2026-08-15",
  "/timetable": "2026-08-30",
  "/special": "2026-09-01",
};

export const STATIC_PAGES: readonly StaticPageEntry[] = [
  {
    pathname: "/",
    changeFrequency: "daily",
    priority: 1.0,
    images: [siteConfig.metadata.ogImage, siteConfig.metadata.searchThumbnail],
  },
  { pathname: "/events", changeFrequency: "daily", priority: 0.9 },
  { pathname: "/special", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/timetable", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/access", changeFrequency: "weekly", priority: 0.7 },
  { pathname: "/info", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/info/guide", changeFrequency: "weekly", priority: 0.6 },
  { pathname: "/info/faq", changeFrequency: "weekly", priority: 0.6 },
  { pathname: "/info/pamphlet", changeFrequency: "weekly", priority: 0.5 },
  {
    pathname: "/about",
    changeFrequency: "monthly",
    priority: 0.5,
    images: [siteConfig.metadata.searchThumbnail],
  },
  { pathname: "/about/sponsors", changeFrequency: "weekly", priority: 0.6 },
  { pathname: "/info/contact", changeFrequency: "monthly", priority: 0.5 },
  { pathname: "/about/privacy", changeFrequency: "yearly", priority: 0.3 },
];

function absoluteUrl(pathname: string): string {
  const base = siteConfig.metadata.siteUrl.replace(/\/$/, "");
  return pathname === "/" ? base : `${base}${pathname}`;
}

export interface BuildStaticSitemapOptions {
  /** CMS を読むページの最終更新日。省略したページは STATIC_PAGE_LAST_MODIFIED を使う */
  cmsLastModified?: Readonly<Record<string, Date>>;
}

export function buildStaticSitemapEntries({
  cmsLastModified = {},
}: BuildStaticSitemapOptions = {}): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    if (page.pathname === "/special") continue;

    const lastModified =
      cmsLastModified[page.pathname] ??
      (STATIC_PAGE_LAST_MODIFIED[page.pathname]
        ? new Date(`${STATIC_PAGE_LAST_MODIFIED[page.pathname]}T00:00:00+09:00`)
        : undefined);

    const shared = {
      ...(lastModified ? { lastModified } : {}),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
      ...(page.images ? { images: page.images.map((image) => absoluteUrl(image)) } : {}),
    };

    entries.push({ url: absoluteUrl(page.pathname), ...shared });
  }

  return entries;
}
