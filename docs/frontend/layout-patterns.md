# レイアウトパターンと設計原則

本ドキュメントでは、Header/Hero統合、z-index管理、absolute/fixed/sticky使い分けなど、フロントエンド開発における標準的なレイアウトパターンを定義します。

---

## Header/Hero統合パターン

### 問題: HeroSectionがHeader高さを考慮していない

**典型的な実装（問題あり）:**

```tsx
// Header.tsx
<header className="sticky top-0 z-50 py-4">...</header>

// HeroSection.tsx
<section className="min-h-screen relative">...</section>
```

**問題点:**

- `min-h-screen`（100vh相当）でviewport全体を占有
- Header（sticky top-0、約64px）の分だけコンテンツがはみ出る
- スクロール時のlayout shift
- モバイルでのURLバー表示/非表示時の挙動不安定

**視覚的な問題:**

```
┌─────────────────┐
│ Header (64px)   │ ← sticky top-0, z-50
├─────────────────┤
│                 │
│  HeroSection    │ ← min-h-screen (100vh)
│  (1080px)       │    Header分がはみ出る
│                 │
└─────────────────┘
```

---

### 解決策: calc()による実効100vh + CSS変数化

**ステップ1: Header高さをCSS変数化**

**ファイル:** `src/app/globals.css`

```css
:root {
  /* レイアウト定数 */
  --header-height: 4rem; /* 64px (py-4 × 2 + 内容物高さ約32px) */
}
```

**ステップ2: HeroSectionで calc() を使用**

**ファイル:** `src/components/home/HeroSection.tsx`

```tsx
<section className="w-full min-h-[calc(100vh-4rem)] pt-16 relative ...">{/* ... */}</section>
```

**解説:**

- `min-h-[calc(100vh-4rem)]`: viewport高さからHeader高さ（64px）を引いた実効100vh
- `pt-16`: Header高さ分（64px）のpadding-topを確保し、Header直下からコンテンツを開始

**結果:**

```
┌─────────────────┐
│ Header (64px)   │ ← sticky top-0, z-40
├─────────────────┤
│                 │
│  HeroSection    │ ← min-h-[calc(100vh-4rem)] (1016px)
│  (1016px)       │    pt-16でHeader直下から開始
│                 │
└─────────────────┘
合計: 1080px (100vh)
```

---

### Header高さ変更時の注意

**重要:** Header.tsx の `py-4` を変更する場合、以下を同期すること:

1. `globals.css` の `--header-height` を更新
2. `HeroSection.tsx` の `pt-16` を調整

**例: py-4 → py-6 に変更した場合**

```css
/* globals.css */
:root {
  --header-height: 5rem; /* 80px (py-6 × 2 + 内容物約32px) */
}
```

```tsx
/* HeroSection.tsx */
<section className="min-h-[calc(100vh-5rem)] pt-20 ...">
```

**変更漏れ防止策:**

- Header.tsx にコメントで警告を記載（推奨）

```tsx
/**
 * IMPORTANT: padding変更時は globals.css の --header-height も更新すること
 * 現在: py-4 (1rem × 2) + 内容物約32px = 64px (4rem)
 */
export function Header() {
```

### `--header-height` は2状態ヘッダーの近似値である

Header は `isAtTop` で高さが変わる2状態コンポーネントである。
`--header-height`（現在 `5.5rem` = 88px）はこの2状態の中間に置かれた近似値であり、
どちらの実測値とも一致しない。

| 状態                      | 内訳                                     | 実測高さ  |
| ------------------------- | ---------------------------------------- | --------- |
| `isAtTop`（スクロール前） | `pt-0` + `py-3`×2 + ロゴ `h-[83px]`      | **107px** |
| スクロール後（ピル型）    | `pt-2` + `py-3`×2 + ロゴ `h-[45px]`      | **77px**  |
| `--header-height`         | 変数定義（コメントはロゴ56px前提で古い） | 88px      |

このため `calc(100svh - var(--header-height))` のヒーローは、
初期表示（`isAtTop`）で下端が折り返し線の **約19px下** に沈む。
下寄せレイアウトのヒーローでも `pb-10`（40px）程度の下パディングがあれば
中身は画面内に残るため実用上の問題はないが、
**「ヒーロー下端がぴったり折り返し線に一致する」前提の実装をしてはいけない。**

厳密な一致が必要になった場合は、変数を1つの静的値で持つ方式自体を見直すこと
（`isAtTop` の状態を CSS 変数へ書き出す等）。ヒーロー側で個別に数値を
ハードコードして辻褄を合わせるのは、変更漏れを増やすだけなので禁止する。

