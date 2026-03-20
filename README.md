# 東京都市大学 第97回 世田谷祭 公式Webサイト

東京都市大学 世田谷キャンパスで開催される学園祭「第97回 世田谷祭」の公式Webサイトです。

| 項目     | 内容                                 |
| -------- | ------------------------------------ |
| 開催日程 | 2026年10月31日（土）〜 11月1日（日） |
| 開催時間 | 10:00 〜 18:00                       |
| 会場     | 東京都市大学 世田谷キャンパス        |
| テーマ   | つながる、ひろがる、世田谷祭         |

## 技術スタック

| カテゴリ             | 技術                                             |
| -------------------- | ------------------------------------------------ |
| フレームワーク       | [Next.js 16.1](https://nextjs.org/) (App Router) |
| 言語                 | TypeScript                                       |
| スタイリング         | [TailwindCSS 4](https://tailwindcss.com/)        |
| アニメーション       | [GSAP](https://greensock.com/)                   |
| CMS                  | [microCMS](https://microcms.io/)                 |
| フォーム             | React Hook Form + Zod                            |
| 多言語対応           | [next-intl](https://next-intl.dev/)              |
| ホスティング         | [Vercel](https://vercel.com/)                    |
| パッケージマネージャ | pnpm                                             |

## セットアップ

### 前提条件

- Node.js >= 20
- pnpm

### インストール

```bash
# リポジトリをクローン
git clone https://github.com/your-org/tcu-setagayafes97-web.git
cd tcu-setagayafes97-web

# 依存パッケージをインストール
pnpm install

# 環境変数を設定
cp .env.example .env.local
```

### 環境変数

`.env.local` に以下の環境変数を設定してください。

| 変数名                    | 説明                      | 必須 |
| ------------------------- | ------------------------- | :--: |
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン | Yes  |
| `MICROCMS_API_KEY`        | microCMS API キー         | Yes  |
| `NEXT_PUBLIC_SITE_URL`    | サイトの公開URL           | Yes  |
| `NEXT_PUBLIC_GTM_ID`      | Google Tag Manager ID     |  No  |
| `SMTP_HOST`               | SMTP サーバーホスト       |  No  |
| `SMTP_PORT`               | SMTP ポート番号           |  No  |
| `SMTP_USER`               | SMTP ユーザー名           |  No  |
| `SMTP_PASS`               | SMTP パスワード           |  No  |
| `CONTACT_TO_EMAIL`        | お問い合わせ送信先メール  |  No  |
| `CONTACT_FROM_EMAIL`      | お問い合わせ送信元メール  |  No  |

### 開発コマンド

```bash
# 開発サーバー起動
pnpm dev

# プロダクションビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# Lint チェック
pnpm lint

# フォーマットチェック
pnpm format:check

# フォーマット自動修正
pnpm format

# バンドル分析
pnpm analyze
```

## ディレクトリ構成

```
src/
├── app/                  # Next.js App Router ページ
│   ├── [locale]/         # 多言語ページ (en, zh, ko)
│   ├── about/            # 委員会・協賛・お問い合わせ・プライバシー
│   ├── api/              # API Routes
│   ├── events/           # 企画検索・詳細
│   ├── info/             # お知らせ・FAQ・ガイド・パンフレット
│   ├── map/              # マップ・アクセス
│   └── timetable/        # タイムテーブル
├── components/           # React コンポーネント
├── data/                 # 静的コンテンツ管理（JSON/TS）
├── lib/                  # ユーティリティ・ヘルパー関数
├── messages/             # 多言語翻訳ファイル (ja/en/zh/ko)
└── assets/               # 静的アセット（画像・動画）
```

## ブランチ戦略

`main` ブランチへの直接 push は禁止です。すべての作業はフィーチャーブランチで実施し、PR 経由でマージします。

```
feature/<feature-name>     # 新機能追加
bugfix/<bug-description>   # バグ修正
hotfix/<urgent-fix>        # 緊急修正
docs/<doc-update>          # ドキュメント更新
refactor/<refactor-target> # リファクタリング
```

### コミットメッセージ規約

```
PREFIX: コミットメッセージ
```

| PREFIX     | 用途               |
| ---------- | ------------------ |
| `FEATURE`  | 新機能追加         |
| `FIX`      | バグ修正           |
| `REFACTOR` | リファクタリング   |
| `STYLE`    | スタイル変更       |
| `DOC`      | ドキュメント更新   |
| `TEST`     | テスト追加・修正   |
| `CHORE`    | ビルド・設定変更   |
| `PERF`     | パフォーマンス改善 |
| `CI`       | CI/CD 設定変更     |

## ドキュメント

プロジェクトのドキュメントは `docs/` ディレクトリで管理しています。

- [`docs/INDEX.md`](docs/INDEX.md) - ドキュメント索引
- [`docs/requires/require.md`](docs/requires/require.md) - 要件定義書
- [`docs/requires/todo.md`](docs/requires/todo.md) - 開発タスクリスト
- [`docs/dev/git.md`](docs/dev/git.md) - ブランチ戦略・CI/CD
- [`docs/frontend/design.md`](docs/frontend/design.md) - デザインシステム
- [`docs/frontend/layout-patterns.md`](docs/frontend/layout-patterns.md) - レイアウトパターン

## ライセンス

Private - All Rights Reserved
