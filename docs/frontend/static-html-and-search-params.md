# `useSearchParams()` と静的HTML

`useSearchParams()` を使う Client Component は、**書き方を1つ間違えるとページ本体を静的HTMLから
丸ごと消します。** #154（`/timetable`）と #156（`/events`）で2回起きました。

> [!NOTE]
> **#148 は無関係です。** 同じ `/timetable` の事故ですが、中身は `height: 100%` が `0px` に
> 解決される CSS の不具合であり、bailout には一切触れていません。`/timetable` の `<Suspense>`
> 欠落を実際に埋めたのは、#148 を閉じた PR #154 の 943fec3 です。

関連: [performance.md](./performance.md)（Lighthouse基準） /
[layout-e2e.md](./layout-e2e.md)（実ブラウザでの実測） /
[../dev/seo-metadata.md](../dev/seo-metadata.md)

---

## 何が起きるのか

`useSearchParams()` は静的レンダリング時に、**最も近い `<Suspense>` 境界より内側**を
クライアント描画へ落とします（bailout）。落ちた範囲は静的HTMLに入りません。

**境界を書かなくてもエラーにはなりません。** 代わりに、いちばん近い `loading.tsx` が
作る境界が代役を務めます。このアプリには2枚あります。

| ファイル                     | 代役になる範囲                           |
| ---------------------------- | ---------------------------------------- |
| `src/app/loading.tsx`        | ルート直下。ヘッダー・フッター以外の全部 |
| `src/app/events/loading.tsx` | `/events` のページ全体                   |

> [!WARNING]
> #156 の Issue 本文は「ルート直下の `src/app/loading.tsx` が捕まえる」と書いていますが、
> `/events` を捕まえていたのは **`src/app/events/loading.tsx`** です（2026-09-03 実測）。
> 範囲が同じなので結果は変わりませんが、原因を追うときは**そのルートに `loading.tsx` が
> あるかを先に見る**こと。

---

## 判定方法 — 素朴な grep は誤読する

生成物 `.next/server/app/<route>.html` を直接読みます。**属性の綴りまで含めて照合すること。**

```bash
NEXT_PUBLIC_EVENTS_VISIBLE=true pnpm build

f=.next/server/app/events.html
grep -o 'data-page-hero="true"' "$f" | wc -l    # ヒーローが描かれているか
grep -o 'data-page-sheet="true"' "$f" | wc -l   # 白いシートが描かれているか
grep -o 'href="/events/[a-zA-Z0-9_-]*"' "$f" | sort -u | wc -l
```

引っかかりやすい罠が2つあります。

1. **`grep -c` を使わない。** HTML は改行の無い1行なので、`grep -c` は「行数」として常に 0 か 1 を返します。
   個数を数えるなら `grep -o ... | wc -l`
2. **`data-page-hero` だけで検索しない。** 落ちている状態でも 3 件ヒットします。RSC の
   flight ペイロード（`self.__next_f.push`）の中に `\"data-page-hero\":true` という**別の綴り**で
   入っているためです。描画されたHTMLに出るのは `data-page-hero="true"` のほう。
   同様に `<title>` やヘッダーのナビにはページ名の文字列が出るので、`企画を探す` のような
   語での grep も当てになりません

bailout の位置は次で確認します。

```bash
grep -o '.\{160\}BAILOUT_TO_CLIENT_SIDE_RENDERING' "$f"
```

直前が `<div hidden id="S:0">` なら `loading.tsx` が代役になっています。
自分で置いた `<Suspense>` の直前にあれば、意図どおり境界の内側で止まっています。

---

## 境界を足すだけでは中身は戻らない

**bailout は「境界の内側をクライアント描画へ落とす」ものであって、内側をサーバー描画に
戻すものではありません。** 境界を足すと落ちる範囲が縮むだけです。

`<Suspense>` の **fallback はサーバーで描かれ、静的HTMLに出力されます**。したがって
「中身をHTMLに載せたい」なら、**fallback をプレースホルダではなく既定状態の完成形にします。**

`/events` では「クエリ無しで着地したときの表示」＝未フィルタ1ページ目を fallback に置きました
（`src/app/events/page.tsx`）。

