# デザインシステム

東京都市大学 第97回 世田谷祭 Webサイトのデザイントークン定義。
カラー・タイポグラフィの仕様を一元管理する。

---

## カラーシステム

### 表記方法について

カラーはすべて **HLC（CIELCH）** で一次定義する。
HLC は人間の知覚に線形な CIELAB 色空間の極座標表現であり、デザイン間の色の差異を定量的に評価できる。

```
HLC(H°, L, C)
  H = Hue angle（色相角）  0–360°
  L = Lightness（明度）     0–100
  C = Chroma（彩度）        0–100+
```

CSS 実装は `oklch()` 関数（CSS Color Level 4）で記述する。
oklch は CIELCH に近似した知覚均等色空間であり、ブラウザネイティブで補間・アニメーションが自然になる。

> **注**: HLC と oklch の数値は座標スケールが異なるため直接一致しない。
> HLC は印刷・デザインツール（ColorThink, HLC Colour Atlas 等）向けの仕様値、
> oklch はコード実装値として並記する。

---

### ブランドカラー

#### Primary — Wisteria

世田谷祭のテーマカラー。藤の花を想起させる明るい紫。

| 属性        | 値                        |
| ----------- | ------------------------- |
| HEX         | `#CD79EE`                 |
| RGB         | `rgb(205, 121, 238)`      |
| **HLC**     | **H319 / L64 / C70**      |
| oklch (CSS) | `oklch(68% 0.175 314deg)` |

```css
--color-primary: oklch(68% 0.175 314deg);
```

> **HLC 詳細**:
>
> - H 319° … 赤寄りの青紫（マゼンタと青の中間付近）
> - L 64 … 中明度（白背景・黒文字どちらとも共存可能なゾーン）
> - C 70 … 高彩度（sRGB 域内の鮮やかな紫。くすみなし）

---

### カラーパレット

Primary を起点に L・C を調整して生成したスケール。
**H・C の変化は最小限に抑え、L の調整のみで明暗を作る**のが HLC ベストプラクティス。

#### Primary Scale

| Token                     | HLC                  | oklch                         | HEX 近似      | 用途                               |
| ------------------------- | -------------------- | ----------------------------- | ------------- | ---------------------------------- |
| `--color-primary-50`      | H319 / L95 / C14     | `oklch(95% 0.035 314deg)`     | `#F9F0FD`     | 極薄背景、ホバー状態の微妙な色変化 |
| `--color-primary-100`     | H319 / L88 / C28     | `oklch(88% 0.07 314deg)`      | `#F0DAFA`     | 薄い背景、タグ背景                 |
| `--color-primary-200`     | H319 / L80 / C42     | `oklch(80% 0.11 314deg)`      | `#E3C0F7`     | 淡いアクセント                     |
| `--color-primary-300`     | H319 / L74 / C56     | `oklch(74% 0.14 314deg)`      | `#DAA7F3`     | 補助的なアクセント                 |
| **`--color-primary-400`** | **H319 / L64 / C70** | **`oklch(68% 0.175 314deg)`** | **`#CD79EE`** | **ブランドカラー（基準）**         |
| `--color-primary-500`     | H319 / L54 / C70     | `oklch(57% 0.175 314deg)`     | `#B04FD6`     | ホバー・フォーカス状態             |
| `--color-primary-600`     | H319 / L44 / C65     | `oklch(47% 0.165 314deg)`     | `#8E3AB0`     | ダークアクセント                   |
| `--color-primary-700`     | H319 / L34 / C55     | `oklch(37% 0.14 314deg)`      | `#6B2588`     | ダークテキスト用アクセント         |
| `--color-primary-900`     | H319 / L15 / C30     | `oklch(18% 0.075 314deg)`     | `#2D0D40`     | 最暗（ほぼ黒紫）                   |

#### Neutral Scale（グレースケール）

テキスト・背景・ボーダー用。彩度ゼロ（C=0）の純粋な明度スケール。

