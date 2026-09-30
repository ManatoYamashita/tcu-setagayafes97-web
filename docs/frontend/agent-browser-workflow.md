# agent-browser ワークフロー

**agent-browser** でレイアウトを数値で測り、参考サイトやローカル実装と比べるための手順。
コマンドと測定値はすべて agent-browser 0.38.1 で 2026-09-30 に本番（`https://setagayafes.org/`）で実行して確かめた。

> [!IMPORTANT]
> **測る前に [browser-observation-limits.md](./browser-observation-limits.md) を読むこと。**
> 実行環境は一定ではなく、`framesIn1s` を測らずに得た観測値は報告できない。
> うまくいかないときは [browser-verification-pitfalls.md](./browser-verification-pitfalls.md)
> （viewport の変え方・ハイドレーション前の読み取り・`.next` のキャッシュなど、**手順そのものが誤診を生む実例**）。

## 前提 — `eval` が返すのは最後の式の値だけ

**`agent-browser eval` の出力は、評価した最後の式の値である。`console.log()` の中身は返らない**
（`console.log()` 自体の値は `undefined` なので `null` と表示される）。ログを見るには別途
`agent-browser console` を叩く必要があり、どの `eval` の出力かも混ざる。

**測定スニペットは `JSON.stringify(...)` を最後の式にして値を返す。** 以前この文書に載っていた
スニペットは `console.log` / `console.table` で出力していたため、そのまま実行すると `null` しか表示されなかった。
待機が要るときは非同期 IIFE で包んで `return` する（トップレベル `await` は受け付けない）。

## 基本操作

```bash
# 開く（Vercel のページは読み込み完了を待てずにタイムアウト表示が出ることがある。表示されていれば測れる）
agent-browser open https://setagayafes.org/

# 読み込み完了を待つ。URL も一緒に見ること（下の CAUTION）
agent-browser eval 'location.href + " " + document.readyState'

# 同じサイト内の遷移（open がタイムアウトする場合もこちらは通る）
agent-browser eval "location.href='https://setagayafes.org/events'; 1"

# モーションを止める（レイアウトを測る・撮るときは先に実行する。下の NOTE）
agent-browser set media reduced-motion

# viewport を変える（幅を変えられるのはこれだけ）
agent-browser set viewport 375 667

# スクリーンショット（幅は直前の set viewport で決まる）
agent-browser screenshot /tmp/screenshot.png

# ページの console 出力を見る
agent-browser console
```

> [!WARNING]
> **`screenshot <path> --viewport WxH` と書いてはいけない。** `--viewport` が出力先のファイル名として
> 解釈され、viewport は変わらず、作業ディレクトリに `--viewport` という PNG が残る。
> `open --viewport` と `window.resizeTo()` も効かない（[browser-verification-pitfalls.md](./browser-verification-pitfalls.md) の表）。

> [!CAUTION]
> **`readyState` だけで読み込み完了を判定しない。** `open` がタイムアウトするとページは `about:blank` のまま残り、
> **`about:blank` の `readyState` も `"complete"` である。** そのまま測るとすべての要素が `null` になる
> （2026-09-30、本文のスニペットを検証中に実際に踏んだ）。`location.href` が対象の URL になっていることも確かめる。
> 開けないときは `eval "location.href='<URL>'; 1"` で遷移させる。

> [!CAUTION]
> **`set viewport` は、対象のページを開いてから実行する。** 同じサイト内の遷移では幅が保たれたが、
> `about:blank` で `set viewport` してから本番を開くと既定幅（1000×678）へ戻った（2026-09-30 実測）。
> **測定値には必ず `innerWidth` を含める。** 幅が変わっていなくても、値だけ見れば正常に見える。

## 測定スニペット

### Header と Hero の配置

```js
(() => {
  const header = document.querySelector("header");
  const hero = document.querySelector("main section, section");
  const style = getComputedStyle(header);
  return JSON.stringify({
    innerWidth,
    innerHeight,
    header: { height: header.offsetHeight, position: style.position, zIndex: style.zIndex },
    hero: { top: hero.offsetTop, height: hero.offsetHeight },
    heroStartsBelowHeader: hero.offsetTop === header.offsetHeight,
  });
})();
```

2026-09-30 の本番トップページ:

| viewport  | `header.height` | `hero.top` | `hero.height` | 内訳                           |
| --------- | --------------- | ---------- | ------------- | ------------------------------ |
| 1920×1080 | 107             | 107        | 992           | 1080 − 88（`--header-height`） |
| 375×667   | 107             | 107        | 579           | 667 − 88                       |

**Hero の高さは「viewport − 実際の Header 高さ」ではない。** 上の実測は compact 化（2026-09-30）前のトップで、当時の Hero は
`h-[calc(100svh-var(--header-height))]` で、`--header-height` は `5.5rem`（88px）の近似値である。
Header の実高はスクロール前 107px / 後 77px で、一次情報は [layout-patterns.md](./layout-patterns.md) の表。

