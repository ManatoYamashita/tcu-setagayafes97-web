# 操作要素の状態（ホバー・フォーカス）

タッチ端末でのホバーの扱いと、全サイト共通のキーボードフォーカスの規約。
[design.md](./design.md) から分割した（2026-10-04、#389）。

---

## 操作要素のホバー

タッチ端末でタップ後の `:hover` が残り、選択状態と誤認される操作要素には、Tailwind CSS v4 のカスタムvariantを使う。

```css
@custom-variant hoverable (@media (hover: hover) and (pointer: fine));
```

`EventFilters`、ニュース・FAQの絞り込み、案内ページ内ナビゲーションのように状態表示と競合する操作要素は `hoverable:hover:` でゲートする。画像拡大やカードの装飾など、タッチ端末で残っても選択状態と誤認しにくい視覚効果は対象外とし、機械的に全 `hover:` を置換しない。

## キーボードフォーカス

全サイト共通の規約。値は `#bf73e3` などと同じく**実配信値で**、枠の画素を読んで確かめる（#176）。

```tsx
"focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-primary-600";
```

- **`focus:` ではなく `focus-visible:`** を使う。マウスクリックでは枠を出さない
- **`focus:outline-none` / `focus:outline-hidden` で UA 既定の枠を消さない。**
  `eslint.config.mjs` の `RESTRICTED_FOCUS_SELECTORS` が落とす。例外は
  スキップリンクの着地点（`<main tabIndex={-1}>`）の `focus-visible:outline-none` だけで、これは射程外
- **`ring-white` や半透明のリング（`ring-white/20`・`ring-primary/20`）を使わない。**
  白いシートの上では 1.00〜1.23:1 しかなかった
- **枠の比較相手はボタンの地色ではなく、枠の外側の下地である。** `outline-offset-3` で
  ボタンから離して描くため、白いボタンでも枠の隣は下地になる

| 下地                                                                                                   | 枠の色                           | 実測比（2026-09-23） |
| ------------------------------------------------------------------------------------------------------ | -------------------------------- | -------------------- |
| 白いシート `#ffffff`                                                                                   | `outline-primary-600`            | 7.45:1               |
| 淡紫ページ背景 `bg-secondary` `#d5a7ed`                                                                | `outline-primary-600`            | 3.75:1               |
| 中間の紫 `rgb(147,75,180)`（旧 `/events/[id]` の not-found / error の暗色グラデーション。#149 で撤去） | `outline-white`                  | 5.38:1               |
| 同上                                                                                                   | `outline-primary-600`            | **1.39:1（NG）**     |
| フッター `bg-primary-600`                                                                              | `outline-white`（`SocialIcons`） | 7.45:1（算出）       |

`Button` は `outline-primary-600` を既定に持つ。暗色の下地に置くときは
`className="focus-visible:outline-white"` を渡す（`cn` が `tailwind-merge` なので既定色は消える）。

**`primary-600` の枠は、紫の下地の上では下地と見分けがつかなくなる**（上表の 1.39:1）。
現在のページで紫の面に操作要素を置いているのはフッターだけだが、紫の面を新設するときは
枠を白にするか、面そのものを白いシートへ寄せること（#149 は後者を選んだ）。

**この規約は ESLint では保証できない。** 下地は同じ className に書かれていないため、
枠の色が下地に対して 3:1 あるかは静的に判定できない（#270 の偽陽性の実測と同じ理由。[color-contrast.md](./color-contrast.md)）。
装置が守るのは「UA の枠を `focus:` で消さない」ことだけで、色は実測で確かめる。
`getComputedStyle` は `oklab()` を返すので、スクリーンショットの画素を読むこと。

---

## 参照・関連ドキュメント

- [color-contrast.md](./color-contrast.md) — 前景色・背景色のコントラスト比
- [access-page-design.md](./access-page-design.md) — Access ページでのフォーカス表示

---

**最終更新日**: 2026-10-04（design.md から分割した。#389）
