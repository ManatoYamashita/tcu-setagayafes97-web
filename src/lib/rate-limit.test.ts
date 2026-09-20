import { describe, expect, it } from "vitest";
import { createRateLimiter, getClientIp } from "@/lib/rate-limit";

/** 時刻を手で進められるクロック */
function clock(start = 0) {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    },
  };
}

describe("createRateLimiter", () => {
  it("上限までは通す", () => {
    const limiter = createRateLimiter({ limit: 3, windowMs: 1000, now: clock().now });

    expect([limiter.take("a"), limiter.take("a"), limiter.take("a")]).toEqual([true, true, true]);
  });

  it("上限を超えたら拒否する", () => {
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: clock().now });
    limiter.take("a");
    limiter.take("a");

    expect(limiter.take("a")).toBe(false);
  });

  it("キーごとに独立している", () => {
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: clock().now });
    limiter.take("a");

    expect(limiter.take("b")).toBe(true);
  });

  it("時間が経つと連続的に回復する", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: time.now });
    limiter.take("a");
    limiter.take("a");
    expect(limiter.take("a")).toBe(false);

    // 半分の時間で1トークンぶん回復する
    time.advance(500);
    expect(limiter.take("a")).toBe(true);
    expect(limiter.take("a")).toBe(false);
  });

  it("拒否が続いても回復量を取りこぼさない", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 1, windowMs: 1000, now: time.now });
    limiter.take("a");

    // 拒否されるたびに updatedAt を進めると、この2回で回復がリセットされてしまう
    time.advance(400);
    expect(limiter.take("a")).toBe(false);
    time.advance(400);
    expect(limiter.take("a")).toBe(false);
    time.advance(400);
    expect(limiter.take("a")).toBe(true);
  });

  it("古いキーを掃除する（/api/contact の実装はここが無い）", () => {
    const time = clock();
    const limiter = createRateLimiter({ limit: 10, windowMs: 100, now: time.now });

    for (let i = 0; i < 300; i++) limiter.take(`ip-${i}`);
    expect(limiter.size()).toBe(300);

    // 掃除は 256 回に1度しか走らない。時間を進めてから十分に叩く
    time.advance(1000);
    for (let i = 0; i < 256; i++) limiter.take("live");

    expect(limiter.size()).toBe(1);
  });
});

describe("getClientIp", () => {
  it("x-forwarded-for の先頭を使う", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.1, 70.41.3.18" });

    expect(getClientIp(headers)).toBe("203.0.113.1");
  });

  it("x-real-ip へフォールバックする", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
  });

  it("どちらも無ければ unknown", () => {
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