### z-index の一覧

```js
JSON.stringify(
  [...document.querySelectorAll("*")]
    .map((el) => ({ el, style: getComputedStyle(el) }))
    .filter(({ style }) => style.position !== "static" && style.zIndex !== "auto")
    .map(({ el, style }) => ({
      tag: el.tagName.toLowerCase(),
      zIndex: Number(style.zIndex),
      position: style.position,
      label: (el.id || String(el.className)).slice(0, 40),
    }))
    .sort((a, b) => b.zIndex - a.zIndex)
);
```

2026-09-30 の本番では、z-40 以上はスキップリンク（`a`、z-50、`fixed`）と Header（z-40、`sticky`）の2つ。
**モーションを止めずにデスクトップ幅で開くと、オープナーの全画面レイヤー（`Opener.tsx`、z-60）も出る。**
自動操作下では GSAP が始まらずに覆ったまま残ることがあるため、先に `set media reduced-motion` を実行する。
**z-40 以上が Header だけとは限らない。** スキップリンク・下書きバナー・モバイルメニューが z-50、
言語切替とナビのドロップダウンが z-60 を使っている。値の方針は [layout-patterns.md](./layout-patterns.md) の標準スケール。

### Layout Shift（CLS）

```js
(async () => {
  const shifts = await new Promise((resolve) => {
    const entries = [];
    new PerformanceObserver((list) => entries.push(...list.getEntries())).observe({
      type: "layout-shift",
      buffered: true,
    });
    setTimeout(() => resolve(entries), 1000);
  });
  const cls = shifts.filter((e) => !e.hadRecentInput).reduce((sum, e) => sum + e.value, 0);
  return JSON.stringify({ innerWidth, cls: Number(cls.toFixed(4)), shifts: shifts.length });
})();
```

`hadRecentInput` の付いたシフト（操作直後のもの）は CLS に数えない。本番トップの 1920×1080 で `cls: 0`。
**読み込み直後に測ること。** 観測は `buffered: true` でそれまでの分も拾うが、ページを操作した後の値は意味が変わる。

## デザイン再現の手順

1. **参考サイトを測る** — 参考サイト（[.claude/CLAUDE.md](../../.claude/CLAUDE.md) のデザイン仕様）を開き、
   `set viewport` で幅を決めてから上のスニペットを流し、スクリーンショットを撮る
2. **実装する** — 高さ・z-index の方針は [layout-patterns.md](./layout-patterns.md) に従う
3. **同じ幅で同じスニペットを流して比べる** — 差分は数値で見る。スクリーンショットは並べて目視する

```bash
# スニペットをファイルに置いてから流す（ファイル名は任意。リポジトリには置いていない）
agent-browser set viewport 1920 1080
agent-browser eval "$(cat /tmp/measure-layout.js)"
agent-browser screenshot /tmp/reference.png
```

## レスポンシブ検証

| デバイス | viewport  | 用途                      |
| -------- | --------- | ------------------------- |
| Mobile   | 375×667   | iPhone SE / 8 相当        |
| Tablet   | 768×1024  | iPad 相当                 |
| Desktop  | 1920×1080 | 一般的な FHD ディスプレイ |

対応下限の 320px は Layout E2E が測っている（[layout-e2e.md](./layout-e2e.md)）。

```bash
# read で分けるのは zsh でも動かすため（zsh は引用符の無い変数を単語分割しない）
for vp in "375 667 mobile" "768 1024 tablet" "1920 1080 desktop"; do
  read -r w h name <<< "$vp"
  agent-browser set viewport "$w" "$h"
  agent-browser eval "$(cat /tmp/measure-layout.js)"
  agent-browser screenshot "/tmp/localhost-$name.png"
done
```

各幅で確かめること:

- `innerWidth` が指定した幅になっている（なっていなければ以降の値は無意味）
- `heroStartsBelowHeader` が `true`
- `hero.height` が `innerHeight − 88`
- 横スクロールが出ていない（`document.documentElement.scrollWidth <= innerWidth`）

## 関連ドキュメント

- [browser-observation-limits.md](./browser-observation-limits.md) - 観測の前提と限界
- [browser-verification-pitfalls.md](./browser-verification-pitfalls.md) - 検証手順そのものが誤る実例
- [layout-patterns.md](./layout-patterns.md) - Header / Hero の寸法、z-index の標準スケール
- [../dev/microcms.md](../dev/microcms.md) - 管理画面が自動操作に適さない理由

---

**作成日:** 2026-02-07
**最終更新:** 2026-09-30（実測に合わせて全面改訂。`console.log` では値が返らないスニペット、古い寸法、
存在しない `measure-header.js` を除いた）
