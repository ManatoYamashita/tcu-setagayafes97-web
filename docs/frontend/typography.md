# タイポグラフィ

ブランドフォント Kaisei Opti の読み込みと使い分け、文字サイズと行送り。
[design.md](./design.md) から分割した（2026-09-30）。色は design.md、コントラストは [color-contrast.md](./color-contrast.md) にある。

## ブランドフォント — Kaisei Opti

東京都市大学 世田谷祭のブランドフォント。

| 属性       | 値                                                                                        |
| ---------- | ----------------------------------------------------------------------------------------- |
| フォント名 | Kaisei Opti（海星 Opti）                                                                  |
| 分類       | Japanese Mincho / Serif                                                                   |
| 制作       | Font Data Inc.                                                                            |
| 提供元     | Google Fonts                                                                              |
| ウェイト   | 400（Regular）/ 700（Bold）。読み込んでいるのはこの2つ（500 を指定すると 400 で描かれる） |
| ライセンス | SIL Open Font License 1.1                                                                 |

### フォントの特性

Kaisei Opti は毛筆書体（楷書）の筆法を残しつつ、現代的な可読性のために最適化された明朝体（Mincho）フォント。「Opti」の名は Optical Sizing（視覚的調整）に由来し、表示サイズに応じたバランスが考慮されている。

**強み:**

- 日本語テキストとの相性が良い（漢字・かな・英数字のウェイトが統一）
- 大サイズでの使用時に筆の抑揚が映える
- ウェイト 700 はインパクトのある見出しに適する

**注意:** 毛筆由来の筆跡（払い・止め・入り）が強く、**本文の連用には向かない。** 本文は `--font-sans` で描き、
Kaisei Opti は見出しに使う（下の「どこに当たるか」）。
過度に使うとデザインが「和風・和食店」的なトーンに偏るため、見出し以外へ広げるときは慎重に判断する。

### 読み込み

```ts
// src/components/layout/KaiseiFont.ts
export const kaiseiOpti = Kaisei_Opti({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-kaisei-opti",
  display: "swap",
  preload: false,
});
```

`loadKaiseiFont()`（`src/components/layout/loadKaiseiFont.ts`）がこのモジュールを遅延 import し、
`document.body` へ変数のクラスを足して初めて `--font-kaisei-opti` が定義される。呼ぶ時点はページで違う。

| ページ        | 読み込む時点                                                                                       | それまでの見出し      |
| ------------- | -------------------------------------------------------------------------------------------------- | --------------------- |
| トップ（`/`） | ABOUT / NEWS のセクションがビューポートへ近づいたとき（`AboutSection` / `NewsSectionInteractive`） | 端末の明朝（`serif`） |
| それ以外      | ハイドレーション後（`DeferredKaiseiFontsLoader`）                                                  | 端末の明朝（`serif`） |

見出しの `font-family` は `var(--font-kaisei-opti, "Kaisei Opti"), serif` で、**フォールバックを省いてはいけない**
（理由は `globals.css` の `@theme` のコメント）。性能上の判断は [performance.md](./performance.md)。

### どこに当たるか

**書体は要素で決まる。サイズ・言語・中身では決まらない。** 2026-09-30 に実装へ合わせた（下の NOTE）。

| 対象                                   | 書体                         | 仕組み                                                                                                                                               |
| -------------------------------------- | ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `h1` / `h2` / `h3`（サイズを問わない） | Kaisei Opti                  | `globals.css` の `@layer base`                                                                                                                       |
| 上のうち、明示して戻した見出し         | `--font-sans`                | `font-sans` / インライン。`AboutHero` の `h1`、`SpecialGuestSection` の `h2`、`TimetableContent` の結果見出し、`NewsCard` の `h3`                    |
| 見出し以外で明示した要素               | Kaisei Opti                  | `font-heading` / `font-serif` / インライン。`AboutHero` の「97」、`ContactForm` のお問い合わせ種別名、`HeroSection` の開催日（年・月・日の数字）ほか |
| 本文・UI（上記以外すべて）             | `--font-sans`                | `body` の `font-sans`（`ui-sans-serif, system-ui, …`。Noto Sans JP は読み込んでいない）                                                              |
| トップのヒーローの大見出し             | Dela Gothic One のサブセット | `font-hero-display`（8文字だけを自前配信）                                                                                                           |

2026-09-30 の本番の実測（Kaisei Opti の読み込み後）: /about の `h2` / `h3` は 16〜36px のすべてが Kaisei Opti、
フッターの `h2`（16px。英語の「Follow Us」を含む）も Kaisei Opti、404 の `h1` の「404」の数字も Kaisei Opti。
sans だったのは明示して戻した `AboutHero` の `h1` だけだった。

**運用:**

- 見出しを sans にしたいときは、その見出しに `font-sans` を付ける（`h1`〜`h3` は既定で Kaisei Opti になる）
- 見出し以外に Kaisei Opti を当てるときは `font-heading` を使う（`font-serif` も同じ値）
- ウェイトは 400 / 700 のどちらかにする

> [!NOTE]
> 以前ここには「見出しは 32px 以上（H1/H2 は 48px 以上）」「本文（16px 以下）・英語・数字・UI ラベルに使わない」
> という規約と、「`--text-3xl` 以下は sans-serif を基本とする」という注記があったが、**実装はどれも行っていなかった**
> （`h1`〜`h3` にサイズも中身も見ずに当てる）。2026-09-30 に、規約のほうを実装に揃えた。

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

> 見出しの書体（Kaisei Opti をどこに当てるか）はサイズでは決まらない。上の「どこに当たるか」を参照。

## 関連ドキュメント

- [design.md](./design.md) - カラーシステム・CSS 変数（コントラストは [color-contrast.md](./color-contrast.md)）
- [performance.md](./performance.md) - Webフォントの配信と preload の検査
- Google Fonts: Kaisei Opti — https://fonts.google.com/specimen/Kaisei+Opti

---

**最終更新日**: 2026-09-30（design.md から分割。フォントスケール表を Tailwind の既定値に合わせ、Kaisei Opti の適用範囲の規約を実装に揃えた）
