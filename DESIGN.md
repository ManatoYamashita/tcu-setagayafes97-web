# DESIGN.md — 東京都市大学 第97回世田谷祭 公式Webサイト

> このファイルはAIエージェントおよび開発チームが正確なUIを生成・実装するためのデザイン仕様書です。
> 実装の一次ソースは `src/app/globals.css` と `tailwind.config.ts`。本ドキュメントはその要約と運用ルールを提供します。

---

## 1. Visual Theme & Atmosphere

- **デザイン方針**: モダン × 上品 × 遊び心。大学祭のワクワク感と洗練されたブランド感を両立
- **密度**: ゆったりとしたメディア型。ホワイトスペースを十分に確保
- **キーワード**: 藤色（Wisteria）、和洋混淆、ガラスモーフィズム、筆致、祝祭感

---

## 2. Color Palette & Roles

カラーはすべて **oklch()** で一次定義。HEX は近似値として併記。

### Primary — Wisteria（藤）

世田谷祭のテーマカラー。CTA ボタン、リンク、強調要素に使用。

| Token                     | oklch                         | HEX 近似      | 用途                       |
| ------------------------- | ----------------------------- | ------------- | -------------------------- |
| `--color-primary-50`      | `oklch(95% 0.035 314deg)`     | `#F9F0FD`     | 極薄背景、ホバー状態       |
| `--color-primary-100`     | `oklch(88% 0.07 314deg)`      | `#F0DAFA`     | 薄い背景、タグ背景         |
| `--color-primary-200`     | `oklch(80% 0.11 314deg)`      | `#E3C0F7`     | 淡いアクセント             |
| `--color-primary-300`     | `oklch(74% 0.14 314deg)`      | `#DAA7F3`     | 補助的なアクセント         |
| **`--color-primary-400`** | **`oklch(68% 0.175 314deg)`** | **`#CD79EE`** | **ブランドカラー（基準）** |
| `--color-primary-500`     | `oklch(57% 0.175 314deg)`     | `#B04FD6`     | ホバー・フォーカス         |
| `--color-primary-600`     | `oklch(47% 0.165 314deg)`     | `#8E3AB0`     | ダークアクセント           |
| `--color-primary-700`     | `oklch(37% 0.14 314deg)`      | `#6B2588`     | ダークテキスト用           |
| `--color-primary-900`     | `oklch(18% 0.075 314deg)`     | `#2D0D40`     | 最暗（ほぼ黒紫）           |

### Secondary — Lavender Mist（ラベンダーミスト）

ページ全体の背景色。Primary より明度が高く、テキストとのコントラストを確保しやすい。

| 属性  | 値                          |
| ----- | --------------------------- |
| oklch | `oklch(79.5% 0.108 314deg)` |
| HEX   | `#E1C0EE`                   |

### Neutral（グレースケール）

| Token              | oklch               | HEX       | 用途                     |
| ------------------ | ------------------- | --------- | ------------------------ |
| `--color-gray-50`  | `oklch(97% 0 0deg)` | `#F7F7F7` | ページ背景（白系）       |
| `--color-gray-100` | `oklch(93% 0 0deg)` | `#EDEDED` | カード背景、区切り線     |
| `--color-gray-200` | `oklch(86% 0 0deg)` | `#DBDBDB` | ボーダー                 |
| `--color-gray-400` | `oklch(65% 0 0deg)` | `#A3A3A3` | プレースホルダー、ラベル |
| `--color-gray-600` | `oklch(45% 0 0deg)` | `#737373` | サブテキスト             |
| `--color-gray-700` | `oklch(35% 0 0deg)` | `#525252` | 本文テキスト             |
| `--color-gray-900` | `oklch(13% 0 0deg)` | `#212121` | 見出しテキスト           |

### Semantic（意味的マッピング）

| Token                | 参照先                | 用途                  |
| -------------------- | --------------------- | --------------------- |
| `--color-bg`         | `--color-secondary`   | ページ背景（淡い紫）  |
| `--color-text`       | `--color-gray-900`    | デフォルトテキスト    |
| `--color-text-muted` | `--color-gray-600`    | サブテキスト・説明文  |
| `--color-border`     | `--color-gray-200`    | 区切り線・枠線        |
| `--color-accent`     | `--color-primary-400` | CTA、リンク、強調要素 |

