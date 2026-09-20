import { describe, expect, it } from "vitest";
import { appImageLoader, isMicrocmsImage } from "@/lib/image-loader";

/**
 * 画像配信経路の契約（#237）
 *
 * ここで固定するのは「どの画像がどこへ行くか」であり、変換後の見た目ではない。
 * 本体は 1 点に尽きる。**microCMS の画像が `/_next/image` を通らないこと。**
 * 通れば Vercel の変換枠を消費し、枯渇すれば 402 で画像が壊れる。
 */

const MICROCMS_IMAGE =
  "https://images.microcms-assets.io/assets/e2c3a1c035834ec198750609b56213a0/814316fd3c0c47299569a32fc8f386c2/photo.jpg";

describe("appImageLoader — microCMS の画像", () => {
  it("Vercel の最適化エンドポイントを通さない（#237 の本体）", () => {
    const url = appImageLoader({ src: MICROCMS_IMAGE, width: 340, quality: 75 });
    expect(url).not.toContain("/_next/image");
    expect(url.startsWith("https://images.microcms-assets.io/")).toBe(true);
  });

  it("要求された幅と品質を imgix のパラメータへ渡す", () => {
    const url = new URL(appImageLoader({ src: MICROCMS_IMAGE, width: 828, quality: 60 }));
    expect(url.searchParams.get("w")).toBe("828");
    expect(url.searchParams.get("q")).toBe("60");
  });

  /*
   * CloudFront が Accept を落とすため `auto=format` が効かず、形式は固定するしかない。
   * AVIF を選んでいる理由（サポート下限・OGP 非経由・デコード実測）は image-loader.ts を参照。
   * ここを webp へ戻すときは、同じコミットで docs/frontend/image-delivery.md も直すこと。
   */
  it("フォーマットを AVIF へ固定する", () => {
    const url = new URL(appImageLoader({ src: MICROCMS_IMAGE, width: 340 }));
    expect(url.searchParams.get("fm")).toBe("avif");
  });

  it("fit=max で拡大を禁じる（原寸より大きい幅を要求されても水増ししない）", () => {
    const url = new URL(appImageLoader({ src: MICROCMS_IMAGE, width: 3840 }));
    expect(url.searchParams.get("fit")).toBe("max");
  });

  it("quality 未指定なら 75 を使う", () => {
    const url = new URL(appImageLoader({ src: MICROCMS_IMAGE, width: 340 }));
    expect(url.searchParams.get("q")).toBe("75");
  });

  it("パーセントエンコードされたファイル名を壊さない（入稿ファイル名は日本語が多い）", () => {
    const japanese = "https://images.microcms-assets.io/assets/x/y/%E5%86%99%E7%9C%9F%E9%83%A8.jpg";
    const url = appImageLoader({ src: japanese, width: 340 });
    expect(url).toContain("/%E5%86%99%E7%9C%9F%E9%83%A8.jpg?");
  });

  it("既存のクエリを持つURLでもパラメータを失わない", () => {
    const withQuery = `${MICROCMS_IMAGE}?rect=0,0,100,100`;
    const url = new URL(appImageLoader({ src: withQuery, width: 340 }));
    expect(url.searchParams.get("rect")).toBe("0,0,100,100");
    expect(url.searchParams.get("fm")).toBe("avif");
  });
});

describe("appImageLoader — それ以外の画像", () => {
  /*
   * このローダーは microCMS の画像にしか渡らない（`AppImage` が振り分ける）。
   * `public/` の静的画像は `loader` 無し = next/image の既定ローダーで
   * Vercel の最適化へ回る。ここで固定するのは「直接使われたときに
   * imgix のパラメータを勝手に足さない」という保険の挙動である。
   */
  it("public 配下の静的画像は素通しする（imgix のパラメータを足さない）", () => {
    expect(appImageLoader({ src: "/images/brand/logo.webp", width: 208, quality: 60 })).toBe(
      "/images/brand/logo.webp"
    );
  });

  it("ホスト名の前方一致で騙されない（別ホストは imgix 扱いしない）", () => {
    const lookalike = "https://images.microcms-assets.io.example.com/a.jpg";
    expect(appImageLoader({ src: lookalike, width: 340 })).toBe(lookalike);
  });
});

describe("isMicrocmsImage — AppImage の振り分け条件", () => {
  /*
   * `AppImage` はこの判定だけでローダーを渡すかを決める。true なら imgix、
   * false なら Vercel の最適化。**枠を焼いていたのは microCMS 側だけ**なので、
   * ここが false の画像まで最適化から外してはいけない（LCP 要素が 4.7 倍になる）。
   */
  it("microCMS の配信ホストだけを true にする", () => {
    expect(isMicrocmsImage(MICROCMS_IMAGE)).toBe(true);
    expect(isMicrocmsImage("/images/brand/logo.webp")).toBe(false);
    expect(isMicrocmsImage("/materials/geers.webp")).toBe(false);
    expect(isMicrocmsImage("https://images.microcms-assets.io.example.com/a.jpg")).toBe(false);
    expect(isMicrocmsImage("http://images.microcms-assets.io/a.jpg")).toBe(false);
  });
});
