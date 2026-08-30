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

| 属性           | 値                                 |
| -------------- | ---------------------------------- |
| HEX（仕様値）  | `#CD79EE`                          |
| RGB（仕様値）  | `rgb(205, 121, 238)`               |
| **HLC**        | **H319 / L64 / C70**               |
| oklch (CSS)    | `oklch(68% 0.175 314deg)`          |
| **実配信 HEX** | **`#bf73e3`** `rgb(191, 115, 227)` |

```css
--color-primary: oklch(68% 0.175 314deg);
```

> [!IMPORTANT]
> **画面に出るブランドカラーは `#bf73e3` である。** 一次定義は `src/app/globals.css` の
> `@theme` にある oklch 1箇所だけで、`#CD79EE` はその由来となったデザイン仕様値であり、
> どこにも配信されていない（#143 でソース直書きを一掃した）。
>
> CSS が効かない文脈だけは実配信 HEX を直書きしている。**`@theme` を変更したら
> ここも手で追従させること。**
>
> | 箇所                                 | 理由                                             |
> | ------------------------------------ | ------------------------------------------------ |
> | `src/app/api/contact/route.ts`       | メールクライアントは CSS 変数を解決しない        |
> | `src/components/about/AboutHero.tsx` | Grainient が色を WebGL シェーダの uniform へ渡す |
> | `src/data/site.ts` の `themeColor`   | メタデータ用の文字列（現在は未配信）             |

> **HLC 詳細**:
>
> - H 319° … 赤寄りの青紫（マゼンタと青の中間付近）
> - L 64 … 中明度（白背景・黒文字どちらとも共存可能なゾーン）
> - C 70 … 高彩度（sRGB 域内の鮮やかな紫。くすみなし）

---

#### Secondary — Lavender Mist（ラベンダーミスト）

背景色として使用する、柔らかく明るい紫。Primary カラーよりも明度が高く、テキストとのコントラストを確保しやすい。

| 属性           | 値                                 |
| -------------- | ---------------------------------- |
| HEX（仕様値）  | `#E1C0EE`                          |
| RGB（仕様値）  | `rgb(225, 192, 238)`               |
| **HLC**        | **H319 / L79.5 / C11**             |
| oklch (CSS)    | `oklch(79.5% 0.108 314deg)`        |
| **実配信 HEX** | **`#d5a7ed`** `rgb(213, 167, 237)` |

```css
--color-secondary: oklch(79.5% 0.108 314deg);
```

> **使用用途**:
>
> - ページ全体の背景色
> - カードやセクションの淡い背景
> - Primary（primary-400）よりも柔らかな印象を与えたい領域

---

### カラーパレット

Primary を起点に L・C を調整して生成したスケール。
**H・C の変化は最小限に抑え、L の調整のみで明暗を作る**のが HLC ベストプラクティス。

#### Primary Scale

| Token                     | HLC                  | oklch                         | 実配信 HEX    | 用途                               |
| ------------------------- | -------------------- | ----------------------------- | ------------- | ---------------------------------- |
| `--color-primary-50`      | H319 / L95 / C14     | `oklch(95% 0.035 314deg)`     | `#f7e8ff`     | 極薄背景、ホバー状態の微妙な色変化 |
| `--color-primary-100`     | H319 / L88 / C28     | `oklch(88% 0.07 314deg)`      | `#e9caf8`     | 薄い背景、タグ背景                 |
| `--color-primary-200`     | H319 / L80 / C42     | `oklch(80% 0.11 314deg)`      | `#d8a8f0`     | 淡いアクセント                     |
| `--color-primary-300`     | H319 / L74 / C56     | `oklch(74% 0.14 314deg)`      | `#cb8fe8`     | 補助的なアクセント                 |
| **`--color-primary-400`** | **H319 / L64 / C70** | **`oklch(68% 0.175 314deg)`** | **`#bf73e3`** | **ブランドカラー（基準）**         |
| `--color-primary-500`     | H319 / L54 / C70     | `oklch(57% 0.175 314deg)`     | `#9c50be`     | ホバー・フォーカス状態             |
| `--color-primary-600`     | H319 / L44 / C65     | `oklch(47% 0.165 314deg)`     | `#7b359a`     | ダークアクセント                   |
| `--color-primary-700`     | H319 / L34 / C55     | `oklch(37% 0.14 314deg)`      | `#592072`     | ダークテキスト用アクセント         |
| `--color-primary-900`     | H319 / L15 / C30     | `oklch(18% 0.075 314deg)`     | `#1d0428`     | 最暗（ほぼ黒紫）                   |

