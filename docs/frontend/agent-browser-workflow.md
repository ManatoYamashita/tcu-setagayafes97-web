# agent-browser ワークフロー

本ドキュメントでは、**agent-browser** を使用したデザイン再現・デバッグ・テストの標準フローを定義します。

---

## 概要

agent-browser は、参考サイトとローカル実装を **数値的・視覚的に比較** するための強力なツールです。このワークフローに従うことで、デザイン再現の品質を担保し、属人的な判断を排除できます。

**主要なユースケース:**

1. 参考サイトのレイアウト・スタイルの精密分析
2. ローカル実装との数値比較（Header高さ、z-index階層、viewport占有率）
3. レスポンシブデザインのクロスブラウザ・クロスviewportテスト
4. Layout Shift・z-index競合などのデバッグ

---

## 検証できないもの（先に読むこと）

**このツールでアニメーションの再生を検証してはいけません。** 手順ではなく、得られた結論を信じてよいかどうかの前提条件なので、測る前に読んでください。

### 自動化タブでは requestAnimationFrame が止まっている

ブラウザ自動化のタブは `visibilityState: "hidden"` のまま動きます。ブラウザは非表示タブの `requestAnimationFrame` を停止するため、**rAF 駆動のアニメーションは1フレームも進みません。**

対象は GSAP、Web Animations API、`requestAnimationFrame` を自前で回す実装すべてです。

### 測る前に測定系の生存確認をする

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

`framesIn1s: 0` なら、**そのタブで得たアニメーション関連の観測値はすべて無効**です。

> `await new Promise(res => requestAnimationFrame(res))` のように rAF で待つコードを書くと、rAF が死んでいる環境では永久に返らず CDP がタイムアウトします。待機は必ず `setTimeout` で行ってください。

### スクリーンショットが撮れることは反証にならない

CDP の `Page.captureScreenshot` はフレームを強制取得するため、**rAF が止まっていても静止画は返ります。** 「画面が描画されているのだからアニメーションも動いているはず」という推論は成り立ちません。

さらに厄介なことに、GSAP は `fromTo` の開始値を同期的に適用します。そのため静止画では**「アニメーション未開始」と「途中で止まった」が同じ見た目**になり、区別できません。

### 検証できるもの / できないもの

| 対象                                                  | 可否     | 備考                                                |
| ----------------------------------------------------- | -------- | --------------------------------------------------- |
| DOM 構造・クラス名・属性                              | 条件付き | `querySelectorAll` の件数など。ただし下記の例外あり |
| `href` / `aria-*` / `lang` などの静的な値             | 可       | セレクタや DOM プロパティ経由の確認も含む           |
| レイアウト（`getBoundingClientRect`、computed style） | 可       | ただしアニメーション**中**の値は不可                |
| CSS transition / GSAP の**最終状態**                  | 条件付き | 上の生存確認をパスした場合のみ                      |
| アニメーションの**再生そのもの**                      | **不可** | 実機で目視するしかない                              |

### 例外: DOM 構造そのものが rAF に依存することがある

DOM の件数を数えるだけの計測であっても安全とは限りません。**React の Suspense ストリーミングは、`<div hidden id="S:n">` に流し込んだ内容を本来の位置へ差し込む処理を `requestAnimationFrame` に積みます。** rAF が止まっていると差し込みが永久に走らず、前ページや fallback の DOM が残り続けます。

`framesIn1s: 0` の環境で「消えるはずのDOMが残っている」を観測したら、まず計測アーティファクトを疑ってください。詳細と実証手順は [page-transition.md](./page-transition.md) の「Issue #39 の誤診」を参照。

### 撮る前に有限長アニメーションを強制終了させる

本サイトはページ遷移ごとに `.page-transition-wrapper` を `opacity: 0` からフェードインさせます。rAF が止まった自動化タブではこれが開始状態のまま固まるため、**何もせずに撮ったスクリーンショットはページ本体が真っ白になります。**

計測・撮影の直前に、有限長のアニメーションだけを終了させてください。無限ループのアニメーション（スピナー、blob）に `finish()` を呼ぶと `InvalidStateError` になります。