### アクセシビリティ（WCAG コントラスト比）

| 組み合わせ                         | コントラスト比 | 判定                 |
| ---------------------------------- | -------------- | -------------------- |
| `#212121` on `#E1C0EE`（淡紫背景） | **7.5:1**      | WCAG AA 適合（推奨） |
| `#212121` on `#FFFFFF`（白背景）   | 16.1:1         | WCAG AAA 適合        |
| `#525252` on `#FFFFFF`             | 7.4:1          | WCAG AA 適合         |
| `#CD79EE` on `#FFFFFF`（白背景）   | 約 3.0:1       | 大テキスト・UI のみ  |
| `#FFFFFF` on `#CD79EE`（紫背景）   | 約 3.0:1       | 大テキストのみ       |

> **重要**: Primary 紫 `#CD79EE` を白背景の通常テキストに使用禁止（コントラスト不足）。CTA・装飾的見出し・アクセントに限定。

---

## 3. Typography Rules

### 3.1 フォント一覧（実装）

| フォント名         | 分類           | ウェイト | CSS変数              | Preload | 用途                     |
| ------------------ | -------------- | -------- | -------------------- | ------- | ------------------------ |
| Kaisei Opti        | 明朝体（楷書） | 400, 700 | `--font-kaisei-opti` | false   | 見出し・ブランドフォント |
| システムサンセリフ | ゴシック体     | OS依存   | `--font-sans`        | —       | 本文テキスト             |
| システム丸ゴシック | ディスプレイ   | OS依存   | `font-hero-display`  | —       | ホームのヒーロー文字     |

### 3.2 font-family 指定

```css
/* 本文（デフォルト） */
--font-sans: ui-sans-serif, system-ui, sans-serif;

/* 見出し（h1, h2, h3 に自動適用） */
--font-heading: var(--font-kaisei-opti), serif;
--font-serif: var(--font-kaisei-opti), serif;

/* ヒーロー用（カスタムユーティリティ） */
/* @utility font-hero-display */
font-family: "Hiragino Maru Gothic ProN", "Arial Rounded MT Bold", sans-serif;
```

### 3.3 Kaisei Opti 使用制限（重要）

| 用途                      | 可否     | 備考                         |
| ------------------------- | -------- | ---------------------------- |
| ページ大見出し（H1/H2）   | 推奨     | 48px 以上、weight 700        |
| セクション見出し（H3/H4） | 可       | 32px 以上、weight 500 以上   |
| ロゴ・ブランド表記        | 推奨     | SVG または大サイズのみ       |
| キャッチコピー            | 可       | 日本語テキストに限定         |
| 本文（16px 以下）         | **禁止** | 可読性が低下する             |
| 英語テキスト              | **禁止** | 欧文グリフのバランスが崩れる |
| 数字（価格・日時）        | **禁止** | 欧文専用フォントで揃える     |
| UI ラベル・ボタン         | **禁止** | 操作性が落ちる               |

### 3.4 フォントスケール（モジュラースケール 1.25）

| Token         | Size | Weight  | Line Height | 主な用途             | フォント                   |
| ------------- | ---- | ------- | ----------- | -------------------- | -------------------------- |
| `--text-6xl`  | 60px | 700     | 1.1         | ページタイトル（H1） | Kaisei Opti                |
| `--text-5xl`  | 48px | 700     | 1.2         | セクション大見出し   | Kaisei Opti                |
| `--text-4xl`  | 38px | 700     | 1.3         | セクション見出し     | Kaisei Opti                |
| `--text-3xl`  | 30px | 500-700 | 1.4         | カード見出し         | Kaisei Opti / Noto Sans JP |
| `--text-2xl`  | 24px | 500     | 1.5         | サブ見出し           | Noto Sans JP               |
| `--text-xl`   | 20px | 400-500 | 1.6         | リード文             | Noto Sans JP               |
| `--text-base` | 16px | 400     | 1.75        | 本文テキスト         | Noto Sans JP               |
| `--text-sm`   | 14px | 400     | 1.7         | 補足・キャプション   | Noto Sans JP               |
| `--text-xs`   | 12px | 400     | 1.6         | ラベル・タグ         | Noto Sans JP               |

### 3.5 行間・字間

