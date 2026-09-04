import type { MetadataRoute } from "next";

import { siteConfig } from "@/data/site";
import { LOCALIZED_PATHNAMES } from "@/i18n/localized-pathnames";
import { routing } from "@/i18n/routing";
import { buildLocalePath } from "@/lib/metadata";

/**
 * 静的ページのサイトマップ項目
 *
 * `src/app/sitemap.ts` から切り出してある。`docs/dev/testing.md` のとおり
 * `src/app/` 配下にはテストを置けない（ルートとして解釈される）ため、
 * 検査したい組み立て処理はここへ置く。
 *
 * `SPECIAL_VISIBLE` を引数で受けるのも同じ理由である。`src/data/site.ts` の
 * 定数はモジュールスコープで `process.env` を評価するので、環境変数を切り替える
 * テストは `vi.resetModules()` と動的 import を要求し、
 * 「動的 import で得た値は静的 import と別実体」という落とし穴を踏む。
 * 引数にすれば純粋関数になり、そのすべてが不要になる。
 */
export interface StaticPageEntry {
  pathname: string;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
  priority: number;
  images?: readonly string[];
  /** `LOCALIZED_PATHNAMES` に含まれ、ロケール別URLを出すページ */
  localized?: boolean;
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
  "/about": "2026-09-04",
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
    images: ["/ogp.webp", siteConfig.metadata.searchThumbnail],
  },
  { pathname: "/events", changeFrequency: "daily", priority: 0.9 },
  { pathname: "/special", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/timetable", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/access", changeFrequency: "weekly", priority: 0.7, localized: true },
  { pathname: "/info", changeFrequency: "daily", priority: 0.8 },
  { pathname: "/info/guide", changeFrequency: "weekly", priority: 0.6, localized: true },
  { pathname: "/info/faq", changeFrequency: "weekly", priority: 0.6, localized: true },
  { pathname: "/info/pamphlet", changeFrequency: "weekly", priority: 0.5 },
  {
    pathname: "/about",
    changeFrequency: "monthly",
    priority: 0.5,
    images: [siteConfig.metadata.searchThumbnail],
    localized: true,
  },
  { pathname: "/about/sponsors", changeFrequency: "weekly", priority: 0.6 },
  { pathname: "/info/contact", changeFrequency: "monthly", priority: 0.5, localized: true },
  { pathname: "/about/privacy", changeFrequency: "yearly", priority: 0.3, localized: true },
];

function absoluteUrl(pathname: string): string {
  const base = siteConfig.metadata.siteUrl.replace(/\/$/, "");
  return pathname === "/" ? base : `${base}${pathname}`;
}

/**
 * hreflang の相互参照
 *
 * Google は「各URLが自分自身を含む全言語版を列挙する」ことを要求する。
 * Next.js のサイトマップ直列化は渡した言語をそのまま `<xhtml:link>` へ並べるだけで
 * 自己参照を補完しないため、全ロケール分を明示的に入れる。
 */
function localeAlternates(pathname: string): Record<string, string> {
  return {
    ...Object.fromEntries(
      routing.locales.map((locale) => [locale, absoluteUrl(buildLocalePath(pathname, locale))])
    ),
    "x-default": absoluteUrl(buildLocalePath(pathname, routing.defaultLocale)),
  };
}

export interface BuildStaticSitemapOptions {
  /**
   * `SPECIAL_VISIBLE`。真の間 `/special` は著名人企画LPへ302転送されるため
   * （`next.config.ts` の `redirects()`）、転送元をサイトマップから落とす。
   * 載せたままだと Search Console が「リダイレクトあり」として除外する。
   */
  specialVisible: boolean;
  /** CMS を読むページの最終更新日。省略したページは STATIC_PAGE_LAST_MODIFIED を使う */
  cmsLastModified?: Readonly<Record<string, Date>>;
}

export function buildStaticSitemapEntries({
  specialVisible,
  cmsLastModified = {},
}: BuildStaticSitemapOptions): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const page of STATIC_PAGES) {
    if (specialVisible && page.pathname === "/special") continue;

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

    if (!page.localized) {
      entries.push({ url: absoluteUrl(page.pathname), ...shared });
      continue;
    }

    const alternates = { languages: localeAlternates(page.pathname) };
    for (const locale of routing.locales) {
      entries.push({
        url: absoluteUrl(buildLocalePath(page.pathname, locale)),
        ...shared,
        alternates,
      });
    }
  }

  return entries;
}

/**
 * `localized: true` を宣言したページが `LOCALIZED_PATHNAMES` と一致しているか
 *
 * 一致していないロケール付きURLを出すと `src/proxy.ts` の matcher 外になり、
 * サイトマップが 404 を宣言することになる。テストで固定する。
 */
export function localizedStaticPathnames(): readonly string[] {
  return STATIC_PAGES.filter((page) => page.localized).map((page) => page.pathname);
}

export { LOCALIZED_PATHNAMES };
