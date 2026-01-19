# microCMS APIスキーマ インポートガイド

## 概要

このディレクトリには、microCMSのAPIスキーマ定義JSONファイルが格納されています。

## ファイル一覧

- `news.json` - News API（お知らせ）スキーマ
- `events.json` - Events API（企画）スキーマ
- `informations.json` - Informations API（協賛・FAQ）スキーマ

## インポート手順

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
   - News API → `news.json`
   - Events API → `events.json`
   - Informations API → `informations.json`
3. インポート完了を確認

### 4. インポート後の手動設定（推奨）

#### Events API

- `startTime`, `endTime` フィールドにプレースホルダー「例: 10:00」を設定

#### 全API共通

- 各フィールドに説明文を追加（入稿時の注意事項）
- APIプレビュー機能でレスポンス形式を確認

## トラブルシューティング

### カスタムフィールドがインポートされない

Events APIの `sns` フィールド（SNSLinksカスタムフィールド）がインポートされない場合：

**代替案:** フラットな個別フィールドとして手動作成

- `sns_twitter` (テキスト)
- `sns_instagram` (テキスト)
- `sns_website` (テキスト)

フロントエンド側で以下のようにマッピング：

```typescript
const event: Event = {
  // ...
  sns: {
    twitter: rawData.sns_twitter,
    instagram: rawData.sns_instagram,
    website: rawData.sns_website,
  },
};
```

### JSON構文エラー

- [JSONLint](https://jsonlint.com/) でJSON構文を検証
- インデントは2スペース推奨
- UTF-8エンコーディング確認

## 型定義との対応

各JSONファイルは以下のTypeScript型定義と対応しています：

- `news.json` ← `src/types/news.ts`
- `events.json` ← `src/types/events.ts`
- `informations.json` ← `src/types/informations.ts`

## スキーマ詳細

### News API (news.json)

| フィールドID | 表示名         | 型           | 必須 | 備考              |
| ------------ | -------------- | ------------ | ---- | ----------------- |
| type         | お知らせ種別   | select       | ✓    | urgent/news/other |
| title        | タイトル       | text         | ✓    |                   |
| thumbnail    | サムネイル画像 | media        |      |                   |
| description  | 概要           | textArea     | ✓    |                   |
| content      | 本文           | richEditorV2 | ✓    |                   |

### Events API (events.json)

| フィールドID | 表示名             | 型           | 必須 | 備考                     |
| ------------ | ------------------ | ------------ | ---- | ------------------------ |
| date         | 開催日             | select       | ✓    | day1/day2/both/other     |
| type         | 企画種別           | select       | ✓    | room/stage/special/other |
| place        | 場所（教室番号等） | text         | ✓    |                          |
| building     | 建物名             | text         | ✓    |                          |
| title        | 企画タイトル       | text         | ✓    |                          |
| organizer    | 主催団体名         | text         | ✓    |                          |
| thumbnail    | サムネイル画像     | media        |      |                          |
| description  | 企画概要           | textArea     | ✓    |                          |
| content      | 詳細説明           | richEditorV2 | ✓    |                          |
| startTime    | 開始時刻（HH:mm）  | text         |      |                          |
| endTime      | 終了時刻（HH:mm）  | text         |      |                          |
| sns          | SNS情報            | custom       |      | カスタムフィールド       |

**SNSLinksカスタムフィールド:**

- twitter (テキスト)
- instagram (テキスト)
- website (テキスト)

### Informations API (informations.json)

| フィールドID       | 表示名        | 型           | 必須 | 備考              |
| ------------------ | ------------- | ------------ | ---- | ----------------- |
| category           | カテゴリ      | select       | ✓    | sponsor/faq/other |
| title              | タイトル      | text         | ✓    |                   |
| sponsorName        | 協賛企業名    | text         |      | sponsor用         |
| sponsorDescription | 協賛企業説明  | textArea     |      | sponsor用         |
| logo               | ロゴ画像      | media        |      | sponsor用         |
| url                | URL           | text         |      |                   |
| priority           | 表示優先度    | number       |      |                   |
| question           | 質問（FAQ用） | text         |      | FAQ用             |
| answer             | 回答（FAQ用） | richEditorV2 |      | FAQ用             |

## 参考リンク

- [microCMS公式ドキュメント: APIスキーマのエクスポート／インポート](https://document.microcms.io/manual/export-and-import-api-schema)
- [JSONLint - JSON Validator](https://jsonlint.com/)