### 全画面ヒーローの実装は3箇所で統一する

`HeroSection`（トップ）・`AboutHero`（委員会）・`SpecialHero`（著名人企画LP）は
いずれも `calc(100svh - var(--header-height))` を使う。

Header は `sticky` であり **フロー上に高さを占有する**。
`fixed` ではないため、ヒーローに単純な `100svh` を与えると
ヘッダーの高さぶんだけ全体が下へ押し出され、下端が画面外へ出る。
特に `SpecialHero` は `items-end` でロゴと主催者名を下寄せするため、
`min-h-svh` にすると初期表示でロゴが切れる（813×656 で実測: ロゴ下端が3px、
主催者名は全体が画面外）。

`SpecialHero` のみ `h` ではなく `min-h` を使う。
長いアーティスト名がロゴ画像なしで入稿された場合に、
高さを固定するとテキストが溢れるためである。

---

## z-index管理とレイヤー構造

### 標準スケール

本プロジェクトでは、以下のz-index標準スケールに従うこと:

| レイヤー      | z-index | 用途                                       | Tailwind class |
| ------------- | ------- | ------------------------------------------ | -------------- |
| Modal/Overlay | 60      | モーダル、トーストメッセージ、オーバーレイ | `z-60`         |
| Sticky Header | 40      | 固定ヘッダー、グローバルナビゲーション     | `z-40`         |
| Floating UI   | 30      | Hero内最上位要素（円形バッジ、SCROLL等）   | `z-30`         |
| Content Upper | 20      | テキストエリア、カードの上位レイヤー       | `z-20`         |
| Content Base  | 10      | 画像、背景、カードのベースレイヤー         | `z-10`         |
| Default       | auto    | 通常のコンテンツ（z-index指定不要）        | -              |

**ルール:**

- ✅ 上記スケールの値のみを使用（10刻み）
- ❌ アドホックな値（`z-[45]`、`z-25`等）は禁止
- ❌ 同一レイヤー内での競合を避ける（例: Header以外でz-40以上を使用しない）

---

### HeroSectionでのz-index設計（修正前/後）

**修正前（問題あり）:**

```tsx
// Header.tsx
<header className="z-50">...</header>

// HeroSection.tsx
<div className="z-30">テキストエリア</div>
<div className="z-20">画像エリア</div>
<div className="z-[45]">円形バッジ</div>  ← アドホック値
<div className="z-50">SCROLL TO EXPLORE</div>  ← Headerと競合
<div className="z-50">SNSアイコン</div>  ← Headerと競合
```

**問題点:**

- `z-[45]`: 標準スケール外のアドホック値
- `z-50`: Header（z-50）と同一レイヤーで競合
- HTML順序に依存した不安定な重なり

---

**修正後（推奨）:**

```tsx
// Header.tsx
<header className="z-40">...</header>

// HeroSection.tsx
<div className="z-20">テキストエリア</div>
<div className="z-10">画像エリア</div>
<div className="z-30">円形バッジ</div>
<div className="z-30">SCROLL TO EXPLORE</div>
<div className="z-30">SNSアイコン</div>
```

**改善点:**

- ✅ Header: `z-40`（Sticky Headerレイヤー）
- ✅ Hero内最上位: `z-30`（Floating UIレイヤー）
- ✅ Hero内ベース: `z-20/10`（Content Upper/Baseレイヤー）
- ✅ アドホック値の排除

---

### z-index競合の検出方法

**agent-browserで確認:**

```javascript
// z-40以上の要素を抽出（Header以外に存在すべきでない）
const highZIndexElements = Array.from(document.querySelectorAll("*")).filter((el) => {
  const style = getComputedStyle(el);
  return style.position !== "static" && parseInt(style.zIndex) >= 40;
});

console.log("z-40以上の要素数:", highZIndexElements.length); // 期待値: 1（Headerのみ）
highZIndexElements.forEach((el) => {
  console.log(el.tagName, el.className, "z-index:", getComputedStyle(el).zIndex);
});
```

**期待値:**

- z-40以上の要素数: **1**（Headerのみ）
- Hero内要素はすべてz-30以下

---

## absolute/fixed/sticky使い分け

### position プロパティの特性

