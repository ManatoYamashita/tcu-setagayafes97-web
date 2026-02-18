import { NextRequest, NextResponse } from "next/server";

/**
 * Proxy（本番版）
 * 全パスを許可する
 *
 * Next.js 16 では middleware.ts と proxy.ts は共存不可のため、
 * proxy.ts で制御を行う
 */
export default function proxy(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  // 静的アセット、API、Next.js内部パスを除外
  matcher: ["/((?!_next/static|_next/image|api|favicon\\.ico|images|videos|.*\\..*).*)"],
};
