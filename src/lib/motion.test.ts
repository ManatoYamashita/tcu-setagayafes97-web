import { describe, expect, it } from "vitest";
import { isInSiteArrival } from "@/lib/motion";

/**
 * オープナーを「入口でだけ」再生するための判定。
 *
 * サイト内の遷移が Next.js のフォールバックでフルロードへ落ちたとき
 * （デプロイ後のビルドID不一致など）、遷移種別は `navigate`、referrer は
 * 直前のページになる。2026-10-04 に本番ビルドを2回作って実測した値である。
 */
const ORIGIN = "https://setagayafes.org";

describe("isInSiteArrival", () => {
  it("同一オリジンからの navigate はサイト内の移動とみなす（ビルドID不一致のフォールバック）", () => {
    expect(isInSiteArrival("navigate", `${ORIGIN}/access`, ORIGIN)).toBe(true);
  });

  it("同一オリジンからの back_forward もサイト内の移動とみなす", () => {
    expect(isInSiteArrival("back_forward", `${ORIGIN}/events?keyword=a`, ORIGIN)).toBe(true);
  });

  it("reload は referrer が同一オリジンでも入口とみなす（明示的な読み込み直し）", () => {
    expect(isInSiteArrival("reload", `${ORIGIN}/access`, ORIGIN)).toBe(false);
  });

  it("外部サイトからの navigate は入口とみなす", () => {
    expect(isInSiteArrival("navigate", "https://www.google.com/", ORIGIN)).toBe(false);
  });

  it("旧アーカイブなど別オリジンのサブドメインは入口とみなす", () => {
    expect(isInSiteArrival("navigate", "https://97th.setagayafes.org/", ORIGIN)).toBe(false);
  });

  it("referrer が空（URL直打ち・ブックマーク）は入口とみなす", () => {
    expect(isInSiteArrival("navigate", "", ORIGIN)).toBe(false);
  });

  it("URL として解釈できない referrer は入口とみなす", () => {
    expect(isInSiteArrival("navigate", "not a url", ORIGIN)).toBe(false);
  });

  it("navigation entry が取れない環境では入口とみなす", () => {
    expect(isInSiteArrival(undefined, `${ORIGIN}/access`, ORIGIN)).toBe(false);
  });
});
