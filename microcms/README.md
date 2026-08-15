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
| `news.json`         | News API（お知らせ）          | 未検証                 |
| `events.json`       | Events API（企画）            | ✅ 2026-08-16 照合済み |
| `informations.json` | Informations API（協賛・FAQ） | 未検証                 |

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

> [!NOTE]
> 実機との照合は未実施。以下はJSONファイルの内容です。

| フィールドID | 表示名         | 型           | 必須 | 備考              |
| ------------ | -------------- | ------------ | ---- | ----------------- |
| type         | お知らせ種別   | select       | ✓    | urgent/news/other |
| title        | タイトル       | text         | ✓    |                   |
| thumbnail    | サムネイル画像 | media        |      |                   |
| description  | 概要           | textArea     | ✓    |                   |
| content      | 本文           | richEditorV2 | ✓    |                   |

### Events API (events.json)

**実機と照合済み（2026-08-16）**

| フィールドID | 表示名           | 型           | 必須 | 備考                                        |
| ------------ | ---------------- | ------------ | ---- | ------------------------------------------- |
| date         | 開催日           | select       | ✓    | `day1 : 10月31日（土）` 形式（値 : ラベル） |
| type         | 企画タイプ       | select       | ✓    | room / stage / special / other              |
| place        | 場所             | text         | ✓    |                                             |
| building     | 建物番号         | text         |      |                                             |
| title        | タイトル         | text         | ✓    |                                             |
| organizer    | 主催団体         | text         | ✓    |                                             |
| thumbnail    | サムネイル       | media        |      |                                             |
| description  | 概要             | textArea     | ✓    |                                             |
| content      | 詳細             | richEditorV2 | ✓    |                                             |
| startTime    | 開始時刻         | text         |      |                                             |
| endTime      | 終了時刻         | text         |      |                                             |
| sns          | SNS              | text         |      | カスタムフィールドではない（上記参照）      |
| special      | 著名人企画の詳細 | custom       |      | → `specialDetail`。#70                      |

> [!NOTE]
> `select` の値は `day1 : 10月31日（土）` のように **`値 : ラベル`** 形式で登録されています。
> コード側は `src/lib/events.ts` で `split(":")` して先頭を取り出しています。
> ラベルだけを変更する分にはコードへの影響はありません。

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

> [!NOTE]
> 実機との照合は未実施。以下はJSONファイルの内容です。

| フィールドID | 表示名     | 型       | 必須 | 備考              |
| ------------ | ---------- | -------- | ---- | ----------------- |
| category     | カテゴリ   | select   | ✓    | sponsor/faq/other |
| title        | タイトル   | text     | ✓    |                   |
| description  | 概要       | textArea |      |                   |
| image        | 画像       | media    |      |                   |
| url          | URL        | text     |      |                   |
| priority     | 表示優先度 | number   |      |                   |

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
