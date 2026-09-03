import { NextRequest, NextResponse } from "next/server";
import createMiddleware from "next-intl/middleware";
import { LOCALIZED_PATHNAMES } from "./i18n/localized-pathnames";
import { routing } from "./i18n/routing";
import { ARCHIVE_96TH_ORIGIN } from "./data/legacy-hosts";

const intlProxy = createMiddleware(routing);

/**
 * next-intl Proxy (旧: Middleware)
 *
 * 多言語対応ページのみをマッチングし、
 * 非対応ページ（microCMS依存）はスキップする
 *
 * @see https://next-intl.dev/docs/routing/middleware
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 旧アーカイブURLは、Next.jsの末尾スラッシュ正規化を経由せず直接301する。
  if (pathname === "/96th/" || pathname.startsWith("/96th/")) {
    const archivePath = pathname.slice("/96th".length) || "/";
    return NextResponse.redirect(`${ARCHIVE_96TH_ORIGIN}${archivePath}${search}`, 301);
  }

  // Next.jsの既定動作（末尾スラッシュを308で除去）を維持する。
  if (pathname !== "/" && pathname.endsWith("/") && !request.headers.has("x-nextjs-data")) {
    const normalizedUrl = new URL(request.url);
    normalizedUrl.pathname = pathname.replace(/\/+$/, "");
    return NextResponse.redirect(normalizedUrl, 308);
  }

  return intlProxy(request);
}

/**
 * マッチャー設定
 *
 * 多言語対応ページ（`src/app/[locale]` 配下に実体があるもの）:
 * - /about, /about/privacy
 * - /access
 * - /info/guide, /info/faq, /info/contact
 *
 * 多言語非対応ページ（除外）:
 * - /events, /events/[id]
 * - /timetable
 * - /info, /info/[id], /info/pamphlet
 * - /about/sponsors
 * - /api, /_next, /favicon.ico など
 *
 * IMPORTANT: 以下の3点を守ること。
 *
 * 1. `/` を追加してはいけない。
 *    `src/app/[locale]/page.tsx` が存在しないため、追加すると `/` が `/ja` へ
 *    rewrite され、トップページが404になる。
 *
 * 2. `:path*` は `/ja/:path*` 以外で使わない。
 *    `/(en|zh|ko)/about/:path*` のような書き方は、対応ページが存在しない
 *    `/en/about/sponsors` まで拾ってしまう。ミドルウェアを通過した404には
 *    hreflang の `Link:` ヘッダが付き、検索エンジンへ誤った代替情報を送る。
 *
 * 3. 多言語対応ページを増やすときは `src/i18n/localized-pathnames.ts` の
 *    `LOCALIZED_PATHNAMES` も更新すること。Next.js の制約により matcher は
 *    静的リテラルでなければならず定数から生成できないため、下部の
 *    ドリフト検知で不整合を開発時に知らせている。
 */
export const config = {
  matcher: [
    // Next.jsの自動末尾スラッシュ正規化を proxy.ts で再現する。
    "/:path+/",
    "/96th/:path*",

    // ja 接頭辞つきURLは一律で接頭辞なしへ307リダイレクトする。
    // localePrefix: "as-needed" のため日本語の正規URLは接頭辞なし側であり、
    // /ja/access のような重複URLを残さない。多言語非対応ページ
    // （/ja/events など）も同じ経路で救済される。
    "/ja/:path*",

    // デフォルトロケール（ja）の正規URL。内部的に /ja/* へ rewrite される
    "/about",
    "/about/privacy",
    "/access",
    "/info/guide",
    "/info/faq",
    "/info/contact",

    // en / zh / ko の多言語対応ページ
    "/(en|zh|ko)/about",
    "/(en|zh|ko)/about/privacy",
    "/(en|zh|ko)/access",
    "/(en|zh|ko)/info/guide",
    "/(en|zh|ko)/info/faq",
    "/(en|zh|ko)/info/contact",
  ],
};

// matcher と LOCALIZED_PATHNAMES のドリフト検知（開発時のみ）。
// config の宣言とは独立した文なので、matcher の静的解析には影響しない。
if (process.env.NODE_ENV !== "production") {
  const expected = [
    "/ja/:path*",
    ...LOCALIZED_PATHNAMES,
    ...LOCALIZED_PATHNAMES.map((pathname) => `/(en|zh|ko)${pathname}`),
  ];
  const missing = expected.filter((pathname) => !config.matcher.includes(pathname));

  if (missing.length > 0) {
    console.error(
      `[proxy] matcher と LOCALIZED_PATHNAMES が不整合です。matcher へ追加してください: ${missing.join(", ")}`
    );
  }
}
