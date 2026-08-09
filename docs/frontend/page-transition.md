# ページ遷移アニメーションと View Transitions API

本ドキュメントでは、React の `<ViewTransition>` によるページ遷移の実装方針と、その過程で判明した Next.js / React 側の落とし穴を記録します。あわせて、Issue #39 で「前ページのDOMが残留する」という**存在しないバグを起票してしまった事故**の原因と、同じ誤診を繰り返さないための計測ルールを定義します。

計測環境そのものの前提は [agent-browser-workflow.md](./agent-browser-workflow.md) の「検証できないもの」節を先に読んでください。

---

## 結論（先に読むこと）

1. **`::view-transition-*` の CSS は、React の `<ViewTransition>` がツリーに無ければ一度も適用されない。** 擬似要素にルールを書いただけでは何も起きません。
2. **`<ViewTransition>` は `src/app/template.tsx` に 1 箇所置けば全ページに効く。** `page.tsx` を個別に包む必要はありません。
3. **`next.config.ts` の `experimental.viewTransition` は next@16.1.0 では読まれていない死に設定。** 付けても外しても挙動は変わりません。
4. **`<div hidden id="S:n">` の中に前ページの内容が残っているのは、自動化タブで rAF が止まっているときだけ起きる計測アーティファクト。** 実ブラウザでは発生しません。

---

## 実装方針

### 起点: `src/app/template.tsx`

```tsx
import { ViewTransition } from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <ViewTransition enter="page-enter" exit="page-exit" default="none">
      <div className="page-transition-wrapper">{children}</div>
    </ViewTransition>
  );
}
```

Next.js の `template.tsx` は `layout.tsx` と異なり**ナビゲーションのたびに再マウントされます。** そのため旧ページの `<ViewTransition>` は unmount（exit）、新ページのそれは mount（enter）として扱われ、React が `document.startViewTransition()` を起動します。

公式ガイドは「`layout.tsx` ではなく各 `page.tsx` を包め」と書いていますが、これは**レイアウトがナビゲーション間で永続するため enter / exit が発火しない**という理由です。`template.tsx` は永続しないので、この制約は当てはまりません。16 ページすべてを個別に包む必要はありません。

| prop             | 値                         | 意味                                                                                                                                         |
| ---------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| `enter` / `exit` | `page-enter` / `page-exit` | `view-transition-class` として DOM に付与される。CSS 側は `::view-transition-new(.page-enter)` のようにクラスセレクタで受ける                |
| `default`        | `"none"`                   | 「更新」ケースの view-transition-name を無効化する。外すと、ページ内の `startTransition` を伴う状態更新のたびに全体がクロスフェードする      |
| `name`           | 省略（`"auto"`）           | React が自動生成した一意名（`_t_4_` 等）を付ける。明示的な `name` を与えると旧新がペア（share）扱いになり、exit / enter ではなくモーフになる |

`<ViewTransition>` は Server Component 内で使えます（`template.tsx` に `"use client"` は不要）。

### ヘッダーの固定

`src/components/layout/Header.tsx` の `<header>` に `viewTransitionName: "site-header"` を付け、CSS 側でアニメーションを止めています。これをしないと、遷移中にヘッダーが root スナップショットの一部としてクロスフェードし、ユーザーが空間的な基準点を失います。

### CSS の落とし穴

`src/app/globals.css` の該当ブロックには、経験的に踏み抜きやすい点が 3 つ入っています。

**1. root のクロスフェードを止めるときは `mix-blend-mode` も戻す**

```css
::view-transition-image-pair(root) {
  isolation: auto;
}
::view-transition-old(root),
::view-transition-new(root) {
  animation: none;
  mix-blend-mode: normal;
  display: block;
}
```

UA 既定では `::view-transition-image-pair` が `isolation: isolate`、old / new が `mix-blend-mode: plus-lighter` です。**アニメーションだけ止めて blend mode を放置すると、新旧スナップショットが加算合成されて白飛びします。**

**2. `prefers-reduced-motion` でワイルドカードを使わない**

`::view-transition-old(*)` は比較的新しい構文です。未対応ブラウザはセレクタリストごとルールを破棄するため、モーション軽減が効かなくなります。クラス指定で確実に打ち消します。

```css
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(.page-exit),
  ::view-transition-new(.page-enter) {
    animation: none !important;
  }
}
```

**3. 遷移中のクリックを通す**

```css
::view-transition {
  pointer-events: none;
}
```

`::view-transition` オーバーレイは既定でポインタイベントを受け取るため、アニメーション中のクリックが失われます。

### タイミング

旧ページ 0.2s で沈んで消える → 0.2s 待ってから新ページ 0.3s で持ち上がって現れる、の非対称構成（合計 0.5s）。exit と enter は**別グループ**なので同時に描画されます。enter に delay を入れないと新旧が重なって二重に見えます。

`filter: blur()` は使っていません。ビューポート全域の blur はフレームごとの再描画コストが大きく、`Performance 90 以上` / `FCP 1.5s 以下` の目標に対して割に合いません。

### 非対応ブラウザ

React が `startViewTransition` の有無を見て分岐するため、非対応ブラウザではアニメーションなしで即座に切り替わります。CSS フォールバックは用意していません。

