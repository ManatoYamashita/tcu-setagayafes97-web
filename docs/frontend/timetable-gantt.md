# タイムテーブル盤面（ガントチャート）の設計

`/timetable` のデスクトップ盤面（`src/components/timetable/TimetableGantt.tsx`）の設計判断と、
そこへ至った事故の記録です。

関連: [layout-patterns.md](./layout-patterns.md)（レイアウト全般） /
[design.md](./design.md)（白いシート上のコントラスト） /
[browser-verification-pitfalls.md](./browser-verification-pitfalls.md)（検証手順）

---

## 縦方向の寸法は必ず px で持つ

**これが盤面の第一の規則です。** `h-full` / `height: %` / `top: %` を縦に使わないでください。

### 起きたこと（#148）

盤面は次の構造をしていました。

```tsx
<div className="relative" style={{ minHeight: "600px" }}>   {/* ← height を持たない */}
  <div className="ml-24 relative h-full">                    {/* ← 0px に解決される */}
    <div style={{ top: `${top}%`, height: `${height}%` }} /> {/* ← 全部 0px 基準 */}
```

CSS の百分率高さは、**親の高さが確定しているときにしか解決されません。**
`min-height` は親の高さを確定させないため、`height: 100%` は `auto` として扱われ、
中身が絶対配置しかない要素は 0px になります。

結果、`top: 6.25%` も `top: 37.5%` も 0px となり、**別時刻の企画がすべて同じ座標に、
高さ 0 で重なりました。** 時刻による位置の振り分けという、このページの機能そのものが
成立していなかったことになります。

`min-height` を `height` に変えるだけでも直りますが、それでは「誰かが後日また `min-height` に
戻す」余地が残ります。**盤面の高さを数値で持ち、`style={{ height: 数値 }}` で渡す**方式なら、
親の解決に依存する箇所がゼロになり、この事故は構造的に起きません。

```
盤面高さ = (endHour - startHour) × HOUR_HEIGHT_PX      ← 数値
カード   = style={{ top: topPx, height: heightPx }}     ← 数値（React が px を付ける）
```

計算は `src/lib/timetable-layout.ts` に集約しています。このモジュールは **% を返しません。**

### 例外: 横方向の %

レーン分割（重なる企画を左右に並べる）の `left` / `width` だけは % です。
こちらは CSS Grid のトラック幅が確定しているため安全です。
**縦と横で扱いが違う理由がここにあります。**

---

## 盤面の構造

```
<div overflow-x-auto role="region" tabIndex={0}>        ← スクローラ
  <div className="grid"
       style={{ gridTemplateColumns: `72px repeat(n, minmax(180px, 1fr))` }}>

    <div className="sticky left-0 z-20 bg-white">       ← 時刻ラベル列
      <div className="h-8" />                           ← 見出し行ぶんの余白
      <TimeAxisColumn />                                ← 自分で px 高さを持つ

    <section>× n                                        ← ステージ列
      <h3 className="h-8">ステージ名</h3>
      <div className="relative" style={{ height: 盤面高さ }}>
        <HourLines />                                   ← 罫線（列の内側）
        <div className="absolute" style={{ top, height, left, width }}>
          <TimetableEventCard />
```

見出しを別行の grid セルに置かず、**各ステージ列の中に `<h3>` を含めている**のは、
見出しとその列の内容を同じ `<section>` に収めるためです。行の高さは全列で同じ
（`h-8`）なので、盤面の開始位置は揃います。

### 罫線は列ごとに置く

`HourLines` は盤面全体を覆う1枚のオーバーレイではなく、**ステージ列の内側**に敷きます。

- 隣り合う列の線が突き合わさるので、見た目は盤面全幅を横断します
- sticky な時刻ラベル列の手前で自然に止まります

全体を覆う方式だと sticky 列との重なり順の調整が要るうえ、時刻ラベルの下に線が透けます。
旧実装が時刻チップに不透明な `bg-white` を敷いて線を切り抜いていたのはそのためでした。
線の色は `border-gray-400`（#8f8f8f / 3.23:1）。目盛りは装飾ではないので
WCAG 1.4.11（非テキストコントラスト）の 3:1 を満たす必要があります。

---

## `overflow-x: auto` の制約

列が増えると幅が足りないため横スクロールさせますが、CSS の仕様上、次の2点が付いてきます。

### 1. 縦方向もスクロールコンテナになる

`overflow-x` と `overflow-y` の片方が `visible` 以外なら、もう片方の `visible` は
`auto` に計算されます。つまりこの要素は縦にもスクロールコンテナであり、

