import { describe, expect, it, vi } from "vitest";
import { isMicrocmsNotFound, isMicrocmsRetryable, withMicrocmsRetry } from "@/lib/microcms";

/**
 * SDK（microcms-js-sdk 3.2.0）が投げる例外のメッセージをそのまま再現する。
 * ステータスはメッセージでしか渡されない。
 */
function sdkError(status: number, message?: string): Error {
  return new Error(
    `fetch API response status: ${status}${message ? `\n  message is \`${message}\`` : ""}`
  );
}

describe("isMicrocmsNotFound", () => {
  it("404 と 400 は「存在しない」として扱う", () => {
    expect(isMicrocmsNotFound(sdkError(404, "Content is not found."))).toBe(true);
    expect(isMicrocmsNotFound(sdkError(404))).toBe(true);
    expect(isMicrocmsNotFound(sdkError(400))).toBe(true);
  });

  it("一時的な失敗は「存在しない」にしない（#287）", () => {
    expect(isMicrocmsNotFound(sdkError(429, "Too many requests, please try again later."))).toBe(
      false
    );
    expect(isMicrocmsNotFound(sdkError(500))).toBe(false);
    expect(isMicrocmsNotFound(sdkError(503))).toBe(false);
    expect(isMicrocmsNotFound(new Error("Network Error.\n  Details: fetch failed"))).toBe(false);
  });

  it("認証の失敗は設定の誤りであって「存在しない」ではない", () => {
    expect(isMicrocmsNotFound(sdkError(401))).toBe(false);
    expect(isMicrocmsNotFound(sdkError(403))).toBe(false);
  });

  it("4桁の数字や Error 以外の値を 404 と取り違えない", () => {
    expect(isMicrocmsNotFound(new Error("fetch API response status: 4040"))).toBe(false);
    expect(isMicrocmsNotFound("fetch API response status: 404")).toBe(false);
    expect(isMicrocmsNotFound({ message: "fetch API response status: 404" })).toBe(false);
    expect(isMicrocmsNotFound(undefined)).toBe(false);
  });
});

describe("isMicrocmsRetryable", () => {
  it("429 / 5xx / ネットワークエラーは再試行する", () => {
    expect(isMicrocmsRetryable(sdkError(429))).toBe(true);
    expect(isMicrocmsRetryable(sdkError(500))).toBe(true);
    expect(isMicrocmsRetryable(sdkError(503))).toBe(true);
    expect(isMicrocmsRetryable(new Error("Network Error.\n  Details: fetch failed"))).toBe(true);
  });

  it("404 / 400 / 401 は再試行しても結果が変わらないので再試行しない", () => {
    expect(isMicrocmsRetryable(sdkError(404))).toBe(false);
    expect(isMicrocmsRetryable(sdkError(400))).toBe(false);
    expect(isMicrocmsRetryable(sdkError(401))).toBe(false);
    expect(isMicrocmsRetryable("fetch API response status: 429")).toBe(false);
  });
});

describe("withMicrocmsRetry", () => {
  const noWait = (_ms: number) => Promise.resolve();

  it("一時的な失敗のあとに成功すれば、その値を返す", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const fetchOnce = vi
      .fn()
      .mockRejectedValueOnce(sdkError(429))
      .mockRejectedValueOnce(sdkError(503))
      .mockResolvedValueOnce("ok");

    await expect(withMicrocmsRetry(fetchOnce, noWait)).resolves.toBe("ok");
    // attempt が 0, 1, 2 と渡る（microcmsGet は 1 以降で重複排除を迂回する）
    expect(fetchOnce.mock.calls.map(([attempt]) => attempt)).toEqual([0, 1, 2]);
  });

  it("再試行し尽くしたら最後の例外を投げる", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const last = sdkError(429, "third");
    const fetchOnce = vi
      .fn()
      .mockRejectedValueOnce(sdkError(429))
      .mockRejectedValueOnce(sdkError(429))
      .mockRejectedValueOnce(last);

    await expect(withMicrocmsRetry(fetchOnce, noWait)).rejects.toBe(last);
    expect(fetchOnce).toHaveBeenCalledTimes(3);
  });

  it("404 は再試行せずにそのまま投げる", async () => {
    const notFound = sdkError(404);
    const fetchOnce = vi.fn().mockRejectedValue(notFound);
    const sleep = vi.fn(noWait);

    await expect(withMicrocmsRetry(fetchOnce, sleep)).rejects.toBe(notFound);
    expect(fetchOnce).toHaveBeenCalledTimes(1);
    expect(sleep).not.toHaveBeenCalled();
  });

  it("待ち時間は 2秒 → 5秒（合計が関数の実行上限10秒を超えない）", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    const sleep = vi.fn(noWait);
    await withMicrocmsRetry(vi.fn().mockRejectedValue(sdkError(500)), sleep).catch(() => {});

    expect(sleep.mock.calls.map(([ms]) => ms)).toEqual([2_000, 5_000]);
  });
});