- **本文の行間 (line-height)**: 1.75（日本語の可読性を確保）
- **見出しの行間**: 1.1 - 1.4（スケールに応じて段階的に）
- **ラベルの字間 (letter-spacing)**: `tracking-widest`（0.2em）〜 `tracking-[0.3em]`
- **見出しの字間**: `tracking-wide`（0.025em）〜 `tracking-wider`（0.05em）

### 3.6 禁則処理・改行ルール

```css
word-break: break-all;
overflow-wrap: break-word;
line-break: strict;
```

### 3.7 OpenType 機能

```css
font-feature-settings: "palt" 1; /* 見出し・ナビゲーションのプロポーショナル字詰め */
font-feature-settings: "kern" 1; /* 欧文カーニング */
```

- `palt` は見出しに有効。本文には適用しない
- `kern` は和欧混植時に有効

### 3.8 縦書き

```css
/* @utility text-vertical */
writing-mode: vertical-rl;
text-orientation: upright;
```

PICKUP ラベル等の装飾テキストで使用。

---

## 4. Component Stylings

### Buttons

3つのバリエーション + 3つのサイズ。

**共通スタイル:**

- `rounded-lg`（8px）
- `font-semibold`
- `focus:ring-2 focus:ring-offset-2`
- `disabled:cursor-not-allowed disabled:opacity-50`

**Primary**

- Background: `bg-white`（`#FFFFFF`）
- Text: `text-primary`（`#CD79EE`）
- Hover: `hover:opacity-90`
- Focus Ring: `focus:ring-white`

**Secondary**

- Background: `bg-white/20`（白 20% 透過）
- Text: `text-gray-900`（`#212121`）
- Hover: `hover:opacity-90`

**Outline**

- Background: `transparent`
- Text: `text-gray-900`（`#212121`）
- Border: `border-2 border-gray-200`（`#DBDBDB`）
- Hover: `hover:bg-white hover:text-primary`

**サイズ:**

| Size | Padding     | Font Size           |
| ---- | ----------- | ------------------- |
| sm   | `px-4 py-2` | `text-sm`（14px）   |
| md   | `px-6 py-3` | `text-base`（16px） |
| lg   | `px-8 py-4` | `text-lg`（18px）   |

### Cards

**共通スタイル:**

- Background: `bg-white/10`（白 10% 透過）
- Border Radius: `rounded-2xl`（16px）
- Border: `border`

**バリエーション:**

| Variant  | Border               | 備考                          |
| -------- | -------------------- | ----------------------------- |
| default  | `border-gray-200/20` | ホバー時 `border-gray-200/40` |
| featured | `border-gray-200`    | 不透過ボーダー                |

**ホバーエフェクト（実装例）:**

- `hover:-translate-y-1`（1段階浮き上がり）
- `hover:shadow-lg`
- `transition-all duration-300`

### Badge

- `inline-flex rounded-full px-3 py-1 text-xs font-semibold`
- カテゴリ別の色: urgent（red-500）、news（blue-500）、room（green-500）、stage（orange-500）、special（pink-500）

### Accordion

- Background: `bg-gray-50`
- Border: `border border-gray-200`
- Border Radius: `rounded-lg`（8px）
- Hover: `hover:bg-gray-100`
- 開閉: `max-h-0 opacity-0` ↔ `max-h-screen opacity-100`、ChevronDown 回転

---

## 5. Layout Principles

### Spacing Scale（Tailwind デフォルト準拠）

| Token | Value | 主な用途                                 |
| ----- | ----- | ---------------------------------------- |
| 1     | 4px   | 微小な余白                               |
| 2     | 8px   | テキスト間                               |
| 4     | 16px  | モバイルパディング（`px-4`）             |
| 6     | 24px  | タブレットパディング（`px-6`）           |
| 8     | 32px  | セクション内余白                         |
| 12    | 48px  | セクション間余白                         |
| 16    | 64px  | 大きなセクション間余白                   |
| 20    | 80px  | デスクトップ水平パディング（`lg:px-20`） |

### Header

```css
--header-height: 5.5rem; /* 88px */
```

- ヘッダー下のコンテンツは `pt-16` でオフセット
- Hero Section は `min-h-[calc(100svh-var(--header-height))]`

### Grid