#### Neutral Scale（グレースケール）

テキスト・背景・ボーダー用。彩度ゼロ（C=0）の純粋な明度スケール。

| Token              | HLC      | oklch               | 実配信HEX | 用途                     |
| ------------------ | -------- | ------------------- | --------- | ------------------------ |
| `--color-gray-50`  | L97 / C0 | `oklch(97% 0 0deg)` | `#f5f5f5` | ページ背景               |
| `--color-gray-100` | L93 / C0 | `oklch(93% 0 0deg)` | `#e8e8e8` | カード背景、区切り線     |
| `--color-gray-200` | L86 / C0 | `oklch(86% 0 0deg)` | `#d1d1d1` | ボーダー                 |
| `--color-gray-400` | L65 / C0 | `oklch(65% 0 0deg)` | `#8f8f8f` | プレースホルダー、ラベル |
| `--color-gray-600` | L45 / C0 | `oklch(45% 0 0deg)` | `#555555` | サブテキスト             |
| `--color-gray-700` | L35 / C0 | `oklch(35% 0 0deg)` | `#3a3a3a` | 本文テキスト             |
| `--color-gray-900` | L13 / C0 | `oklch(13% 0 0deg)` | `#070707` | 見出しテキスト           |

#### Semantic Color

| Token                | 参照先                | 用途                         |
| -------------------- | --------------------- | ---------------------------- |
| `--color-bg`         | `--color-secondary`   | ページ背景（淡い紫）         |
| `--color-text`       | `--color-gray-900`    | デフォルトテキスト（黒寄り） |
| `--color-text-muted` | `--color-gray-600`    | サブテキスト・説明文         |
| `--color-border`     | `--color-gray-200`    | 区切り線・枠線               |
| `--color-accent`     | `--color-primary-400` | CTA、リンク、強調要素        |

---

### コントラスト比（アクセシビリティ）

WCAG 2.1 に準拠した最低基準。

**すべて実配信値で算出している**（仕様 HEX ではない）。

| 組み合わせ                                           | コントラスト比 | 適用基準                         |
| ---------------------------------------------------- | -------------- | -------------------------------- |
| **gray-900 `#070707` on Secondary `#d5a7ed`**        | **10.2:1**     | **✅ WCAG AAA 適合（推奨）**     |
| gray-900 `#070707` on `#FFFFFF`（白背景）            | 20.1:1         | ✅ WCAG AAA 適合                 |
| gray-700 `#3a3a3a` on `#FFFFFF`                      | 11.4:1         | ✅ WCAG AAA 適合                 |
| gray-600 `#555555` on `#FFFFFF`                      | 7.5:1          | ✅ WCAG AA 適合                  |
| primary-400 `#bf73e3` on `#FFFFFF`（白背景）         | 3.1:1          | ⚠️ WCAG AA（大テキスト・UI）のみ |
| **primary-700 `#592072` on Secondary（淡紫背景）**   | **5.6:1**      | **✅ WCAG AA 適合（推奨）**      |
| primary-600 `#7b359a` on Secondary（淡紫背景）       | 3.8:1          | ⚠️ 大テキスト・UI のみ           |
| primary-300 `#cb8fe8` on Secondary（淡紫背景）       | 1.2:1          | ❌ 前景色として使用禁止          |
| `#FFFFFF` on primary-400 `#bf73e3`（Primary 紫背景） | 3.1:1          | ⚠️ 大テキストのみ使用可          |
| `#FFFFFF` on Secondary `#d5a7ed`（淡紫背景）         | **2.0:1**      | ❌ **前景色として使用禁止**      |