| Token              | HLC      | oklch               | HEX       | 用途                     |
| ------------------ | -------- | ------------------- | --------- | ------------------------ |
| `--color-gray-50`  | L97 / C0 | `oklch(97% 0 0deg)` | `#F7F7F7` | ページ背景               |
| `--color-gray-100` | L93 / C0 | `oklch(93% 0 0deg)` | `#EDEDED` | カード背景、区切り線     |
| `--color-gray-200` | L86 / C0 | `oklch(86% 0 0deg)` | `#DBDBDB` | ボーダー                 |
| `--color-gray-400` | L65 / C0 | `oklch(65% 0 0deg)` | `#A3A3A3` | プレースホルダー、ラベル |
| `--color-gray-600` | L45 / C0 | `oklch(45% 0 0deg)` | `#737373` | サブテキスト             |
| `--color-gray-700` | L35 / C0 | `oklch(35% 0 0deg)` | `#525252` | 本文テキスト             |
| `--color-gray-900` | L13 / C0 | `oklch(13% 0 0deg)` | `#212121` | 見出しテキスト           |

#### Semantic Color

| Token                | 参照先                | 用途                  |
| -------------------- | --------------------- | --------------------- |
| `--color-text`       | `--color-gray-900`    | デフォルトテキスト    |
| `--color-text-muted` | `--color-gray-600`    | サブテキスト・説明文  |
| `--color-bg`         | `#FFFFFF`             | ページ背景            |
| `--color-border`     | `--color-gray-200`    | 区切り線・枠線        |
| `--color-accent`     | `--color-primary-400` | CTA、リンク、強調要素 |

---

### コントラスト比（アクセシビリティ）

WCAG 2.1 に準拠した最低基準。

| 組み合わせ                       | コントラスト比 | 適用基準                      |
| -------------------------------- | -------------- | ----------------------------- |
| `#CD79EE` on `#FFFFFF`（白背景） | 約 3.0:1       | WCAG AA（大テキスト・UI）のみ |
| `#FFFFFF` on `#CD79EE`（紫背景） | 約 3.0:1       | 大テキストのみ使用可          |
| `#212121` on `#FFFFFF`           | 16.1:1         | WCAG AAA 適合                 |
| `#525252` on `#FFFFFF`           | 7.4:1          | WCAG AA 適合                  |

> **重要**: Primary 紫（`#CD79EE`）は**白背景での通常テキストに使用禁止**（コントラスト不足）。
> CTA リンク・装飾的な見出し・アクセントカラーとしての利用に限定すること。

---

## タイポグラフィシステム

### ブランドフォント — Kaisei Opti

東京都市大学 世田谷祭のブランドフォント。

| 属性       | 値                                         |
| ---------- | ------------------------------------------ |
| フォント名 | Kaisei Opti（海星 Opti）                   |
| 分類       | Japanese Mincho / Serif                    |
| 制作       | Font Data Inc.                             |
| 提供元     | Google Fonts                               |
| ウェイト   | 400（Regular）/ 500（Medium）/ 700（Bold） |
| ライセンス | SIL Open Font License 1.1                  |

#### フォントの特性

Kaisei Opti は毛筆書体（楷書）の筆法を残しつつ、現代的な可読性のために最適化された明朝体（Mincho）フォント。「Opti」の名は Optical Sizing（視覚的調整）に由来し、表示サイズに応じたバランスが考慮されている。

**強み:**

- 日本語テキストとの相性が良い（漢字・かな・英数字のウェイトが統一）
- 大サイズでの使用時に筆の抑揚が映える
- ウェイト 700 はインパクトのある見出しに適する

**制限・注意事項（重要）:**

- 毛筆由来の筆跡（払い・止め・入り）が強く、**本文小サイズ（16px 以下）での連用は可読性が落ちる**
- 欧文との混植では字幅の差が目立ちやすいため、英数字は別フォントの指定を推奨
- 行間は最低 `1.8` 以上を確保すること（詰まると読みにくくなる）
- 過度に使用するとデザインが「和風・和食店」的なトーンに偏るため、**使用箇所を見出し・大テキストに絞る**

#### 読み込み（Next.js）

```tsx
// src/app/layout.tsx
import { Kaisei_Opti } from "next/font/google";

const kaiseiOpti = Kaisei_Opti({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kaisei-opti",
});
```

```css
/* globals.css */
:root {
  --font-kaisei-opti: /* Next.js が注入 */;
}
```

#### 使用用途と禁止事項