| position   | 配置基準                   | スクロール挙動         | 用途例                       |
| ---------- | -------------------------- | ---------------------- | ---------------------------- |
| `static`   | 通常フロー                 | 通常                   | デフォルト                   |
| `relative` | 通常位置からのオフセット   | 通常                   | absolute子要素の基準点       |
| `absolute` | 最も近いpositioned親要素   | 親要素に追従           | Hero内の浮遊要素（バッジ等） |
| `fixed`    | viewport                   | 画面固定（追従しない） | モーダル、トースト           |
| `sticky`   | 最も近いスクロールコンテナ | 閾値まで通常、以降固定 | スティッキーヘッダー         |

---

### ユースケース別ガイド

#### 1. Sticky Header（グローバルナビゲーション）

**要件:**

- ページトップでは通常配置
- スクロール時に画面上部に固定
- 常に最前面（z-40）

**実装例:**

```tsx
<header className="sticky top-0 z-40 bg-white shadow-md">{/* ナビゲーション内容 */}</header>
```

---

#### 2. Hero内の浮遊要素（円形バッジ、SCROLL TO EXPLORE等）

**要件:**

- Hero Section内の特定位置に配置
- Heroとともにスクロール
- Hero内で最上位（z-30）

**実装例:**

```tsx
<section className="relative min-h-[calc(100vh-4rem)]">
  {/* 円形バッジ */}
  <div className="absolute -top-6 -right-6 z-30">
    <img src="..." alt="..." />
  </div>

  {/* SCROLL TO EXPLORE */}
  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30">
    <p>SCROLL TO EXPLORE</p>
  </div>
</section>
```

**ポイント:**

- 親要素（section）に `relative` を指定し、absolute子要素の基準点とする
- `top/right/bottom/left` で配置位置を指定
- `z-30` でHero内最上位レイヤー

---

#### 3. モーダル・オーバーレイ

**要件:**

- 画面全体を覆う
- スクロールしても固定
- すべての要素より前面（z-60）

**実装例:**

```tsx
<div className="fixed inset-0 z-60 bg-black/50 flex items-center justify-center">
  <div className="bg-white p-8 rounded-lg">{/* モーダル内容 */}</div>
</div>
```

---

## 百分率の高さは親の height が確定しているときだけ

`height: %`（Tailwind の `h-full`）は、**親の高さが確定しているときにしか解決されない。**
`min-height` は親の高さを確定させないため、次は `0px` になる。

```tsx
<div className="relative" style={{ minHeight: "600px" }}>  {/* height を持たない */}
  <div className="h-full">                                  {/* → 0px */}
    <div style={{ top: "37.5%", height: "18.75%" }} />      {/* → 全部 0px 基準 */}
```

タイムテーブルのガント盤面はこれで全企画が同一座標に重なっていた（#148）。
絶対配置の子しか持たない要素は、高さが `auto` に落ちた時点で 0 になる。

**座標計算を伴う面は、高さを数値（px）で持たせること。** 詳細と、そこから派生する
`overflow-x: auto` / `sticky` の制約は [timetable-gantt.md](./timetable-gantt.md) を参照。

---

## 同じ寸法を CSS と JS が別々に持たない

ある寸法を **CSS 側（Tailwind クラス）と JS 側（定数）の両方が持っている**とき、
それは1つの値ではなく、たまたま今は一致している2つの値である。
**片方だけ変えられる構造になっている時点で、いずれ食い違う。**

コメントで「両方を合わせること」と書いても防げない。守るべきなのは規律ではなく構造で、
**実体を1つにして、もう片方をそこから導出させる**しかない。

### 実例1: 親の高さ（#148）

盤面の高さを CSS（`min-height`）が持ち、子の座標を JS（`top: %`）が持っていた。
`min-height` は高さを確定させないため `%` が解決されず、全企画が同一座標へ潰れた。

→ 高さの実体を JS の数値に一本化し、`style={{ height: 数値 }}` で CSS へ渡す。

### 実例2: カード間の余白（#154）

カード間の余白を CSS（`pb-1`）が持ち、密度判定の閾値計算を JS（`CARD_GAP_PX`）が持っていた。
どちらも 4px だが繋がっておらず、判定側が「枠」と「カード実寸」を取り違えていることに
気付ける仕組みが無かった。

```tsx
// 悪い: 4px が2箇所にあり、片方だけ動かせる
<div className="absolute px-1 pb-1" style={{ height: slotPx }}>
  <Card density={getCardDensity(slotPx)} />   {/* pb-1 を引いていない */}

// 良い: 実体は定数1つ。CSS はそこから受け取る
<div className="absolute px-1" style={{ height: slotPx, paddingBottom: CARD_GAP_PX }}>
  <Card density={getCardDensity(slotPx)} />   {/* 内部で CARD_GAP_PX を引く */}
```

