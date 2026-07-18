import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * next-intl Proxy (旧: Middleware)
 *
 * 多言語対応ページのみをマッチングし、
 * 非対応ページ（microCMS依存）はスキップする
 *
 * @see https://next-intl.dev/docs/routing/middleware
 */
export default createMiddleware(routing);

/**
 * マッチャー設定
 *
 * 多言語対応ページ:
 * - /about, /about/privacy
 * - /info/guide, /info/faq, /info/contact
 * - /access
 *
 * 多言語非対応ページ（除外）:
 * - /events, /events/[id]
 * - /timetable
 * - /info, /info/[id], /info/pamphlet
 * - /about/sponsors
 * - /api, /_next, /favicon.ico など
 */
export const config = {
  matcher: [
    // デフォルトロケール（ja）用のルート
    "/about",
    "/about/privacy",
    "/info/guide",
    "/info/faq",
    "/info/contact",
    "/access",

    // 他言語用のルート（プレフィックス付き）
    "/(en|zh|ko)/about/:path*",
    "/(en|zh|ko)/info/guide",
    "/(en|zh|ko)/info/faq",
    "/(en|zh|ko)/access",
  ],
};
