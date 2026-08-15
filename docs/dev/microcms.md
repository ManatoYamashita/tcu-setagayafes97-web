# microCMS API 制約と実装パターン

本プロジェクトで使用する microCMS API の制約事項と、それに対する実装パターンをまとめる。

## API 制約

### limit パラメータ上限: **100件**

microCMS の GET List API は `limit` の最大値が **100** に制限されている。
100 を超える値を指定すると `400 Bad Request` が返る。

```
Error: fetch API response status: 400
message is `Invalid 'limit' value. It should not exceed 100.`
```

### その他の主要制約

| パラメータ | 制約             | 備考                 |
| ---------- | ---------------- | -------------------- |
| `limit`    | 最大 100         | デフォルト 10        |
| `offset`   | 0 以上           | ページネーション用   |
| `filters`  | 文字列長制限あり | 複雑なフィルタは分割 |

## ページネーション実装パターン

### 現在の適用箇所

- **`src/lib/events.ts` — `getEventsList()`**: 実装済み

### 実装方法

100件超のデータ取得が必要な場合、`offset` ベースのページネーションで自動分割取得する。

```typescript
const MICROCMS_MAX_LIMIT = 100;

// 100件以下: 1回で取得
if (limit <= MICROCMS_MAX_LIMIT) {
  const response = await client.get({ endpoint, queries: { limit, ... } });
  return response.contents;
}

// 100件超: ページネーション
const allContents = [];
let offset = 0;

while (allContents.length < limit) {
  const perPage = Math.min(MICROCMS_MAX_LIMIT, limit - allContents.length);
  const response = await client.get({
    endpoint,
    queries: { limit: perPage, offset, ... },
  });

  allContents.push(...response.contents);

  // 取得件数が要求数未満 = これ以上データがない
  if (response.contents.length < perPage) break;
  offset += perPage;
}
```

**終了判定**: `response.contents.length < perPage` でデータ末尾を検知。
`totalCount` を使う方法もあるが、上記の方がシンプルで十分。

### 未適用の関数（将来的に100件超が必要になった場合）

以下の関数は現時点で100件以下のリクエストのため未適用。
データ量が増加した場合、同じパターンを適用すること。

| 関数                | ファイル                  | 現在の最大 limit  |
| ------------------- | ------------------------- | ----------------- |
| `getNewsList()`     | `src/lib/news.ts`         | 100（sitemap 用） |
| `getSponsorsList()` | `src/lib/informations.ts` | 100               |
| `getFAQList()`      | `src/lib/informations.ts` | 50                |

### 注意事項

- ページネーションは API コール回数が増えるため、ISR/SSG でキャッシュを活用すること
- `orders` パラメータはページ間で一貫性を保つ必要がある（ソート順の不整合に注意）
- 本プロジェクトの想定企画数は最大200件程度（2回のリクエストで取得可能）

## 使用 API エンドポイント

| API            | 用途               | 主な取得関数                                                |
| -------------- | ------------------ | ----------------------------------------------------------- |
| `news`         | お知らせ・ニュース | `getNewsList()`, `getNewsById()`                            |
| `events`       | 企画情報           | `getEventsList()`, `getFeaturedEvents()`, `getEventById()`  |
| `informations` | 協賛企業・FAQ      | `getSponsorsList()`, `getFAQList()`, `getInformationById()` |

## select フィールドの選択肢を増やすときの注意

**スキーマ側で選択肢を増やしても、コード側の正規化関数を直さなければ静かに壊れる。**

`src/lib/*.ts` の正規化関数はホワイトリスト方式で、想定外の値をすべてフォールバック値へ落とす。

```typescript
// src/lib/informations.ts
if (cleanCategory === "sponsor" || cleanCategory === "faq" || cleanCategory === "other") {
  return cleanCategory;
}
return "other"; // ← 新しい選択肢はここに吸い込まれる
```

**エラーにならない。** 入稿側では新しい選択肢が選べているため、原因にたどり着くまで時間がかかる。

- `microcms/*.json` の `selectItems` を変更したら、**同じコミットで**対応する正規化関数と型定義を直す
- 対象: `normalizeInformationCategory()`（`informations.category`）、`src/lib/events.ts` と `src/lib/news.ts` の同種の関数
- 値は API をまたいで一意になるよう命名する。やむを得ず衝突する場合（例: `events.type` と `informations.category` の `special`）は、取得関数の JSDoc に区別を明記する