### 判断の手順

1. その寸法を使う箇所を全て挙げる。CSS クラス・インラインスタイル・JS 定数を区別する
2. 2箇所以上が**独立に**値を持っていれば、実体をどちらか一方へ寄せる
3. 寄せ先は原則 JS 側。計算に使えて、`tsc` が参照の取り残しを見つけられる
4. Tailwind クラスで表現できなくなることを損失と考えない。
   **クラス名の統一より、値が1つであることのほうが強い保証である**

なお、Tailwind の任意値（`h-[var(--x)]`）で CSS 変数を経由させる手もあるが、
その値を JS 側でも計算に使うなら、変数を介さず数値を直接渡すほうが追跡しやすい。

---

## レスポンシブ高さ計算

### 100vh vs 100svh

**問題:** モバイルSafariでは `100vh` がURLバーを含む高さとなり、実際の表示領域より大きい

**解決策:**

| 単位     | 説明                    | 対応ブラウザ       | 推奨用途                 |
| -------- | ----------------------- | ------------------ | ------------------------ |
| `100vh`  | Viewport Height（標準） | 全ブラウザ         | デスクトップ             |
| `100svh` | Small Viewport Height   | モダンブラウザのみ | モバイル（将来的に推奨） |
| `100dvh` | Dynamic Viewport Height | モダンブラウザのみ | URLバー追従が必要な場合  |

**現在の推奨実装（2026年2月時点）:**

```css
/* デスクトップ・タブレット */
.hero {
  min-height: calc(100vh - var(--header-height));
}

/* モバイル（将来的にsvh対応） */
@media (max-width: 768px) {
  .hero {
    min-height: calc(100svh - var(--header-height));
  }
}
```

**注意:**

- `100svh` は Safari 15.4 / Chrome 108 以降で利用できる
- **`100vh` へのフォールバックは書かなくてよい。** 本プロジェクトの下限は
  TailwindCSS v4 が要求する Safari 16.4 / Chrome 111 であり、`svh` の対応範囲は
  それより広い。二重定義は無意味に規則を増やすだけである
- プロジェクトのブラウザ対応要件（iOS 16.4 以上、Chrome最新2バージョン）を確認

---

## タブレット帯（640〜1023px）の取りこぼし

### 問題: `lg:` 一段階だけでレイアウトを切り替えると 640〜1023px が全てモバイル扱いになる

`flex flex-col lg:grid lg:grid-cols-12` のように **`lg` の1段階だけ**でレイアウトを分岐させると、
1024px 未満の全てが「モバイル用の縦積み」になる。375px を想定して書いたスタイルが
1023px でもそのまま適用されるため、以下が同時に破綻する。

`ChairpersonSection`（About）で実際に起きた症状:

| 症状                         | 原因                                       | 実測値                                                         |
| ---------------------------- | ------------------------------------------ | -------------------------------------------------------------- |
| 円形画像が巨大化             | `aspect-square w-full` に幅制約なし        | 641px 幅で **545×545px**、1023px 幅で **927×927px**            |
| 本文の1行が長すぎる          | 幅制約なしで全幅に伸びる                   | `text-base` が 1023px で **58字/行**（日本語の適正は35〜45字） |
| 画像のはみ出しが途中で止まる | `-mr-8`(32px) と `sm:px-12`(48px) が不揃い | sm 以上で右端まで **16px 足りない**                            |
| 見出しが痩せる               | `text-3xl lg:text-5xl` で中間段階なし      | 927px 幅に 30px の見出し                                       |

### 対策

1. **幅の決まらない画像には必ず `w-*` / `max-w-*` を置く。**
   `aspect-square` / `aspect-[4/3]` は比率を決めるだけで、幅は親任せになる。

   ```
   w-24 sm:w-28 lg:w-full   ← 各帯で実寸を決める
   ```

2. **`sizes` をブレークポイントと突き合わせる。**
   `sizes="(max-width: 1024px) 100vw, 25vw"` は 96px のアバターに 640px 超の画像を
   要求してしまう。実際の CSS px から逆算する。

   ```
   sizes="(min-width: 72rem) 330px, (min-width: 64rem) 30vw, 112px"
   ```

