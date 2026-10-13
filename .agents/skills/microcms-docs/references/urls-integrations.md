# microCMS チュートリアル・MCP・SDK URL

ベースURL: `https://document.microcms.io`

取得方法とAPI・操作マニュアルの一覧は [urls.md](urls.md) を参照する。
ドキュメントのURLパスには `.md` を付けて取得する。

## 目次

- [チュートリアル](#チュートリアル)
- [MCPサーバー](#mcpサーバー)
- [SDK](#sdk)

## チュートリアル

フレームワーク別の統合ガイド。**セクションのトップURL（`/tutorial/next/` など）は `.md` に対応していない**ため、
必ず以下の実ページURLを使用する。

### Next.js

- `/tutorial/next/next-top` - Next.jsとの連携（概要）
- `/tutorial/next/next-app-router-getting-started` - Getting Started（App Router）
- `/tutorial/next/next-app-router-tutorial` - チュートリアル（App Router）
- `/tutorial/next/next-getting-started` - Getting Started（Pages Router）
- `/tutorial/next/next-tutorial` - チュートリアル（Pages Router）

### Astro

- `/tutorial/astro/astro-top` - Astroとの連携（概要）
- `/tutorial/astro/astro-getting-started` - Getting Started
- `/tutorial/astro/astro-tutorial` - チュートリアル

### Nuxt 2

- `/tutorial/nuxt/nuxt-top` - Nuxt 2との連携（概要）
- `/tutorial/nuxt/nuxt-getting-started` - Getting Started
- `/tutorial/nuxt/nuxt-tutorial` - チュートリアル
- `/tutorial/nuxt/microcms-blog-clone` - microCMSブログのクローンを作る

### Gatsby

- `/tutorial/gatsby/gatsby-top` - Gatsbyとの連携（概要）
- `/tutorial/gatsby/gatsby-getting-started` - Getting Started
- `/tutorial/gatsby/gatsby-tutorial` - チュートリアル

### JavaScript

- `/tutorial/javascript/javascript-top` - JavaScriptとの連携（概要）
- `/tutorial/javascript/javascript-getting-started` - Getting Started（ブラウザ）
- `/tutorial/javascript/nodejs-getting-started` - Getting Started（サーバー / Node.js）

### PHP

- `/tutorial/php/php-top` - PHPとの連携（概要）
- `/tutorial/php/php-getting-started` - Getting Started

### Ruby

- `/tutorial/ruby/ruby-top` - Rubyとの連携（概要）
- `/tutorial/ruby/ruby-getting-started` - Getting Started

（`/tutorial/ruby/ruby-sdk` は `.md` 版が提供されていないため使用しない。SDKの情報は `ruby-top` に含まれる）

### Go

- `/tutorial/go/go-top` - Goとの連携（概要）
- `/tutorial/go/go-getting-started` - Getting Started
- `/tutorial/go/go-sdk` - SDK

> [!NOTE]
> チュートリアルが提供されているのは上記8種類のみ。
> Remix / Nuxt 3 / iOS / Android のチュートリアルページは**存在しない**。
> これらについて質問された場合は、ドキュメントに該当ページが無いことを伝えたうえで、
> 汎用的なコンテンツAPIの仕様（`/content-api/` 配下）や各SDKのリポジトリを案内する。

---

## MCPサーバー

- `/mcp-server/microcms-mcp-server` - microCMS本体のMCPサーバー
- `/mcp-server/microcms-document-mcp-server` - ドキュメントMCPサーバー（このスキルと同様の用途）

> 補足: microCMS公式が `microcms-document-mcp-server` を提供している。MCPを利用できる環境ではそちらが最新情報の参照に適する場合がある。

---

## SDK

主要言語の公式SDKは GitHub の `microcmsio` organization で公開されている。

| SDK        | リポジトリ                        | ドキュメント内の使用例                                                                              |
| ---------- | --------------------------------- | --------------------------------------------------------------------------------------------------- |
| JavaScript | `microcmsio/microcms-js-sdk`      | `/tutorial/javascript/javascript-getting-started`, `/tutorial/next/next-app-router-getting-started` |
| PHP        | `microcmsio/microcms-php-sdk`     | `/tutorial/php/php-getting-started`                                                                 |
| Ruby       | `microcmsio/microcms-ruby-sdk`    | `/tutorial/ruby/ruby-top`                                                                           |
| Go         | `microcmsio/microcms-go-sdk`      | `/tutorial/go/go-sdk`                                                                               |
| iOS        | `microcmsio/microcms-ios-sdk`     | ドキュメント内に無し（リポジトリのREADMEを参照）                                                    |
| Android    | `microcmsio/microcms-android-sdk` | ドキュメント内に無し（リポジトリのREADMEを参照）                                                    |

JavaScript SDK のインストール: `npm install microcms-js-sdk`

SDKの具体的なAPIは、上記のチュートリアルページのコード例から確認すること。
iOS / Android はドキュメントサイトにチュートリアルが無いため、GitHubリポジトリを案内する。
