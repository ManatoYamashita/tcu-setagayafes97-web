# microCMS の取得に失敗したときの扱い

`src/lib/{events,news,informations}.ts` の取得関数が、microCMS の失敗をどう返すかの契約。
#287 で「どの例外も `null` / `[]` に潰す」実装をやめた。

## 契約

| 状況                                                    | 詳細系（`get*ById`） | 一覧系（`get*List` ほか） |
| ------------------------------------------------------- | -------------------- | ------------------------- |
| 公開フラグが false / microCMS 未設定（CI）              | `null`               | `[]`                      |
| microCMS が「存在しない」と答えた（400 / 404）          | `null` → 404         | —                         |
| 本当に0件                                               | —                    | `[]`                      |
| **429 / 5xx / ネットワーク**（2回再試行しても回復せず） | **投げる**           | **投げる**                |
| 401 / 403（API キーの誤り）                             | **投げる**           | **投げる**                |

**呼び出し側で `null` や `[]` に潰してよいのは、`isMicrocmsNotFound()`（`src/lib/microcms.ts`）が
true のときだけ**である。例外を投げると、次のように振る舞う。

| 場面                                 | 結果                                                                  |
| ------------------------------------ | --------------------------------------------------------------------- |
| ビルド（`next build`）               | **ビルドが落ちる。** Vercel は直前のデプロイを配信し続ける            |
| 時間ベース ISR（`revalidate = 600`） | 再生成が失敗し、**古いページがそのまま配信され続ける**                |
| Webhook（`revalidatePath`）直後      | **500**（`error.tsx`）。キャッシュされず、microCMS が戻れば次で正常化 |

`src/app/sitemap.ts` だけは呼び出し側で例外を受け止め、該当 URL を欠いたまま出力する
（サイトマップの欠けは一時的で、ページ本体を壊さないため）。

## なぜ潰してはいけないか（実測）

2026-09-30、詳細取得（`/api/v1/events/<id>`）にだけ 429 を返す注入を
`NODE_OPTIONS=--require` で入れて測った。一覧の取得は成功するので、
「一覧には載っているのに詳細が取れない」状態を再現できる。

### ビルド

| コード | 注入                  | 結果                                                                   |
| ------ | --------------------- | ---------------------------------------------------------------------- |
| 修正前 | 常に 429              | **exit 0**。企画詳細 98 ページと著名人企画 1 ページが 404 で生成された |
| 修正後 | 常に 429              | exit 1（`/events` の事前描画で停止）                                   |
| 修正後 | 各 URL の初回だけ 429 | exit 0。再試行 197 回で全て回復し、404 は 0 ページ                     |
| 修正後 | なし                  | exit 0（再試行 0 回）                                                  |

### ISR（`next start` で実測。企画詳細1ページを観測）

| 経路                         | コード | 障害中                          | 障害から回復した後               |
| ---------------------------- | ------ | ------------------------------- | -------------------------------- |
| Webhook                      | 修正前 | **404 に置き換わり HIT で固定** | **404 のまま**（次の再検証まで） |
| Webhook                      | 修正後 | 500（キャッシュされない）       | 最初のアクセスで 200 に戻る      |
| 時間ベース（15秒へ一時変更） | 修正前 | **404 に置き換わる**            | **404 のまま**                   |
| 時間ベース（15秒へ一時変更） | 修正後 | 200（STALE。古いページを維持）  | 200                              |

**#287 で未検証だった「ISR の再生成で正常なキャッシュが 404 に置き換わる」は、実際に起きる。**
入稿と再検証が集中する開催当日前後に microCMS が 429 を返すと、実在する企画が
次の再検証まで 404 のまま残っていた。

## 判定は例外のメッセージを読む

SDK（microcms-js-sdk 3.2.0）はステータスをプロパティで渡さず、
`fetch API response status: 404` というメッセージでしか表現しない。
`isMicrocmsNotFound()` と `isMicrocmsRetryable()` はこの先頭を読む。
**SDK を上げたら、メッセージの形式が変わっていないかを `src/lib/microcms.test.ts` で確かめること。**

「存在しない」に 400 を含めるのは、ID として不正な値で 400 が返るためである
（2026-09-30 実測）。含めないと、URL から来たゴミの ID が 404 ではなく 500 になる。

| 入力（詳細取得）                  | ステータス |
| --------------------------------- | ---------- |
| 実在しない ID（英数・日本語とも） | 404        |
| 無効な `draftKey`                 | 404        |
| `..%2F..` のような不正な ID       | 400        |
| 不正な API キー                   | 401        |

## 再試行は自前で持つ — SDK の `retry: true` は Next.js の中で効かない

SDK には `createClient({ retry: true })` があるが、**Next.js の描画中は効かない。**
Next.js は描画1回の中で同じ URL への GET を `React.cache` で重複排除しており
（`next/dist/server/lib/dedupe-fetch.js`）、同じ URL で再試行すると最初の 429 が
そのまま返ってくる。実測では、初回だけ 429 を返す注入に対して SDK の再試行は
2回とも 429 を受けてビルドが落ちた（素の Node では同じ注入で2回目に成功する）。