3. **本文には `max-w-2xl` 等の measure 制限を置く。**
   lg のカラム幅がそれを下回るなら lg では no-op になるので副作用がない。
   意図を明示するため `lg:max-w-none` を併記しておくと、将来コンテナ幅を広げても壊れない。

4. **負のマージンは左右パディングと対で増やす。**
   `px-8 sm:px-12` なら `-mr-8 sm:-mr-12`。

5. **文字サイズは `sm:` を挟んで3段階にする。** `text-3xl sm:text-4xl lg:text-5xl`

### `aspect-ratio` × `max-height` の落とし穴

`aspect-[4/3] max-h-64` は「幅から高さを算出 → `max-height` でクランプ」となり、
**比率が破れて横長になる**。意図した比率で見せたいなら `max-h-*` ではなく `max-w-*` で絞る。

さらに、ブレークポイントで比率を切り替える場合は **反対側の制約を必ず解除する**。

```
aspect-[4/3] max-h-64 sm:max-h-80 lg:aspect-square lg:max-h-none
                                                   ^^^^^^^^^^^^^ 必須
```

`lg:max-h-none` を忘れると、コンテナ幅が `max-h` を超えた時点で正円が楕円に潰れる。
上の例では **1024px では潰れず 1152px 以上でだけ 325×320 に潰れる**ため、
1024px だけ確認して見落としやすい。**必ず 1152px 以上でも実測すること。**

### DOM 2枚持ちを避ける（`lg:hidden` + `hidden lg:block`）

形状差が Tailwind のバリアントだけで表現できるなら、DOM を1ノードに統合する。

```
{/* Before: 同じ画像を2ノードで持ち、二重管理になっていた */}
<div className="lg:hidden">        ... aspect-[4/3] rounded-l-2xl ...
<div className="hidden lg:block">  ... aspect-square rounded-full ...

{/* After: 1ノード */}
<div className="aspect-[4/3] rounded-l-2xl lg:aspect-square lg:rounded-full">
```

`rounded-l-2xl` → `lg:rounded-full` のようにロングハンド→ショートハンドの上書きになる場合でも、
Tailwind v4 はレスポンシブバリアントをベース層より後に出力するため意図どおり上書きされる。

帯域面の実利もある。`display:none` の `<img>` も Chromium は fetch するため、
2ノード構成では `sizes` の異なる `/_next/image` リクエストが**2本**飛んでいた。

**例外: 形状差がインラインスタイルに載っている場合。** インラインスタイルには
レスポンシブバリアントが無く、JS でブレークポイントを見て切り替えると
ハイドレーション不整合とレイアウトシフトを招く。タイムテーブルの盤面（絶対配置）と
縦スタック（通常フロー）がこれに当たる。その場合は DOM を分けたうえで、
**モデルの計算とカードコンポーネントを共有して重複をコンテナだけに閉じ込める**
（[timetable-gantt.md](./timetable-gantt.md)）。

### 補足: グリッド座標配置と DOM 順は独立

`lg:col-start-*` / `lg:row-start-*` で**全ての表示アイテムが行・列とも確定配置**されている場合、
CSS Grid の auto-placement（文書順を参照するフェーズ）は実行されない。
したがって **DOM 順を並べ替えても lg のレイアウトは変わらない**。

これを使えば `order-*` を導入せずに「lg 未満だけ表示順を変える」が実現できる。

```
DOM順:  ... → 挨拶ヘッダー → 署名(写真+氏名) → 本文
lg未満: この順に縦積み（写真が本文の上に来る）
lg以上: 座標指定どおり（本文=col 3-7 / 署名=col 8-11 が横並び）
```

なお `lg:gap-y-0` を使っている場合、行をまたぐ間隔は自動では入らない。
新しい行を追加したら `lg:pb-*` などで明示的に間隔を作ること。

---

## 部分幅ヒーロー画像の境界処理

### 問題: オーバーレイのカラーストップが画像の配置位置と噛み合っていない

共通ヒーロー `src/components/ui/PageHero.tsx` は、`lg` 以上で画像を `lg:w-[70vw]` の右寄せに配置する。
つまり**画像の左端はビューポートの 30% 位置**に固定される。

当初のオーバーレイは `to right, secondary 20%, secondary/0.85 35%, transparent 65%` だった。
30% 地点の不透明度は約 0.90 にとどまり画像を覆いきれず、さらに 35% 以降で急速に透明化するため、
画像の矩形の左辺が縦線として知覚されていた。

### 解決策: 画像側を `mask-image` で溶かし、オーバーレイは可読性に専念させる