- **中の要素をページに対して `sticky top-0` にはできない。** ステージ名の縦固定はやりません
- 縦にはみ出した要素は縦スクロールバーを生みます。時刻ラベルは `-translate-y-1/2` で
  上下へ 8px はみ出すため、スクローラに `pb-3` を置いて逃がしています

### 2. `sticky left-0` はスクローラの `padding-left` を無視する

スティック位置はスクロールポートの端です。スクローラ自身に横パディングを置くと
ラベル列の位置がずれるので、**余白は外側のカード（`TimetableChart`）が持ちます。**
同じ理由で、外枠に `overflow-hidden` を置いてはいけません（sticky 列とフォーカスリングが欠ける）。

キーボードでスクロールできる領域なので `role="region"` + `aria-label` + `tabIndex={0}` が要ります
（WCAG 2.1.1 / 4.1.2）。

---

## 時間レンジ

**表示中の企画から算出します**（`calculateTimeRange()`）。最早開始を切り捨て、
最遅終了を切り上げて時間単位に丸めます。企画が無い・全て不正なら `siteConfig` の
開場/閉場時刻から作った `DEFAULT_TIME_RANGE` に落ちます。

規則は2つです。

- **1つの盤面の全ステージ列は同一のレンジを共有する。** 列ごとに変えると縦のスケールが
  揃わず、ステージ間の比較ができません
- **レンジは「ステージで絞り込む前」の集合から算出する。** 絞り込み後だと、タブを
  切り替えるたびに縦のスケールが動きます

旧実装は `10` / `18` を `TimetableChart` と `TimeAxis` に別々にベタ書きしており、
範囲外の企画は clamp で 10:00 や 18:00 に潰れていました（閉場時刻 19:30 とも不整合）。

---

## 「その他」の受け皿と、破ってはいけない不変条件

`place` がどのステージにも一致しない企画は「その他」列へ入ります（`resolveStageId()`）。
旧実装は `extractStageId()` が `null` を返した企画を**黙って捨てていた**ため、
`place` が想定外の表記だと「企画はあるのに盤面ごと出ない」状態になっていました。

> [!IMPORTANT]
> **絞り込みとグループ化は、必ず両方とも `resolveStageId()` を通すこと。**
> 片方だけ `extractStageId()`（null を返す）に戻すと、グループ化では「その他」へ入る企画が、
> 絞り込みでは `null !== "other"` で必ず外れるため、**「その他」タブが常に空になります。**

「その他」は `stages` 配列には足していません。あの配列は「実在する会場」の定義であり、
「その他」は会場ではなく振り分け先の名前だからです。現時点で `stages` を読むのは
`src/lib/timetable.ts` だけですが、キャンパスマップや企画一覧が会場一覧として参照し始めたときに
実在しない会場が漏れないよう、`OTHER_STAGE_ID` は独立した定数にしています。

タブ側（`TimetableTabs`）は `availableStages` を親配列にして描画します。
`stages` を親にして `filter` すると、そこに存在しない「その他」のタブが永久に出せません。

### 選択中のステージは当日0件でもタブに残す

一覧は `listStageTabs()` が作ります。「表示中の日程に企画があるステージ」に加えて、
**選択中のステージを当日0件でも必ず含めます。**

含めないと、その日に企画が無いステージIDをURLで直接開いたとき（`?date=day2&stage=体育館` など）
そのタブが一覧から落ち、「すべて」も含めてどのタブも `aria-pressed` にならず、
何で絞り込まれているのか画面から読めなくなります（#154 のレビュー指摘）。

実在しないステージIDは無視します。`getStageName()` は未知のIDをそのまま返すため、
素通しにするとURLの任意の文字列がタブのラベルとして表示されます（`isKnownStageId()` で弾く）。

---

## カードの高さと密度

`HOUR_HEIGHT_PX = 96`（1.6px/分）。30分企画が 48px で、タイトルと時刻の2行を保てる下限です。

### 枠とカード実寸は別物である

レーンに割り当てた高さ（**枠**）と、その中のカードの高さ（**実寸**）は `CARD_GAP_PX = 4`
だけ食い違います。ラッパが持つカード間の余白ぶんです。

> [!IMPORTANT]
> **密度の判定は枠ではなくカード実寸で行うこと。** 枠のまま比べると 4px ぶん楽観的になり、
> 収まらない密度が選ばれます。最初の実装は枠で判定しており、60分企画で下余白が 9px
> 潰れていました（#154 のレビュー指摘・実測値）。
> `CARD_GAP_PX` はラッパの `paddingBottom` へ直接載せてあります。Tailwind の `pb-1` に
> 戻すと、定数とDOMが別々に動けるようになり同じ事故が再発します。

