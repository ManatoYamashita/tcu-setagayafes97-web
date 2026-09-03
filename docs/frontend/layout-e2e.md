# レイアウトの実測アサーション（Playwright）

`/timetable` の盤面が実際に描かれているかを、実ブラウザで測る仕組みです。
**「E2E を増やしていく基盤」ではなく、#148 の再発防止装置**として作っています。

関連: [timetable-gantt.md](./timetable-gantt.md)（盤面の設計） /
[../dev/testing.md](../dev/testing.md)（ユニットテストの方針） /
[browser-verification-pitfalls.md](./browser-verification-pitfalls.md)（手動検証の落とし穴）

---

## なぜ実ブラウザが要るのか

#148 は `min-height` しか持たない親の下で `height: 100%` が `auto` に解決され、
盤面が 0px に潰れた事故です。**CSS の百分率高さが解決されるかはレイアウトエンジンの
仕事であり、型でもユニットテストでも表現できません。**

jsdom / happy-dom はレイアウトエンジンを持たず `getBoundingClientRect()` が常に 0 を
返すため、**この事故を原理的に検出できません。**

### Vitest Browser Mode を採らなかった理由

段階2で Vitest を入れているので追加依存が減りそうに見えますが、成立しません。

1. **依存は減らず増える。** Browser Mode は provider として `playwright` を必ず要求するため、
   `@vitest/browser` + `playwright` の2つが要る。`@playwright/test` 1つより多い
2. **別 URL へ遷移する E2E の道具ではない。** テストはブラウザ内のテストページで実行され、
   dev サーバの `/timetable` へ遷移するとランナー自身が破棄される
3. **決定的に重要 — #148 は「祖先の連鎖」のバグだった。** コンポーネントを孤立して
   マウントする方式では祖先の連鎖が本物と別物になり、**この事故を再現できない**

---

## `pnpm build && pnpm start` は原理的に使えない

`src/app/timetable/page.tsx` のフィクスチャ分岐はこうなっています。

```ts
const USE_FIXTURE =
  process.env.NODE_ENV !== "production" && process.env.NEXT_PUBLIC_TIMETABLE_FIXTURE === "1";
```

ここから3つが同時に導かれます。

1. `next build` / `next start` では `NODE_ENV` が `production` に固定されるので `USE_FIXTURE` は常に false
2. `process.env.NODE_ENV` はビルド時に定数置換されるため、分岐ごと到達不能コードになり
   **動的 import のチャンクごと生成されない。** 実行時に env を差し替えても読むべきチャンクが無い
3. 結果として `getEventsList()` が呼ばれ **microCMS のシークレットが必要**になる。
   しかも実データはステージ企画が1件で `place` はどのステージにも一致せず、
   **検証したいケース（レーン分割・密度差・レンジ拡張・その他列）が1つも存在しない盤面**になる

> [!CAUTION]
> **この分岐を production でも通るように変更してはいけません。** 検証用データを本番バンドルへ
> 入れないための意図的な設計です。テストの都合で崩すと、守りたかったものを壊します。

したがって E2E は `pnpm dev` に対してのみ成立します。これは制約であると同時に利点でもあり、
**secrets を要求しないので fork からの PR でも走る唯一のジョブ**になっています
（`Build Check` は secrets 不達で fork PR では必ず落ちます）。

代わりに失うものは「本番ビルド固有の壊れ方」の検出です。そこは既存の `Build Check` と
実機の確認に委ねます。

---

## 待ち方 — 測ろうとしている値そのものを待たない

> [!IMPORTANT]
> `waitForFunction(() => column.height > 0)` と書いた瞬間、**#148 は「タイムアウト」ではなく
> 「検出できない」に化けます。** 独立した信号で待ち、幾何は一発勝負で測ること。

| 不確定要素                               | 採用した決定的な待ち方                                                                                      |
| ---------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| dev サーバの初回コンパイル               | `webServer.url` に `/timetable?...` を指定し、**テスト開始前**に 200 を確認する（`port:` では待ち足りない） |
| CSS の適用（dev は JS で注入する）       | `expect(hero).toBeVisible()`。素の DOM を測ると全要素 0px になる。**盤面とは独立した信号**                  |
| ストリーミングのシェルとハイドレーション | `expect(locator("[data-timetable-event]")).toHaveCount(9)`。カードはハイドレーション後にしか現れない        |
| オープナー（GSAP）                       | `contextOptions: { reducedMotion: "reduce" }`。**GSAP のチャンクごと読み込まれなくなる**                    |
| フォント                                 | `page.evaluate(() => document.fonts.ready)`                                                                 |

