# ブラウザ観測の前提と限界

**ブラウザ自動化で「測ってよいもの」と「測れないもの」を判定するための前提条件をまとめます。**

手順ではなく判断基準です。**観測値を報告する前に、その値が信頼できるかどうかをここで確認してください。**

関連: [agent-browser-workflow.md](./agent-browser-workflow.md)（測定の手順） / [browser-verification-pitfalls.md](./browser-verification-pitfalls.md)（検証手順そのものが誤る例）

---

## 観測の前提を測る（先に読むこと）

**ブラウザ自動化の実行環境は一定ではありません。** 手順ではなく、得られた結論を信じてよいかどうかの前提条件なので、測る前に読んでください。

`visibilityState` が `"hidden"` で `requestAnimationFrame` が完全に停止しているセッションもあれば、`"visible"` で約 60fps 動くセッションもあります。同じ URL を同じ日に測っても、ツール・バージョン・ヘッドレスか否か・タブが前面かどうかで結果が変わります。

同一 Preview URL・同一日の実測例:

| 実行系                      | `visibilityState` | `framesIn1s` | view transition                  |
| --------------------------- | ----------------- | ------------ | -------------------------------- |
| `agent-browser` 0.13.0      | `visible`         | `60`         | 正常に完走（`ready` が resolve） |
| Chrome 拡張経由の自動化タブ | `hidden`          | `0`          | スキップ（`ready` が reject）    |

**「自動化だから動かない」とも「自動化でも動く」とも決めつけないでください。** 毎回測って分岐します。

### 手順1: 測定系の生存確認（必須）

```javascript
let frames = 0;
requestAnimationFrame(function tick() {
  frames++;
  requestAnimationFrame(tick);
});
// rAF ではなく setTimeout で待つ（rAF が死んでいてもここは返る）
await new Promise((r) => setTimeout(r, 1000));
({ visibilityState: document.visibilityState, framesIn1s: frames });
```

> `await new Promise(res => requestAnimationFrame(res))` のように rAF で待つコードを書くと、rAF が死んでいる環境では永久に返らず CDP がタイムアウトします。待機は必ず `setTimeout` で行ってください。

### 手順2: 結果で分岐する

| 観測                                               | アニメーション関連の観測値 | やること                                                       |
| -------------------------------------------------- | -------------------------- | -------------------------------------------------------------- |
| `framesIn1s: 0`                                    | **すべて無効**             | このセッションでの再生検証は諦め、実機確認を依頼する（後述）   |
| `framesIn1s > 0` かつ `visibilityState: "visible"` | 有効                       | 自動検証してよい。ただし `framesIn1s` を測定結果へ必ず併記する |

rAF が停止しているときに巻き込まれるのは、GSAP、Web Animations API、`requestAnimationFrame` を自前で回す実装、そして View Transitions API のすべてです。

**`framesIn1s` を書かない観測値は報告しないでください。** 後から誰も検算できず、Issue #47 / #39 と同じ事故になります。

### スクリーンショットが撮れることは生存確認にならない

CDP の `Page.captureScreenshot` はフレームを強制取得するため、**rAF が止まっていても静止画は返ります。** 「画面が描画されているのだからアニメーションも動いているはず」という推論は成り立ちません。手順1 の代用にしないでください。

さらに厄介なことに、GSAP は `fromTo` の開始値を同期的に適用します。そのため静止画では**「アニメーション未開始」と「途中で止まった」が同じ見た目**になり、区別できません。

### 検証できるもの / できないもの

| 対象                                                  | 可否     | 備考                                                            |
| ----------------------------------------------------- | -------- | --------------------------------------------------------------- |
| DOM 構造・クラス名・属性                              | 条件付き | `querySelectorAll` の件数など。ただし下記の例外あり             |
| `href` / `aria-*` / `lang` などの静的な値             | 可       | セレクタや DOM プロパティ経由の確認も含む                       |
| レイアウト（`getBoundingClientRect`、computed style） | 可       | ただしアニメーション**中**の値は手順2 の分岐に従う              |
| CSS transition / GSAP の**最終状態**                  | 条件付き | 手順1 の生存確認をパスした場合のみ                              |
| アニメーションの**再生そのもの**                      | 条件付き | `framesIn1s > 0` なら可。`0` なら不可（実機で目視するしかない） |
| 遷移中のクリック・hover などの操作                    | 条件付き | view transition 中は不可。理由は下記の View Transitions API 節  |

