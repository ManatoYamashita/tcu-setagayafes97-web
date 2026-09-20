import { describe, expect, it } from "vitest";
import { appImageLoader, isMicrocmsImage, resolveDelivery } from "@/lib/image-loader";

/**
 * 画像配信経路の契約（#237 / #241）
 *
 * ここで固定するのは「どの画像がどこへ行くか」であり、変換後の見た目ではない。
 * 本体は 1 点に尽きる。**どの画像も `/_next/image` を通らないこと。**
 * 通れば Vercel の変換枠を消費し、枯渇すれば 402 でその画像だけが壊れる。
 *
 * 2026-09-20 に `public/` の静的画像も対象へ入った。「静的画像は枠の 7% しか
 * 使わないので Vercel に残してよい」という #240 の判断は誤りで、**枠は総量で枯れる**
 * ため、消費の少なさは何も保護しなかった（オープナーのロゴが Retina で消えた）。
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
   * `public/` の静的画像は `unoptimized` で実体をそのまま配る。ここで固定するのは
   * 「直接使われたときに imgix のパラメータを勝手に足さない」という保険の挙動である。
   */
  it("public 配下の静的画像は素通しする（imgix のパラメータを足さない）", () => {
    expect(appImageLoader({ src: "/images/brand/logo.avif", width: 208, quality: 60 })).toBe(
      "/images/brand/logo.avif"
    );
  });

  it("ホスト名の前方一致で騙されない（別ホストは imgix 扱いしない）", () => {
    const lookalike = "https://images.microcms-assets.io.example.com/a.jpg";
    expect(appImageLoader({ src: lookalike, width: 340 })).toBe(lookalike);
  });
});

describe("isMicrocmsImage — AppImage の振り分け条件", () => {
  /*
   * `AppImage` はこの判定だけで配信経路を決める。true なら imgix で実行時変換、
   * false なら `unoptimized` で事前最適化済みの実体をそのまま配る。
   * **どちらも Vercel の変換枠を使わない。**
   */
  it("microCMS の配信ホストだけを true にする", () => {
    expect(isMicrocmsImage(MICROCMS_IMAGE)).toBe(true);
    expect(isMicrocmsImage("/images/brand/logo.avif")).toBe(false);
    expect(isMicrocmsImage("/materials/geers.avif")).toBe(false);
    expect(isMicrocmsImage("https://images.microcms-assets.io.example.com/a.jpg")).toBe(false);
    expect(isMicrocmsImage("http://images.microcms-assets.io/a.jpg")).toBe(false);
  });
});

describe("resolveDelivery — 配信経路の決定", () => {
  /*
   * `AppImage` の振り分けそのもの。**`AppImage` の中にインラインで書くと、
   * `loader` や `unoptimized` の指定が外れてもこのファイルは緑のまま通り、
   * 枠の消費が静かに復活する**（#237 で実際に起きた形）。ここで固定しておく。
   */
  it("microCMS の画像は imgix へ回す", () => {
    expect(resolveDelivery(MICROCMS_IMAGE)).toBe("imgix");
  });

  it("public/ の静的画像は実体をそのまま配る", () => {
    expect(resolveDelivery("/images/brand/favicon-white.avif")).toBe("raw");
    expect(resolveDelivery("/ogp.webp")).toBe("raw");
  });

  /*
   * 画像の静的 import は `{ src, width, height }` のオブジェクトで渡る。
   * microCMS の画像が静的 import で入ることはありえないので raw でよい。
   * （静的 import 自体は eslint.config.mjs の no-restricted-imports が禁じている。）
   */
  it("文字列でない src（静的 import）も実体配信の側へ落とす", () => {
    expect(resolveDelivery({ src: "/_next/static/media/a.avif", width: 10, height: 10 })).toBe(
      "raw"
    );
    expect(resolveDelivery(undefined)).toBe("raw");
  });

  it("ホスト名の前方一致で騙されない", () => {
    expect(resolveDelivery("https://images.microcms-assets.io.example.com/a.jpg")).toBe("raw");
  });
});