境界を塗り潰して隠すのではなく、画像自体の左端を透明へフェードさせる。辺が物理的に存在しなくなる。

```css
/* 画像レイヤー: 左端22%（画像幅70vwに対する比 = 約15vw）をフェード */
@media (min-width: 64rem) {
  .page-hero-image-fade {
    -webkit-mask-image: linear-gradient(to right, transparent 0%, #000 22%);
    mask-image: linear-gradient(to right, transparent 0%, #000 22%);
  }
}
```

### 設計上のルール

1. **画像の配置位置とグラデーションのストップ位置を必ず突き合わせる。**
   `70vw` 右寄せなら左端は 30%。オーバーレイはそれより右（33%）まで不透明を維持する
2. **境界隠しをオーバーレイに兼任させない。**
   オーバーレイの本務はテキストの可読性確保。両方を1つのグラデーションで担わせると、
   可読性を上げれば画像が潰れ、画像を見せれば境界が出る、というトレードオフに陥る
3. **グラデーションの終端は `transparent` ではなく同色の alpha 0 を使う。**
   意図が明確になり、補間経路が確実にその色に留まる
4. **ブレークポイントで方向が変わるオーバーレイは、DOM を2枚持たずCSSのメディアクエリで切り替える。**
   `lg:hidden` と `hidden lg:block` の2枚構成は二重管理になる
5. **`mask-image` 非対応環境（iOS 15.0〜15.3 等）を前提に、マスクは「上乗せ」として設計する。**
   マスクが無視されてもオーバーレイ単体で境界が隠れる値にしておけば、グレースフルに劣化する

### 実装箇所

- `src/app/globals.css` の `@layer utilities` — `.page-hero-image-fade` / `.page-hero-overlay`
- `src/components/ui/PageHero.tsx` — 上記クラスの適用のみ。色値はCSS側へ集約し、`--color-secondary` の複製を持たない

---

## 幅の梯子は1本にする（`/events/[id]` の実例）

`1980d1b`（2026-09-04）が1ページの中に **4種類の `max-w-*` を同居させた**。
1640px 幅で左端が `32 / 180 / 244 / 308px` に割れ、スクロールすると内容の左端が飛び跳ねた。

| 層              | 当時の指定             | 左端 |
| --------------- | ---------------------- | ---- |
| パンくず inner  | `max-w-7xl`            | 180  |
| シート `<main>` | `mx-4 sm:mx-6 lg:mx-8` | 32   |
| シート inner    | `max-w-6xl`            | 244  |
| `<article>`     | `max-w-5xl`            | 308  |

**ハウス標準は `PageSheetLayout.tsx` の1本だけである。**
シート = `mx-4 sm:mx-6 lg:mx-8` / 内側 = `mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8`。
本文だけを絞りたいなら、その内側にさらに `max-w-3xl` 等の measure 制限を置く。
**器の幅を層ごとに変えて絞ってはいけない。**

### 揃えるのは器の左端であって、中身の左端ではない

幅の梯子を1本にする目的は**器の左端を1本にする**ことである。器の中身まで
一律に左端へ寄せる規則ではない。

- **トラックを埋める要素**（`aspect-*` / `w-full` で幅いっぱいになる画像・本文・見出し）
  → 左端は器の左端と自動的に一致する。何もしなくてよい
- **トラックを埋めない固定サイズ要素**（ロゴ、アイコン、バッジ、小さなイラスト）
  → **中央、または均衡の取れる位置へ置く。** 左端へ寄せると反対側にだけ空白が寄り、
  「揃えた」つもりで不格好になる

判断の基準は「見出しか否か」ではなく、**その要素がトラックを埋めるか否か**である。

実例: `/events/[id]` のアイコンサムネイル（`EventDetail.tsx` の `isIconThumbnail` 分岐。
`lg:h-52 lg:w-52` = 208px 固定）を 485〜667px のトラックで `justify-start` にしたところ、
右側にだけ 277〜459px の空白が残った（`f483bf1` で入れ、`458aea1` で撤去）。
中央配置なら 1153px 幅で左右とも 175px になる。同じ器でも写真サムネイルが問題にならないのは、
`lg:aspect-[4/3]` がトラック幅いっぱいに広がるためである。

### シートの外側に置いた節は、シートと同じ `mx-*` を持たせる

これが最も見落とされる。`RelatedEvents` はシート（`<main>`）の**外**にあるため、
内側のパディングだけ揃えても左端は一致しない。シートが持つ `mx-4 sm:mx-6 lg:mx-8` の分だけ
ずれる。