「条件付き」はすべて手順2 の分岐表に従います。**見た目の最終確認（意図どおり美しいか）は、いずれにせよ人間の目が要ります。** ここで「可」と書いているのは、数値として観測できるという意味だけです。

### 例外: DOM 構造そのものが rAF に依存することがある

DOM の件数を数えるだけの計測であっても安全とは限りません。**React の Suspense ストリーミングは、`<div hidden id="S:n">` に流し込んだ内容を本来の位置へ差し込む処理を `requestAnimationFrame` に積みます。** rAF が止まっていると差し込みが永久に走らず、前ページや fallback の DOM が残り続けます。

`framesIn1s: 0` の環境で「消えるはずのDOMが残っている」を観測したら、まず計測アーティファクトを疑ってください。詳細と実証手順は [page-transition.md](./page-transition.md) の「Issue #39 の誤診」を参照。

### 例外: `next/dynamic` の `ssr: false` は描画を検証できない

`framesIn1s: 0` の環境では、`ssr: false` の dynamic import の**描画**を検証できません（おすすめ企画セクションの 3D 歯車 `FeaturedGearScene` で実測）。

> [!WARNING]
> **症状は自動化ツールによって異なり、片方は「成功しているように見えます。」** `canvas` の存在確認だけで合格判定を出すと誤判定します。

| ツール                                         | `<canvas>` 要素    | drawing buffer                 | 見え方                                  |
| ---------------------------------------------- | ------------------ | ------------------------------ | --------------------------------------- |
| agent-browser（Playwright/Chromium）           | **マウントしない** | —                              | loading fallback が残る（明らかに失敗） |
| Claude in Chrome（実 Chrome の `hidden` タブ） | **マウントする**   | `300×150` のまま・全ピクセル 0 | **要素はあるので成功に見える**（罠）    |

#### agent-browser の症状: fallback で固まる

React 自体はハイドレート済み（`Object.keys(el).some(k => k.startsWith("__react"))` が true）にもかかわらず、11 秒待っても `<canvas>` はマウントされませんでした。

```html
<!--$!--><template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING"></template>
<!-- ここに loading fallback が出たまま -->
```

`$!` は「クライアント側で描き直すべき境界」を示すマーカーですが、その再描画が走りません。Issue #39 の `$RV` と同種の rAF 依存が疑われるものの、境界のコメントノードに `_reactRetry` は生えておらず、**手動で発火させる手段は見つかっていません。**

#### Claude in Chrome の症状: マウントするが1フレームも描かれない

実 Chrome では dynamic import が解決し、`<canvas>` が DOM に現れます。**しかし R3F は初期化されていません。** `Canvas` はコンテナサイズへのリサイズと描画をどちらも rAF 上で行うため、`hidden` タブでは HTML の既定サイズ `300×150` のまま、描画も 1 回も走りません。

```js
const c = wrapper.querySelector("canvas");
const gl = c.getContext("webgl2") || c.getContext("webgl");
const px = new Uint8Array(4);
gl.readPixels(c.width >> 1, c.height >> 1, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);

// R3F 未初期化のサイン（ラッパーが 470×470 なのに canvas が既定サイズ）
c.width === 300 && c.height === 150;
// 未描画のサイン
[...px].every((v) => v === 0);
```

`canvas` の存在は「マウントされた」ことしか意味しません。**`width`/`height` がコンテナ寸法へ追随しているか、`readPixels` が非ゼロを返すかまで見てください。**

**結論として、`framesIn1s: 0` の環境では `ssr: false` コンポーネントの描画は検証できません。** ラッパー要素の位置・サイズ・z-index・`aria-hidden`、`animate-*` の有無、横スクロールの発生といった**描画に依存しない指標**は検証できるので、そこまでを自動で確認し、回転・チルト・モーション軽減時の静止は実機確認に回してください。

### 例外: Claude in Chrome の `hidden` タブでは `vh` が 0 になる

`visibilityState: "hidden"` のタブでは、**ビューポート由来の単位（`vh` / `svh` / `dvh`）が 0 として評価されます。**

2026-08-16 に `/special/[id]` のヒーローで実測しました。`min-h-[60vh]` のセクションが高さ 0 に潰れ、その中の `next/image` の `fill`（絶対配置で親サイズに追随）も 0×0 になります。

