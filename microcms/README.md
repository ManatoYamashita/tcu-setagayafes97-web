# microCMS APIスキーマ インポートガイド

## 概要

このディレクトリには、microCMSのAPIスキーマ定義JSONファイルが格納されています。

> [!IMPORTANT]
> **これらのJSONは「インポート用のソース」であり、実機の写しとして自動同期されるものではありません。**
> 管理画面でスキーマを変更したら、**エクスポートを取得して該当ファイルへ反映してください。**
> 同期を怠ると、次回インポート時に古い定義が復元されます。

## ファイル一覧

| ファイル            | 対象API                       | 実機との照合           |
| ------------------- | ----------------------------- | ---------------------- |
| `news.json`         | News API（お知らせ）          | ✅ 2026-08-16 照合済み |
| `events.json`       | Events API（企画）            | ✅ 2026-08-16 照合済み |
| `informations.json` | Informations API（協賛・FAQ） | ✅ 2026-08-16 照合済み |

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

**実機と照合済み（2026-08-16）**

| フィールドID | 表示名         | 型           | 必須 | 備考                                                                   |
| ------------ | -------------- | ------------ | ---- | ---------------------------------------------------------------------- |
| type         | タイプ         | select       | ✓    | `urgent : 緊急` / `news : お知らせ` / `other : その他`                 |
| title        | タイトル       | text         | ✓    |                                                                        |
| thumbnail    | サムネイル画像 | media        |      | 解像度と縦横比の要件 → [docs/dev/microcms.md](../docs/dev/microcms.md) |
| description  | 概要           | textArea     | ✓    |                                                                        |
| content      | 本文           | richEditorV2 | ✓    |                                                                        |

### Events API (events.json)

**実機と照合済み（2026-08-16）**

| フィールドID | 表示名           | 型           | 必須 | 備考                                                                                                                                                       |
| ------------ | ---------------- | ------------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| date         | 開催日           | select       | ✓    | `day1 : 10月31日（土）` 形式（値 : ラベル）                                                                                                                |
| type         | 企画タイプ       | select       | ✓    | room / stage / store / special / other                                                                                                                     |
| place        | 場所             | text         | ✓    |                                                                                                                                                            |
| building     | 建物番号         | text         |      | **未入力運用。** 実データ18件すべてが空のため、検索・絞り込みは `place` から導出する → [docs/frontend/events-search.md](../docs/frontend/events-search.md) |
| title        | タイトル         | text         | ✓    |                                                                                                                                                            |
| organizer    | 主催団体         | text         | ✓    |                                                                                                                                                            |
| thumbnail    | サムネイル       | media        |      | 正方形ロゴは 624px 四方、写真は 1400px 幅を推奨。縦横比が表示の分岐を決める → [docs/dev/microcms.md](../docs/dev/microcms.md)                              |
| description  | 概要             | textArea     | ✓    |                                                                                                                                                            |
| content      | 詳細             | richEditorV2 | ✓    |                                                                                                                                                            |
| startTime    | 開始時刻         | text         |      |                                                                                                                                                            |
| endTime      | 終了時刻         | text         |      |                                                                                                                                                            |
| sns          | SNS              | text         |      | カスタムフィールドではない（上記参照）                                                                                                                     |
| special      | 著名人企画の詳細 | custom       |      | → `specialDetail`。#70                                                                                                                                     |

> [!NOTE]
> `select` の値は `day1 : 10月31日（土）` のように **`値 : ラベル`** 形式で登録されています。
> コード側は `src/lib/events.ts` で `split(":")` して先頭を取り出しています。
> ラベルだけを変更する分にはコードへの影響はありません。

> [!IMPORTANT]
> **`type` の `store : 模擬店` は、実機の入稿データから確認して 2026-09-06 に追記したものです。**
> 本ファイルの `selectItems[].id` は microCMS が生成する不透明値ですが、`store` の行だけは
> 実機の id を取得できていないため仮の値（`store-slot`）が入っています。このJSONを
> インポートし直す用途では問題ありませんが、**実機の id と一致はしません。**
>
> それ以前は `store` がスキーマ写しにも `EventType` にも無く、`normalizeEventType()` の
> ホワイトリストから漏れて**エラーも警告も出さずに `other` へ落ちていました。**
> 選択肢を増やしたら `src/types/events.ts` / `src/lib/events.ts` / `src/data/filter-options.ts`
> の3箇所を必ず同時に直してください。

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
| image        | 画像     | media  |      |                                                       |
| url          | URL      | text   |      |                                                       |
| priority     | 表示順   | number |      |                                                       |

> [!NOTE]
> **`description` は1行テキストです。** 協賛企業の紹介文を複数行で入稿したい場合は、
> 管理画面で textArea へ変更したうえで本ファイルも同期してください（型定義への影響はありません）。

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
