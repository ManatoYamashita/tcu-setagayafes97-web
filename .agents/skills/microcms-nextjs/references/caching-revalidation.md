# microCMS + Next.js 再検証・更新反映

最終確認: 2026-09-08

仕様の根拠は末尾の公式情報を参照する。設計上の推奨・コード例は本Skillの提案であり、唯一の公式推奨構成を意味しない。

基本事項は [caching.md](caching.md) を参照する。

## 目次

- [WebhookでOn-demand Revalidationする](#webhookでon-demand-revalidationする)
- [revalidatePathとタグを使い分ける](#revalidatepathとタグを使い分ける)
- [公開予約を扱う](#公開予約を扱う)
- [キャッシュされない構成](#キャッシュされない構成)
- [更新が反映されないとき](#更新が反映されないとき)
- [本番相当で検証する](#本番相当で検証する)
- [公式情報](#公式情報)

## WebhookでOn-demand Revalidationする

構成:

```text
microCMSで公開・更新
  ↓
カスタムWebhook
  ↓
Next.js Route Handler
  ↓
署名検証
  ↓
revalidateTag / revalidatePath
```

### Route Handler例

以下はNext.js 16の例。更新後の最初のアクセスで古いデータを返さない要件を想定する。多少の遅延を許容して応答速度を優先する場合は、下記の `{ expire: 0 }` を `'max'` に変更する。

```ts
import crypto from "node:crypto";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function verifySignature(body: string, signature: string, secret: string) {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);

  return (
    actualBuffer.length === expectedBuffer.length &&
    crypto.timingSafeEqual(actualBuffer, expectedBuffer)
  );
}

export async function POST(request: Request) {
  const secret = process.env.MICROCMS_WEBHOOK_SECRET;
  const signature = request.headers.get("x-microcms-signature");

  if (!secret || !signature) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.text();

  if (!verifySignature(rawBody, signature, secret)) {
    return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ message: "Invalid JSON" }, { status: 400 });
  }
  if (
    !payload ||
    typeof payload !== "object" ||
    !("api" in payload) ||
    typeof payload.api !== "string" ||
    !("id" in payload) ||
    !(payload.id === null || typeof payload.id === "string")
  ) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  if (payload.api !== "articles") {
    return NextResponse.json({ revalidated: false });
  }

  // 上の取得関数は一覧・詳細とも共通タグ articles を持つ。
  revalidateTag("articles", { expire: 0 });
  return NextResponse.json({ revalidated: true });
}
```

重要:

- 署名検証にはraw bodyを使う。
- シークレットは環境変数で管理する。
- 検証前に再検証処理を実行しない。
- microCMS Webhookは失敗時に自動リトライされないため、重要な同期処理では監視・補完手段を検討する。
- Webhookの通知順序へ依存しない。

microCMS Webhookの共通仕様は `microcms-guide` の `webhooks.md` を参照する。

## revalidatePathとタグを使い分ける

- `revalidateTag(tag, 'max')`: 古い値を返しながらバックグラウンドで再取得する。更新後の初回アクセスにも旧内容が表示されうる。
- `revalidateTag(tag, { expire: 0 })`: 対象を期限切れにし、次のアクセスで再取得を待つ。Webhookの受信時点でページを事前生成する処理ではない。
- `updateTag` はServer Action向けで、WebhookのRoute Handlerからは使えない。1引数の `revalidateTag(tag)` はNext.js 16では非推奨。

公開終了・削除後に旧内容を表示してはいけない要件では、上記の違いを踏まえて選ぶ。開いているブラウザの画面がWebhookだけで自動更新されるわけでもない。

### `revalidatePath`

シンプルで、影響するルートが明確な場合に向く。

```ts
revalidatePath("/articles");
revalidatePath(`/articles/${id}`);
```

向くケース:

- 更新対象が少数の明確なページだけ。
- タグ設計を持ち込みたくない小規模サイト。

### `revalidateTag` / `cacheTag`

同じデータを複数ページが利用する場合に向く。

```text
articlesデータ
├─ /
├─ /articles
├─ /articles/[id]
└─ /categories/[id]
```

このような場合、データにタグを付けて依存ページをまとめて再検証する方が保守しやすい。

Cache Componentsモデルでは、Next.jsの現在のガイドもCMSのようなデータに長い `cacheLife` + `cacheTag` + Webhookによる `revalidateTag` を有力な構成としている。

## 公開予約を扱う

公開予約を使うサイトでは、単純な長時間ISRだけだと公開予定時刻から次の再検証まで古い表示が残りうる。

要件別に考える。

### 数分程度の遅延が許容される

時間ベースISRでも成立する場合がある。

### 公開操作・予約実行後に速やかに反映したい

microCMS Webhook + On-demand Revalidationを検討する。

### 秒単位で厳密な公開時刻を要求する

Webhook・ネットワーク・再生成には処理時間があるため、「完全に指定時刻と同一瞬間」をISRで保証できるとは説明しない。

必要なら動的取得や別の公開制御方式も含めて設計する。

## キャッシュされない構成

常に最新コンテンツが必要なら、動的取得を選択できる。

ただし「キャッシュが難しいから全部no-store」をデフォルトにしない。

影響:

- リクエストごとにmicroCMS取得が増えうる。
- レイテンシが増える可能性がある。
- サーバー負荷・データ転送量へ影響する。

公開記事のように更新頻度が低いデータは、キャッシュ + Webhookの方が適することが多い。

## 更新が反映されないとき

次の順序で確認する。

### 1. microCMS API

Content APIを直接呼び、期待する公開データが返っているか。

返っていなければNext.jsのキャッシュ問題ではない。

### 2. Next.jsのバージョンとモデル

- `cacheComponents` は有効か。
- `use cache` / `cacheLife` / `cacheTag` を使っているか。
- 従来モデルの `revalidate` / `customRequestInit` か。

### 3. Webhook

- microCMSから通知されているか。
- 受信Route Handlerが2xxを返しているか。
- 署名検証が通っているか。
- 正しいAPI / IDを解析しているか。

### 4. 再検証対象

- 実際にキャッシュへ付けたタグ名と同じか。
- パスがrewrites前後でずれていないか。
- 一覧だけ再検証し、詳細が残っていないか。

### 5. ホスティング

自前Dockerや複数インスタンスでは、キャッシュの永続化・共有方法がVercelと異なる場合がある。ホスティングの実装を確認する。

### 再ビルドしても古いデータが残る

microCMS公式ヘルプには、ビルド前の `.next/cache/fetch-cache` 削除で改善する場合があると案内されている。まずCIやホスティングが前回のビルドキャッシュを復元していないか確認する。このパスは実装依存であり、全バージョン・Cache Components共通の無効化APIではない。削除をビルドスクリプトへ常設する前に、対象バージョンと問題のキャッシュ層を確認する。[公式ヘルプ：再ビルド後も更新されない](https://help.microcms.io/ja/knowledge/app-router-cache)

## 本番相当で検証する

開発モードは本番キャッシュ挙動と異なるため、ISR問題はproduction buildで再現確認する。

```bash
npm run build
npm run start
```

必要に応じてNext.jsのキャッシュデバッグ用環境変数も利用する。

```bash
NEXT_PRIVATE_DEBUG_CACHE=1
```

ただし内部・デバッグ用の挙動は将来変わる可能性があるため、利用中のNext.js公式ドキュメントを確認する。

## 公式情報

- [fetchとキャッシュ](https://nextjs.org/docs/app/api-reference/functions/fetch)
- [use cache](https://nextjs.org/docs/app/api-reference/directives/use-cache)
- [revalidateTag：SWRと即時失効](https://nextjs.org/docs/app/api-reference/functions/revalidateTag)
- [Cache ComponentsとSuspense](https://nextjs.org/docs/messages/blocking-route)
- [microCMS Webhook](https://document.microcms.io/manual/webhook-setting)
