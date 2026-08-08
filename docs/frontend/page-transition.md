# ページ遷移アニメーションと View Transitions API

本ドキュメントでは、ページ遷移アニメーションの実装方針と、View Transitions API を採用しなかった理由を記録します。あわせて、Issue #39 で「前ページのDOMが残留する」という**存在しないバグを起票してしまった事故**の原因と、同じ誤診を繰り返さないための計測ルールを定義します。

計測環境そのものの前提は [agent-browser-workflow.md](./agent-browser-workflow.md) の「検証できないもの」節を先に読んでください。

---

## 結論（先に読むこと）

1. **`::view-transition-*` の CSS は、React の `<ViewTransition>` がツリーに無ければ一度も適用されない。** 擬似要素にルールを書いただけでは何も起きません。
2. **`next.config.ts` の `experimental.viewTransition` は next@16.1.0 では読まれていない死に設定。** 付けても外しても挙動は変わりません。
3. **ページ遷移アニメーションは `src/app/template.tsx` + `.page-transition-wrapper` の CSS アニメーションで実装する。** View Transitions API は使いません。
4. **`<div hidden id="S:n">` の中に前ページの内容が残っているのは、自動化タブで rAF が止まっているときだけ起きる計測アーティファクト。** 実ブラウザでは発生しません。

---

## 実装方針

`src/app/template.tsx` は `.page-transition-wrapper` の `<div>` を置くだけです。

```tsx
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-transition-wrapper">{children}</div>;
}
```

Next.js の `template.tsx` は `layout.tsx` と異なり**ナビゲーションのたびに再マウントされる**ため、このラッパーに付けた CSS アニメーションは遷移ごとに再生されます。JS を一切増やさずに enter アニメーションが得られる、`template.tsx` 本来の用途です。

`src/app/globals.css` 側は次の 3 点を守ります。

| 項目                     | 決定                                    | 理由                                                                                                                                                                              |
| ------------------------ | --------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `animation-fill-mode`    | `backwards`（`forwards` / `both` 禁止） | `forwards` / `both` だと終了後も `transform` が残り、`position: fixed` の子孫に対する包含ブロックを作り続ける。`to` の値は既定状態と同一なので `backwards` でも見た目は変わらない |
| `filter: blur()`         | 使わない                                | ビューポート全域の blur はフレームごとの再描画コストが大きい。`Performance 90 以上` / `FCP 1.5s 以下` の目標に対して割に合わない                                                  |
| `prefers-reduced-motion` | `animation: none !important` で打ち消す | ページ全体が動くため、モーション過敏の影響が最も大きい部類                                                                                                                        |

初回ロードでもアニメーションが走ります。`opacity: 0` 始まりなので LCP に影響しうるため、duration は 0.4s 程度に抑えています。

---

## View Transitions API を使わない理由

### `::view-transition-*` の発火条件

`react-dom` が `document.startViewTransition()` を呼ぶのは、内部フラグ `shouldStartViewTransition` が真のときだけです。このフラグを立てるのは以下の 2 箇所のみで、**どちらも `<ViewTransition>` コンポーネント（fiber tag 30）が対象ツリーに存在する場合にしか通りません。**

- `trackEnterViewTransitions()`
- `applyViewTransitionToHostInstances()`

つまり `<ViewTransition>` を書かずに `::view-transition-old(root)` / `::view-transition-new(root)` へルールを足しても、擬似要素そのものが生成されないため**完全な死にコード**になります。以前の実装がこの状態でした。

### `@supports not (view-transition-name: a)` は逆効果になる

VT 非対応ブラウザ向けのフォールバックとして

```css
@supports not (view-transition-name: a) {
  .page-transition-wrapper {
    animation: ...;
  }
}
```

と書くのはアンチパターンです。Chrome / Safari / Firefox 144+ は `view-transition-name` を**サポートしている**ため条件が偽になり、フォールバックが適用されません。結果として「モダンブラウザはアニメーションなし、古いブラウザだけフェードインする」という倒錯した状態になります。

上の 2 点が重なると、**遷移アニメーションが全ブラウザで消えているのに CSS 上は実装されているように見える**状態が生まれます。CSS の存在をもって「実装済み」と判断しないでください。

