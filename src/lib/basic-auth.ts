import { NextRequest, NextResponse } from "next/server";

/**
 * プレビュー環境用 Basic認証チェック
 *
 * PREVIEW_AUTH=true の場合のみ認証を有効化する。
 * 認証不要またはパスした場合は null を返し、
 * 認証失敗時は 401 レスポンスを返す。
 */
export function checkBasicAuth(request: NextRequest): NextResponse | null {
  const previewAuth = process.env.PREVIEW_AUTH;

  if (previewAuth !== "true") {
    return null;
  }

  const authId = process.env.PREVIEW_AUTH_ID;
  const authPass = process.env.PREVIEW_AUTH_PASS;

  // ID/PASSが未設定の場合は安全側に倒してスキップ
  if (!authId || !authPass) {
    return null;
  }

  const authorization = request.headers.get("authorization");

  if (authorization) {
    const [scheme, encoded] = authorization.split(" ");

    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const [id, pass] = decoded.split(":");

      if (id === authId && pass === authPass) {
        return null;
      }
    }
  }

  return new NextResponse("Authentication required", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Preview"',
    },
  });
}