```javascript
document.getAnimations().forEach((a) => {
  if (Number.isFinite(a.effect?.getComputedTiming?.().endTime)) {
    try {
      a.finish();
    } catch {}
  }
});
```

### 代替手段: 実機確認を依頼する

再生を確かめる必要があるなら、依頼するのが唯一の正解です。**どのURL・どの幅・何を操作し・何が見えるべきか**を具体的に書いてください。

> 例: `http://localhost:3000/info/guide` をウィンドウ幅 1024px 未満で開き、右上のハンバーガーを押してください。白いパネルが右からスライドし、項目5件と連番 01-05 が表示されれば正常です。

### 実例: 存在しないバグを起票してしまった事故

Issue #47 は「モバイルメニューが開かない」として起票されましたが、**実際には正常に動いており、誤報でした。**

観測された「証拠」（パネルが `xPercent: 100`、`--sm-num-opacity: 0`、ラベルが `yPercent: 140`）は、すべて `StaggeredMobileMenu.tsx` がアニメーション開始前に適用する**初期値**でした。rAF が停止していたため1フレームも進まず、初期状態が「壊れた最終状態」に見えていたのです。

このとき「変更前のコミットでも同じ値が出るので既存バグだ」という対照実験も行いましたが、**両方とも rAF が停止した同じ環境で測っていたため何も切り分けていませんでした。**

**測定系が壊れていれば、対照実験は何も証明しません。** 比較する前に、測定系そのものの生存を確認してください。

同じ事故は Issue #39 でも起きました。「クライアントサイド遷移後も前ページのDOMが残る」という報告でしたが、実体は rAF 停止で差し込みが止まった Suspense のストリーミングコンテナであり、原因として名指しされた `experimental.viewTransition` はそもそも Next.js から読まれてすらいない死に設定でした。経緯は [page-transition.md](./page-transition.md) にまとめています。

---

## デザイン再現 3ステップ

### Step 1: 参考サイト分析（Analyze）

**目的:** 参考サイトのレイアウト構造を **数値で** 把握する

**実施内容:**

1. agent-browserで参考サイトにアクセス
2. 主要要素（Header、Hero、Footer等）の高さ・位置を測定
3. z-index階層を可視化
4. viewport占有率を計算
5. スクリーンショット取得（複数viewport）

**例: Header高さ測定**

```javascript
// agent-browser eval コマンドで実行
const header = document.querySelector("header");
console.log("=== Header分析 ===");
console.log("Header高さ:", header.offsetHeight, "px");
console.log("position:", getComputedStyle(header).position);
console.log("z-index:", getComputedStyle(header).zIndex);
console.log("viewport占有率:", ((header.offsetHeight / window.innerHeight) * 100).toFixed(2), "%");
```

**例: Hero Section分析**

```javascript
const hero = document.querySelector("section"); // または適切なセレクタ
console.log("=== Hero Section ===");
console.log("Hero高さ:", hero.offsetHeight, "px");
console.log("Hero top位置:", hero.offsetTop, "px");
console.log("実効占有率:", ((hero.offsetHeight / window.innerHeight) * 100).toFixed(2), "%");
```

**スクリーンショット取得:**

```bash
agent-browser screenshot /tmp/reference-desktop.png --viewport 1920x1080
agent-browser screenshot /tmp/reference-tablet.png --viewport 768x1024
agent-browser screenshot /tmp/reference-mobile.png --viewport 375x667
```

---

### Step 2: ローカル実装（Implement）

**目的:** Step 1 で得た数値目標に基づいて実装

**実施内容:**

1. Header高さ、Hero配置、z-index階層を参考サイトに合わせる
2. CSS変数やTailwindクラスで調整
3. レスポンシブブレークポイントを考慮

**重要な設計パターン:**

- **Header/Hero統合:** `min-h-[calc(100vh-var(--header-height))]` でHeader高さを引いた実効100vhを実現
- **z-index管理:** 標準スケール（10/20/30/40/60）に従う（詳細は `layout-patterns.md` 参照）
- **レスポンシブ高さ:** `100vh` vs `100svh`（モバイルSafari対策）

---

### Step 3: 比較検証（Verify）