`waitForLoadState("networkidle")` は**使いません。** dev サーバでは HMR の WebSocket が
居るため来ない可能性があります。

### `reducedMotion` のトレードオフ

`src/lib/motion.ts` の `willRunOpener()` が `prefers-reduced-motion` を見ているため、
これを立てるとオープナーは**動かないのではなく、存在しなくなります**。ポーリングより決定的です。

副作用としてオープナー演出そのものは検証対象外になります。rAF 依存の演出は実機目視の
領分（[browser-observation-limits.md](./browser-observation-limits.md) の判断表）なので、
役割分担として正しいと判断しました。

> [!NOTE]
> `reducedMotion` は `use` の直下ではなく **`use.contextOptions` の下**に置きます。
> 直下に書くと Playwright 1.62 では型エラーになります（`pnpm type-check` が検出します）。

### リトライしない

`retries: 0` を貫きます。リトライを入れると **#148 のような確定的なバグが
「たまに落ちるテスト」に見えて放置されます。** 落ちたら必ず原因を潰してください。

---

## テストが実際に何を捕まえるか（実測）

2026-09-03 に、実装を意図的に退行させて確認しました。**通ることは何も証明しません。**

| 退行させた内容                                                                                            | 落ちたテスト                                                                                                                               |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **#148 の忠実な再現**（列を `min-height` にし、`h-full` の中間ラッパを挟み、カードの縦位置を `%` へ戻す） | 時刻が縦座標へ写像されている（**期待 48 / 実際 0**）／企画が同一座標に重なっていない（9→7）／カード実寸 24px（実際 14）／溢れ（実際 75px） |
| 列から高さ指定を丸ごと削除                                                                                | 盤面に高さがある／レンジをステージ絞り込みの前に算出している                                                                               |
| 絞り込みを `extractStageId()` へ戻す                                                                      | 「その他」タブが空にならない（＋盤面が空になり多数）                                                                                       |
| ビューポートを 900px にする                                                                               | **「測定条件が満たされていない」という明示的なメッセージ**で落ちる                                                                         |

> [!WARNING]
> **列の `height` を `minHeight` へ変えるだけでは、どのテストも落ちません。**
> PR #154 が px の高さを**列そのもの**へ載せたため、`min-height` でも同じ used height が
> 出るからです。#148 を再現するには `h-full` の中間ラッパが要ります。
>
> そして**忠実に再現しても「盤面に高さがある」は緑のまま**です。潰れるのは列ではなく
> 中のラッパだからです。**「盤面が潰れる」と「座標が潰れる」は別の退行**であり、
> #148 を捕まえているのは「時刻が縦座標へ写像されている」のほうです。
> 2つを別テストに分けているのはこのためです。

### 偽陰性のガード

**1024px 未満では盤面が `display:none` になり `getBoundingClientRect()` が 0 を返します。**
つまり幅が足りないだけで、盤面が壊れていても全部緑に見えます。

`e2e/fixtures.ts` の共通フィクスチャが、毎回この3つを先に確かめます。

1. `window.innerWidth` が project の指定どおりか（違えば「測定条件が満たされていない」で落ちる）
2. ヒーローの高さが 0 でないか（`svh` が潰れていたら測定系そのものが壊れている）
3. フィクスチャ由来の企画名が存在するか（`reuseExistingServer` で別サーバを掴んでいないか）

---

## 構成

```
e2e/
├── fixtures.ts                      # 測定系の生存確認・共通フィクスチャ
└── timetable/
    ├── board-geometry.spec.ts       # 盤面高さ・座標の写像・レーン分割・レンジ  [desktop]
    ├── card-density.spec.ts         # カード実寸 24px・内容の溢れ              [desktop]
    ├── tabs-and-filtering.spec.ts   # 押下状態・その他タブ・レンジの算出元      [desktop]
    ├── scroll-containment.spec.ts   # 横スクロールが盤面内で完結               [desktop]
    └── responsive-parity.spec.ts    # 縦スタックへの切替と件数の一致           [mobile]
```

ビューポートは2つです。`desktop` の **1280px** は、盤面の最小幅 1152px（`72 + 6列 × 180`）に対して
スクローラが約 1070px となり、**横スクロールの検証が実際に成立する**幅として選んでいます。

