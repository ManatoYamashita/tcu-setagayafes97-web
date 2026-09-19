import { test, expect, type Page } from "@playwright/test";

/**
 * 全ルートを1周して `<main id="content">` がちょうど1つあることを数える（#177 A の再発防止装置）
 *
 * ## なぜ要るのか
 *
 * `src/app/layout.tsx` は `<main>` を出さない。各ルートが自分で出す契約であり、
 * その契約は `docs/frontend/landmarks-and-skip-link.md` にしか書かれていない。
 * **足し忘れてもエラーも警告も出ない。** 実際に16ルート中12ルートで抜けたまま
 * 公開まで到達し、2026-09-05 の監査で初めて見つかった（#177 A）。
 * さらに #226 の初版では 404・エラー画面の4つを数え落とした。
 * **どちらも lint / 型 / ユニットテスト / build のすべてを通過している。**
 *
 * ## 生HTMLを数えてはいけない
 *
 * `curl | grep -c '<main'` は使えない。2026-09-19 に dev サーバで実測した値。
 *
 * | ルート                  | 生HTML | ライブDOM |
 * | ----------------------- | ------ | --------- |
 * | `/events`               | **2**  | 1         |
 * | `/events/<存在しないID>` | **0**  | 1         |
 *
 * `/events` は `<Suspense>` の fallback と解決済みチャンクが両方 HTML に載るため2つ数える
 * （ライブDOMでは入れ替わって1つ）。動的ルートの `notFound()` は先にシェルが送出され、
 * not-found の中身が後から差し込まれるため生HTMLには載らない。
 * **ブラウザで `document.querySelectorAll` を呼ぶ以外に正しく数える方法がない。**
 *
 * ## 秘密情報を要求しない
 *
 * microCMS を読む関数はすべて `isMicrocmsConfigured` で門を閉じ、失敗時も `[]` / `null` を
 * 返す（`src/lib/{news,events,sponsors}.ts`）。したがって secrets 無しでも全ルートが
 * 描画される。**fork からの PR でも結果が出る**という Layout E2E の性質を壊さない。
 *
 * 動的ルートは入稿データが無いので 404 になるが、**それは避けるべき事態ではなく
 * 検査したい対象そのもの**である（`not-found.tsx` にも `<main>` が要る）。
 */

/** 開発オーバーレイ（`<nextjs-portal>`）の中身は利用者のタブ順に含まれない */
const FOCUSABLE = 'a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])';

interface Route {
  readonly path: string;
  readonly label: string;
  /** 期待する HTTP ステータス。`notFound()` へ落ちるルートは 404 */
  readonly status: 200 | 404;
}

/**
 * 契約の対象は「URL」ではなく「Header が描画される画面」である。
 * `page.tsx` を持たない `not-found.tsx` / `error.tsx` もここに入る
 * （`docs/frontend/landmarks-and-skip-link.md`「404・エラー画面を数え落とさないこと」）。
 *
 * エラー境界（`error.tsx`）はブラウザから決定的に発火させられないため、この表に無い。
 * 2ファイルの分は目視とソースで担保している。**発火させる手段ができたら足すこと。**
 */
const ROUTES: readonly Route[] = [
  { path: "/", label: "トップ", status: 200 },
  { path: "/events", label: "企画一覧", status: 200 },
  { path: "/special", label: "著名人企画", status: 200 },
  { path: "/timetable", label: "タイムテーブル", status: 200 },
  { path: "/access", label: "アクセス", status: 200 },
  { path: "/info", label: "お知らせ一覧", status: 200 },
  { path: "/info/guide", label: "ご来場の方へ", status: 200 },
  { path: "/info/faq", label: "よくある質問", status: 200 },
  { path: "/info/pamphlet", label: "パンフレット", status: 200 },
  { path: "/info/contact", label: "お問い合わせ", status: 200 },
  { path: "/about", label: "委員会", status: 200 },
  { path: "/about/sponsors", label: "協賛", status: 200 },
  { path: "/about/privacy", label: "プライバシー", status: 200 },
  // 多言語レイアウト（`src/app/[locale]/layout.tsx`）を1本通す
  { path: "/en/about", label: "委員会（en）", status: 200 },
  // ここから下が #226 初版で抜けていた側
  { path: "/this-route-does-not-exist", label: "存在しないURL", status: 404 },
  { path: "/events/e2e-no-such-event", label: "企画詳細の見つかりません", status: 404 },
  { path: "/info/e2e-no-such-news", label: "お知らせ詳細の見つかりません", status: 404 },
  { path: "/special/e2e-no-such-special", label: "著名人企画の見つかりません", status: 404 },
];

