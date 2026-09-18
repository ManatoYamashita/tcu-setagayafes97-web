# 下書きの実機確認（microCMS 画面プレビュー）

microCMS に入稿した**下書きを、公開しないまま本番と同じ画面で確認する**ための仕組み。
編集画面の「画面プレビュー」ボタンから、本番ドメインの詳細ページが下書きの内容で開く。

対象は `events`（`/events/[id]` と `/special/[id]`）と `news`（`/info/[id]`）。
`informations` は単一コンテンツの詳細ページを持たないため対象外で、画面プレビューの設定も行わない。

## 使い方

1. microCMS のコンテンツ編集画面で「画面プレビュー」を押す
2. 本番ドメインの詳細ページが開き、下端に「下書きプレビュー表示中」の帯が出る
3. 確認が済んだら帯の**「プレビューを解除」を押す**

> [!IMPORTANT]
> **解除を忘れないこと。** プレビュー中のブラウザは Draft Mode の cookie を持ち続け、
> そのブラウザからのアクセスだけ ISR のキャッシュを迂回して毎回レンダリングされる。
> 表示が壊れるわけではないが、キャッシュの効いた本来の速度では見えなくなる。

**スマホの実機で見る場合は、その端末で「画面プレビュー」を押すか、プレビューURLをその端末へ送る。**
cookie はブラウザごとに保存されるため、PC で有効にしても手元のスマホには引き継がれない。

## 設定手順

### 1. シークレットを生成して Vercel へ登録する

```bash
openssl rand -hex 32
```

`MICROCMS_DRAFT_SECRET` として Vercel の Environment Variables（Production / Preview）へ登録する。
ローカルで試す場合は `.env.local` にも置く。

リクエスト時にしか読まないため **GitHub Secrets / `feature-ci.yml` には登録しない**
（`MICROCMS_WEBHOOK_SECRET` と同じ扱い。判断基準は [ci-env.md](./ci-env.md)）。

> [!IMPORTANT]
> **Vercel への登録を、microCMS 側の設定より先に済ませること。**
> 順序を逆にすると、最初のプレビューが 500（`Draft preview is not configured.`）になる。

### 2. microCMS に遷移先URLを設定する

`events` と `news` の2つの API それぞれで、**API設定 > 画面プレビュー > 遷移先URL** に次を入力する。
`{CONTENT_ID}` と `{DRAFT_KEY}` は microCMS が置き換えるプレースホルダなので、そのまま書く。

```
https://setagayafes.org/api/draft?secret=<MICROCMS_DRAFT_SECRET>&api=events&id={CONTENT_ID}&draftKey={DRAFT_KEY}
```

`news` の場合は `api=news` に変える。

> [!WARNING]
> **末尾にスラッシュを付けないこと。** `/api/draft/` は [`src/proxy.ts`](../../src/proxy.ts) の
> `"/:path+/"` に一致して 308 を1回挟む。`/api/draft` は matcher の外なので素通りする。

## 設計

### draftKey は cookie で運ぶ

Next.js の Draft Mode が持つ `__prerender_bypass` cookie は「有効か無効か」しか表現できず、
draftKey のような値を載せられない。そこで `/api/draft` が別 cookie
（`setagayafes-draft-preview`）へ `{ api, id, draftKey }` を保存し、詳細ページがそれを読む。

cookie に api と id を入れているのは、**表示中のページと一致するときだけ**下書きを使うため。
一致を見ないと、企画Aのプレビュー cookie を持ったまま企画Bを開いたときに、Bの draftKey として
Aのキーを送ってしまう。

### `searchParams` では実装できない

`?draftKey=` を Server Component の `searchParams` で受け取ると、**読んだ時点でルート全体が
動的レンダリングへ切り替わり、下書きを見ない通常の訪問者に対しても ISR が失われる。**
[`src/app/timetable/page.tsx`](../../src/app/timetable/page.tsx) に同じ理由の回避記録があり、
このリポジトリではサーバー側で `searchParams` を読んでいる箇所がひとつも無い。

### 静的生成を壊さない呼び出し順序（重要）

Next.js 16.1 の実装（`next/dist/server/request/draft-mode.js`）では、`draftMode()` が返す
オブジェクトのうち **`enable()` と `disable()` だけが `trackDynamicDraftMode()` を呼び、
そのルートの静的生成を無効化する。`isEnabled` の読み取りは追跡対象ではない。**

| 置き場所             | 呼ぶもの               | 影響                                     |
| -------------------- | ---------------------- | ---------------------------------------- |
| `/api/draft`         | `enable()`             | Route Handler なので元から動的。問題なし |
| `/api/draft/disable` | `disable()`            | 同上                                     |
| 詳細ページ3本        | `isEnabled` の読み取り | **静的生成は維持される**                 |