> **重要**:
>
> - **推奨組み合わせ**: gray-900（黒テキスト）on Secondary（淡い紫背景）— コントラスト比 10.2:1 で WCAG AAA 適合
> - Primary 紫（primary-400 / 実配信 `#bf73e3`）は**白背景での通常テキストに使用禁止**（3.1:1）。CTA リンク・装飾的な見出し・アクセントカラーとしての利用に限定すること。
> - **Secondary 紫（実配信 `#d5a7ed`）の上に白テキストを置いてはいけない。** 実配信値でのコントラストは **2.0:1** しかなく、大テキストの 3:1 にも届かない。仕様 HEX `#E1C0EE` で計算しても 1.6:1 で、旧記載の「約 5.2:1・大テキストなら可」は誤りだった（2026-08-30 訂正）。
> - **`--color-primary-light`（primary-300）を前景テキスト・アイコンに使ってはいけない。** 淡紫背景で 1.2:1、白10%を重ねたカードでも 1.3:1 しかなく、背景とほぼ同色になる。暗色背景時代の名残であり、装飾用途に限ること。
> - **リンク色は背景で使い分ける。** 白背景は `--color-primary-dark`（primary-600 / 7.5:1）、淡紫背景（`bg-secondary` や `bg-white/10` のカード）は `primary-700`（5.6:1）。`primary-dark` は淡紫背景では 3.8:1 で AA に届かない。
> - **`bg-white/10` の見え方は下地で決まる。** 淡紫のページ背景の上では白を 10% 重ねただけで背景とほぼ同じ明度になり、`PageSheetLayout` の白いシート（`bg-white`）の上では**純白**になる。同じ理屈で `border-gray-200/20` は白いシート上で 1.08:1 となり消える。カード内の色は「どのシートの上にあるか」を見てから選ぶこと。

> [!WARNING]
> **本ファイルのカラースケール表とコントラスト表は、実際に配信される色（実配信値）で書いてある。** カラースケールは `@theme` で oklch 指定しており、Lightning CSS がビルド時に sRGB へ変換するため（出力CSSに oklch は残らない）、デザイン仕様の HEX とは別の値が配信される。例: Secondary は仕様 `#E1C0EE` に対して実配信 `#d5a7ed`、ブランドカラーは仕様 `#CD79EE` に対して実配信 `#bf73e3`。**仕様 HEX が載っているのはブランドカラーの属性表だけで、そこには実配信 HEX を併記してある。** 新しい組み合わせを検証するときは、必ず出力CSSの実値を使うこと。
>
> ```bash
> grep -o -- '--color-secondary:[^;]*' $(find .next -name '*.css' -path '*static*' | head -1)
> ```

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
// src/components/layout/KaiseiFont.ts
import { Kaisei_Opti } from "next/font/google";

