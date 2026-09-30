# microCMS APIスキーマ インポートガイド

## 概要

このディレクトリには、microCMSのAPIスキーマ定義JSONファイルが格納されています。

> [!IMPORTANT]
> **これらのJSONは「インポート用のソース」であり、実機の写しとして自動同期されるものではありません。**
> 管理画面でスキーマを変更したら、**エクスポートを取得して該当ファイルへ反映してください。**
> 同期を怠ると、次回インポート時に古い定義が復元されます。

## ファイル一覧

| ファイル            | 対象API                       | 実機との照合                     |
| ------------------- | ----------------------------- | -------------------------------- |
| `news.json`         | News API（お知らせ）          | ✅ 2026-09-30 エクスポートで置換 |
| `events.json`       | Events API（企画）            | ✅ 2026-09-30 エクスポートで置換 |
| `informations.json` | Informations API（協賛・FAQ） | ✅ 2026-09-30 エクスポートで置換 |

> [!WARNING]
> **3本とも、手で書き写さず、管理画面のエクスポートをそのまま整形して置くこと**
> （「API設定 > APIスキーマ > この設定をエクスポートする」→ `pnpm exec prettier --write microcms/<api>.json`）。
> 2026-08-16 に手で「照合済み」とした写しは、2026-09-30 のエクスポートで次の食い違いが見つかった。
>
> | ファイル            | 食い違い                                                                                            |
> | ------------------- | --------------------------------------------------------------------------------------------------- |
> | `events.json`       | **必須設定5項目**（`title` / `organizer` / `description` / `content` / `place` が実機では任意）ほか |
> | `news.json`         | `cta` の表示名（写し「CTAリンク先URL」、実機「詳しくはこちら」）                                    |
> | `informations.json` | 食い違いなし（既定値のキーが増えただけ）                                                            |

> [!NOTE]
> **`select` の値はいずれの API も `値 : ラベル` 形式**（例: `urgent : 緊急`）で登録されています。
> コード側は `split(":")` で先頭を取り出すため、ラベルだけの変更はコードに影響しません。

## インポート手順

> [!WARNING]
> **インポートできるのは API を新規作成するときだけです。** 既存 API の設定画面にあるのは
> 「この設定をエクスポートする」のみで、インポート機能はありません。
> 既存 API へのフィールド追加は管理画面で手作業になります。

### 1. microCMS管理画面にログイン

### 2. 新規API作成

1. サービスを選択
2. 「+API作成」をクリック
3. API名を入力（例: `news`, `events`, `informations`）
4. エンドポイント名を入力（上記API名と同じ推奨）
5. APIタイプは「リスト形式」を選択

### 3. スキーマインポート

1. 「APIスキーマを定義」画面で「ファイルインポートする場合はこちらから」リンクをクリック
2. 対応するJSONファイルを選択
3. インポート完了を確認

### 4. インポート後の確認（必須）

**インポート後は必ずエクスポートを取り、このディレクトリのJSONと突き合わせてください。**
過去に `events.json` の `sns` フィールドがカスタムフィールドとして復元されず、テキストフィールドに
なった実績があります（下記「既知の差異」参照）。

## 既知の差異

### Events API の `sns` はテキストフィールド

`sns` は当初 `SNSLinks` カスタムフィールド（twitter / instagram / website の3項目）として
設計されましたが、**実機ではテキストフィールド1つ**です。

コード側は既にこの状態へ適応済みで、`src/lib/events.ts` の `normalizeSNSLinks()` が
URL文字列を見て振り分けています。

```typescript
if (sns.includes("twitter.com") || sns.includes("x.com")) links.twitter = sns;
else if (sns.includes("instagram.com")) links.instagram = sns;
else links.website = sns;
```

**制約:** 1企画につきSNSリンクは1つだけ。複数のSNSを掲載する必要が生じたら、
カスタムフィールド化を再検討してください。

## スキーマ詳細

### News API (news.json)

**現行フィールド（CTA追加: 2026-09-28）**

| フィールドID | 表示名         | 型           | 必須 | 備考                                                                   |
| ------------ | -------------- | ------------ | ---- | ---------------------------------------------------------------------- |
| type         | タイプ         | select       | ✓    | `urgent : 緊急` / `news : お知らせ` / `other : その他`                 |
| title        | タイトル       | text         | ✓    |                                                                        |
| thumbnail    | サムネイル画像 | media        |      | 解像度と縦横比の要件 → [docs/dev/microcms.md](../docs/dev/microcms.md) |
| description  | 概要           | textArea     | ✓    |                                                                        |
| content      | 本文           | richEditorV2 | ✓    |                                                                        |
| cta          | 詳しくはこちら | text         |      | 記事詳細の「詳しくはこちら」に使う内部パスまたはHTTP(S) URL            |

### Events API (events.json)

**実機のエクスポートで置き換え済み（2026-09-30）。** `events.json` は管理画面「API設定 > APIスキーマ > この設定をエクスポートする」の出力をそのまま整形したもので、`selectItems[].id` も実機の値です。

