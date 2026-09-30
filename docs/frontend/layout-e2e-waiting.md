# E2E の待ち方（Playwright）

[layout-e2e.md](./layout-e2e.md) の実測アサーションが、**測定系の揺れに左右されないため**の決まりです。
不確定要素ごとの決定的な待ち方と、待ちの足りなさで実際に起きた事故（#309）を置きます。

関連: [layout-e2e.md](./layout-e2e.md)（装置の全体・構成・使い方） /
[browser-observation-limits.md](./browser-observation-limits.md)（実機目視との役割分担） /
[static-html-and-search-params.md](./static-html-and-search-params.md)（本番の `/timetable` が `S:` を経由しない理由）

---

## 原則 — 測ろうとしている値そのものを待たない

> [!IMPORTANT]
> `waitForFunction(() => column.height > 0)` と書いた瞬間、**#148 は「タイムアウト」ではなく
> 「検出できない」に化けます。** 独立した信号で待ち、幾何は一発勝負で測ること。

| 不確定要素                                | 採用した決定的な待ち方                                                                                      |
| ----------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| dev サーバの初回コンパイル                | `webServer.url` に `/timetable?...` を指定し、**テスト開始前**に 200 を確認する（`port:` では待ち足りない） |
| CSS の適用（dev は JS で注入する）        | `expect(hero).toBeVisible()`。素の DOM を測ると全要素 0px になる。**盤面とは独立した信号**                  |
| ストリーミングのシェルとハイドレーション  | `expect(getByText(FIXTURE_MARKER).first()).toBeAttached()`。企画はハイドレーション後にしか現れない          |
| Suspense の中身の差し替え（reveal、#309） | `expect(locator('div[hidden][id^="S:"]')).toHaveCount(0)`。**上の行だけでは足りない**（下記）               |
| オープナー（GSAP）                        | `contextOptions: { reducedMotion: "reduce" }`。**GSAP のチャンクごと読み込まれなくなる**                    |
| フォント                                  | `page.evaluate(() => document.fonts.ready)`                                                                 |

`waitForLoadState("networkidle")` は**使いません。** dev サーバでは HMR の WebSocket が
居るため来ない可能性があります。

## Suspense の中身は、まず `hidden` の中に届く（#309）

dev は `/timetable` を動的描画でストリーミングします。`<Suspense>` の中身は、まず `<body>` 直下の
`<div hidden id="S:0">` に届き、React が本来の位置へ**移します**（置き換えではなく同じノードの移動）。
**移される前でも要素は DOM に接続しているので `toBeAttached()` は通りますが、幅も高さも 0 を返します。**
フィクスチャ企画名の `toBeAttached()` は、この状態を素通りしていました。

`goto()` の既定である `load` を待つだけでも足りません。移すのはストリーム中の `$RC` ではなく、
`$RC` が予約する `$RV` だからです。予約の仕方は、シェル（fallback を含む最初の HTML）が
初めて描画されたフレームで記録される `$RT` の有無で分かれます。

| `$RC` が走った時点                         | `$RV` の予約                                                                            |
| ------------------------------------------ | --------------------------------------------------------------------------------------- |
| シェルがまだ描画されていない（`$RT` 無し） | `requestAnimationFrame`                                                                 |
| シェルが描画済み（`$RT` 有り）             | `$RT + 300ms` まで `setTimeout`（`performance.now()` が 2000〜2300ms なら 2300ms まで） |

実測（MutationObserver、11回）では、中身の挿入から 30〜47ms 後と 316〜335ms 後の二峰に分かれました。
**どちらもパースの外で走るので、`load` より後に差し替えが来る回があります。**

普段は、ヒーローの可視化や `fonts.ready` を待つ間に差し替えが終わっているので表に出ません。
順序が逆転した回だけ、幾何を1回だけ読むテストが 0 を拾います（2026-09-30 の午前に
`responsive-parity.spec.ts:87` が 11回中3回 `Received: 0` で落ち、その後の約100回は0回だった）。

ゲートは `gotoTimetable` の `goto()` の直後に置き、他の待ちの長さに依存させません。
`load` はストリームの終端より後に来るので、その時点で一時置き場はすべて DOM に揃っています。
よって「0個になる」は中身の到着前に素通りしません。
**測る値（幅・高さ）とは独立した信号**なので、冒頭の「原則」にも反しません。

退行注入（2026-09-30）: `addInitScript` で `$RV` を包み、差し替えを 1.5 秒遅らせた。

| ゲート | 全 E2E × 2回                                                                                           |
| ------ | ------------------------------------------------------------------------------------------------------ |
| なし   | **18件失敗**（desktop の盤面の実測8件 ＋ mobile の :87、各2回）。`board-geometry` の #148 本体も落ちる |
| あり   | 102件すべて通過                                                                                        |

> [!NOTE]
> **本番には無い経路です。** 本番の `/timetable` は静的HTMLで、この境界は
> `BAILOUT_TO_CLIENT_SIDE_RENDERING`（クライアント描画）になり、`S:` を経由しません。
> E2E が dev に対してのみ成立する（[layout-e2e.md](./layout-e2e.md)「`pnpm build && pnpm start` は原理的に使えない」）ことの
> 代償の1つです。

## `reducedMotion` のトレードオフ

`src/lib/motion.ts` の `willRunOpener()` が `prefers-reduced-motion` を見ているため、
これを立てるとオープナーは**動かないのではなく、存在しなくなります**。ポーリングより決定的です。

副作用としてオープナー演出そのものは検証対象外になります。rAF 依存の演出は実機目視の
領分（[browser-observation-limits.md](./browser-observation-limits.md) の判断表）なので、
役割分担として正しいと判断しました。

> [!NOTE]
> `reducedMotion` は `use` の直下ではなく **`use.contextOptions` の下**に置きます。
> 直下に書くと Playwright 1.62 では型エラーになります（`pnpm type-check` が検出します）。

## リトライしない

`retries: 0` を貫きます。リトライを入れると **#148 のような確定的なバグが
「たまに落ちるテスト」に見えて放置されます。** 落ちたら必ず原因を潰してください。

---

**作成日:** 2026-09-30（#318。[layout-e2e.md](./layout-e2e.md) から「待ち方」の節を分割）