const kaiseiOpti = Kaisei_Opti({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-kaisei-opti",
});
```

`next/font` の変数をルートへ付けるとフォントCSSが全ページへ配信される。
使用箇所のないフォントは将来用に読み込まず、必要になった時点で追加する。Kaisei Opti は
ページ見出しでのみ遅延ロードし、本文はOSのシステムフォントを使用する。
性能上の判断基準は [performance.md](./performance.md) を参照する。

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

## 開催概要の情報リスト

Aboutページの開催概要は、カード状の枠や行ごとの区切りを使わず、左側の一本線と「ラベル・値」の2列で構成する。

- アクセントラインは`primary-600`、ラベルは白背景で可読性を確保できる`primary-700`を使用する。
- 値は`gray-900`の本文書体とし、テーマ・住所・問い合わせ先などの改行を保持する。
- モバイルでもラベルと値の対応を追いやすいよう2列を維持し、ラベル列のみ固定幅、値は残り幅で自然に折り返す。
- 角丸、影、セル背景、横罫線は追加しない。情報構造と余白だけでグループを表現する。

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
  --color-primary-400: oklch(68% 0.175 314deg); /* 実配信 #bf73e3 — HLC H319/L64/C70 */
  --color-primary-500: oklch(57% 0.175 314deg);
  --color-primary-600: oklch(47% 0.165 314deg);
  --color-primary-700: oklch(37% 0.14 314deg);
  --color-primary-900: oklch(18% 0.075 314deg);

  /* Alias */
  --color-primary: var(--color-primary-400);

  /* Secondary Brand Color */
  --color-secondary: oklch(79.5% 0.108 314deg); /* 実配信 #d5a7ed — HLC H319/L79.5/C11 */

  /* Neutrals */
  --color-gray-50: oklch(97% 0 0deg);
  --color-gray-100: oklch(93% 0 0deg);
  --color-gray-200: oklch(86% 0 0deg);
  --color-gray-400: oklch(65% 0 0deg);
  --color-gray-600: oklch(45% 0 0deg);
  --color-gray-700: oklch(35% 0 0deg);
  --color-gray-900: oklch(13% 0 0deg);

  /* Semantic */
  --color-bg: var(--color-secondary); /* 淡い紫背景 */
  --color-text: var(--color-gray-900);
  --color-text-muted: var(--color-gray-600);
  --color-border: var(--color-gray-200);
  --color-accent: var(--color-primary);

  /* ===== Typography ===== */
  --font-display: var(--font-kaisei-opti), "Hiragino Mincho Pro", "Yu Mincho", serif;
  --font-body: ui-sans-serif, system-ui, sans-serif, "Hiragino Sans", sans-serif;

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

## リッチテキスト（`prose`）の扱い

microCMS のリッチテキストは `dangerouslySetInnerHTML` で挿入し、コンテナに `prose` クラスを付けている（`SpecialProfile` / `NoticeList` / `GoodsTable` / `TicketTable` / `info/[id]` / `EventDetail` の6箇所）。

### `@tailwindcss/typography` は導入していない

そのため **`prose` / `prose-lg` / `prose-invert` / `prose-a:*` / `prose-p:*` はCSSを1行も生成しない**。単なるクラス名として存在するだけである。

**これが厄介なのは、ビルドもLintも通り、警告も出ないこと。** `prose-a:text-primary` と書いてあれば効いているように読めるが、実際にはリンクは Preflight の `a { color: inherit }` のまま黒く表示される。2026-08-25 の指摘「リンクを紫にして」はこれが原因だった。

### 装飾を足す場合は `@layer base` に直接書く

`src/app/globals.css` の `@layer base` にセレクタを直接定義する。

```css
@layer base {
  .prose a {
    color: var(--color-primary-dark);
    text-decoration: none;
    text-underline-offset: 2px;
  }
}
```

**リンク色に `--color-primary`（実配信 `#bf73e3`）を使ってはいけない。** 白背景でのコントラストが 3.1:1 しかなく、上記「コントラスト比」節の「Primary 紫は白背景での通常テキストに使用禁止」に抵触する。本文中のインラインリンクは大テキストでも CTA でもないため、`--color-primary-dark`（実配信 `#7b359a`、7.45:1）を使う。

**`@layer components` に書いてはいけない。** Tailwind v4 は `@layer components` / `@layer utilities` の中身を「登録可能なユーティリティ定義」として解釈するため、`.prose a` のような**複合セレクタは黙って破棄される**。出力CSSには `@layer components;` という空の宣言だけが残り、エラーも警告も出ない。

検証は「見た目」ではなく出力CSSの実体で行うこと。

```js
// ブラウザのコンソールで、配信されたCSSに規則が含まれるか確認する
const href = document.querySelector("link[rel=stylesheet]").href;
(await fetch(href).then((r) => r.text())).includes(".prose a");
```

レイヤー順（`theme` → `base` → `components` → `utilities`）により、`@layer base` に置いた `.prose a`（詳細度 0-1-1）は Preflight の `a`（0-0-1）に勝ち、要素に直接当てた `text-*` ユーティリティには負ける。これが望ましい優先順位である。

---

## 参照・関連ドキュメント

- [layout-patterns.md](./layout-patterns.md) — z-index・レイアウト設計原則
- [browser-verification-pitfalls.md](./browser-verification-pitfalls.md) — 検証手順そのものが誤る実例
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — プロジェクト全体設計方針（テーマカラー・多言語対応）
- [require.md](../requires/require.md) — プロジェクト要件定義書
- Google Fonts: Kaisei Opti — https://fonts.google.com/specimen/Kaisei+Opti

---

**最終更新日**: 2026-08-29