| 企画長 | 枠     | カード実寸 | 密度      | 出す情報               |
| ------ | ------ | ---------- | --------- | ---------------------- |
| 15分   | 28px\* | 24px       | `minimal` | タイトルのみ           |
| 30分   | 48px   | 44px       | `compact` | タイトル + 時刻        |
| 60分   | 96px   | 92px       | `full`    | タイトル + 時刻 + 場所 |

\* 本来 24px ですが `MIN_EVENT_HEIGHT_PX`（= 24 + `CARD_GAP_PX`）にクランプします。
カード実寸が 24px となり、WCAG 2.5.8（ターゲットサイズ AA）の 24×24 を満たします。

閾値は「その密度の内容が**余白ごと**収まるカード実寸」です（`full` 89px / `compact` 44px）。
「文字が切れない下限」で判定すると、下余白が 0 のカードが出ます。
唯一の例外が `minimal` で、24px は WCAG の下限であり動かせないため、下余白だけ 1px 詰まります。

`full` の縦パディングが `px-3` と揃わず `py-1.5` なのは、60分企画（実寸 92px）へ
内容 75px を余白ごと収めるためです。`py-3` に戻すと必要高が 101px になり、閾値も連動して
上がるため、**1時間企画が `compact` へ落ちて場所が表示されなくなります。**
タイムテーブルで最も多い企画長から、来場者が最も必要とする情報を落とすことになります。

> [!WARNING]
> **クランプ後の高さを重なり判定に使わないこと。** 隣接しているだけの短時間企画が
> 偽の重なりとして検出され、不要なレーン分割が出ます。判定は実時刻（分）で行います。

レーン分割された列は幅が半分以下になるため、時刻と場所の行は `truncate` で
1行に固定しています（折り返すとカードから溢れます）。失われる情報は `aria-label` が持っています。

---

## モバイル（DOM 2枚持ちの例外）

盤面は最小でも 972px（時間軸 72px + 5列 × 180px）を要求するため、`lg`(1024px) 未満では
ステージごとの縦スタック（`TimetableStackedList`）に切り替えます。`md`(768px) ではありません。

これは [layout-patterns.md](./layout-patterns.md) の「DOM 2枚持ちを避ける」の**例外**です。
同指針は「形状差が Tailwind のバリアントだけで表現できる場合」を対象にしており、
今回は縦位置が `style={{ top, height }}` のインラインスタイルに載っています。
インラインスタイルにレスポンシブバリアントは存在せず、JS でブレークポイントを見て
切り替えるとハイドレーション不整合とレイアウトシフトを招きます。

代わりに重複は最小化しています。`StageGroup[]` と `TimeRange` は `TimetableContent` が
一度だけ計算して両方へ配り、カードは `TimetableEventCard` を共有します。
重複するのは「絶対配置のラッパ」対「通常フローの `<li>`」だけです。

**両者に出る企画は一致していなければなりません。** 盤面は時刻を解釈できない企画を描けませんが
縦スタックは描けてしまうため、入口の `filterStageEvents()` で時刻の形式検査まで済ませています。

---

## 検証

検証は2層に分かれます。**算術で表せる不変条件はユニットテストが固定し、
DOM が要るものだけを実ブラウザで実測します。**

| 層                            | 対象                                                      |
| ----------------------------- | --------------------------------------------------------- |
| `pnpm test`（Vitest / node）  | 高さ・座標・レーン分割・密度・ステージ解決の**算術**      |
| `pnpm test:e2e`（Playwright） | **盤面が実際に 0px でないこと**など、レイアウトの解決結果 |

ユニットテストの方針は [`docs/dev/testing.md`](../dev/testing.md)、
実ブラウザ側の設計は [`layout-e2e.md`](./layout-e2e.md) を参照。

### ユニットテストが固定している不変条件

| 本ファイルの節                | 検証しているもの                                                             |
| ----------------------------- | ---------------------------------------------------------------------------- |
| 時間レンジ                    | `calculateTimeRange()` が最低1時間を確保する／企画0件で `DEFAULT_TIME_RANGE` |
| カードの高さと密度            | `getCardDensity(89) === "compact"`（**枠ではなくカード実寸**で判定）         |
| 同上                          | `calculateEventOffset("19:50","20:30")` が盤面下端を突き抜けない             |
| 同上（`MIN_EVENT_HEIGHT_PX`） | 隣接する短時間企画がレーン分割されない（**重なり判定は実時刻**）             |
| 「その他」の受け皿            | 絞り込みとグループ化が**同じ結果を返す**（両方 `resolveStageId()` 経由）     |
| 選択中のステージは残す        | 当日0件のステージがタブに残り、未知IDは無視される                            |