### `experimental.viewTransition` は死に設定

`next@16.1.0` において、この設定キーはどこからも読まれていません。

| 確認箇所                                                | 結果                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `next/dist/` 全体の grep                                | `server/config-schema.js`（zod スキーマ）と `server/config-shared.js`（既定値 `false`）のみ |
| `dist/build/define-env.js` の `__NEXT_*` define 一覧    | view transition 関連の define は存在しない                                                  |
| `@next/swc-darwin-arm64` ネイティブバイナリの `grep -a` | `viewTransition` / `view_transition` ともに 0 件                                            |
| `dist/lib/needs-experimental-react.js`                  | 参照するのは `taint` と `transitionIndicator` のみ。React チャネルも切り替わらない          |

**zod スキーマが受理するため警告が一切出ません。** 「設定したのだから効いているはず」と考えないでください。Next.js 16.3 の公式ガイドも "View transitions work in the App Router with no configuration" と明記しており、この設定は役目を終えています。

### 将来 View Transitions を正式導入する場合

公式ガイド [Designing view transitions](https://nextjs.org/docs/app/guides/view-transitions) の手順に従い、`react` から `ViewTransition` を import して**各 `page.tsx` を包む**必要があります（`layout.tsx` では enter / exit が発火しません）。方向付き遷移を行う場合は `<Link transitionTypes={[...]}>` の設計もセットで必要です。対象ページ数が多いため、着手するなら独立した Issue として扱ってください。

---

## Issue #39 の誤診: `<div hidden id="S:0">` の正体

### 報告内容

`/timetable` から `/events` へクライアントサイド遷移した後、`document.querySelectorAll('h1').length` が 2 を返し、前ページの `<h1>タイムテーブル</h1>` が `0×0` のサイズで残り続ける。`aria-hidden` も `inert` も付いていないため支援技術に露出する、という内容でした。原因は `experimental.viewTransition` と断定されていました。

### 実際の原因

残留していたのは React の**ストリーミング用コンテナ `<div hidden id="S:0">`** です。SSR で Suspense 境界の中身が後から流れてくると、React は一旦 `<body>` 末尾の `<div hidden id="S:n">` へ吐き出し、インラインスクリプトの `$RC()` で本来の位置へ差し込みます。その `$RC` の実装がこうなっています。

```js
$RC = function (a, b) {
  if ((b = document.getElementById(b)))
    (a = document.getElementById(a))
      ? ((a.previousSibling.data = "$~"),
        $RB.push(a, b),
        2 === $RB.length &&
          ("number" !== typeof $RT
            ? requestAnimationFrame($RV.bind(null, $RB)) // ← ここ
            : setTimeout($RV.bind(null, $RB) /* ... */)))
      : b.parentNode.removeChild(b);
};
```

**実際に DOM へ差し込む `$RV` の実行が `requestAnimationFrame` に積まれます。** 自動化タブは `visibilityState: "hidden"` で rAF が停止しているため `$RV` は永久に呼ばれず、

- Suspense 境界のマーカーは `$~`（差し込み待ち）のまま
- 中身は `<div hidden id="S:0">` に取り残される
- 可視ページ側にはローディングスピナー（fallback）が出たまま

という状態で固まります。これが「前ページのDOMが残留している」ように見えていた正体です。

### 実証

rAF が止まった同じタブで `$RV($RB)` を手動実行したところ、症状が完全に解消しました。

| 計測項目                     | `$RV` 実行前 | `$RV` 実行後 |
| ---------------------------- | ------------ | ------------ |
| `framesIn1s`                 | `0`          | `0`          |
| 境界マーカー                 | `$~`         | `$`          |
| `#S:0` の存在                | あり         | **なし**     |
| ドキュメント全体の `h1` 件数 | 1            | 1            |
| 可視ページ内の `h1` 件数     | **0**        | **1**        |

差し込み後は `/timetable` ↔ `/events` を 8 回往復しても `h1` は毎回 1 件、`#S:0` も再出現しませんでした。**蓄積しません。**

### 報告のうち事実と異なっていた点

| 報告                                    | 実際                                                                                                                                     |
| --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 原因は `experimental.viewTransition`    | 当該設定は読まれておらず、因果関係が成立しない。切り分けで変わったのは「フルリビルドが走ったこと」と「別の計測ラウンドで測ったこと」だけ |
| 支援技術のアクセシビリティツリーに残る  | 残留コンテナは `hidden` 属性により `display: none`。`display: none` の部分木は仕様上アクセシビリティツリーから除外される                 |
| `getComputedStyle().display` が `block` | 計測したのは `<h1>` 自身。`display: none` は**子孫の computed `display` を書き換えない**ため、この観測値は祖先について何も語らない       |

---

## 計測ルール

### 要素の可視性は「祖先すべて」を見る

`display: none` は子孫の computed `display` を書き換えません。要素単体の `getComputedStyle().display` を見ても、その要素が表示されているかどうかは**判定できません**。`getBoundingClientRect()` が `0×0` なら、まず祖先を疑ってください。

```javascript
// 各 h1 について body までの全祖先を、可視性に関わる値ごと出す
[...document.querySelectorAll("h1")].map((h1) => {
  const chain = [];
  for (let el = h1; el && el !== document.body; el = el.parentElement) {
    const cs = getComputedStyle(el);
    chain.push({
      tag: el.tagName,
      cls: el.className || "(none)",
      id: el.id || undefined,
      hidden: el.hasAttribute("hidden") || undefined,
      inert: el.hasAttribute("inert") || undefined,
      ariaHidden: el.getAttribute("aria-hidden") || undefined,
      display: cs.display,
      visibility: cs.visibility,
      contentVisibility: cs.contentVisibility,
    });
  }
  return { text: h1.textContent.trim(), rect: h1.getBoundingClientRect().toJSON(), chain };
});
```

### DOM 構造の観測でも rAF 生存確認は必要

[agent-browser-workflow.md](./agent-browser-workflow.md) の切り分け表では DOM 構造の確認を「検証できる」側に分類していますが、**Suspense のストリーミング差し込みのように DOM 操作そのものが rAF に依存しているケースがあります。** DOM 件数を数えるだけの計測でも、`framesIn1s` を記録に残してください。

`framesIn1s: 0` の環境で `<div hidden id="S:n">` を見つけたら、バグではなく計測アーティファクトです。`$RV($RB)` を手動実行して消えるなら確定です。

### 自動化タブではページ本体が opacity: 0 のまま止まる

`.page-transition-wrapper` に enter アニメーションが付いた副作用として、**rAF が止まった自動化タブではページ本体が `opacity: 0`・`translateY(14px)` の開始状態で固まります。** CSS アニメーションのタイムラインも非表示タブでは進まないためで、これ自体は不具合ではありません。

スクリーンショットやレイアウト計測の前に、有限長のアニメーションだけを強制終了させてください。無限ループのアニメーション（スピナー、blob）に `finish()` を呼ぶと `InvalidStateError` になるため、必ず絞り込みます。

```javascript
document.getAnimations().forEach((a) => {
  if (Number.isFinite(a.effect?.getComputedTiming?.().endTime)) {
    try {
      a.finish();
    } catch {}
  }
});
```

これを踏まずに撮ったスクリーンショットは「ページが真っ白」に見えます。**それをバグとして起票しないでください。**

### 起票前に実機で確認する

Issue #47 に続き Issue #39 も、自動化タブの観測値だけで起票された誤報でした。**「前ページが残る」「アニメーションが動かない」「要素が見えない」という症状は、実ブラウザで再現するまで起票しないでください。** 依頼の書き方は agent-browser-workflow.md の「代替手段: 実機確認を依頼する」を参照。

---

## 関連ドキュメント

- [agent-browser-workflow.md](./agent-browser-workflow.md) - 自動化タブで検証できないものと、実機確認の依頼方法
- [layout-patterns.md](./layout-patterns.md) - z-index・position の使い分け（`transform` が包含ブロックを作る話の背景）
- [design.md](./design.md) - デザインシステム（カラー・タイポグラフィトークン）