| 用途                      | 可否 | 備考                                                |
| ------------------------- | ---- | --------------------------------------------------- |
| ページ大見出し（H1/H2）   | 推奨 | 48px 以上、weight 700                               |
| セクション見出し（H3/H4） | 可   | 32px 以上、weight 500 以上                          |
| ロゴ・ブランド表記        | 推奨 | SVG または大サイズでの使用に限る                    |
| キャッチコピー            | 可   | 日本語テキストに限定                                |
| 本文（16px 以下）         | 禁止 | 読みにくい。本文はシステムフォントまたは sans-serif |
| 英語テキスト              | 禁止 | 欧文グリフのバランスが崩れる                        |
| 数字（価格・日時）        | 禁止 | 欧文専用フォントで揃えること                        |
| UI ラベル・ボタン         | 禁止 | 操作性が落ちる                                      |

---

### フォントスケール

タイポグラフィはモジュラースケール（比率 1.25 / Major Third）を基準とする。

| Token         | サイズ | Line Height | Weight  | 主な用途             |
| ------------- | ------ | ----------- | ------- | -------------------- |
| `--text-6xl`  | 60px   | 1.1         | 700     | ページタイトル（H1） |
| `--text-5xl`  | 48px   | 1.2         | 700     | セクション大見出し   |
| `--text-4xl`  | 38px   | 1.3         | 700     | セクション見出し     |
| `--text-3xl`  | 30px   | 1.4         | 500–700 | カード見出し         |
| `--text-2xl`  | 24px   | 1.5         | 500     | サブ見出し           |
| `--text-xl`   | 20px   | 1.6         | 400–500 | リード文             |
| `--text-base` | 16px   | 1.75        | 400     | 本文テキスト         |
| `--text-sm`   | 14px   | 1.7         | 400     | 補足・キャプション   |
| `--text-xs`   | 12px   | 1.6         | 400     | ラベル・タグ         |

> **Kaisei Opti 適用対象**: `--text-4xl` 以上（30px 以上）の見出しテキストのみ推奨。
> `--text-3xl` 以下は sans-serif（Noto Sans JP 等）を基本とし、Kaisei Opti は避ける。

---

## CSS 変数まとめ

```css
:root {
  /* ===== Colors ===== */
  /* Primary */
  --color-primary-50: oklch(95% 0.035 314deg);
  --color-primary-100: oklch(88% 0.07 314deg);
  --color-primary-200: oklch(80% 0.11 314deg);
  --color-primary-300: oklch(74% 0.14 314deg);
  --color-primary-400: oklch(68% 0.175 314deg); /* #CD79EE — HLC H319/L64/C70 */
  --color-primary-500: oklch(57% 0.175 314deg);
  --color-primary-600: oklch(47% 0.165 314deg);
  --color-primary-700: oklch(37% 0.14 314deg);
  --color-primary-900: oklch(18% 0.075 314deg);

  /* Alias */
  --color-primary: var(--color-primary-400);

  /* Neutrals */
  --color-gray-50: oklch(97% 0 0deg);
  --color-gray-100: oklch(93% 0 0deg);
  --color-gray-200: oklch(86% 0 0deg);
  --color-gray-400: oklch(65% 0 0deg);
  --color-gray-600: oklch(45% 0 0deg);
  --color-gray-700: oklch(35% 0 0deg);
  --color-gray-900: oklch(13% 0 0deg);

  /* Semantic */
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-600);
  --color-bg: #ffffff;
  --color-border: var(--color-gray-200);
  --color-accent: var(--color-primary);

  /* ===== Typography ===== */
  --font-display: var(--font-kaisei-opti), "Hiragino Mincho Pro", "Yu Mincho", serif;
  --font-body: "Noto Sans JP", "Hiragino Sans", sans-serif;

  --text-xs: 0.75rem; /* 12px */
  --text-sm: 0.875rem; /* 14px */
  --text-base: 1rem; /* 16px */
  --text-xl: 1.25rem; /* 20px */
  --text-2xl: 1.5rem; /* 24px */
  --text-3xl: 1.875rem; /* 30px */
  --text-4xl: 2.375rem; /* 38px */
  --text-5xl: 3rem; /* 48px */
  --text-6xl: 3.75rem; /* 60px */
}
```

---

## 参照・関連ドキュメント

- [layout-patterns.md](./layout-patterns.md) — z-index・レイアウト設計原則
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — プロジェクト全体設計方針（テーマカラー・多言語対応）
- [require.md](../requires/require.md) — プロジェクト要件定義書
- Google Fonts: Kaisei Opti — https://fonts.google.com/specimen/Kaisei+Opti

---

**最終更新日**: 2026-02-19
