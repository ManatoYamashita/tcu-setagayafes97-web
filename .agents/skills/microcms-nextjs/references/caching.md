# microCMS + Next.js キャッシュ・ISR

最終確認: 2026-09-08

仕様の根拠は末尾の公式情報を参照する。設計上の推奨・コード例は本Skillの提案であり、唯一の公式推奨構成を意味しない。

## 目次

- [最初にキャッシュモデルを判定する](#最初にキャッシュモデルを判定する)
- [更新要件から戦略を選ぶ](#更新要件から戦略を選ぶ)
- [Cache Componentsを使う場合](#cache-componentsを使う場合)
- [従来モデルを使う場合](#従来モデルを使う場合)
- [microcms-js-sdkで従来モデルのfetchオプションを渡す](#microcms-js-sdkで従来モデルのfetchオプションを渡す)
- [WebhookでOn-demand Revalidationする](caching-revalidation.md#webhookでon-demand-revalidationする)
- [revalidatePathとタグを使い分ける](caching-revalidation.md#revalidatepathとタグを使い分ける)
- [公開予約を扱う](caching-revalidation.md#公開予約を扱う)
- [キャッシュされない構成](caching-revalidation.md#キャッシュされない構成)
- [更新が反映されないとき](caching-revalidation.md#更新が反映されないとき)
- [本番相当で検証する](caching-revalidation.md#本番相当で検証する)
- [公式情報](#公式情報)

## 最初にキャッシュモデルを判定する

Next.js 16以降では、`next.config.*` の `cacheComponents` を最初に確認する。

```ts
const nextConfig = {
  cacheComponents: true,
};
```

### `cacheComponents: true`

Cache Componentsモデルを使う。

- データ取得は動的が基本。
- キャッシュしたい関数・コンポーネントへ `'use cache'` を付ける。
- `cacheLife` で寿命を指定する。
- `cacheTag` でタグを付ける。
- `revalidateTag` / `revalidatePath` 等で再検証する。

### `cacheComponents` を使わない

従来モデルを使う。

現在のNext.js 16系の従来モデルでは、`fetch` はデフォルトではキャッシュされない。必要なリクエストへ `cache: 'force-cache'` や `next.revalidate` を指定する。

`microcms-js-sdk` では `customRequestInit` からNext.jsの `fetch` オプションを渡せる。

fetchのData Cacheとページの静的生成は別であり、fetch設定を省略してもビルド時の取得結果を含むページが事前生成される場合がある。「fetchが未キャッシュだから毎アクセスで更新される」とは判断しない。

古いNext.js記事の「fetchはデフォルトでキャッシュされる」という説明を現在のプロジェクトへそのまま適用しない。

## 更新要件から戦略を選ぶ

実装方法より先に、「どのくらいの遅延まで許容できるか」を確認する。

| 要件                       | 第一候補                                               |
| -------------------------- | ------------------------------------------------------ |
| 数十分〜数時間の遅延でよい | 時間ベースキャッシュ                                   |
| 公開・更新時に反映したい   | 長めのキャッシュ + WebhookによるOn-demand Revalidation |
| 常に最新データが必要       | 動的取得 / no-store相当                                |
| 公開前の下書きを確認したい | Draft Mode + プレビュー時の動的取得                    |

CMSコンテンツのように「変更が発生したときだけ更新すればよい」データでは、短い間隔で常時再検証するより、長めにキャッシュしてWebhookで無効化する構成を優先的に検討する。

## Cache Componentsを使う場合

Next.js 16のCache Componentsでは、microCMS取得関数をキャッシュ単位にする方法が分かりやすい。

```ts
import { cacheLife, cacheTag } from "next/cache";
import { client } from "@/lib/microcms";
import type { Article } from "@/types/article";

export async function getArticles() {
  "use cache";
  cacheLife("max");
  cacheTag("articles");

  return client.getList<Article>({
    endpoint: "articles",
  });
}
```

詳細単位のタグも付けられる。

```ts
export async function getArticle(id: string) {
  "use cache";
  cacheLife("max");
  cacheTag("articles", `article:${id}`);

  return client.getListDetail<Article>({
    endpoint: "articles",
    contentId: id,
  });
}
```

キャッシュしないデータ取得やリクエスト時の `searchParams` / `cookies()` を読む部分は、`<Suspense>` 境界の内側へ配置する。`use cache` の追加だけでページ全体の構成が完成するとは限らない。

### タグ設計

ページパスではなく「データの依存関係」で考える。

例:

- `articles`: 記事一覧に依存するデータ
- `article:{id}`: 特定記事
- `categories`: カテゴリ一覧
- `category:{id}`: 特定カテゴリ

記事更新がトップページ・記事一覧・詳細へ影響するなら、適切な共通タグを使うと一括で更新できる。

タグを細分化しすぎて、Webhook側で大量の依存関係を管理する設計にも注意する。

## 従来モデルを使う場合

### 時間ベースISR

ページ全体の再検証周期を設定する例:

```ts
export const revalidate = 3600;
```

ただし、Next.js 16で `cacheComponents: true` のプロジェクトへこのパターンをそのまま提案しない。

### fetch単位で設定する

ネイティブ `fetch` の例:

```ts
const response = await fetch(url, {
  next: {
    revalidate: 3600,
  },
});
```

完全に動的にしたい場合:

```ts
const response = await fetch(url, {
  cache: "no-store",
});
```

更新頻度1秒など極端に短いISRを「リアルタイム更新」の代替として使わない。高精度な更新が必要ならOn-demand Revalidationまたは動的取得を検討する。

## microcms-js-sdkで従来モデルのfetchオプションを渡す

SDKは `customRequestInit` からNext.js App Routerのfetchオプションを渡せる。

時間ベース:

```ts
const data = await client.getList<Article>({
  endpoint: "articles",
  customRequestInit: {
    next: {
      revalidate: 3600,
    },
  },
});
```

タグ（`next.tags` はラベルであり、キャッシュを有効化する指定も必要）:

```ts
const data = await client.getList<Article>({
  endpoint: "articles",
  customRequestInit: {
    cache: "force-cache",
    next: {
      tags: ["articles"],
    },
  },
});
```

キャッシュしない:

```ts
const data = await client.getList<Article>({
  endpoint: "articles",
  customRequestInit: {
    cache: "no-store",
  },
});
```

`customRequestInit` は「microCMS独自のキャッシュ」ではない。SDK内部のfetchへNext.js側の設定を渡していると説明する。

## 公式情報

- [fetchとキャッシュ](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [revalidateTag：SWRと即時失効](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Cache ComponentsとSuspense](https://nextjs.org/docs/messages/blocking-route)
- [microCMS Webhook](https://document.microcms.io/manual/webhook-setting)
