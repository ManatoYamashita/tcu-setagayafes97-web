# ランドマークとスキップリンク

`<main>` とスキップリンクの契約。**新しいルートを足すときに必ず読むこと。**

関連: [#177](https://github.com/ManatoYamashita/tcu-setagayafes97-web/issues/177) A /
[layout-patterns.md](./layout-patterns.md) / [layout-e2e.md](./layout-e2e.md)

## 契約

**1ページにつき `<main id="content">` がちょうど1つ。** 0個でも2個でもいけない。

`src/app/layout.tsx` は `<Header />` → `{children}` → `<Footer />` を出すだけで、
**`<main>` は出さない。** 各ルートが自分で出す。

| 出し方                               | 対象                                                                                                                    |
| ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| **`PageSheetLayout` が出す**（推奨） | `/access` `/about/privacy` `/events` `/info` `/info/contact` `/info/faq` `/info/guide` `/special` `/timetable`          |
| **ルートが自前で出す**               | `/`（`src/app/page.tsx`）・`/about`・`/about/sponsors`・`/events/[id]`・`/info/[id]`・`/info/pamphlet`・`/special/[id]` |

自前で出す側は、ページ最外の `<div className="min-h-screen …">` を `<main>` に変えるだけでよい。

```tsx
<main id="content" tabIndex={-1} className="min-h-screen bg-secondary focus-visible:outline-none">
```

`/about` が `PageSheetLayout` を使わないのは、`AboutHero` が `PageHero` ではなく
シートをインラインで再現しているためである（`src/app/[locale]/about/page.tsx`）。

## `PageSheetLayout` の `<main>` は `data-page-sheet` を兼ねる

```tsx
<main id="content" tabIndex={-1} className="… " data-page-sheet>
```

**`data-page-sheet` を消さないこと。** Layout E2E が盤面の器としてこの属性を参照する
（[layout-e2e.md](./layout-e2e.md)）。`<div>` から `<main>` へ変えたのは要素名だけで、
属性もクラスもそのままである。

## 二重 `<main>` を作らない

`PageSheetLayout` が `<main>` を出すため、**その中の要素を `<main>` にしてはいけない。**

過去に `/events` がこれを踏んだ。`EventsView` が結果一覧を `<main>` で包んでおり、
`PageSheetLayout` の `<main>` と合わせて2つになる。サイドバー（`<aside>`）と並ぶ一区画は
ページの `main` ではないので、`<div>` が正しい。

同じ理由で `src/app/events/(list)/loading.tsx` も `<div>` にしてある。

**検算はブラウザで行う。**

```js
document.querySelectorAll("main, [role=main]").length; // 必ず 1
```

## `tabIndex={-1}` は飾りではない

スキップリンクの遷移先がフォーカスを受け取るために要る。`-1` なので
**キーボードの順送りには入らない**（`0` にすると余計な停止点が増える）。

`focus-visible:outline-none` を添えているのは、スキップリンク経由で `<main>` に
フォーカスが入ったときにページ全体が枠で囲まれるのを避けるため。
**操作要素ではないので、リングを消しても到達性は落ちない。**

## スキップリンク

`src/components/layout/Header.tsx` の先頭、`<header>` **より前**に置く。
ページ内で最初のフォーカス可能要素である必要があるため。

```tsx
<a
  href="#content"
  className="fixed left-4 top-4 z-50 -translate-y-24 rounded-lg bg-primary-700 px-4 py-2 text-sm font-semibold text-white shadow-lg focus-visible:translate-y-0"
>
  {messages.header.skipToContent}
</a>
```

**`sr-only` + `focus-visible:not-sr-only` を使っていない。** 両者が同じ `focus-visible`
変種群の中で `position` を奪い合い、結果が Tailwind v4 のカスケード順
（変種群 → プロパティ順）に依存してしまうため。`translate` で画面外へ退避させれば
順序に依存しない。

文言は `src/messages/chrome/*.json` の `header.skipToContent`。
`ChromeMessages = typeof ja` なので、ja に足せば en / zh / ko の欠落は `tsc` が落とす。

### 実測（2026-09-19 / `/timetable` / Chromium）

| 状態       | 位置                           | 画面内   | 備考                                                         |
| ---------- | ------------------------------ | -------- | ------------------------------------------------------------ |
| 静止       | `top: -80px` / `bottom: -44px` | いいえ   | `top-4`(16) + `-translate-y-24`(-96)                         |
| Tab 後     | `top: 16px` / `bottom: 52px`   | **はい** | `:focus-visible` 成立                                        |
| Enter 後   | —                              | —        | `location.hash = "#content"`、フォーカスが `MAIN#content` へ |
| さらに Tab | —                              | —        | main 内の最初の操作要素へ。**ヘッダーの7項目を飛ばせる**     |

白文字 on `primary-700` のコントラストは **11.2:1**。

## 確認方法

新しいルートを足したら、実ブラウザで次の2つを見る。**ソースを読むだけでは足りない。**

```js
// 1. main がちょうど1つで id が content か
[...document.querySelectorAll("main, [role=main]")].map((m) => m.id); // ["content"]

// 2. 最初のフォーカス可能要素がスキップリンクか
document
  .querySelector('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])')
  .textContent.trim(); // "本文へスキップ"
```

---

**最終更新日**: 2026-09-19