```
<Suspense fallback={<EventsView ...既定値... />}>   ← 静的HTMLに出る
  <EventsContent initialEvents={events} />          ← "use client" / useSearchParams
    └ <EventsView ... />                            ← 同じコンポーネント
</Suspense>
```

> [!IMPORTANT]
> **fallback の中で `useSearchParams()` を呼んではいけません。** fallback にはそれ以上
> 落ちる先がありません。`/events` で `EventFilters` と `Pagination` から
> `useSearchParams()` を外して props 化したのは、リファクタのついでではなく**この制約への対応**です。
> クエリを読むのは `EventsContent` の1箇所だけに保ってください。

---

## 実測（2026-09-03 / Next.js 16.1.0 / `NEXT_PUBLIC_EVENTS_VISIBLE=true pnpm build`）

`.next/server/app/events.html` を直接読んだ結果。

| 確認項目                                  | 境界なし                    | 境界あり（fallback = 既定ビュー） |
| ----------------------------------------- | --------------------------- | --------------------------------- |
| `data-page-hero="true"`                   | 0                           | **1**                             |
| `data-page-sheet="true"`                  | 0                           | **1**                             |
| `href="/events/xxx"`（重複除く）          | 0                           | **11**                            |
| `href="/special/xxx"`（重複除く）         | 0                           | **1**                             |
| `件の企画が見つかりました`                | 0                           | **1**（＋flightペイロードに1）    |
| `BAILOUT_TO_CLIENT_SIDE_RENDERING` の位置 | `events/loading.tsx` の境界 | 追加した `<Suspense>` の内側      |
| HTML raw                                  | 81,635 bytes                | 184,964 bytes                     |
| gzip -9                                   | 15,429 bytes                | 24,898 bytes                      |
| brotli -q11                               | 12,780 bytes                | **16,990 bytes**                  |

**転送量で見ると +4.2KB です。** raw では2.3倍に見えますが、HTMLと flight ペイロードに同じ
マークアップが2度出るため圧縮がよく効きます。判断は必ず圧縮後の数字で行うこと。

### 差し替えの体感（`pnpm start` / Playwright / クリーンなコンテキスト）

fallback は hydrate されません。境界がクライアント描画へ落ちるとき、fallback の DOM は
破棄されて本描画に差し替わります。**差し替わるまでフィルタのボタンは無反応です。**

| 着地URL                               | fallback → 本描画 | CLS |
| ------------------------------------- | ----------------- | --- |
| `/events`                             | 388ms             | 0   |
| `/events?type=stage`（18→15件）       | 384ms             | 0   |
| `/events?type=room`（カード12枚→1枚） | 413ms             | 0   |
| `/events?page=2`                      | 379ms             | 0   |

クエリ付きで着地すると、差し替わるまでの数百ミリ秒は**未フィルタの一覧**が見えます。
CLS が 0 なのは、スクロール位置0の視界をヒーローが占めており、折り返しより下の
高さ変化が可視要素をずらさないためです（`?type=room` は文書高が 4,283 → 2,708px と
大きく縮みますが、それでも 0）。

---

## 再発防止装置 — `no-restricted-imports`

この事故は**エラーにならない。** lint / format / 型 / ユニットテスト / build / Layout E2E の
すべてを通過したまま、`/events` のクロール経路だけが静かに失われる。
#154 は同じ不変条件を JSDoc とドキュメントで守ろうとしたが、それらは人間が読まなければ
効かない（[../dev/testing.md](../dev/testing.md)「なぜ入れたか」）。

`eslint.config.mjs` が、**fallback として描かれる5ファイルに `useSearchParams` の import を
禁じている。**

```js
const EVENTS_FALLBACK_TREE = [
  "src/components/events/EventsView.tsx",
  "src/components/events/EventFilters.tsx",
  "src/components/events/Pagination.tsx",
  "src/components/events/EventGrid.tsx",
  "src/components/events/EventCard.tsx",
];
```

`EventsContent.tsx` は境界の**内側**にいるので対象外である。クエリを読むのはここだけに保つ。
`useRouter()` は bailout を起こさないため制限していない。

退行を注入して赤くなることを確認済み（2026-09-05 実測）。

| 状態                                         | `pnpm run lint` |
| -------------------------------------------- | --------------- |
| 現状                                         | exit 0          |
| `EventFilters` へ `useSearchParams` を戻した | **exit 1**      |