- **レスポンシブグリッド**: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **ギャップ**: `gap-4`（モバイル）→ `gap-6`（デスクトップ）

---

## 6. Depth & Elevation

| Level | Shadow       | 用途                             |
| ----- | ------------ | -------------------------------- |
| 0     | `none`       | フラットな要素（トップヘッダー） |
| 1     | `shadow-md`  | カード、ピル型ヘッダー           |
| 2     | `shadow-lg`  | ホバー時カード                   |
| 3     | `shadow-2xl` | フローティング要素               |

### Backdrop Blur（ガラスモーフィズム）

| Class              | 用途                 |
| ------------------ | -------------------- |
| `backdrop-blur-sm` | モバイルメニュー背景 |
| `backdrop-blur-md` | モーダル背景         |

### 透明度パターン

| Pattern              | 用途                     |
| -------------------- | ------------------------ |
| `bg-white/10`        | カード背景               |
| `bg-white/20`        | セカンダリボタン         |
| `bg-black/60`        | オーバーレイテキスト背景 |
| `border-gray-200/20` | 薄いボーダー             |

---

## 7. Do's and Don'ts

### Do（推奨）

- フォントは必ずフォールバックチェーンを指定する
- 日本語本文の line-height は 1.5 以上にする（推奨: 1.75）
- 色のコントラスト比は WCAG AA 以上を確保する
- コンポーネントの余白は Spacing Scale に従う
- Kaisei Opti は 30px 以上の見出しに限定する
- z-index は 10 刻みの標準スケールのみ使用する
- Primary 紫（`#CD79EE`）は CTA・リンク・装飾に限定する

### Don't（禁止）

- `font-family` に和文フォント1つだけを指定しない（環境依存になる）
- 日本語本文に `line-height: 1.2` 以下を使わない
- 全角・半角スペースを混在させない
- テキスト色に純粋な `#000000` を使わない（`#212121` を使用）
- Kaisei Opti を本文（16px 以下）・英語・数字・UIラベルに使わない
- Primary 紫を白背景の通常テキスト色に使わない（コントラスト不足）
- `z-[45]` 等のアドホックな z-index 値を使わない

---

## 8. Responsive Behavior

### Breakpoints

| Name    | Width     | Tailwind   | 説明                   |
| ------- | --------- | ---------- | ---------------------- |
| Mobile  | < 640px   | デフォルト | モバイルレイアウト     |
| SM      | >= 640px  | `sm:`      | 小型タブレット         |
| Tablet  | >= 768px  | `md:`      | タブレットレイアウト   |
| Desktop | >= 1024px | `lg:`      | デスクトップレイアウト |
| Wide    | >= 1280px | `xl:`      | ワイドデスクトップ     |

### タッチターゲット

- 最小サイズ: 44px x 44px（WCAG基準）

### フォントサイズの調整例

| 要素             | Mobile                                  | Tablet (md)        | Desktop (lg)       |
| ---------------- | --------------------------------------- | ------------------ | ------------------ |
| Hero 日付        | `text-5xl`（48px）                      | `text-6xl`（64px） | `text-7xl`（80px） |
| セクション見出し | `text-3xl`（30px）                      | —                  | `text-5xl`（48px） |
| 本文             | `text-sm`（14px）〜 `text-base`（16px） | —                  | —                  |

### ヘッダーのレスポンシブ

- **トップ**: `px-0 pt-0`（フラット表示）
- **スクロール後**: `px-4 pt-2` + `rounded-full`（ピル型モーフィング）
- **ナビゲーション**: `hidden lg:block`（768px 未満はハンバーガーメニュー）

---

## 9. Agent Prompt Guide

### クイックリファレンス

```
Primary Color:    #CD79EE / oklch(68% 0.175 314deg)
Secondary Color:  #E1C0EE / oklch(79.5% 0.108 314deg)
Text Color:       #212121 / oklch(13% 0 0deg)
Text Muted:       #737373 / oklch(45% 0 0deg)
Background:       #E1C0EE (紫) or #FFFFFF (白)
Border:           #DBDBDB / oklch(86% 0 0deg)

Body Font:    var(--font-noto-sans-jp), sans-serif
Heading Font: var(--font-kaisei-opti), serif
Body Size:    16px
Line Height:  1.75
```

### プロンプト例

