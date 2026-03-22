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

## 関連ドキュメント

- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — microCMS API 設計（フィールド定義）
- [docs/requires/require.md](../requires/require.md) — 要件定義書

---

**最終更新日**: 2026-03-22