**`height: 100%` の解決失敗（#148 本体）はここに含められません。** 百分率高さの解決は
レイアウトエンジンの仕事であり、算術では表せないからです。次節の実測が要ります。

### フィクスチャ

microCMS の実データはステージ企画が1件しかなく、しかも `place` がどのステージにも
一致しません。`src/components/timetable/__fixtures__/stage-events.ts` に検証用のデータがあり、
次で差し替わります。

```bash
NEXT_PUBLIC_EVENTS_VISIBLE=true NEXT_PUBLIC_TIMETABLE_FIXTURE=1 pnpm dev
```

分岐は `process.env.NODE_ENV` を見ており、本番ビルドでは到達不能コードになって
動的 import のチャンクごと落ちます（実測: `.next/server` `.next/static` の JS に出現しない）。

### 実測アサーション

**以下は `e2e/timetable/` が自動化済みです**（[layout-e2e.md](./layout-e2e.md)）。
原本として残してあるのは、手で再実行して確かめる価値が消えないためです。

| スニペット           | 対応する spec                |
| -------------------- | ---------------------------- |
| 盤面が 0px でない    | `board-geometry.spec.ts`     |
| 同一座標に重ならない | `board-geometry.spec.ts`     |
| カード実寸 24px 以上 | `card-density.spec.ts`       |
| 内容が溢れていない   | `card-density.spec.ts`       |
| `aria-pressed` が2つ | `tabs-and-filtering.spec.ts` |
| 横スクロールの完結   | `scroll-containment.spec.ts` |

> [!WARNING]
> **盤面の `height` を `min-height` へ変えるだけでは、どのテストも落ちません。**
> px の高さが列そのものに載っているため、`min-height` でも同じ used height が出るからです。
> #148 を再現するには `h-full` の中間ラッパが要ります。詳細は
> [layout-e2e.md](./layout-e2e.md)「テストが実際に何を捕まえるか」。

```js
// 盤面が 0px でないこと（#148 本体）
[...document.querySelectorAll("[data-timetable-column]")].map((c) => getComputedStyle(c).height);

// 企画が同一座標に重なっていないこと
const rects = [...document.querySelectorAll("[data-timetable-event]")].map((e) => {
  const r = e.getBoundingClientRect();
  return `${Math.round(r.left)},${Math.round(r.top)}`;
});
new Set(rects).size === rects.length; // true であること

// カードの実寸が 24px 以上（WCAG 2.5.8）
[...document.querySelectorAll("[data-timetable-event] a")].every(
  (a) => a.getBoundingClientRect().height >= 24
);

// 内容がカードから溢れていないこと（密度の閾値が実寸基準かの検算）
// minimal の 1px（WCAG 下限 24px による不可避の余白圧縮）だけが許容値
Math.max(
  ...[...document.querySelectorAll("[data-timetable-event] a")].map(
    (a) => a.scrollHeight - a.clientHeight
  )
) <= 1;

// 選択中のステージが必ず押下状態であること（当日0件のステージをURLで開いた場合を含む）
// 例: /timetable?date=day2&stage=体育館
document.querySelectorAll("button[aria-pressed=true]").length === 2; // 日程 + ステージ

// 横スクロールが盤面内で完結していること
const s = document.querySelector("[data-timetable-scroller]");
document.documentElement.scrollWidth <= window.innerWidth + 1; // true であること
```

上の4つは**盤面が表示されている幅（1024px 以上）でのみ**成立します。それ未満では
盤面が `display:none` になり `getBoundingClientRect()` が 0 を返すため、
偽陰性になります。

### ビューポートの切り替え

`agent-browser open <url> --viewport 375x812` は**効きません**（2026-09-02 実測。
`window.innerWidth` は 1280 のまま）。`agent-browser set viewport <w> <h>` を使ってください。
`resize_window` が使えないことと合わせて
[browser-verification-pitfalls.md](./browser-verification-pitfalls.md) を参照。

```bash
agent-browser set viewport 375 812
```

`lg` の切り替わりはメディアクエリで決まるため、コンテナ幅を JS で絞る方法では再現できません。

---

**作成日:** 2026-09-02（#148 の対応にあわせて作成）
**最終更新:** 2026-09-03（ユニットテスト導入にあわせて検証節を2層構成へ / #157）
