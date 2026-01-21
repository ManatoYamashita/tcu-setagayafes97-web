# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

東京都市大学 第97回 世田谷祭 公式Webサイトの開発プロジェクト。Next.js 16.1 (App Router) + TypeScript + TailwindCSS + microCMS を使用した、学園祭の情報提供と企画検索を目的としたWebサイト。

- **開催日程**: 2026年10月31日（土）〜11月1日（日）
- **公開予定**: 2026年2月28日
- **ホスティング**: Vercel (Free Plan)
- **想定来場者数**: 約3,000名

## 技術スタック

| カテゴリ         | 技術                          |
| ---------------- | ----------------------------- |
| フレームワーク   | Next.js 16.1 (App Router)     |
| 言語             | TypeScript                    |
| スタイリング     | TailwindCSS                   |
| アニメーション   | GSAP                          |
| 3Dグラフィックス | Three.js / React Three Fiber  |
| CMS              | microCMS                      |
| 多言語対応       | next-intl または next-i18next |
| ホスティング     | Vercel (Free Plan)            |

## ドキュメント運用ルール（重要）

本プロジェクトでは `docs/` を唯一のソース・オブ・トゥルース（SoT）とする。

### 参照優先順位

1. `AGENTS.md` - エージェント運用ルール
2. 本ファイル（`.claude/CLAUDE.md`） - ドキュメント運用・命名規約
3. `docs/INDEX.md` - 最新の知見とドキュメント配置
4. `docs/requires/require.md` - プロジェクト要件定義書

### ドキュメント更新フロー（PDCA）

1. **PLAN**: `docs/INDEX.md` で既存配置と命名を確認
2. **DO**: 該当 `docs/` ファイルを更新 or 新規作成
3. **CHECK**: リンク切れ/重複/命名不整合がないか確認
4. **ACTION**: 運用改善点や不足ルールをドキュメント化

### 命名・配置ガイド

- ファイル名は `kebab-case.md`、目的が明確な名前
- 1ファイルが 300 行超 or 技術領域が分岐 → 分割/ディレクトリ化
- 機密情報（PII等）は `docs/` に保存しない
- ドキュメントコミットは `DOC:` プレフィックス

## 開発フロー

### セットアップ

```bash
# 依存パッケージインストール
pnpm install

# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# プロダクションサーバー起動
pnpm start

# Lintチェック
pnpm lint

# フォーマットチェック
pnpm format:check

# フォーマット自動修正
pnpm format
```

### ブランチ戦略

- **main ブランチへの直接 push は禁止**
- すべての作業は専用のフィーチャーブランチで実施
- GitHub Actions による自動 PR 作成を活用
- PR マージ後に main ブランチを更新

**ブランチ命名規則:**

```
feature/<feature-name>     # 新機能追加
bugfix/<bug-description>   # バグ修正
hotfix/<urgent-fix>        # 緊急修正
docs/<doc-update>          # ドキュメント更新のみ
refactor/<refactor-target> # リファクタリング
```

**例:**

- `feature/event-search-page`
- `feature/3d-campus-map`
- `bugfix/countdown-timer-fix`

### コミットメッセージ規約

**基本フォーマット:**

```
<PREFIX>: <commit message>
```

**PREFIX 一覧:**

| PREFIX     | 用途                   | 例                                                |
| ---------- | ---------------------- | ------------------------------------------------- |
| `FEATURE`  | 新機能追加             | `FEATURE: 企画検索ページを追加`                   |
| `FIX`      | バグ修正               | `FIX: カウントダウンタイマーの計算ロジックを修正` |
| `REFACTOR` | リファクタリング       | `REFACTOR: コンポーネントの最適化`                |
| `STYLE`    | スタイル変更（CSS/UI） | `STYLE: モバイル表示のレイアウト調整`             |
| `DOC`      | ドキュメント更新       | `DOC: 要件定義書を更新`                           |
| `TEST`     | テスト追加・修正       | `TEST: ユニットテストを追加`                      |
| `CHORE`    | ビルド・設定変更       | `CHORE: TailwindCSS設定を更新`                    |
| `PERF`     | パフォーマンス改善     | `PERF: 画像の遅延読み込みを実装`                  |
| `CI`       | CI/CD 設定変更         | `CI: GitHub Actions のワークフローを追加`         |