**目的:** 参考サイトとローカル実装の **数値的・視覚的一致** を確認

**実施内容:**

1. agent-browserでローカルサイト（`http://localhost:3000`）にアクセス
2. Step 1 と同じ測定コマンドを実行
3. 数値の差分を確認（許容誤差: ±2px程度）
4. スクリーンショットを並列表示して視覚比較

**例: ローカルサイト測定**

```javascript
const header = document.querySelector("header");
const hero = document.querySelector("section");

console.log("=== ローカル実装の検証 ===");
console.log("Header高さ:", header.offsetHeight, "px"); // 目標: 64px
console.log("Hero top位置:", hero.offsetTop, "px"); // 目標: 64px（Header直下）
console.log("Hero高さ:", hero.offsetHeight, "px"); // 目標: 1016px（1080 - 64）
console.log("実効占有率:", ((hero.offsetHeight / window.innerHeight) * 100).toFixed(2), "%"); // 目標: ~94%

// ✅ チェック
if (hero.offsetTop === header.offsetHeight) {
  console.log("✅ HeroがHeader直下から開始しています");
} else {
  console.warn(
    "⚠️ HeroがHeader直下から始まっていません（差分:",
    hero.offsetTop - header.offsetHeight,
    "px）"
  );
}
```

**スクリーンショット並列比較:**

```bash
# 参考サイトとローカルのスクリーンショットを並べて表示
open /tmp/reference-desktop.png /tmp/localhost-desktop.png
```

---

## 数値測定手法とコマンド集

### Header高さ測定

```javascript
const header = document.querySelector("header");
console.log("Header高さ:", header.offsetHeight, "px");
console.log("viewport占有率:", ((header.offsetHeight / window.innerHeight) * 100).toFixed(2), "%");
```

### Hero Section配置確認

```javascript
const hero = document.querySelector("section"); // または適切なセレクタ
console.log("Hero top位置:", hero.offsetTop, "px"); // Header直下なら header.offsetHeight と一致
console.log("Hero高さ:", hero.offsetHeight, "px");
console.log("Hero bottom位置:", hero.offsetTop + hero.offsetHeight, "px");
```

### z-index階層可視化

```javascript
// positioned要素（position: static以外）のz-index一覧
Array.from(document.querySelectorAll("*"))
  .filter((el) => {
    const style = getComputedStyle(el);
    return style.position !== "static" && style.zIndex !== "auto";
  })
  .map((el) => ({
    tag: el.tagName,
    class: el.className.slice(0, 50),
    zIndex: parseInt(getComputedStyle(el).zIndex),
    position: getComputedStyle(el).position,
  }))
  .sort((a, b) => b.zIndex - a.zIndex)
  .forEach((item) => console.table([item]));
```

### z-index競合の強調表示

```javascript
// z-50以上の要素を赤枠で強調（Header以外に存在すべきでない）
document.querySelectorAll("*").forEach((el) => {
  const zIndex = parseInt(getComputedStyle(el).zIndex);
  if (zIndex >= 50) {
    el.style.outline = "3px solid red";
    console.warn("⚠️ z-50以上の要素を検出:", el.tagName, el.className);
  }
});
```

### viewport占有率計算

```javascript
const element = document.querySelector("selector");
console.log("占有率:", ((element.offsetHeight / window.innerHeight) * 100).toFixed(2), "%");
```

---

## レスポンシブテスト標準手順

### テスト対象viewport

| デバイス | viewport  | 用途                    |
| -------- | --------- | ----------------------- |
| Mobile   | 375×667   | iPhone SE / 8 相当      |
| Tablet   | 768×1024  | iPad 相当               |
| Desktop  | 1920×1080 | 一般的なFHDディスプレイ |

### 各viewportでの確認項目

**共通チェック項目:**

- [ ] Header高さが適切（64px前後、viewport占有率 6%前後）
- [ ] Hero top位置 === Header高さ（Header直下配置）
- [ ] Hero実効高さ === viewport高さ - Header高さ
- [ ] z-index階層が正しい（Header: z-40、Hero内最上位: z-30以下）
- [ ] Layout Shiftが発生しない（CLS < 0.1）

**viewport別コマンド例:**