| フィールドID | 表示名           | 型           | 必須 | 備考                                                                                                                                                                                           |
| ------------ | ---------------- | ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| date         | 開催日           | select       | ✓    | `day1 : 10月31日（土）` 形式（値 : ラベル）                                                                                                                                                    |
| type         | 企画タイプ       | select       | ✓    | room / stage / special / store / other。**`store` だけ値が `store: 模擬店`（コロンの前に空白が無い）**。取り出しは trim するので影響しない                                                     |
| title        | タイトル         | text         |      | 実機では任意（実データは全件入力済み）                                                                                                                                                         |
| thumbnail    | サムネイル       | media        |      | 正方形ロゴは 624px 四方、写真は 1400px 幅を推奨。縦横比が表示の分岐を決める → [docs/dev/microcms.md](../docs/dev/microcms.md)                                                                  |
| description  | 概要             | textArea     |      | 実機では任意。**開場時刻などの補足はここへ書く**（時刻欄には書かない。#305）                                                                                                                   |
| organizer    | 主催団体         | text         |      | 実機では任意                                                                                                                                                                                   |
| content      | 詳細             | richEditorV2 |      | 実機では任意                                                                                                                                                                                   |
| place        | 場所             | text         |      | 実機では任意（実データは全件入力済み。建物・ステージの導出はこの欄が頼り）                                                                                                                     |
| building     | 建物番号         | text         |      | **未入力運用。** 実データ18件すべてが空のため、検索・絞り込みは `place` から導出する → [docs/frontend/events-search.md](../docs/frontend/events-search.md)                                     |
| startTime    | 開始時刻         | text         |      | **入力制限 `^(([01]?[0-9]\|2[0-3]):[0-5][0-9])?$`**（HH:mm か空欄のみ。#305）                                                                                                                  |
| endTime      | 終了時刻         | text         |      | 同上                                                                                                                                                                                           |
| sns          | SNS              | text         |      | カスタムフィールドではない（上記参照）                                                                                                                                                         |
| special      | 著名人企画の詳細 | custom       |      | → `specialDetail`。#70                                                                                                                                                                         |
| sessions     | 開催枠           | repeater     |      | → `session`。**任意のまま運用する**（必須にすると既存企画が保存できなくなる）。値があれば `startTime` / `endTime` より優先 → [docs/dev/event-sessions.md](../docs/dev/event-sessions.md)。#281 |

> [!WARNING]
> **2026-09-30 のエクスポートまで、この表と `events.json` は `title` / `organizer` / `description` /
> `content` / `place` を必須としていたが、実機ではすべて任意だった。** いつから食い違っていたかは不明
> （2026-08-16 の照合時点の記録が誤っていたのか、その後に外されたのかは追えない）。
> 実データは全件入力済みだが、**未入力の企画が保存できる状態である**ことを前提にコードを書くこと
> （`src/lib/events.ts` の正規化と `resolveBuildingId()` はすでに空欄を受け付ける）。

> [!NOTE]
> `select` の値は `day1 : 10月31日（土）` のように **`値 : ラベル`** 形式で登録されています。
> コード側は `src/lib/microcms-select.ts` の `readSelectKey()` で `:` より前を取り出しています。
> ラベルだけを変更する分にはコードへの影響はありません。

> [!IMPORTANT]
> **`type` の `store` は 2026-09-06 に実機の入稿データから見つけて追記したものです。**
> それ以前は `store` がスキーマ写しにも `EventType` にも無く、`normalizeEventType()` の
> ホワイトリストから漏れて**エラーも警告も出さずに `other` へ落ちていました。**
> 選択肢を増やしたら `src/types/events.ts` / `src/lib/events.ts` / `src/data/filter-options.ts`
> の3箇所を必ず同時に直してください。

**カスタムフィールド（開催枠 / #281）**

`session` — 開催枠1つ（`events.sessions` から参照）。管理画面の並びは 開始時刻 → 終了時刻 → 日程

| フィールドID | 表示名   | 型     | 必須 | 備考                                                                                                    |
| ------------ | -------- | ------ | ---- | ------------------------------------------------------------------------------------------------------- |
| startTime    | 開始時刻 | text   |      | 入力制限はトップレベルの `startTime` と同じ                                                             |
| endTime      | 終了時刻 | text   |      | 同上                                                                                                    |
| date         | 日程     | select |      | `day1` / `day2`。**値があればその枠はその日だけに出る**。両日開催で日ごとに時刻が違う企画のため（#305） |

**カスタムフィールド（著名人企画LP用 / #70）**

`goodsItem` — 物販商品

| フィールドID | 表示名   | 型       | 必須 |
| ------------ | -------- | -------- | ---- |
| name         | 商品名   | text     | ✓    |
| color        | カラー   | text     |      |
| size         | サイズ   | text     |      |
| price        | 販売価格 | text     |      |
| note         | 備考     | textArea |      |
| isNew        | 新グッズ | boolean  |      |
| image        | 商品画像 | media    |      |