```
このサイトのデザインシステムに従って、○○コンポーネントを作成してください。
- プライマリカラー: #CD79EE（oklch(68% 0.175 314deg)）
- 本文フォント: Noto Sans JP, sans-serif
- 見出しフォント: Kaisei Opti, serif（30px以上のみ）
- 行間: 本文は line-height: 1.75
- カード背景: bg-white/10, rounded-2xl
- ボーダー: border-gray-200/20
- テキスト色: #212121
```

---

## 10. Animation & Motion

### GSAP アニメーション

プロジェクトでは GSAP を高度なアニメーションに使用。

| コンポーネント      | 手法                      | 効果                                             |
| ------------------- | ------------------------- | ------------------------------------------------ |
| HeroSection         | `stagger(0.12s)`          | 4要素の順次フェードイン + スライドアップ         |
| Opener              | 6フェーズタイムライン     | 薄紫 → 濃紫フェード → スライドアウト             |
| AboutSection        | ScrollTrigger             | スクロール時の画像スケール + テキスト stagger    |
| ChairpersonSection  | ScrollTrigger + SplitText | 行単位リヴィール + 画像二層ズーム + 段落 stagger |
| StaggeredMobileMenu | タイムライン              | 背景スライドイン + メニュー項目 stagger          |

GSAP 使用時は `force3D: true` を設定し GPU 加速を有効にする。

ScrollTrigger の入場は `{ start: "top 80%", once: true }` を共通の基準とし、各 tween には
スプレッドしたコピー `{ ...scrollTriggerBase }` を渡す。入場は `gsap.set` + `gsap.to` ではなく
`gsap.from()` で書くと、モーション軽減時に「何もしない」だけで完成形が表示される。

#### SplitText と日本語（重要）

SplitText は既定で**空白を単語区切りとする**ため、空白のない日本語では段落全体が 1 単語
= 1 行と判定され、行分割が機能しない。`wordDelimiter: ""` を指定して 1 文字を最小単位にする。

```ts
SplitText.create(elements, {
  type: "lines",        // chars は type に含めない（行へまとめた後、文字要素は解除される）
  wordDelimiter: "",    // 日本語には必須
  autoSplit: true,      // フォント読み込み完了とリサイズを監視して自動で再分割
  onSplit: (self) => gsap.from(self.lines, { ... }), // return すると再分割時に破棄される
});
```

- `type` に `chars` を含めないこと。行へグループ化したあと文字要素が解除され、行 `<div>` には
  素のテキストが残るため、禁則処理（行頭の句読点回避）が保たれる
- `white-space: pre-line` / `pre-wrap` と併用しない。`reduceWhiteSpace`（既定 `true`）が
  空白を畳んで改行が失われる。改行は `<br />` と個別の `<p>` で表現する
- `aria` の既定は `"auto"` で元要素に `aria-label` が付くため、`aria-labelledby` の参照は保たれる

### Tailwind / CSS アニメーション

| 名前                     | キーフレーム                   | 用途                           |
| ------------------------ | ------------------------------ | ------------------------------ |
| `animate-spin-slow`      | `spin-slow` — 60s 回転         | CircularText 回転（ヒーロー）  |
| `animate-scroll-line`    | `scroll-line` — 1.5s フェード  | スクロール促進矢印             |
| `animate-blob`           | `blob-drift-1/2` — 20-24s      | 背景 Blob 浮遊                 |
| `animate-triangle-drift` | `triangle-drift-1/2` — 20-24s  | About 装飾三角形の常時ドリフト |
| `dialog-fade-in`         | scale(0.95→1) + opacity — 0.2s | モーダル表示                   |

常時ループする装飾は、keyframes を `globals.css` に置き、要素側の inline `style` で
duration と**負の `animationDelay`** を与えて個体ごとに位相をずらす。

`triangle-drift-*` は `transform` ではなく**個別プロパティ `translate`** を動かす。装飾三角形は
Tailwind の `rotate-[Ndeg]` で角度を持ち、v4 はこれを個別プロパティ `rotate` として出力するため
（`.rotate-\[15deg\]{rotate:15deg}`）、`translate` なら確実に合成されて回転角が保たれる。

### View Transitions（ページ遷移）