> [!WARNING]
> `@supports not (view-transition-name: a)` によるフォールバックは**アンチパターン**です。Chrome / Safari / Firefox 144+ は `view-transition-name` をサポートしているため条件が偽になり、フォールバックが適用されません。結果は「モダンブラウザはアニメーションなし、古いブラウザだけアニメーションする」という倒錯した状態です。以前の実装がこれでした。

### 今後の拡張

公式ガイド [Designing view transitions](https://nextjs.org/docs/app/guides/view-transitions) には、本実装で採用していないパターンがあります。着手するなら独立 Issue として扱ってください。

| パターン          | 概要                                                                     | 追加コスト                                |
| ----------------- | ------------------------------------------------------------------------ | ----------------------------------------- |
| 共有要素モーフ    | 企画一覧のサムネイルを詳細ページのヒーローへ変形させる                   | 一覧・詳細の両方に同名 `<ViewTransition>` |
| 方向付き遷移      | 進む / 戻るで横スライドの向きを変える                                    | 全 `<Link>` への `transitionTypes` 設計   |
| Suspense リビール | ローディングスケルトンから実コンテンツへの受け渡しをアニメーションさせる | 各 `Suspense` の fallback を包む          |

---

## `experimental.viewTransition` は死に設定

`next@16.1.0` において、この設定キーはどこからも読まれていません。

| 確認箇所                                                | 結果                                                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `next/dist/` 全体の grep                                | `server/config-schema.js`（zod スキーマ）と `server/config-shared.js`（既定値 `false`）のみ |
| `dist/build/define-env.js` の `__NEXT_*` define 一覧    | view transition 関連の define は存在しない                                                  |
| `@next/swc-darwin-arm64` ネイティブバイナリの `grep -a` | `viewTransition` / `view_transition` ともに 0 件                                            |
| `dist/lib/needs-experimental-react.js`                  | 参照するのは `taint` と `transitionIndicator` のみ。React チャネルも切り替わらない          |

**zod スキーマが受理するため警告が一切出ません。** 「設定したのだから効いているはず」と考えないでください。Next.js 16.3 の公式ガイドも "View transitions work in the App Router with no configuration" と明記しており、この設定は役目を終えています。

なお `import { ViewTransition } from "react"` は動きます。アプリの `react` は Next.js が `next/dist/compiled/react`（19.3.0-canary）へエイリアスするためで、`node_modules/react`（19.2.3 stable）には `ViewTransition` の export はありません。型は `@types/react/canary.d.ts` から供給されます。

---

## `::view-transition-*` の発火条件

`react-dom` が `document.startViewTransition()` を呼ぶのは、内部フラグ `shouldStartViewTransition` が真のときだけです。このフラグを立てるのは以下の 2 箇所のみで、**どちらも `<ViewTransition>` コンポーネント（fiber tag 30）が対象ツリーに存在する場合にしか通りません。**

- `trackEnterViewTransitions()`
- `applyViewTransitionToHostInstances()`

つまり `<ViewTransition>` を書かずに `::view-transition-old(root)` へルールを足しても、擬似要素そのものが生成されないため**完全な死にコード**になります。CSS の存在をもって「実装済み」と判断しないでください。

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

### 自動化タブでの view transition の挙動

自動化タブは `visibilityState: "hidden"` です。仕様上、非表示ドキュメントの view transition は**スキップ**されます。そのため:

- `document.startViewTransition()` は**呼ばれる**（React 側の配線は動いている）
- `transition.ready` は `InvalidStateError: Transition was aborted because of invalid state` で reject する
- `transition.updateCallbackDone` は resolve し、**DOM 更新自体は正常に適用される**
- アニメーションは 1 フレームも描画されない

`ready` の reject は非表示ドキュメント固有の挙動で、実ブラウザでは起きません（[facebook/react#34098](https://github.com/facebook/react/issues/34098)）。**これをバグとして起票しないでください。**

配線が生きているかどうかだけは、rAF に依存せず確認できます。

```javascript
window.__vt = { calls: 0 };
const orig = document.startViewTransition.bind(document);
document.startViewTransition = (arg) => {
  window.__vt.calls++;
  const w = document.querySelector(".page-transition-wrapper");
  window.__vt.name = w ? getComputedStyle(w).viewTransitionName : null;
  window.__vt.cls = w ? getComputedStyle(w).viewTransitionClass : null;
  const t = orig(arg);
  t.ready?.catch(() => {});
  return t;
};
// この後リンクをクリックし、__vt.calls が増えること、
// name に自動生成名（_t_4_ 等）、cls に page-exit が入ることを確認する
```

**アニメーションの見た目そのものは、この方法でも検証できません。** 実機で目視するしかありません。

### 起票前に実機で確認する

Issue #47 に続き Issue #39 も、自動化タブの観測値だけで起票された誤報でした。**「前ページが残る」「アニメーションが動かない」「要素が見えない」という症状は、実ブラウザで再現するまで起票しないでください。** 依頼の書き方は agent-browser-workflow.md の「代替手段: 実機確認を依頼する」を参照。

---

## 関連ドキュメント

- [agent-browser-workflow.md](./agent-browser-workflow.md) - 自動化タブで検証できないものと、実機確認の依頼方法
- [layout-patterns.md](./layout-patterns.md) - z-index・position の使い分け
- [design.md](./design.md) - デザインシステム（カラー・タイポグラフィトークン）