`ticketPlan` — チケット券種

| フィールドID | 表示名             | 型           | 必須 |
| ------------ | ------------------ | ------------ | ---- |
| name         | 券種名             | text         | ✓    |
| price        | 料金               | text         |      |
| salesPeriod  | 発売日・販売期間   | text         |      |
| method       | 販売方法・販売場所 | richEditorV2 |      |
| note         | 注意事項           | textArea     |      |
| buttonLabel  | 購入ボタンのラベル | text         |      |
| buttonUrl    | 購入ページURL      | text         |      |

`noticeSection` — 注意事項

| フィールドID | 表示名 | 型           | 必須 |
| ------------ | ------ | ------------ | ---- |
| heading      | 見出し | text         | ✓    |
| body         | 本文   | richEditorV2 |      |

`specialDetail` — 著名人企画の詳細（`events.special` から参照）

| フィールドID | 表示名                   | 型           | 参照先          |
| ------------ | ------------------------ | ------------ | --------------- |
| logo         | アーティストロゴ         | media        |                 |
| photos       | アーティスト写真（追加） | mediaList    |                 |
| openTime     | 開場時刻                 | text         |                 |
| goods        | 物販                     | repeater     | `goodsItem`     |
| goodsNote    | 物販の補足               | richEditorV2 |                 |
| tickets      | チケット販売             | repeater     | `ticketPlan`    |
| ticketNote   | チケットの補足           | richEditorV2 |                 |
| notices      | 注意事項                 | repeater     | `noticeSection` |

金額・時刻をすべて `text` にしているのは意図的です。「¥3,000（税込）」「18:00（予定）」
「未定」といった実際の入稿文言を受けるためで、`number` / `date` にすると入りません。

### Informations API (informations.json)

**実機と照合済み（2026-08-16）**

| フィールドID | 表示名   | 型     | 必須 | 備考                                                  |
| ------------ | -------- | ------ | ---- | ----------------------------------------------------- |
| category     | カテゴリ | select | ✓    | `sponsor : 協賛企業` / `faq : FAQ` / `other : その他` |
| title        | タイトル | text   | ✓    |                                                       |
| description  | 概要     | text   |      | **1行テキスト。** textArea ではない                   |
| image        | 画像     | media  |      | 任意。無ければ社名を文字で表示（下記）                |
| url          | URL      | text   |      |                                                       |
| priority     | 表示順   | number |      |                                                       |

> [!NOTE]
> **`description` は1行テキストです。** 協賛企業の紹介文を複数行で入稿したい場合は、
> 管理画面で textArea へ変更したうえで本ファイルも同期してください（型定義への影響はありません）。

> [!NOTE]
> **協賛企業の `image` は空でも表示されます。** トップ・ABOUT のロゴ帯では社名を文字で流し、
> `/about/sponsors` ではロゴ枠の中に社名を置きます。1件も落としません（#332。以前は画像の無い協賛が
> ロゴ帯から黙って消えていました）。判定は `src/lib/sponsor-logos.ts` の `toSponsorLogos()` にあります。

## JSON の書き方

### カスタムフィールドの参照

参照キーが2種類あります。**混同するとインポートで落ちます。**

| 用途               | キー             | 値の形       |
| ------------------ | ---------------- | ------------ |
| `kind: "custom"`   | `customFieldId`  | 文字列       |
| `kind: "repeater"` | `customFieldIds` | 文字列の配列 |

```jsonc
// カスタム（1つのカスタムフィールドを埋め込む）
{ "fieldId": "special", "kind": "custom", "customFieldId": "specialDetail" }

// 繰り返し（カスタムフィールドを複数回入力できる）
{ "fieldId": "goods", "kind": "repeater", "customFieldIds": ["goodsItem"] }
```

### 作成順序

繰り返しフィールドは**作成済みのカスタムフィールドしか参照できません。** 子から親の順に作ります。
詳細は [docs/dev/microcms.md](../docs/dev/microcms.md) を参照。

## トラブルシューティング

### JSON構文エラー

- インデントは2スペース
- UTF-8エンコーディング

### 管理画面をブラウザ自動操作で編集できない

**スキーマ定義は手作業で行ってください。** 種類選択ダイアログが実マウスイベントに依存しており、
スクリプト操作では選択が別の行へ適用されます。詳細と症状は
[docs/dev/microcms.md](../docs/dev/microcms.md) に記録しています。

## 型定義との対応

| JSON                | TypeScript型定義            |
| ------------------- | --------------------------- |
| `news.json`         | `src/types/news.ts`         |
| `events.json`       | `src/types/events.ts`       |
| `informations.json` | `src/types/informations.ts` |

## 参考リンク

- [microCMS公式ドキュメント: APIスキーマのエクスポート／インポート](https://document.microcms.io/manual/export-and-import-api-schema)
- [docs/dev/microcms.md](../docs/dev/microcms.md) — API制約・カスタムフィールドの仕様・管理画面の制約

---

**最終更新日**: 2026-08-16
