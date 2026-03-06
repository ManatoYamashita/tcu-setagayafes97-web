import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

import { routing } from "./i18n/routing";
import { checkBasicAuth } from "./lib/basic-auth";

/**
 * next-intl ルーティングハンドラ
 */
const handleI18nRouting = createMiddleware(routing);

/**
 * i18n対象パスかどうかを判定する
 *
 * 多言語対応ページ:
 * - /about, /about/contact, /about/privacy
 * - /info/guide, /info/faq
 * - /map/access
 * - /(en|zh|ko)/... のプレフィックス付きパス
 */
const I18N_PATHS = [
  "/about",
  "/about/contact",
  "/about/privacy",
  "/info/guide",
  "/info/faq",
  "/map/access",
];

const LOCALE_PREFIXES = ["en", "zh", "ko"];

function isI18nRoute(pathname: string): boolean {
  // デフォルトロケール（ja）用パス
  if (I18N_PATHS.includes(pathname)) {
    return true;
  }

  // 他言語プレフィックス付きパス
  for (const locale of LOCALE_PREFIXES) {
    const prefix = `/${locale}`;
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      const subpath = pathname.slice(prefix.length) || "/";
      if (
        I18N_PATHS.includes(subpath) ||
        subpath.startsWith("/about/") ||
        subpath.startsWith("/info/guide") ||
        subpath.startsWith("/info/faq") ||
        subpath.startsWith("/map/access")
      ) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Proxy (Middleware) 関数
 *
 * 実行順序:
 * 1. Basic Auth チェック（PREVIEW_AUTH=true の場合のみ）
 * 2. i18n対象パス → next-intl ルーティング
 * 3. その他 → そのまま通過
 */
export default function proxy(request: NextRequest): NextResponse {
  // Step 1: Basic Auth チェック
  const authResponse = checkBasicAuth(request);
  if (authResponse) {
    return authResponse;
  }

  // Step 2: i18n対象パスの場合はnext-intlに委譲
  if (isI18nRoute(request.nextUrl.pathname)) {
    return handleI18nRouting(request);
  }

  // Step 3: その他のパスはそのまま通過
  return NextResponse.next();
}

/**
 * マッチャー設定
 *
 * 全ルートをカバーしつつ、静的アセット・API・faviconを除外
 */
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon\\.ico|.*\\..*).*)"],
};