## カスタムフィールドと繰り返しフィールド

### ネストの制約

**カスタムフィールドの中にカスタムフィールドを直接は置けない。** ただし「繰り返し」フィールドは既存のカスタムフィールドを要素型として参照するため、繰り返しを介せばネストを表現できる。

```
specialDetail（カスタムフィールド）
└── goods（繰り返し）
    └── goodsItem（カスタムフィールド）  ← 繰り返し経由なら入れられる
```

### 作成順序は子から親へ

繰り返しフィールドは**作成済みのカスタムフィールドしか選べない**。依存の逆順に作る必要がある。

```
1. goodsItem      （子）
2. ticketPlan     （子）
3. noticeSection  （子）
4. specialDetail  （親 / 上記3つを「繰り返し」で参照）
5. API スキーマへ親を追加
```

親から作ろうとすると参照先が無く詰まる。

### API をまたいで参照できない

カスタムフィールドは **API ごとに定義される。** `events` の親カスタムフィールドから `informations` のカスタムフィールドは選択肢に出ない。関連するものは同じ API 配下にまとめて作ること。

### プラン制限

無料プランでは「ファイル」フィールドが使えない（`現在のプランではご利用できません` と表示される）。「拡張フィールド」は使用可能。

## 下書きコンテンツで動作確認はできない

**`draftKey` は保存のたびに変わり、失効する。** 下書きのまま実装の動作確認をしようとすると、API が 404 を返して止まる。

```bash
# 保存直後に控えた draftKey でも、その後の保存で無効になる
curl -H "X-MICROCMS-API-KEY: $KEY" \
  "https://$DOMAIN.microcms.io/api/v1/events/<id>?draftKey=<key>"
# → HTTP 404
```

確認したい内容に応じて、次のどちらかを使う。

| 目的                       | 方法                                                                                                                                     |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **表示・レイアウトの確認** | コンポーネントへダミーを直接渡す一時ページを作る。CMS に依存せず、**未入力フィールドの挙動まで確認できる**。確認後に削除しコミットしない |
| **API 経由の疎通確認**     | コンテンツを一時的に公開する。公開フラグ（`NEXT_PUBLIC_*_VISIBLE`）が false なら本番・プレビューには出ないため、実害なく確認できる       |

雛形・テンプレート系の実装では、**「入れたものが出るか」より「入れなかったものが消えるか」**の確認が重要になる。一時ページを作る方法なら、空フィールドの組み合わせを自由に試せる。

## 管理画面はブラウザ自動操作で編集できない

**スキーマ定義・カスタムフィールド作成は手作業で行うこと。**（2026-08-16 検証）

microCMS 管理画面のフィールド種類選択ダイアログは、**実マウスイベントで開いたときにしか「どの行を編集中か」の内部状態が更新されない。** スクリプトからの `click()`（`element.click()` / CDP 経由の要素参照クリック）では前回の対象行が保持されたままとなり、選択が意図しない行へ適用される。

さらに次の性質があり、状態判定そのものが成立しない。

| 症状                           | 実態                                                                                                     |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| ダイアログが閉じたように見える | `[role="dialog"]` は DOM に残り続ける。Escape でも消えない                                               |
| 行数を数えられない             | 行の `placeholder` は行ごとに変わる（1行目 `例: title`、2行目 `例: body`）。固定セレクタでは数えられない |
| 種類の候補が二重に見える       | ダイアログ内にサンプル用の `<input>` が含まれる。`[role="dialog"]` 配下を除外しないと行数判定が壊れる    |

**自動化できるのはフィールドIDと表示名の入力だけ**（`HTMLInputElement.prototype.value` のセッター + `input` イベントで React に反映される）。種類の選択が信頼できない以上、全体を手作業で行うほうが速く安全である。

なお API スキーマ画面にあるのは「この設定をエクスポートする」のみで、**既存 API へのインポート機能は無い。** JSON を用意して流し込むことはできない。

関連: [agent-browser-workflow.md](../frontend/agent-browser-workflow.md)

## 関連ドキュメント

- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — microCMS API 設計（フィールド定義）
- [docs/requires/require.md](../requires/require.md) — 要件定義書

---

**最終更新日**: 2026-08-16