**このルールが守るのは「クエリを読む場所」だけである。** `src/app/events/page.tsx` から
`<Suspense>` 境界そのものを外す変更は、ESLint では止められない。そちらは次の装置が受け持つ。

---

## 再発防止装置 その2 — ビルド生成物のアサーション

`scripts/assert-events-static-html.mjs` を `pnpm build` の末尾へ連結してある。

```json
"build": "next build && node scripts/assert-events-static-html.mjs"
```

`postbuild` にしていないのは、pnpm の `enable-pre-post-scripts` に依存させないため。
既定値が変わったり `.npmrc` へ一行足されたりすると、**装置が黙って死ぬ。**

### フラグが false の間も置いておいてよい

**`NEXT_PUBLIC_EVENTS_VISIBLE` が `"true"` でなければ自動でスキップし、`true` になった
瞬間から検査を始める。** 解禁のタイミングで誰かが検査を「足す」必要は無い。
スキップ時も準備中ページが実際に描かれていることは確認するので、素通りではない。

Vercel Preview は既に `EVENTS_VISIBLE=true` なので（[../dev/ci-env.md](../dev/ci-env.md)）、
**解禁を待たず現時点から Preview デプロイのゲートとして稼働している。**

### 何を見ているか

`EventFilters` が描くキーワード入力欄の `id="keyword-search"` を見る。

- `EventsView` ツリーがサーバー描画されたことの証拠になる
- **企画が0件でも描かれる**（`EventGrid` が空状態を出すだけでフィルターUIは残る）。
  したがって microCMS が一時的に空を返しても誤検知しない。
  **件数に依存する指標を合否条件にしてはいけない**（企画詳細リンクの本数は参考値として
  ログに出すだけ）

> [!IMPORTANT]
> **`data-page-hero` と `data-page-sheet` は判定に使えない。** `ComingSoon` も
> `PageSheetLayout` を通るため、フラグが false の本番でも 1 件ずつ出る（2026-09-05 実測）。
> #156 の表にある「0 → 1」は「境界なし かつ `EVENTS_VISIBLE=true`」限定の比較値である。

### 退行注入で実測（2026-09-05 / `NEXT_PUBLIC_EVENTS_VISIBLE=true pnpm build`）

| 状態                                                | `pnpm build` | 企画リンク |
| --------------------------------------------------- | ------------ | ---------- |
| 現状                                                | exit 0       | 11本       |
| `page.tsx` から `<Suspense>` 境界を削除             | **exit 1**   | 0本        |
| fallback を `EventsView` からプレースホルダへ格下げ | **exit 1**   | 0本        |

**2つ目と3つ目は ESLint では捕まらない。** 2つの装置は役割が違う。

| 装置                                    | 捕まえるもの                          |
| --------------------------------------- | ------------------------------------- |
| `eslint.config.mjs`                     | fallback ツリーがクエリを読み始めた   |
| `scripts/assert-events-static-html.mjs` | 境界の消失・fallback の格下げ・その他 |

---

## 新しく `useSearchParams()` を使うとき

1. そのルートに `loading.tsx` があるか確認する（あればそれが暗黙の境界になる）
2. `<Suspense>` を置く。**包む範囲は最小に。** `/events` では Server Component である
   著名人企画のセクションを境界の外に残し、静的HTMLへ残している
3. fallback に「クエリ無しで着地したときの表示」を置けるか検討する。置けるなら、
   そのために下位コンポーネントから `useSearchParams()` を props へ引き上げる
4. ビルドして上記の grep を通す。**通ることは何も証明しません。** 境界を一時的に外して
   数字が 0 に戻ることまで確かめること（[layout-e2e.md](./layout-e2e.md) と同じ作法）
5. **その制約を機械で検査する手段を同じPRで用意する。** 散文コメントは装置ではない。
   `eslint.config.mjs` の `no-restricted-imports` へ対象ファイルを足し、fallback を
   既定状態の完成形にしたなら `scripts/assert-events-static-html.mjs` に倣って
   ビルド生成物のアサーションも置く。**フラグで隠れているページでも、フラグを見て
   スキップする形にすれば今すぐ置ける**（解禁時に足す約束は必ず忘れられる）