```
シートの中身の左端 = mx-* + px-*
シート外の節の左端 = px-*          ← mx-* のぶん足りない
```

**しかも広い画面ではずれが縮む。** `max-w-*` が効いて中央寄せになった幅
（`vw ≥ 1344px`）では、外枠の左端が **`W/2 - 640` に収束して外側インセットに依存しなくなる**
ためである。残るのは内側パディングの差だけになる。

修正前（`section: px-4` / `div: max-w-7xl sm:px-2 lg:px-4`）と、
修正後のシート（`mx-4 sm:mx-6 lg:mx-8` / `max-w-7xl px-4 sm:px-6 lg:px-8`）の見出し左端:

| viewport | シート内の見出し | 関連企画の見出し | 判定      |
| -------- | ---------------- | ---------------- | --------- |
| 390px    | 32               | 16               | ずれ 16px |
| 820px    | 48               | 24               | ずれ 24px |
| 1024px   | 64               | 32               | ずれ 32px |
| 1440px   | 112              | 96               | ずれ 16px |

> [!WARNING]
> **内側パディングだけ先に揃えると、広い画面で完全一致してしまう。**
> 上の表の途中で `div` を `px-4 sm:px-6 lg:px-8` へ直すと、1440px は 112 対 112 になる。
> 外枠が `W/2 - 640` で一致しているところへ内側パディングまで揃うので、
> **`mx-*` が無いままでも 1440px では完璧に見える。** ここで確認を打ち切ると、
> 1280〜1366px の一般的なノートPCに 32px のずれを残したまま出荷することになる。
> 確認は必ず `max-w-*` が効かない幅（1344px 未満）を含めること。

修正は外側の節にも `mx-4 sm:mx-6 lg:mx-8` を持たせること。修正後は
パンくず・シート・関連企画の3つが全幅で一致する（実測: 390/820/1024/1153/1280/1440/1920px
のいずれもずれ 0px）。

上表は本番CSSをコンパイルし、幅を指定した iframe へ流し込んで
`getBoundingClientRect().left` を読んだ値である。**iframe はメディアクエリを自前の幅で
評価するため、ウィンドウをリサイズせずに複数幅を同時に測れる。** ただし
`source(none)` + `@source` の構成では**修正前にしか無いクラス（`sm:px-2` など）が
本番CSSに出力されない**。比較用の実測をするときは、両方の状態のクラスを列挙した
ダミーを `@source` へ足してからコンパイルすること。これを忘れると、
規則が存在しないだけなのに「上書きされた」と読み違える。

### 全幅の背景を持つ節は、内側に `mx-*` の層を挟む

同じページのパンくず `<nav>` がこれに当たる。白帯を画面いっぱいに敷く必要があるため
`<nav>` 自体には `mx-*` を置けない。**背景を持つ要素と、幅を決める要素を分ける。**

```jsx
<nav className="bg-white py-4">          {/* 白帯は全幅のまま */}
  <div className="mx-4 sm:mx-6 lg:mx-8"> {/* シートと同じ外側インセット */}
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
```

`<nav>` の内側へ `px-8 sm:px-12 lg:px-16` のように**パディングを倍にして代用してはいけない。**
狭い幅では合うが、`max-w-*` が効く幅では外枠が `W/2 - 640` に収束したうえで
パディング差がそのまま残るため、今度は広い側が 32px ずれる。

### 重ねるための負のマージンは、重ねる相手がいる場所にだけ置く

`PageSheetLayout` の `-mt-6` は、シートを `PageHero` の上へ 24px 食い込ませるための指定である。
`/events/[id]` にはヒーローが無く、シートの直前にあるのはパンくずの白帯だけだった。
そこへ `md:-mt-6` を写経した結果、**md 以上の全幅でパンくずがシートに 24px 覆われた**
（実測 2026-09-05、768 / 1024 / 1153 / 1440px のいずれも 24px。パンくず文字の下端 40px に対し
シート上端 32px で、文字そのものが欠けていた）。767px 以下では `md:` が効かないため無傷で、
**モバイルだけ見ていると気づけない。**

負のマージンを写経するときは、**重ねる相手がその位置に実在するか**を必ず確認する。

## モバイルの全幅ブリードは `lg` で必ず解除する