## アーキテクチャ・設計原則

### コンテンツ分離原則（重要）

**すべての画像パス、テキストコンテンツはUIコンポーネントと分離し、JSON/TSファイルで管理する。**

**ディレクトリ構成（予定）:**

```
/src
├── /app                  # Next.js App Router ページ
├── /components           # Reactコンポーネント
├── /data                 # 静的コンテンツ管理
│   ├── site.ts           # サイト基本情報（タイトル、開催日等）
│   ├── navigation.ts     # ナビゲーション構成
│   ├── buildings.ts      # 建物情報（3Dマップ用）
│   ├── facilities.ts     # 施設情報（トイレ、案内所等）
│   ├── access.ts         # アクセス情報
│   ├── guide.ts          # ご来場の方へ（注意事項等）
│   └── privacy.ts        # プライバシーポリシー
├── /lib                  # ユーティリティ・ヘルパー関数
│   └── microcms.ts       # microCMS クライアント
├── /messages             # 多言語翻訳ファイル
│   ├── ja.json
│   ├── en.json
│   ├── zh.json
│   └── ko.json
└── /assets
    ├── /images           # 静的画像
    └── /videos           # ロゴアニメーション等
```

### microCMS API 設計

**使用API（最大5API中3API使用）:**

1. **news** - お知らせ・ニュース（必須）
2. **events** - 企画情報（必須）
3. **informations** - 協賛企業等の汎用情報（必須）

**主要フィールド:**

- **News API**: `type` (urgent/news/other), `title`, `thumbnail`, `description`, `content`
- **Events API**: `date` (day1/day2/both/other), `type` (room/stage/special/other), `place`, `building`, `title`, `organizer`, `thumbnail`, `description`, `content`, `startTime`, `endTime`, `sns`
- **Informations API**: `category` (sponsor/faq/other), `title`, `sponsorName`, `sponsorDescription`, `logo`, `url`, `priority`

### パフォーマンス最適化

**Vercel Free Plan 制約を考慮:**

- Bandwidth: 100GB/月
- Serverless Function実行時間: 10秒
- ビルド時間: 45分

**最適化戦略:**

- ISR/SSGを積極的に活用
- サーバーレス関数の使用を最小化
- 画像は Next.js Image コンポーネントで最適化
- コード分割とダイナミックインポート

**Lighthouse 目標値:**

- Performance: 90以上
- First Contentful Paint: 1.5秒以下
- Time to Interactive: 3秒以下

### 多言語対応

**対応言語:**

- 日本語（ja）- デフォルト、全ページ対応
- English（en）- 固定ページのみ
- 中文簡体字（zh）- 固定ページのみ
- 한국어（ko）- 固定ページのみ

**実装方針:**

- 固定ページ: next-intl または next-i18next を使用し、翻訳ファイル（JSON）で管理
- CMSコンテンツ: 日本語のみ（将来的な多言語対応は検討）
- 言語切替UI: ヘッダーにドロップダウンまたはアイコンボタン

### 3Dマップ実装（予定）

**技術スタック:**

- Three.js / React Three Fiber
- 自作3Dモデル（Blender等で作成）
- 建物数: 約10棟（1号館〜10号館）

**インタラクション:**

1. 建物をクリック
2. その建物内の企画一覧をオーバーレイ/サイドパネルで表示
3. 企画クリックで詳細ページへ遷移

**フォールバック:**

- 実装難易度が高い場合は2Dマップをフォールバックとして用意

## ページ構成