/**
 * 測定系が生きていることの確認。
 *
 * スキップリンクは `Header` が全ルートで出すので、**1つも無いなら
 * 測っているのはこのアプリではない**（dev サーバの取り違え、ビルド失敗の代替表示など）。
 * これが無いと「main が1つ」という判定が偽陽性になりうる。
 *
 * **`locator.count()` で数えてはいけない。** 一度きりの評価なので、ストリーミングで
 * 後から差し込まれる画面では 0 を掴む。`/special/<存在しないID>` で実際に踏んだ
 * （2026-09-19。失敗時のスナップショットにはリンクが写っていた＝単なる早すぎる評価）。
 * `toHaveCount` は expect のタイムアウトまで自動で再試行する。
 */
async function assertRigAlive(page: Page) {
  await expect(
    page.locator('a[href="#content"]'),
    "スキップリンクが1つも無い＝Header が描画されていない（測定系が壊れている）"
  ).toHaveCount(1);
}

test.describe("ランドマークとスキップリンク", () => {
  for (const route of ROUTES) {
    test(`${route.label}（${route.path}）に main が1つだけある`, async ({ page }) => {
      const response = await page.goto(route.path);
      expect(response, `${route.path} への応答が無い`).not.toBeNull();
      expect(response!.status(), `${route.path} の HTTP ステータス`).toBe(route.status);

      await assertRigAlive(page);

      // 動的ルートの notFound() はシェル送出後に差し込まれるため、まず自動リトライする
      // アサーションで着地を待つ。**これが本体の判定である。**
      await expect(
        page.locator("main#content"),
        "main#content がちょうど1つでない（docs/frontend/landmarks-and-skip-link.md の契約）"
      ).toHaveCount(1);

      // 着地後に1回だけ網羅確認する。上の locator では拾えない
      // 「id の無い2つ目の main」「別要素の role=main」をここで落とす。
      const mains = await page.evaluate(() =>
        [...document.querySelectorAll("main, [role=main]")].map((el) => ({
          tag: el.tagName,
          id: el.id,
        }))
      );

      expect(mains, "main / role=main はこの1つだけであること").toEqual([
        { tag: "MAIN", id: "content" },
      ]);
    });
  }

  /**
   * スキップリンクが実際に働くこと。
   *
   * `<main>` が在るだけでは足りない。#226 初版では404画面で
   * 「リンクは出るが押しても何も起きない」状態になっていた。
   * 代表として通常ルートと404ルートを1本ずつ通す（全ルートで回すと
   * dev の初回コンパイルが積み上がり、ジョブ時間に見合わない）。
   */
  for (const route of [
    ROUTES.find((r) => r.path === "/timetable")!,
    ROUTES.find((r) => r.path === "/this-route-does-not-exist")!,
  ]) {
    test(`${route.label}でスキップリンクが本文へフォーカスを移す`, async ({ page }) => {
      await page.goto(route.path);
      await assertRigAlive(page);

      // 利用者のタブ順の先頭であること。開発オーバーレイは利用者には見えないので除く。
      await expect
        .poll(
          () =>
            page.evaluate((selector) => {
              const el = [...document.querySelectorAll<HTMLElement>(selector)].find(
                (node) => !node.closest("nextjs-portal")
              );
              return el ? `${el.tagName}[href=${el.getAttribute("href")}]` : "(none)";
            }, FOCUSABLE),
          { message: "最初のフォーカス可能要素がスキップリンクでない＝ヘッダーを飛ばせない" }
        )
        .toBe("A[href=#content]");

      // Tab は開発オーバーレイを掴むことがあるため、リンクを直接フォーカスして押す。
      // 検証したいのは「タブ順の先頭か」（上で確認済み）と「押して飛ぶか」の2点で、
      // 後者に Tab の経路は要らない。
      await page.locator('a[href="#content"]').focus();
      await page.keyboard.press("Enter");

      await expect
        .poll(
          () =>
            page.evaluate(() => {
              const el = document.activeElement;
              return el ? `${el.tagName}#${el.id}` : "(null)";
            }),
          {
            message: "Enter を押してもフォーカスが本文へ移らない＝遷移先の main が無いか id が違う",
          }
        )
        .toBe("MAIN#content");
    });
  }
});
