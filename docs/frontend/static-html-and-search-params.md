# `useSearchParams()` と静的HTML

`useSearchParams()` を使う Client Component は、**書き方を1つ間違えるとページ本体を静的HTMLから
丸ごと消します。** #148 / #154（`/timetable`）と #156（`/events`）で2回起きました。

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

## 新しく `useSearchParams()` を使うとき

1. そのルートに `loading.tsx` があるか確認する（あればそれが暗黙の境界になる）
2. `<Suspense>` を置く。**包む範囲は最小に。** `/events` では Server Component である
   著名人企画のセクションを境界の外に残し、静的HTMLへ残している
3. fallback に「クエリ無しで着地したときの表示」を置けるか検討する。置けるなら、
   そのために下位コンポーネントから `useSearchParams()` を props へ引き上げる
4. ビルドして上記の grep を通す。**通ることは何も証明しません。** 境界を一時的に外して
   数字が 0 に戻ることまで確かめること（[layout-e2e.md](./layout-e2e.md) と同じ作法）