| 計測系                       | `innerHeight` | ヒーロー高さ  | 背景画像 |
| ---------------------------- | ------------- | ------------- | -------- |
| Claude in Chrome（`hidden`） | —             | **0**         | **0×0**  |
| agent-browser 0.13.0         | 720           | 432（= 60vh） | 1280×432 |

**症状が「画像が表示されない」なので、画像の読み込み失敗と誤診します。** 実際には `naturalWidth > 0` で読み込みは成功しており、レイアウトが潰れているだけでした。

判別方法は単純です。

```js
// 親要素の高さが 0 なら、画像ではなくレイアウトを疑う
element.getBoundingClientRect().height;
// 画像自体の読み込みは naturalWidth で見る（レイアウトと独立）
img.naturalWidth > 0;
```

**`vh` / `svh` / `dvh` を使うページの検証には agent-browser を使ってください。**

## BFCache の観測

戻る・進むの挙動を検証するとき、BFCache（bfcache）が効いた復帰と、ドキュメントが再作成された復帰は**まったく別の経路**です。取り違えると「防御が効いた」と「そもそも BFCache が起きていない」を区別できません。

### 落とし穴1: Vercel preview では測れない

プレビューデプロイは `vercel.live` のフィードバック iframe を注入します。これがクロスオリジンで BFCache を阻害するため、**preview URL では BFCache が絶対に効きません。**

```js
performance.getEntriesByType("navigation")[0].notRestoredReasons;
// => { reasons: [{ reason: "masked" }],
//      children: [{ src: "https://vercel.live/_next-live/feedback/feedback.html" }] }
```

`reason: "masked"` はクロスオリジンフレームが理由を隠しているサインです。`children` に犯人が出ます。**BFCache の検証はローカル本番ビルド（`pnpm build && pnpm start`）で行ってください。** レスポンスヘッダに `Cache-Control: no-store` が付いていないことも先に確認します（付いていると Chrome は BFCache を使いません）。

### 落とし穴2: `navigation.type` は判定に使えない

BFCache 復帰後の `PerformanceNavigationTiming.type` は **`"back_forward"` ではなく元の `"navigate"` のまま**です（復帰したエントリは元の navigation そのものだから）。`"back_forward"` が返るのは**ドキュメントが再作成された**ときです。逆に読むと判定が反転します。

### 判定の3点セット

描画に依存しない指標だけで判定します（`framesIn1s: 0` の環境でも使えます）。

```js
// 離脱前に仕込む
window.__probe = "ALIVE";
addEventListener("pageshow", (e) => (window.__persisted = e.persisted));
document.querySelector(".page-transition-wrapper").dataset.probeNode = "NODE-A";
```

```js
// 戻ったあとに読む
({
  bfcacheHit: window.__probe, // "ALIVE" なら JS コンテキストが生存＝BFCache
  persisted: window.__persisted, // true なら pageshow が persisted で発火
  sameNode: document.querySelector(".page-transition-wrapper").dataset.probeNode, // 同一なら再マウントなし
});
```

1. **プローブ生存** — `window` 上の値が残っていれば BFCache ヒット。
2. **`pageshow.persisted`** — アプリ側の防御が見ている当の値。
3. **DOM ノード同一性** — `dataset` のマーカーが残っていれば再マウントされていない。

必ず**対照**を先に取ってください。「同一ドキュメント内の戻るで期待どおり変化する」ことを示してから「BFCache 復帰では変化しない」を主張しないと、単に検証コードが壊れているだけかもしれません。

### 落とし穴3: rAF を await するとタブごと死ぬ

`framesIn1s` を測るコードを `hidden` なタブで実行すると `requestAnimationFrame` が二度と発火せず、`await` が永久に解決しません。CDP がタイムアウトし、**レンダラが凍結してタブが落ちます**（実際に落としました）。バックグラウンドタブでは rAF を待つ計測を実行しないこと。`setTimeout` はスロットリングされつつも解決します。

**これは agent-browser 固有ではありません。** Claude in Chrome（実 Chrome を CDP で駆動）でも同じで、`hidden` タブで rAF を `await` したところ `Runtime.evaluate` が 45 秒でタイムアウトしました。

**順序を守ってください。** `visibilityState` を**同期評価**で先に読み、`"visible"` を確認できてから `framesIn1s` を測ります。逆にすると測定そのものでタブを失います。

```js
// 1. まずこれだけを同期で読む（rAF に触らない）
({ visibilityState: document.visibilityState, hasFocus: document.hasFocus() });
// 2. "visible" だったときだけ framesIn1s を測る
```