```
/                           # トップページ (HOME)
├── /events                 # 企画を探す
│   ├── /                   # 企画検索・一覧
│   └── /[id]               # 企画詳細 [動的生成]
├── /timetable              # タイムテーブル
├── /map                    # マップ・アクセス
│   ├── /                   # 3Dキャンパスマップ
│   └── /access             # 交通アクセス
├── /info                   # インフォメーション
│   ├── /                   # お知らせ一覧
│   ├── /[id]               # お知らせ詳細 [動的生成]
│   ├── /guide              # ご来場の方へ
│   ├── /faq                # よくある質問
│   └── /pamphlet           # パンフレットDL
├── /about                  # 委員会・その他
│   ├── /                   # 委員長挨拶・理念
│   ├── /sponsors           # 協賛企業一覧
│   ├── /contact            # お問い合わせ
│   └── /privacy            # プライバシーポリシー
└── /[locale]               # 多言語ページ (en, zh, ko)
```

## 主要機能

### トップページ (HOME)

- **起動時アニメーション**: WebM動画（ロゴアニメーション）、初回訪問時のみ表示（sessionStorage管理）
- **カウントダウン**: 開催日までのカウントダウン（日:時:分:秒）、開催中は「開催中！」バナー、終了後はお礼メッセージ
- **主要セクション**: メインビジュアル、開催概要、News（最新3件）、おすすめ企画、協賛バナーエリア

### 企画検索・一覧 (/events)

- **フィルター**: 日程（Day1/Day2/両日）、場所（建物番号）、カテゴリ（教室/ステージ/スペシャル）、キーワード
- **表示形式**: カード形式、サムネイル・タイトル・カテゴリバッジ・場所・日程
- **ページネーション**: またはLazy Loading（無限スクロール）

### タイムテーブル (/timetable)

- **形式**: 縦型ガントチャート（縦軸: 時間、横軸: ステージ）
- **日程切替**: Day1 / Day2 タブ
- **ステージ切替**: ステージごとのタブ（7A, 7B, 体育館, ホール等）

### お問い合わせフォーム (/about/contact)

**フォーム種別:**

1. 一般・来場者向け
2. 取材・メディア向け
3. 落とし物のお問い合わせ

**送信方法:**

- メール送信（Nodemailer + Vercel Serverless Functions）
- またはフォームサービス（Formspree等）をバックアップとして検討

## SEO・アクセシビリティ

### SEO対策

- 各ページにメタタグ設定（title, description, OGP）
- 構造化データ（JSON-LD）でイベント情報をマークアップ
- sitemap.xml 自動生成
- robots.txt 設置

### アクセシビリティ

- WAI-ARIA対応
- キーボードナビゲーション対応
- カラーコントラスト比の確保（テーマカラー: #CD79EE）

### ブラウザ対応

- Chrome / Safari / Firefox / Edge（最新2バージョン）
- iOS Safari（iOS 15以上）
- Android Chrome（最新）

## デザイン仕様

- **テーマカラー**: `#CD79EE`（紫）
- **レスポンシブ対応**: モバイルファースト設計
- **参考サイト**: https://sumitomoexpo.com/

## 開発上の注意点

### 外部ライブラリ導入時

新しいライブラリを追加する場合は、以下の情報を提供し、承認を得ること:

- 導入目的
- 代替手段の検討結果
- プロジェクトへの影響範囲（バンドルサイズ、パフォーマンス等）

### コード品質

- TypeScript の型定義を適切に使用
- コンポーネントは再利用可能な形で設計
- ハードコードを避け、`/src/data` 配下のファイルで管理
- 適切なエラーハンドリング

### Vercel Free Plan 制約への配慮

- 不要なサーバーレス関数の使用を避ける
- ISR/SSGを積極的に活用
- 画像は最適化し、CDN配信を活用
- ビルド時間が45分を超えないように注意

## リスク・課題

| リスク               | 対策                                               |
| -------------------- | -------------------------------------------------- |
| 3Dマップの実装難易度 | 優先度を下げ、2Dマップをフォールバックとして用意   |
| コンテンツ入稿の遅延 | ダミーデータで開発を進行、入稿スケジュールを明確化 |
| Vercel Free Plan制約 | ISR/SSGを活用し、サーバーレス関数の使用を最小化    |

## 参考リンク

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [microCMS Documentation](https://document.microcms.io/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [GSAP Documentation](https://greensock.com/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)

---

**最終更新日**: 2026-01-18