```javascript
const viewports = [
  { name: "Mobile", width: 375, height: 667 },
  { name: "Tablet", width: 768, height: 1024 },
  { name: "Desktop", width: 1920, height: 1080 },
];

// 各viewportでの測定（agent-browserでviewport変更後に実行）
const header = document.querySelector("header");
const hero = document.querySelector("section");

viewports.forEach((vp) => {
  console.log(`\n=== ${vp.name} (${vp.width}×${vp.height}) ===`);
  console.log("Header高さ:", header.offsetHeight, "px");
  console.log("Hero top:", hero.offsetTop, "px");
  console.log("一致:", hero.offsetTop === header.offsetHeight ? "✅" : "❌");
});
```

**スクリーンショット一括取得:**

```bash
agent-browser screenshot /tmp/localhost-mobile.png --viewport 375x667
agent-browser screenshot /tmp/localhost-tablet.png --viewport 768x1024
agent-browser screenshot /tmp/localhost-desktop.png --viewport 1920x1080
```

---

## デバッグワークフロー

### Layout Shift検出

**問題:** Header/Hero境界でのガタつき、スクロール時のズレ

**検出方法:**

```javascript
// CLS (Cumulative Layout Shift) 測定
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.value > 0.1) {
      console.warn("⚠️ Layout Shift検出:", entry.value, entry);
    } else {
      console.log("✅ Layout Shift良好:", entry.value);
    }
  }
}).observe({ type: "layout-shift", buffered: true });
```

**対策例:**

- Header高さを固定（CSS変数化）
- `min-h-[calc(100vh-var(--header-height))]` でHero高さを動的計算
- `pt-16`（または適切なpadding）でHeader高さ分を確保

### z-index競合確認

**問題:** Header要素とHero内要素が同じz-indexで競合、HTML順序に依存した不安定な重なり

**検出方法:**

```javascript
// z-40以上の要素を抽出（Header以外に存在すべきでない）
const highZIndexElements = Array.from(document.querySelectorAll("*")).filter((el) => {
  const style = getComputedStyle(el);
  return style.position !== "static" && parseInt(style.zIndex) >= 40;
});

console.log("z-40以上の要素数:", highZIndexElements.length);
highZIndexElements.forEach((el) => {
  console.log(el.tagName, el.className, "z-index:", getComputedStyle(el).zIndex);
});

// ✅ 期待値: Headerのみ（1要素）
// ❌ 問題: 複数要素が存在
```

**対策例:**

- `layout-patterns.md` の標準スケールに従う
- アドホックな値（`z-[45]`等）を排除
- Header: `z-40`、Hero内最上位: `z-30`、Hero内ベース: `z-20/10`

---

## よく使うagent-browserコマンド

### 基本操作

```bash
# ページにアクセス
agent-browser goto https://example.com

# JavaScriptコードを実行
agent-browser eval "console.log('Hello, World!')"

# スクリーンショット取得
agent-browser screenshot /tmp/screenshot.png --viewport 1920x1080

# viewport変更
agent-browser eval "window.resizeTo(375, 667)"
```

### 複合コマンド例

```bash
# 参考サイト分析 → スクリーンショット取得 → ローカル比較
agent-browser goto https://sumitomoexpo.com/
agent-browser eval "$(cat measure-header.js)"  # 測定スクリプトファイル
agent-browser screenshot /tmp/reference.png --viewport 1920x1080

agent-browser goto http://localhost:3000
agent-browser eval "$(cat measure-header.js)"
agent-browser screenshot /tmp/localhost.png --viewport 1920x1080
```

---

## まとめ

本ワークフローに従うことで:

- ✅ **デザイン再現の品質担保**: 参考サイトとの数値的一致を確認
- ✅ **属人的判断の排除**: 測定コマンドによる客観的評価
- ✅ **デバッグ効率向上**: Layout Shift、z-index競合の早期発見
- ✅ **レスポンシブテストの標準化**: 3 viewportsでの一貫した検証

**関連ドキュメント:**

- [layout-patterns.md](./layout-patterns.md) - Header/Hero統合パターン、z-index管理

---

**作成日:** 2026-02-07
**最終更新:** 2026-08-09