一方 `cookies()` は読んだ時点でルートを動的化する。そのため
[`src/lib/draft-mode.ts`](../../src/lib/draft-mode.ts) は
**`isEnabled` が false のときに早期 return して `cookies()` へ到達させない。**
ビルド時（静的生成時）は常に false なので、詳細ページのプリレンダリングは従来どおり成立する。

この順序を崩すと `pnpm build` が落ちるか、詳細ページが静的HTMLを失う。
`pnpm build` の末尾に連結された `scripts/assert-events-static-html.mjs` と、
`.next/server/app/events/*.html` の有無で確認できる。

### 公開フラグを跨ぐ

`getEventById()` / `getSpecialEventById()` / `getNewsById()` は、**draftKey が渡された場合に限り
`NEXT_PUBLIC_*_VISIBLE` のガードを跨ぐ。**

[`src/data/site.ts`](../../src/data/site.ts) は「著名人は解禁日が契約で決まる。microCMS 側を
下書きにするだけで済ませず、必ずこのフラグでも塞ぐこと」と求めている。それでもプレビューを
通すのは、**解禁前のLPを確認したいという要求が、フラグが false のときにこそ発生する**ため。
ここを塞ぐとプレビュー機能の意味が無くなる。

守りは二重になっている。

| 層           | 内容                                                     |
| ------------ | -------------------------------------------------------- |
| シークレット | `MICROCMS_DRAFT_SECRET` を知らないと `/api/draft` が 401 |
| draftKey     | その時点で有効なキーが無いと microCMS が 404 を返す      |

**公開ルート（draftKey を伴わない通常のアクセス）の判定は一切変えていない。**
フラグが false の間、URL を直接叩いても従来どおり 404 になる。

### プレビュー中に出さないもの

| 項目                                  | 扱い                                                          |
| ------------------------------------- | ------------------------------------------------------------- |
| `robots`                              | `noindex`（`createPageMetadata` の `noindex` オプション）     |
| `canonical`                           | 出さない（同上。`noindex` を渡すと `canonical: null` になる） |
| 構造化データ                          | `<script type="application/ld+json">` ごと描画しない          |
| `/events/[id]` の `type=special` 転送 | プレビュー中は転送しない（遷移先は `/api/draft` が決定済み）  |

## 落とし穴

### draftKey は保存のたびに失効する

microCMS の draftKey は**コンテンツを保存するたびに変わる**（[microcms.md](./microcms.md) に
curl での実測記録がある）。プレビューを開いたまま編集を続け、再度同じURLを踏むと 404 になる。

異常ではなく通常の寿命であり、**編集画面から「画面プレビュー」を押し直せば新しいキーで開く。**
`/api/draft` はこの場合 404 と `Draft not found.` を返す。

cookie に残った古いキーで詳細ページを開いた場合は、取得が失敗して通常表示（公開済みの内容、
未公開なら 404）に落ちる。表示が下書きに変わらないときは、まずプレビューを押し直すこと。

### 下書き保存では Webhook を発火させない

[content-revalidation.md](./content-revalidation.md) のとおり、「コンテンツの下書き保存時」の
通知は**既定 OFF のままにする。** 下書きは本番に出ないため再検証する対象が無く、
執筆中に無駄な発火を繰り返すだけになる。画面プレビューを導入してもこの判断は変わらない。

### 未入力フィールドの見え方

下書きは未入力が常態である。`normalizeEvent()` と `normalizeNews()` が主要フィールドを
空文字へ既定化し、`/events/[id]` はさらに [`src/lib/event-display.ts`](../../src/lib/event-display.ts)
のフォールバック（「準備中」表示）を持つ。

**`/special/[id]` と `/info/[id]` には同等のフォールバックが無い。** 未入力のまま見ると
見出しが空のまま表示されるが、これは下書きの状態がそのまま出ているのであって不具合ではない。

### type 未入力の下書きは一般企画として開く

遷移先は `/api/draft` が下書きを取得し、正規化後の `type` を見て決める。
`type` が未入力の下書きは `normalizeEvent()` が `other` へ落とすため、`/events/[id]` で開く。
**著名人企画のLPを確認したい場合は、先に `type = special` を入れて保存すること。**

## 関連ドキュメント

- [microcms.md](./microcms.md) — draftKey の失効、API 制約
- [content-revalidation.md](./content-revalidation.md) — 公開後の反映（Webhook と ISR）
- [ci-env.md](./ci-env.md) — 環境変数の登録先