`mobile` の 390px は `lg`(1024px) 未満で、盤面ではなく `TimetableStackedList` が出ます。
`desktop` project は `testIgnore` で `responsive-parity.spec.ts` を除外しています
（除外しないと desktop 幅でモバイル用の検証が走って落ちます）。

### 期待値は定数から導出する

盤面高さは `calculateBoardHeight()` を、1分あたりの px は `HOUR_HEIGHT_PX` を
`@/lib/timetable-layout` から import して計算しています。960 や 1.6 をベタ書きすると、
`HOUR_HEIGHT_PX` を変えたときにテストだけが取り残されます。

### `aria-pressed` はタブ群にスコープする

```ts
page.locator("[data-timetable-stage-tabs] button[aria-pressed='true']");
```

`document.querySelectorAll('button[aria-pressed=true]')` を素で数えてはいけません。
**開発サーバでは `AgentationDevTool` がオーバーレイを差し込みます**（`src/app/layout.tsx`）。
将来そこに押下状態のボタンが増えると、理由不明で落ちます。

---

## 使い方

```bash
# 初回のみ（ブラウザバイナリの取得。約100MB、リポジトリ外へ入る）
pnpm exec playwright install --only-shell chromium

pnpm test:e2e          # 実行（dev サーバは自動で起動・停止する）
pnpm test:e2e:ui       # 対話的に見る
```

> [!NOTE]
> **ローカルで回すときは 3000 番の dev サーバを止める必要はありません**（E2E は 3100 番を使います）。
> ただし 3100 番でフィクスチャ無しの dev サーバを別途動かしていると、`reuseExistingServer` が
> それを掴みます。その場合は共通フィクスチャが「フィクスチャが無効です」で止めます。

失敗したときは trace を見てください。DOM のスナップショットと操作履歴が入っています。

```bash
pnpm exec playwright show-trace test-results/<テスト名>/trace.zip
```

CI では `webServer.stdout: "pipe"` により **dev サーバのコンパイルログがジョブログに残る**ため、
「コンパイルが遅かった」のか「レイアウトが壊れた」のかを追加設定なしで切り分けられます。

---

## スコープと、増やすときの判断

対象は **`/timetable` の1ページだけ**です。これを「E2E の基盤ができた」と読んで
他ページへ広げると、誰も見ないジョブが育ちます。

足す価値があるのは、**#148 と同じ性質の失敗**――ビルドも型もユニットテストも通るのに、
ブラウザがレイアウトを解決したときにだけ壊れるもの――に限ります。

縮小するとしたら、捨てる順序は次のとおりです。

1. **横スクロールの完結**（`documentElement` 全体を見るため dev 限定の DOM 汚染に最も弱い）
2. モバイルの parity、カード実寸・溢れ
3. **最後まで残すのは「盤面に高さがある」と「時刻が縦座標へ写像されている」の2つ。**
   このページの機能そのものだからです

---

## 依存の追加について

`@playwright/test` は **devDependency 1本**、キャレット無しの完全固定です。
Chromium が上がるとカードの 1px 判定が動きうるため、更新は `CHORE:` の意図的な作業とし、
そのとき「内容がカードから溢れていない」を再検証してください。

| 観点           | 影響                                                                      |
| -------------- | ------------------------------------------------------------------------- |
| 本番バンドル   | **ゼロ**（`src/` から一切 import しない）                                 |
| 本番ランタイム | **ゼロ**                                                                  |
| Vercel の枠    | **消費しない**（帯域・関数実行時間・ビルド45分のいずれにも掛からない）    |
| GitHub Actions | public リポジトリのため無料枠の消費対象外                                 |
| 開発者ローカル | ブラウザバイナリ約100MB（`~/Library/Caches/ms-playwright`、リポジトリ外） |

> [!NOTE]
> **クライアントチャンクの中身は1箇所だけ変わります。** Next が `@playwright/test` を
> optional peer dependency として宣言しているため、pnpm の仮想ストア名
> （`next@16.1.0_..._@playwright+test@1.62.1_...`）が webpack ランタイムのパス文字列に載ります。
> Playwright のコードが入るわけではありません（実測: `@playwright/test` を含むチャンクは 0 件）。
> バンドルを差分で見たときに驚かないよう記録しておきます。

---

**作成日:** 2026-09-03（#157 段階3）
