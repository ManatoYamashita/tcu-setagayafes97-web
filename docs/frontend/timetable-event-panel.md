# タイムテーブルの企画詳細パネル

`/timetable` のカードを押したとき、企画詳細ページへ遷移せずに開くパネルの設計です（#338）。
実装は `src/components/timetable/TimetableEventPanel.tsx`（中身と前後移動）と、開閉の機構を持つ共通部品 `src/components/ui/SlidePanel.tsx`。協賛・協力ページの詳細パネル（`SponsorList`）も同じ `SlidePanel` を使う（#371）。盤面との関係は
[timetable-gantt.md](./timetable-gantt.md) を参照してください。

- lg（1024px）以上: 右からスライドインするパネル（幅 `min(28rem, 100vw)`）
- lg 未満: 下からスライドアップするボトムシート（高さ上限 85dvh）
- パネルの下部に「前の企画 / 次の企画」。全文は「企画ページで全文を見る」で `/events/[id]` へ逃がす

## 構造

| 要素                       | 役割                                                                                                                   |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `<dialog>` + `showModal()` | 1枚だけ `TimetableContent` に置く。フォーカストラップ・Esc・背景の inert・top layer が標準で得られる（z-index は不要） |
| `?event=<entryKey>`        | 開閉の状態は URL が持つ。戻る・共有・再読み込みがそのまま効く                                                          |
| `<Link>` のカード          | `href` を残し、左クリック（修飾キー無し）だけ `preventDefault()` してパネルを開く                                      |
| `buildStageEventDetails()` | 企画IDごとの補足（概要・サムネイル・会場・SNS）。`content` は載せない                                                  |
| `sortEntriesByStart()`     | 縦スタックとパネルの前後移動が同じ並び（開始時刻順、同時刻はステージID順）を使う                                       |

盤面と縦スタックで DOM を2枚持つ構造（`TimetableStackedList` の冒頭参照）でも、パネルは1枚である。
どちらのカードから開いても同じ `<dialog>` を使う。

## 設計判断

### Intercepting Routes（`@modal`）を採らなかった

ルート直下の layout へ slot を足すと、全ページへ影響する。CLAUDE.md が警告するとおり、
ルート直下の `loading.tsx` 周りは `redirect()` / `notFound()` のステータスを壊した前歴があり
（#217）、`e2e/landmarks/route-sweep.spec.ts` の対象も増える。タイムテーブルの中で完結させる。

### 状態を URL に持つ（`?event=`）

- 開く: `router.push`（`scroll: false`）。履歴を1件積む
- 前後へ移動: `router.replace`。履歴を積まない（連打しても戻るの回数が増えない）
- 閉じる: **操作で開いた場合だけ `router.back()`**。直リンクで来た場合に `back()` すると
  サイトの外へ出てしまうため、`event` を除く `router.replace` にする。判定は `openedByPush`（ref）
- 日程・ステージのタブは `URLSearchParams` を作り直すため、`event` は自然に消える
- `event` が不正、または現在の日・ステージの絞り込みに無いときは、パネルを出さずに無視する

### 詳細データに `content` を載せない

`TimetableEntry` は Client Component へ直列化される。2部制の企画は枠ごとに展開されるため、
本文の HTML を載せると枠の数だけ重複する。そこで企画ID単位の `TimetableEventDetail` を別に渡し、
本文（`content`）は持たせない。パネルは概要（`description`）までを見せ、全文は企画ページへ。

### 著名人企画（special）はパネルに入れない

専用 LP（`/special/[id]`）が正規 URL なので、従来どおり遷移する。前後移動の対象からも外す。

### カードを `<a>` のまま残す

JS 無効、中クリック、新規タブで開く、クローラの巡回が従来どおり働く。
`aria-haspopup="dialog"` を付け、修飾キー付き・左ボタン以外のクリックは横取りしない。

## 動き

入場・退場とも **CSS keyframes**（`globals.css` の `.slide-panel`）。

`@starting-style` + `overlay` の方式は退場が Firefox / Safari で効かない（`overlay` が未対応）ため採らない。
退場は JS が `data-closing` を付け、`animationend` を待ってから `dialog.close()` する。
`animationend` が来ない場合の保険として 320ms のタイムアウトを持つ（退場は 200ms）。

退場も入場と同じ ease-out（`cubic-bezier(0.22, 1, 0.36, 1)`）にする。ease-in は出だしが遅く、閉じる操作の体感が鈍る。

`prefers-reduced-motion: reduce` では移動をやめ、透明度だけで 120ms。e2e は
`reducedMotion: "reduce"` で走るため、テストが見るのは最終形の位置である。

## Safari 向けの背景クリック

`<dialog closedby="any">` は Safari 未対応である。`dialog` 自身が click の `target` になるのは
背景（`::backdrop`）を押したときだけなので、`e.target === dialog` で閉じる。
中身は `dialog` を隙間なく覆うため、パネルの内側を押して閉じることはない。
Esc（`cancel` イベント）は `preventDefault()` して自前の閉じる処理へ流す。
ネイティブの閉じ方に任せると、URL と表示が食い違う。

## 検証の記録

- `e2e/timetable/event-panel.spec.ts`（9本）: 右端・下端への接地、URL 同期、Esc / × / 背景、
  フォーカス復帰、前後移動と履歴、両端のボタン、直リンク、不正な `event`、修飾キー
- 退行注入: カードの `e.preventDefault()` をコメントアウトすると 9 本中 7 本が落ちる（2026-09-30）
- 目視: 1280px と 390px で確認。サムネイル無しの企画は `EventMediaPlaceholder` が出る

## 落とし穴

- **前後ボタンの企画名を 1 行の `truncate` にしない。** 448px 幅でも切れ、押すまで全文が見えない。`line-clamp-2` にし、時刻は折り返す（`/better-interface` レビュー、2026-09-30）

- **`{ scroll: false }` を外さない。** パネルを開くたびに先頭へ飛ぶ
- **カードの `onClick` で `preventDefault()` した後に `onSelect` を呼ぶ順序を変えない。**
  `Link` のクライアント遷移が先に走ると、パネルと遷移が同時に起きる
- **e2e でクリック直後に `Escape` を押さない。** `router.push` は `click()` の完了より後に
  URL と DOM へ反映される。`toBeVisible()` / `toHaveURL()` を挟むこと

---

**作成日:** 2026-09-30（#338）
