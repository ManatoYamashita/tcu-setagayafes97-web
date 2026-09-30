# タイポグラフィ

ブランドフォント Kaisei Opti の読み込みと使い分け、文字サイズと行送り。
[design.md](./design.md) から分割した（2026-09-30）。色とコントラストは design.md にある。

## ブランドフォント — Kaisei Opti

東京都市大学 世田谷祭のブランドフォント。

| 属性       | 値                                         |
| ---------- | ------------------------------------------ |
| フォント名 | Kaisei Opti（海星 Opti）                   |
| 分類       | Japanese Mincho / Serif                    |
| 制作       | Font Data Inc.                             |
| 提供元     | Google Fonts                               |
| ウェイト   | 400（Regular）/ 500（Medium）/ 700（Bold） |
| ライセンス | SIL Open Font License 1.1                  |

### フォントの特性

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

### 読み込み（Next.js）

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

### 使用用途と禁止事項

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

## フォントスケール

**文字サイズは Tailwind の既定（`tailwindcss` 4.1.18 の `theme.css`）をそのまま使っており、
`src/app/globals.css` では上書きしていない。** 行送りも、`leading-*` を付けない限り下表の既定値になる
（例外: `.prose p` は `globals.css` で `line-height: 1.8`）。使用数は 2026-09-30 に `src/` を数えた値。

| クラス      | サイズ | 既定の行送り | 使用数 | 主な用途（目安）     | Weight（目安） |
| ----------- | ------ | ------------ | ------ | -------------------- | -------------- |
| `text-7xl`  | 72px   | 1            | 2      | —                    | —              |
| `text-6xl`  | 60px   | 1            | 9      | ページタイトル（H1） | 700            |
| `text-5xl`  | 48px   | 1            | 13     | セクション大見出し   | 700            |
| `text-4xl`  | 36px   | 1.11         | 13     | セクション見出し     | 700            |
| `text-3xl`  | 30px   | 1.2          | 21     | カード見出し         | 500–700        |
| `text-2xl`  | 24px   | 1.33         | 32     | サブ見出し           | 500            |
| `text-xl`   | 20px   | 1.4          | 13     | リード文             | 400–500        |
| `text-lg`   | 18px   | 1.56         | 33     | —                    | —              |
| `text-base` | 16px   | 1.5          | 49     | 本文テキスト         | 400            |
| `text-sm`   | 14px   | 1.43         | 146    | 補足・キャプション   | 400            |
| `text-xs`   | 12px   | 1.33         | 52     | ラベル・タグ         | 400            |

以前この表は「モジュラースケール（比率 1.25）」を基準とし、`--text-4xl` を 38px、行送りを 1.1〜1.75 としていたが、
**どれも実装には無い値だった**（Tailwind の既定は比率が一定でなく、`text-4xl` は 36px）。
`--text-*` という CSS 変数も定義していない（2026-09-30 に実測に合わせて書き直した）。

```bash
# 使用数を数え直す（sm: / md: / lg: の付いたものも含む）
grep -rhoE '(^|[^a-z0-9-])(sm:|md:|lg:|xl:)?text-(xs|sm|base|lg|xl|[2-9]xl)\b' src | grep -oE 'text-[a-z0-9]+' | sort | uniq -c | sort -rn
```

> [!WARNING]
> **Kaisei Opti の適用範囲は、規約と実装が食い違っている（未解決）。**
> 上の「使用用途と禁止事項」は見出しに 32px 以上を求め、以前この節も「`--text-3xl` 以下は sans-serif を基本とし、
> Kaisei Opti は避ける」としていた。しかし `globals.css` の `@layer base` は **`h1` / `h2` / `h3` の全てに**
> Kaisei Opti を当てており、サイズを見ない。たとえば企画詳細の404の見出し（`h2`、`text-2xl` = 24px）は Kaisei Opti で描かれる。
> どちらに揃えるかはデザイン判断が要る。なお本文の書体 `--font-sans` は `ui-sans-serif, system-ui, …` で、
> Noto Sans JP は読み込んでいない。

## 関連ドキュメント

- [design.md](./design.md) - カラーシステム・コントラスト・CSS 変数
- [performance.md](./performance.md) - Webフォントの配信と preload の検査
- Google Fonts: Kaisei Opti — https://fonts.google.com/specimen/Kaisei+Opti

---

**最終更新日**: 2026-09-30（design.md から分割。フォントスケール表を Tailwind の既定値に合わせた）