```css
::view-transition-old(root) → dreamy-fade-out  0.45s  /* translateY + blur */
::view-transition-new(root) → dreamy-fade-in   0.5s   /* translateY + blur */
```

VT 非対応ブラウザは `dreamy-fallback-in`（0.55s）で代替。

### モーション軽減対応

CSS 側（`globals.css`）で `animation: none !important` にする対象は以下の**5つに限定**されている。
`[class*="animate-"]` のような包括ルールは存在しないため、**常時ループする装飾クラスを新設したら
このブロックへの追記が必須**。

| セレクタ                      | 対象                        |
| ----------------------------- | --------------------------- |
| `::view-transition-old/new`   | ページ遷移                  |
| `.page-transition-wrapper`    | VT 非対応時のフォールバック |
| `[class*="animate-blob"]`     | 背景 Blob                   |
| `[class*="animate-triangle"]` | About 装飾三角形            |
| `.animate-scroll-line`        | スクロール促進矢印          |

JS 側は各コンポーネントで `window.matchMedia("(prefers-reduced-motion: reduce)").matches` を
判定し、アニメーションを生成せずに早期 return する（`NewsSection` / `ChairpersonSection`）。
`ChairpersonSection` では SplitText の分割自体もスキップし、DOM を一切変更しない。

---

## 11. Z-Index Scale

10 刻みの固定スケール。アドホック値（`z-[45]` 等）は禁止。

| レイヤー      | z-index | Tailwind | 用途                           |
| ------------- | ------- | -------- | ------------------------------ |
| Modal/Overlay | 60      | `z-60`   | モーダル、トースト             |
| Mobile Menu   | 50      | `z-50`   | モバイルメニューのオーバーレイ |
| Sticky Header | **40**  | `z-40`   | 固定ヘッダー、グローバルナビ   |
| Floating UI   | 30      | `z-30`   | Hero 内最上位要素              |
| Content Upper | 20      | `z-20`   | テキストエリア、カード上位     |
| Content Base  | 10      | `z-10`   | 画像、背景、カードベース       |
| Default       | auto    | —        | 通常コンテンツ                 |

---

## 12. Gradients & Special Effects

### Hero + About 背景グラデーション

```css
/* モバイル */
.hero-about-bg {
  background: linear-gradient(
    to bottom,
    #ffffff 20%,
    var(--color-primary-200) 35%,
    /* #E3C0F7 */ var(--color-secondary) 50% /* #E1C0EE */
  );
}

/* タブレット以上 (md) */
@media (min-width: 768px) {
  .hero-about-bg {
    background: linear-gradient(
      to bottom,
      #ffffff 25%,
      var(--color-primary-200) 40%,
      var(--color-secondary) 55%
    );
  }
}
```

### Clip Path（斜め背景）

```css
.diagonal-bg {
  clip-path: polygon(0 5%, 100% 0, 100% 95%, 0 100%);
}
.diagonal-bg-reverse {
  clip-path: polygon(0 0, 100% 5%, 100% 100%, 0 95%);
}
```

### Hero タイトルエフェクト

```css
/* @utility text-hero-title */
color: #fffde6;
-webkit-text-stroke: 1.5px #1e3a5f;
paint-order: stroke fill;
text-shadow:
  2px 2px 0 #1e3a5f,
  -1px -1px 0 #1e3a5f,
  1px -1px 0 #1e3a5f,
  -1px 1px 0 #1e3a5f,
  0 4px 8px rgba(30, 58, 95, 0.3);
```

### ガラスモーフィズムパターン

```
bg-white/10 + backdrop-blur-sm   → カード・メニュー背景
bg-white/20                      → セカンダリボタン
bg-black/60                      → オーバーレイテキスト背景
border-gray-200/20               → 薄いボーダー
```

---

## 参照ファイル

| ファイル                       | 内容                                              |
| ------------------------------ | ------------------------------------------------- |
| `src/app/globals.css`          | CSS変数・カスタムユーティリティ・キーフレーム定義 |
| `tailwind.config.ts`           | Tailwind 拡張設定（色・フォント）                 |
| `src/app/layout.tsx`           | Google Fonts 読み込み設定                         |
| `src/components/ui/Button.tsx` | ボタンコンポーネント実装                          |
| `src/components/ui/Card.tsx`   | カードコンポーネント実装                          |

---

**最終更新日**: 2026-04-11
