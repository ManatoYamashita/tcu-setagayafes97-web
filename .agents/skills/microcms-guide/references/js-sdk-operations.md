# microcms-js-sdk 書き込み・運用ガイド

最終確認: 2026-09-08

このリファレンスは、JavaScript / TypeScript から microCMS を利用する際に `microcms-js-sdk` をどう使うか判断するためのガイド。API リファレンスの転載ではなく、実装時に選択すべきメソッド、型、安全な API キー運用、エラーハンドリングなどの実践的な判断を扱う。

基本事項は [js-sdk.md](js-sdk.md) を参照する。

## 目次

- [書き込み操作](#書き込み操作)
- [APIキーの扱い](#apiキーの扱い)
- [retry](#retry)
- [customRequestInit](#customrequestinit)
- [エラーハンドリング](#エラーハンドリング)
- [Management API クライアント](#management-api-クライアント)
- [判断ルール](#判断ルール)
- [公式情報](#公式情報)

## 書き込み操作

`create`, `update`, `delete` は API キーに対応する書き込み権限が必要。

```ts
await client.create<Article>({
  endpoint: "articles",
  content: {
    title: "タイトル",
  },
});
```

```ts
await client.update<Article>({
  endpoint: "articles",
  contentId: "article-id",
  content: {
    title: "更新後のタイトル",
  },
});
```

書き込み系の API キーをブラウザへ露出させない。原則としてサーバーサイドや信頼できる実行環境から呼び出す。

SDK のバージョンによって `isDraft`, `isClosed` など利用できるオプションが異なる場合があるため、公開状態を操作するコードを生成するときは現在の公式 README を確認する。

### 繰り返しフィールドの更新

`update` / PATCHで繰り返しフィールドを更新するときは、変更する要素だけでなく、その繰り返しフィールド内の全要素・保持したい全フィールドを送る。省略した内部フィールドは空値になり得る。対象の公開／下書き状態を確認して現在値を取得し、変更箇所以外を維持した配列を作る。GETの参照展開結果をそのまま送らず、WRITE APIが受け取る形に整える。[公式ヘルプ：繰り返しのPATCH](https://help.microcms.io/ja/knowledge/patch-api-repeat-field-request-body)

読み取りから書き込みまでの間に編集者が更新すると上書きする可能性があるため、実行直前の再確認や編集時間の調整も検討する。これはread-modify-writeに関する実装上の注意であり、SDKの自動マージ機能ではない。

## APIキーの扱い

API キーは「常にクライアントへ出してはいけない」という単純な扱いではなく、付与された権限で判断する。

- CSR で API キーを利用すると、利用者からキーを確認できる。
- クライアントから直接 GET する必要がある場合は、公開して問題のない API だけに GET 権限を限定するなど、必要最低限の権限にする。
- 書き込み権限、下書き全取得、非公開 API へのアクセスなどを含むキーはサーバーサイドで扱う。
- 読み取り用と書き込み用の API キーを分けることを検討する。
- コード例では実値を直接記述せず、環境変数や安全な設定方法を使う。

## retry

`createClient` の `retry: true` を指定すると、SDK のリトライ機能を有効にできる。公式 README では最大2回まで再試行すると案内されている。

```ts
const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_API_KEY!,
  retry: true,
});
```

### 推奨

- 一時的な失敗への耐性が必要な処理では利用を検討する。
- リトライを有効にすれば大量アクセスや不適切なリクエスト設計が解決する、と説明しない。
- 書き込み処理や外部副作用を含む設計では、処理全体の冪等性も別途検討する。

GETのエラー応答もCDNに最大10秒キャッシュされる場合があり、即座の再試行では同じエラーを受け取り得る。SDKのretryは対象エラーに対して待機を挟むため、呼び出し元のタイムアウトも確認する。独自リトライは回数を制限し、待機時間を増やす方式を検討する。待機・対象ステータスの詳細は導入済みSDKで確認し、外側のリトライと重ねてリクエストを増幅させない。[公式ヘルプ：再試行で同じエラーが返る場合](https://help.microcms.io/ja/knowledge/retry-error-same-response)

## customRequestInit

`customRequestInit` では underlying `fetch` に渡す設定を指定できる。

AbortController の例:

```ts
const controller = new AbortController();

const data = await client.getObject<SiteSettings>({
  endpoint: "settings",
  customRequestInit: {
    signal: controller.signal,
  },
});
```

フレームワークが `fetch` を拡張している場合、そのオプションを `customRequestInit` から指定できることがある。たとえば Next.js App Router のキャッシュ関連オプションは公式 README に例があるが、意味や推奨設定は Next.js 側の仕様に依存するため `microcms-nextjs` で扱う。

## エラーハンドリング

通常は標準の `Error` として扱える。`isMicroCMSRequestError` をexportするSDKでは、microCMS リクエスト由来のエラーを判定できる。公式READMEの最新版とインストール済みのリリースは一致するとは限らないため、使用前に対象バージョンのexport・型定義を確認する。

```ts
import { createClient, isMicroCMSRequestError } from "microcms-js-sdk";

try {
  await client.getList({ endpoint: "articles" });
} catch (error) {
  if (isMicroCMSRequestError(error)) {
    console.error(error.status);
    // urlやoriginalErrorの出力は、秘密情報が含まれないか確認した場合のみ。
  }
  throw error;
}
```

- HTTP エラーでは `status` に HTTP ステータスコードが入る。
- ネットワークエラーでは `status` は `undefined` になる。
- `url` に `draftKey` が含まれる場合、SDK は値を `***` にマスクする。
- `originalError` の形式は実行環境によって異なるため、その具体的な構造に依存した処理を書かない。

エラーを握りつぶさない。ユーザーにデバッグを依頼された場合は、HTTP エラーかネットワークエラーかをまず切り分ける。

## Management API クライアント

SDK には `createManagementClient` も用意されており、現在は Management API を利用したメディアアップロードなどに使用できる。

```ts
import { createManagementClient } from "microcms-js-sdk";

const client = createManagementClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN!,
  apiKey: process.env.MICROCMS_MANAGEMENT_API_KEY!,
});
```

Content API 用の `createClient` と Management API 用の `createManagementClient` を混同しない。Management API はベータ提供のため、対応範囲や仕様を回答するときは最新の公式情報を確認する。

## 判断ルール

ユーザーの依頼に対して、以下を優先する。

1. API 形式を確認して適切な SDK メソッドを選ぶ。
2. 必要なデータだけ取得できるよう `queries` を検討する。
3. 全件取得は必要性を確認してから使う。
4. TypeScript プロジェクトではコンテンツ型を明示する。
5. API キーは利用場所と権限をセットで確認する。
6. フレームワーク固有のキャッシュやデータ取得挙動は専門 Skill に委ねる。
7. SDK の仕様が不明な場合は、推測せず現在の公式 README / npm / microCMS ドキュメントを確認する。

## 公式情報

- [microCMS JavaScript SDK](https://github.com/microcmsio/microcms-js-sdk)
- [npm](https://www.npmjs.com/package/microcms-js-sdk)
- [GET API におけるクエリパラメータ](https://document.microcms.io/content-api/content-api-query)
- [コンテンツ一覧取得 API](https://document.microcms.io/content-api/get-list-contents)
- [APIキー（認証と権限管理）](https://document.microcms.io/content-api/x-microcms-api-key)
- [101件以上のコンテンツ取得](https://help.microcms.io/ja/knowledge/fetch-big-data)
- [フィールドごとのレスポンス形式](https://document.microcms.io/content-api/get-api-field-responses)
