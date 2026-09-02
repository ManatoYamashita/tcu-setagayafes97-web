# ブラウザ検証の落とし穴

**観測対象ではなく、確認の仕方が結論を狂わせた実例です。**

いずれも「実装は正しいのに壊れて見える」種類の誤診につながり、原因の切り分けを遠回りさせました。同じ道を通らないための記録です。

関連: [agent-browser-workflow.md](./agent-browser-workflow.md)（測定の手順） / [browser-observation-limits.md](./browser-observation-limits.md)（何が測れるかの判定）

---

## 検証手順そのものが誤ることがある

観測対象ではなく、**確認の仕方**が結論を狂わせた実例です。

### `grep` で Tailwind の任意値を検索するときは `-F`

生成CSSに任意値クラスが含まれるかを確認する場面で、`[...]` が正規表現の文字クラスとして解釈され、**存在するのに 0 件と出ました。**

```bash
# NG: [70dvh] が文字クラスになり一致しない
grep -c 'max-h-\[70dvh\]' app.css   # → 0（誤り）

# OK: 固定文字列として検索する
grep -c -F '70dvh' app.css          # → 2（正しい）
```

「生成されていない」と誤判断し、原因の切り分けを一段遠回りしました。**メタ文字を含むクラス名を数えるときは必ず `-F` を付けてください。**

### CSS のカスタムクラスが効かないときは `.next` を疑う

`globals.css` に追加した `.special-hero-overlay` が生成CSSに含まれず、**HMR でも `.next/cache` の削除でも復旧しませんでした。** `.next` を丸ごと削除して再起動したところ解決しています。

```bash
pkill -f "next dev"
rm -rf .next
pnpm dev
```

Tailwind のユーティリティ（`whitespace-nowrap` など既存語彙）は反映されるのに、**新規に定義したカスタムクラスだけが落ちる**という部分的な症状でした。「書いたはずの CSS が効かない」ときは、コードを疑う前にここを潰してください。

## `resize_window` は viewport を変えない

Claude in Chrome の `resize_window` は**ウィンドウ枠のサイズを変えるだけで、`window.innerWidth` に反映されないことがある**（2026-08-16 実測。375×812 を指定しても `innerWidth` は 1217 のまま）。加えて、縮めた状態から広げようとすると次のエラーで失敗する。

```
Failed to resize window: Invalid value for bounds.
Bounds must be at least 50% within visible screen space.
```

**レスポンシブ検証には使えない。** 代わりに次のどちらかを使う。

### A. agent-browser の `set viewport`（推奨）

```bash
agent-browser set viewport 375 812
```

**`open <url> --viewport 375x812` は効かない**（2026-09-02 実測。`agent-browser close` を
挟んでも `window.innerWidth` は 1280 のままだった）。`screenshot` に付ける形も同様に信用しない。
サブコマンドの `set viewport <w> <h>` は確実に反映される（実測: `innerWidth` が 375 になり、
`lg:hidden` / `hidden lg:block` の切り替わりも追随した）。

### B. コンテナ幅を直接絞る

viewport を変えられない環境では、対象のラッパー要素を絞って**そのブレークポイントで起きることだけ**を測る。近似だが、テーブルの横スクロール成立の確認には十分。

```js
const wrap = document.querySelector(".max-w-4xl");
wrap.style.maxWidth = "375px";
wrap.style.width = "375px";
await new Promise((r) => setTimeout(r, 600));

// コンテナが横スクロール可能か / ページ本体が溢れていないか
[...document.querySelectorAll("table")].map((t) => {
  const c = t.parentElement;
  return {
    scrollable: c.scrollWidth > c.clientWidth,
    tableW: t.scrollWidth,
    containerW: c.clientWidth,
  };
});
document.documentElement.scrollWidth > document.documentElement.clientWidth; // false であること
```

**限界:** メディアクエリは viewport 基準で評価されるため、この方法では `md:` 以上／未満の切り替わりは再現できない。**ヘッダーのデスクトップ／モバイル切り替えのような検証は実機で行うこと。**

> [!NOTE]
> **`agent-browser eval` はトップレベル `await` を受け付けない。** 待機を挟む場合は非同期 IIFE で包み、明示的に `return` する。
>
> ```bash
> agent-browser eval "(async () => {
>   document.querySelector('.target').style.width = '375px';
>   await new Promise((r) => setTimeout(r, 700));
>   return JSON.stringify({ w: document.querySelector('.target').clientWidth });
> })()"
> ```
>
> また **`--viewport` はセッション再利用時に無視される。** 幅を変えるたびに `agent-browser close` を挟むこと。

## 外部SPAの管理画面は「操作」に使わない

本ワークフローが対象とするのは**観測**（測定・スクリーンショット・DOM 状態の取得）である。**外部サービスの管理画面を自動操作して設定を投入する用途には使えない。**

2026-08-16 に microCMS の管理画面でカスタムフィールドを作成しようとして失敗した。原因は次の3点で、いずれも「自分たちが書いていない SPA」では一般に起こりうる。

1. **内部状態が実マウスイベントに依存する。** スクリプトからの `click()` では「どの行を編集中か」が更新されず、選択が別の行へ適用される
2. **閉じたはずのダイアログが DOM に残る。** `[role="dialog"]` の有無で開閉を判定すると常に「開いている」と誤認する
3. **セレクタが行ごとに変わる。** `placeholder` が1行目 `例: title` / 2行目 `例: body` のように変化し、固定セレクタで要素数を数えられない

**値の入力だけは自動化できる**（`HTMLInputElement.prototype.value` のセッター + `input` イベント発火で React に反映される）。選択 UI が絡んだ時点で手作業に切り替えること。

判断基準: **失敗が本番データを壊しうる操作は自動化しない。** 観測は失敗しても読み違えるだけだが、設定投入の失敗は残る。

詳細な症状と microCMS 固有の制約は [../dev/microcms.md](../dev/microcms.md) を参照。

---

**作成日:** 2026-08-16（agent-browser-workflow.md から分離）
