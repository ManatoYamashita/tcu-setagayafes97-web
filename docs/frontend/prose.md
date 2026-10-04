# リッチテキスト（`prose`）

[design.md](./design.md) から分割した（2026-10-04、#389）。

---

## 使用箇所

microCMS のリッチテキストは `dangerouslySetInnerHTML` で挿入し、コンテナに `prose` クラスを付けている。**6箇所すべてを列挙する。**

| ファイル                                    | 備考                                                      |
| ------------------------------------------- | --------------------------------------------------------- |
| `src/app/info/[id]/page.tsx`                | 記事本文。測度を `max-w-[38em]` で絞っている唯一の箇所    |
| `src/components/special/SpecialProfile.tsx` |                                                           |
| `src/components/special/NoticeList.tsx`     |                                                           |
| `src/components/special/GoodsTable.tsx`     |                                                           |
| `src/components/special/TicketTable.tsx`    | **2箇所。** うち1つはテーブルセル内で `[&_p]:my-1` を併用 |

> [!NOTE]
> `EventDetail.tsx` は `prose` を**使っていない**（2026-09-18 に確認）。
> 本節は以前この6件目に `EventDetail` を挙げていたが誤りだった。

## `@tailwindcss/typography` は導入していない

そのため **`prose-lg` / `prose-invert` / `prose-sm` / `prose-a:*` / `prose-p:*` / `prose-headings:*` はCSSを1行も生成しない**。単なるクラス名として存在するだけである。

**これが厄介なのは、ビルドもLintも通り、警告も出ないこと。** `prose-a:text-primary` と書いてあれば効いているように読めるが、実際にはリンクは Preflight の `a { color: inherit }` のまま黒く表示される。2026-08-25 の指摘「リンクを紫にして」はこれが原因だった。

**2026-09-18 時点で、無効な修飾子はソースから全て削除済み**（#179）。復活させないこと。
同じ意図を表現したい場合は、CSSを実際に生成する任意バリアント（`[&_p]:my-1` など）を使う。

## `.prose` が実際に持っている規則

**素の `prose` クラスだけが意味を持つ。** その中身は `src/app/globals.css` の `@layer base` に手書きされており、
**microCMS が実際に出力する要素だけ**を対象にしている。

| セレクタ                 | 与えているもの                                                                 |
| ------------------------ | ------------------------------------------------------------------------------ |
| `.prose a`               | `--color-primary-dark` / `text-underline-offset` / hover・focus-visible で下線 |
| `.prose p`               | `margin-block: 1em` / `line-height: 1.8`。先頭と末尾の子では余白を殺す         |
| `.prose h2`, `.prose h3` | `1.5rem` / `1.25rem`、`font-weight: 700`、前 1.5em・後 0.5em                   |
| `.prose ul`, `.prose ol` | `list-style: disc` / `decimal`、`padding-inline-start: 1.5em`                  |
| `.prose li`              | `margin-block: 0.25em` / `line-height: 1.8`                                    |

**Preflight を通した状態がどれだけ壊れるかは実測してある**（2026-09-18 / 本番 `/info/theme` に要素を注入）。

| 要素         | 手当て前の計算値                             | 実害                           |
| ------------ | -------------------------------------------- | ------------------------------ |
| `p`          | `margin: 0px`                                | 6段落が境界の無い1つの塊になる |
| `h2`         | `16px` / `400`                               | 本文と同寸。書体だけが変わる   |
| `ul`, `ol`   | `list-style-type: none`, `padding-left: 0px` | **中黒と番号が消える**         |
| `blockquote` | `border-left-width: 0px`                     | 引用と地の文の区別が付かない   |

**順序付きリストの番号は体裁ではなく情報である。** ここを手当てしない選択肢は無い。

`blockquote` / `table` / `figure` は入稿実績が無いため、あえて規則を書いていない。
**入稿されてから足すこと。** 使われない規則は、次に読む人に「対応済み」と誤解させる。

## 装飾を足す場合は `@layer base` に直接書く

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

**リンク色に `--color-primary`（実配信 `#bf73e3`）を使ってはいけない。** 白背景でのコントラストが 3.1:1 しかなく、[color-contrast.md](./color-contrast.md)「コントラスト比（アクセシビリティ）」の「Primary 紫は**白背景での通常テキストに使用禁止**」に抵触する。本文中のインラインリンクは大テキストでも CTA でもないため、`--color-primary-dark`（実配信 `#7b359a`、7.45:1）を使う。

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

- [color-contrast.md](./color-contrast.md) — リンク色の根拠（白背景のコントラスト）

---

**最終更新日**: 2026-10-04（design.md から分割した。#389）