## View Transitions API の観測

本サイトのページ遷移は React の `<ViewTransition>`（`src/app/template.tsx`）で実装されています。挙動は `visibilityState` で真っ二つに分かれます。

| 観測項目                         | `visible`（rAF 生存）        | `hidden`（rAF 停止）                            |
| -------------------------------- | ---------------------------- | ----------------------------------------------- |
| `document.startViewTransition()` | 呼ばれる                     | 呼ばれる                                        |
| `transition.ready`               | **resolve**（実測 43〜55ms） | `InvalidStateError` で **reject**               |
| `transition.updateCallbackDone`  | resolve                      | resolve（DOM 更新は正常に適用される）           |
| `transition.finished`            | resolve（実測 約 370ms）     | 即座に解決。アニメーションは 1 フレームも出ない |
| アニメーションの検証             | **可能**                     | 不可                                            |

`hidden` での `ready` reject は、仕様上**非表示ドキュメントの view transition がスキップされる**ことによるものです。**これをバグとして起票しないでください。** 配線と対応範囲の確認手順は [page-transition.md](./page-transition.md) の「自動化環境での view transition の挙動」にあります。

**遷移中はクリックが一切通りません。** キャプチャされた要素は hit-test の対象から外れるため、`visible` な環境であっても `transition.finished` まで待たずにクリックすると空振りします。連続遷移を自動化するときは `finished` を待つか、合計時間（現在 0.3 秒）以上のウェイトを入れてください。

なお、リンク遷移ではページ本体に CSS アニメーションが掛からないため、スクリーンショットが真っ白になることはありません。**ただし戻る・進む（履歴遷移）の直後 0.18 秒だけは例外です。** `.page-transition-wrapper` に `.page-enter-history` が付いて `opacity: 0` から立ち上がるため、このタイミングで撮ると本文が薄く写ります。履歴遷移の直後にスクリーンショットを撮るときは 200ms 以上待ってください（理由は [page-transition.md](./page-transition.md) の「履歴遷移（戻る・進む）」）。

`hidden` では GSAP やスピナーなど他の rAF 駆動アニメーションが止まります。有限長のものだけ強制終了させたい場合はこれを使ってください（無限ループに `finish()` を呼ぶと `InvalidStateError` になります）。

```javascript
document.getAnimations().forEach((a) => {
  if (Number.isFinite(a.effect?.getComputedTiming?.().endTime)) {
    try {
      a.finish();
    } catch {}
  }
});
```

### 代替手段: `framesIn1s: 0` なら実機確認を依頼する

手順1 で rAF の停止が確認できた場合、再生を確かめる方法は依頼しかありません。**どのURL・どの幅・何を操作し・何が見えるべきか**を具体的に書いてください。

> 例: `http://localhost:3000/info/guide` をウィンドウ幅 1024px 未満で開き、右上のハンバーガーを押してください。白いパネルが右からスライドし、項目5件と連番 01-05 が表示されれば正常です。

### 実例: 存在しないバグを起票してしまった事故

以下の 2 件はいずれも **`framesIn1s: 0` の環境で測られた**ものです。手順1 を踏んでいれば、どちらも起票前に潰せました。

Issue #47 は「モバイルメニューが開かない」として起票されましたが、**実際には正常に動いており、誤報でした。**

観測された「証拠」（パネルが `xPercent: 100`、`--sm-num-opacity: 0`、ラベルが `yPercent: 140`）は、すべて `StaggeredMobileMenu.tsx` がアニメーション開始前に適用する**初期値**でした。rAF が停止していたため1フレームも進まず、初期状態が「壊れた最終状態」に見えていたのです。

このとき「変更前のコミットでも同じ値が出るので既存バグだ」という対照実験も行いましたが、**両方とも rAF が停止した同じ環境で測っていたため何も切り分けていませんでした。**

**測定系が壊れていれば、対照実験は何も証明しません。** 比較する前に、測定系そのものの生存を確認してください。

同じ事故は Issue #39 でも起きました。「クライアントサイド遷移後も前ページのDOMが残る」という報告でしたが、実体は rAF 停止で差し込みが止まった Suspense のストリーミングコンテナであり、原因として名指しされた `experimental.viewTransition` はそもそも Next.js から読まれてすらいない死に設定でした。経緯は [page-transition.md](./page-transition.md) にまとめています。

---

---

**作成日:** 2026-02-07（agent-browser-workflow.md から分離: 2026-08-16）