そのため `microcmsGet()` が再試行を持ち、**2回目以降だけ**使い捨ての `AbortSignal` を付けて
重複排除を迂回する（`dedupe-fetch.js` は `signal` を持つリクエストを対象から外す）。
初回に付けないのは、`generateMetadata` とページ本体が同じ詳細を読むためで、
迂回するとリクエストが倍になって 429 を招く。

待ち時間は 2秒 → 5秒。合計を Vercel Free Plan の関数実行時間10秒の中へ収めてある。

## 検証するとき

**ビルドの前に `.next/cache/fetch-cache` を消すこと。** 前回のビルドで成功した取得結果が
Data Cache に残っており、消さないと microCMS へ1本も問い合わせずにビルドが通る
（2026-09-30 に「常に 429」の注入でも exit 0 になって気づいた）。

```bash
# 詳細取得にだけ 429 を返す注入（リポジトリには置いていない。下記は要旨）
#   globalThis.fetch を包み、/\.microcms\.io\/api\/v1\/events\/[^/?]+/ に 429 を返す
rm -rf .next/cache/fetch-cache
NODE_OPTIONS="--require ./inject-429.cjs" NEXT_PUBLIC_EVENTS_VISIBLE=true pnpm build
```

## 本番での確認（マージ後）

取得や 404 の扱いを変えたら、Production デプロイの完了後に次の2つを確かめる。
2026-09-30、#301 と #306 のマージ後にこの手順で確認した。

### 実在する URL は全件叩く

**実在する ID を1件だけ叩いても、「実在するページは 200」は示せない。** 壊れ方は
「一部のページだけ 404 で生成される」形で現れる（#287 では 98 ページ中の全てか一部）。
サイトマップに載っている詳細 URL を全件叩き、ステータスを集計する。

```bash
curl -s https://setagayafes.org/sitemap.xml \
  | grep -oE '<loc>[^<]*/(events|special|info)/[^<]+</loc>' | sed 's/<\/*loc>//g' \
  | while read -r u; do curl -s -o /dev/null -w '%{http_code}\n' "$u"; sleep 0.1; done \
  | sort | uniq -c
# 2026-09-30:  115 200（企画 98・著名人企画 1・info 16）
```

**全行が `200` なら合格。** 1件でも `404` があれば、そのページは 404 のまま事前描画されている。
0.1 秒間隔の115本では bot 対策は発動しなかった。**間隔を詰めないこと。**
`403` と `x-vercel-mitigated: challenge` が出たら、それはサイトの障害ではなく bot 対策である
（[ci-env.md](./ci-env.md)）。

存在しない ID のほうは代表だけでよい。`/events/e2e-no-such-event`・`/events/存在しないID`
（URL エンコードして叩く）・`/info/<不存在>`・`/special/<不存在>` がすべて 404 になること。
なお `/events/..%2F..` は **Vercel のエッジが 400 を返し、アプリへ届かない**。アプリの判定の確認には使えない。

### 404 画面の中身は実ブラウザで見る

**HTML を grep しても、404 画面の中身が表示されているかは判定できない。**
動的ルートの `not-found.tsx` は、そのルートの**実在するページの RSC ペイロードにも埋め込まれている**。
2026-09-30 の本番で、企画詳細 404 の目印（`data-event-not-found-illustration`）は
200 の企画ページの HTML にも1件ずつ入っていた。グローバル 404 の画像パス
（`/images/illustrations/404.avif`）に至っては全ページに入っている。

表示されているかは、実ブラウザで要素が可視かどうかで判定する。
判定の書き方は `e2e/not-found/event-detail.spec.ts` と同じで、本番の URL へ向けるだけでよい。

```js
// node で実行（@playwright/test はリポジトリの依存にある）
import { chromium } from "@playwright/test";
const browser = await chromium.launch();
const page = await browser.newPage({ reducedMotion: "reduce" });
for (const path of ["/events/e2e-no-such-event", "/events/0tal5owl37"]) {
  const response = await page.goto(`https://setagayafes.org${path}`);
  const img = page.locator("[data-event-not-found-illustration] img");
  console.log(path, response.status(), await img.isVisible());
}
await browser.close();
// 2026-09-30: 404 は true（natural 896px → 192px 表示）、実在する企画は false
```

## 再発防止

`pnpm build` の末尾で `scripts/assert-no-prerendered-404.mjs` が、`_not-found` 以外の
`.next/server/app/**/*.meta` に `"status": 404` が無いことを見る。
事前描画されるのは `generateStaticParams` が返した ID だけなので、そこに 404 があれば常に矛盾である。
取得関数の判定が将来ゆるめられたときの最後の網で、修正前のコードで注入したビルドは
この検査で 99 ページを検出して落ちる。

## 関連ドキュメント

- [microcms.md](./microcms.md) — microCMS API の制約と実装パターン
- [content-revalidation.md](./content-revalidation.md) — Webhook によるオンデマンド再検証
- [testing.md](./testing.md) — テスト方針

---

**最終更新日**: 2026-09-30（本番での確認手順を追加）
