# デザインシステム

第97回東京都市大学世田谷祭 Webサイトのデザイントークン定義。
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
| `--color-gray-500` | L55 / C0 | `oklch(55% 0 0deg)` | `#717171` | 補助テキスト             |
| `--color-gray-600` | L45 / C0 | `oklch(45% 0 0deg)` | `#555555` | サブテキスト             |
| `--color-gray-700` | L35 / C0 | `oklch(35% 0 0deg)` | `#3a3a3a` | 本文テキスト             |
| `--color-gray-900` | L13 / C0 | `oklch(13% 0 0deg)` | `#070707` | 見出しテキスト           |

**`300` の段は意図的に存在しない。** 境界線・装飾という用途は `gray-200` で足りる。
必要になったら足すこと。**Tailwind 既定の `gray-300` で代用してはいけない**（[color-rules.md](./color-rules.md)）。

### Semantic Color

| Token                | 参照先                | 用途                         |
| -------------------- | --------------------- | ---------------------------- |
| `--color-bg`         | `--color-secondary`   | ページ背景（淡い紫）         |
| `--color-text`       | `--color-gray-900`    | デフォルトテキスト（黒寄り） |
| `--color-text-muted` | `--color-gray-600`    | サブテキスト・説明文         |
| `--color-border`     | `--color-gray-200`    | 区切り線・枠線               |
| `--color-accent`     | `--color-primary-400` | CTA、リンク、強調要素        |

---

## 分割したドキュメント

色の規約と検証は量が多いため、領域ごとに分けてある（#389）。

| ファイル                                         | 中身                                                                                              |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| [color-contrast.md](./color-contrast.md)         | 実配信値の測り方（「実配信HEX」は2つある）、コントラスト比、淡紫グラデーションの上の値            |
| [color-rules.md](./color-rules.md)               | Tailwind 既定パレットの禁止、紫は `primary-*`、残している非ブランド色相、ESLint と `check:colors` |
| [interaction-states.md](./interaction-states.md) | 操作要素のホバー（`hoverable`）、キーボードフォーカス                                             |
| [prose.md](./prose.md)                           | microCMS のリッチテキスト（`prose`）の規則                                                        |
| [typography.md](./typography.md)                 | 書体、文字サイズと行送り                                                                          |

---

## 背景の装飾（グラデーション・ぼかし）

トップの Hero〜ABOUT は `.hero-about-bg` の縦グラデーション1枚で塗る。停止位置を `svh` で持つ理由は
[`.claude/CLAUDE.md`](../../.claude/CLAUDE.md)「背景グラデーション」と `src/app/globals.css` のコメントにある。

**装飾のぼかし（`radial-gradient`）は `closest-side` で箱に内接させる**（#387）。
`circle` の既定の大きさは farthest-corner（箱の対角線の半分）なので、停止位置を `%` で書くと、
縦長・横長の箱では端に色が残ったまま切れ、直線の境界になる。ABOUT の blob は 390px 幅で
176×720 の箱になり、端の内外で 11/255 の段差が出ていた。

```css
/* NG: 箱の縦横比によって端で切れる */
background: radial-gradient(circle at center, rgba(255, 140, 200, 0.4), transparent 70%);
/* OK: どの縦横比でも箱の端で透明になる */
background: radial-gradient(closest-side, rgba(255, 140, 200, 0.4), transparent);
```

境界の有無は目視で決めない。アニメーションを止めて全ページを撮り、箱の端の内側と外側の画素差を測る。

---

## タイポグラフィ

**[typography.md](./typography.md) に分割した**（2026-09-30）。Kaisei Opti の読み込みと使い分け、
文字サイズと行送り（Tailwind の既定値）はそちらにある。

---

## 開催概要の情報リスト

Aboutページの開催概要・ご来場の方へ（#326）・プライバシーポリシー（#330）は、カード状の枠や行ごとの区切りを使わず、左側の一本線と「ラベル・値」の2列で構成する。部品は `src/components/ui/FactList.tsx`（About の `FestivalIntroSection.tsx` の概要と `EventOverviewTable.tsx` の開催概要は、値の改行を保持する同形の実装を持つ）。

- アクセントラインは`primary-600`、ラベルは白背景で可読性を確保できる`primary-700`を使用する。
- 値は`gray-900`の本文書体とし、テーマ・住所・問い合わせ先などの改行を保持する。
- 640px 以上は2列で、ラベル列のみ固定幅、値は残り幅で自然に折り返す。640px 未満はラベルの下に値を積む（2列のままだと 320px で値の列が約 90px しか残らず、細切れに折れたうえ、メールアドレスが列を押し広げて横にはみ出した。#425）。
- 角丸、影、セル背景、横罫線、節ごとの色分けは追加しない。情報構造と余白だけでグループを表現し、区別は見出しとラベルの言葉で行う。例外は `FactList` の `tone="alert"`（`red-700`。危険の意味を担う情報だけで、現在はご来場の方への「緊急時の対応」のみ）。

---

## CSS 変数

**一次定義は `src/app/globals.css` の `@theme` の1箇所であり、本文書へ値を写さない。** 一覧はそこを読む。

```bash
grep -nE '^[[:space:]]*--(color|font)-' src/app/globals.css
```

2026-09-30 まで、ここに `:root` の写し（34変数）を載せていたが、**11変数（`--font-display` / `--font-body` /
`--text-xs`〜`--text-6xl`）は `globals.css` に存在せず**、`--color-accent` の値も違っていた
（実体は `var(--color-primary-400)`）。逆に実在する `--color-gray-500` などが載っていなかった。
写しは必ず古くなるため削除した。フォントは `--font-sans` / `--font-serif` / `--font-heading` で、
文字サイズは CSS 変数を定義せず Tailwind 既定の `text-*` を使っている（[typography.md](./typography.md) のフォントスケール表を参照）。

---

## 参照・関連ドキュメント

- [typography.md](./typography.md) — Kaisei Opti の使い分け、文字サイズと行送り
- [layout-patterns.md](./layout-patterns.md) — z-index・レイアウト設計原則
- [browser-verification-pitfalls.md](./browser-verification-pitfalls.md) — 検証手順そのものが誤る実例
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — プロジェクト全体設計方針（テーマカラー・多言語対応）
- [require.md](../requires/require.md) — プロジェクト要件定義書
- Google Fonts: Kaisei Opti — https://fonts.google.com/specimen/Kaisei+Opti

---

**最終更新日**: 2026-10-04（色の規約・コントラスト・操作状態・`prose` を別ファイルへ分割し、背景の装飾を足した。#389）