`-mx-4 -mt-10 sm:-mx-6 lg:-mx-8 lg:-mt-16` のような負のマージンは
**「その要素がシートの最上部を占める」ことを前提にした指定**である。
同じ要素が `lg` で2カラムグリッドのセルになるなら、**`lg:mx-0 lg:mt-0` で解除しなければ
トラックを超過して隣の列へめり込む**（実測: トラック558pxに対し画像622px、
`gap-12` の48pxが16pxまで潰れた）。

角丸も同様に、`rounded-t-2xl rounded-b-none` はシート最上部専用である。

### Tailwind v4 の出力順は「変種群 → プロパティ順」の2段である

角丸の解除でどう書くかを決めるには、この2段を分けて理解する必要がある。
`src/app/globals.css` を `@tailwindcss/postcss` でコンパイルして出力位置を実測すると
（2026-09-05）、単一の `@layer utilities`（9644〜118094 バイト）の中がこう並ぶ。

| セレクタ             | バイト位置 | 群     |
| -------------------- | ---------- | ------ |
| `.rounded-2xl`       | 29759      | ベース |
| `.rounded-t-2xl`     | 30206      | ベース |
| `.rounded-b-none`    | 30686      | ベース |
| `.lg\:rounded-2xl`   | 109537     | lg     |
| `.lg\:rounded-b-2xl` | 109842     | lg     |

**第1段: 変種群はベース群より必ず後ろに出る。** メディアクエリは詳細度を持たないので、
同じ詳細度（0-1-0）どうしの勝敗はソース順で決まる。したがって `lg:` の指定は
ベースの長形式に勝つ。`lg:rounded-2xl` でも `rounded-b-none` は上書きできる。

**第2段: プロパティ順は同じ群の中だけで効く。** 一括指定が長形式より前に出るのは
ベース群の中（`.rounded-2xl` < `.rounded-b-none`）での話である。だから
**ベースの `rounded-2xl` でベースの `rounded-b-none` を打ち消すことはできない**。
同じ関係が `border-*` と `border-l-*` にもある。

> [!TIP]
> **どちらも動くが `lg:rounded-b-2xl` を選ぶ。** `lg:rounded-2xl` は4隅すべてを
> 書き直すため、「下2隅だけ戻したい」という意図がクラスから読み取れなくなる。
> 打ち消したい長形式と同じペアで上書きするほうが、後から差分を読む側に優しい。

検査はクラスの有無ではなく算出値で行う。**測る viewport を間違えないこと。**
`lg:` の指定は 1024px 未満では適用されないので、狭い幅で測ると必ず `0px` が返る。

```js
// 1024px 以上で実行すること
getComputedStyle(el).borderBottomLeftRadius; // "16px" であること
```

---

## まとめ

### Header/Hero統合のベストプラクティス

1. ✅ Header高さをCSS変数化（`--header-height`）
2. ✅ HeroSectionで `min-h-[calc(100vh-var(--header-height))]` を使用
3. ✅ `pt-16`（または適切な値）でHeader高さ分のpaddingを確保
4. ✅ Header変更時は変数とpaddingを同期

### z-index管理のベストプラクティス

1. ✅ 標準スケール（10/20/30/40/60）のみを使用
2. ✅ アドホックな値（`z-[45]`等）は禁止
3. ✅ 同一レイヤー内での競合を避ける
4. ✅ agent-browserでz-index階層を定期的に確認

### position使い分けのベストプラクティス

1. ✅ Sticky Header: `sticky top-0 z-40`
2. ✅ Hero内浮遊要素: `absolute` + `relative`親要素 + `z-30`
3. ✅ モーダル: `fixed inset-0 z-60`
4. ✅ 通常コンテンツ: `relative` または `static`（z-index不要）

### 寸法の単一実体化のベストプラクティス

1. ✅ 座標計算を伴う面の高さは JS の数値で持つ（`%` / `h-full` を使わない）
2. ✅ CSS と JS が同じ寸法を持つなら、実体を JS 側へ寄せて `style` で渡す
3. ✅ 「両方合わせること」というコメントは対策として数えない
4. ✅ 実例と経緯は [timetable-gantt.md](./timetable-gantt.md) を参照

---

**関連ドキュメント:**

- [i18n-page-structure.md](./i18n-page-structure.md) - 多言語ページの構成パターン（ページビューの置き場所、`pageHeroes` のロケール上書き、`lang` 属性）
- [agent-browser-workflow.md](./agent-browser-workflow.md) - デザイン再現とデバッグの標準フロー

---

**作成日:** 2026-02-07
**最終更新:** 2026-09-05
