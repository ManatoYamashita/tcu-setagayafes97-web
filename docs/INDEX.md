# INDEX.mdドキュメント索引と運用ルール

## 運用原則

- `docs/` は知見とルールの唯一のソース・オブ・トゥルースです。
- `/docs/` 直下に置けるファイルは本索引 `docs/INDEX.md` のみ。他のドキュメントは必ずサブディレクトリに配置します。
- サブディレクトリは必要最小限に留め、命名は `kebab-case` に統一します。
- 追加・更新時は本索引を必ず更新し、重複やリンク切れ、プロジェクトの実情との生合成を定期的にチェックします。
- 機密情報（PII 等）は書き込み禁止。コミット時は `DOC:` プレフィックスを推奨します。

## ディレクトリ構成（最小セット）

```
docs/
├── INDEX.md          # 本索引ファイル
├── dev/              # 開発関連ドキュメント
│   ├── git.md        # ブランチ戦略とCI/CDワークフロー
│   ├── ci-env.md     # GitHub Actions 環境変数管理（Secrets/Variables）
│   └── microcms.md   # microCMS API 制約と実装パターン
├── frontend/         # フロントエンド関連ドキュメント
│   ├── design.md                  # デザインシステム（カラー・タイポグラフィトークン）
│   ├── agent-browser-workflow.md  # agent-browserを使用したデザイン再現とデバッグフロー
│   └── layout-patterns.md         # レイアウトパターンと設計原則
└── requires/         # 要件定義・仕様関連
    ├── require.md           # プロジェクト要件定義書
    ├── todo.md                    # プロジェクト開発タスクリスト
    ├── website-content.md         # クライアント提供のWebサイト掲載文（確定文面）
    ├── contract-individual-v97.md # 第97回業務委託 個別契約書ドラフト（乙側提示用）
    └── delivery-spec-v97.md       # 実行委員会提出用 開発仕様書（外部委託仕様書と同フォーマット）
```

## ドキュメント一覧

### プロジェクトルール

- **[.claude/CLAUDE.md](../.claude/CLAUDE.md)** - Claude Code 向けプロジェクトガイド（最優先参照）
  - プロジェクト概要と技術スタック
  - 開発フロー・コマンド
  - ブランチ戦略とコミット規約
  - アーキテクチャ・設計原則
  - microCMS API 設計
  - パフォーマンス最適化
  - ページ構成と主要機能
  - SEO・アクセシビリティ

- **[AGENTS.md](../AGENTS.md)** - エージェント運用ルール
  - 参照優先順位
  - ドキュメント運用フロー
  - 作業フロー（PDCA）
  - コミュニケーション指針

### 要件定義・仕様（requires/）

- **[require.md](./requires/require.md)** - 東京都市大学 第97回 世田谷祭 Webサイト要件定義書
  - プロジェクト概要・目的
  - 技術要件・スタック
  - microCMS API設計
  - サイト構成・機能要件
  - 多言語対応仕様
  - 静的コンテンツ管理
  - 年次更新対応（第98回以降の使い回し設計）
  - 非機能要件（パフォーマンス、SEO、アクセシビリティ）
  - 開発スケジュール
  - リスク・課題

- **[todo.md](./requires/todo.md)** - プロジェクト開発タスクリスト
  - Phase 1-4の全152タスク
  - セットアップから本番デプロイまでの詳細ステップ
  - 進捗状況の可視化
  - リスク管理とフォールバック戦略
  - チェックボックス形式でのタスク管理
  - 年次更新時の作業手順（第98回以降、推定6時間）

- **[website-content.md](./requires/website-content.md)** - クライアント提供のWebサイト掲載文
  - 第97回 キャンパステーマ『カラクリ』本文
  - 2026年度 学園祭共通テーマ『期待を超える瞬間へ、ともに進もう』本文
  - 公開時点で「準備中」表示とする項目の指示

- **[contract-individual-v97.md](./requires/contract-individual-v97.md)** - 第97回業務委託 個別契約書ドラフト（乙側提示用 v1）
  - 原契約書 `第97回世田谷祭ホームページ外部委託契約書.pdf` に対するレビュー指摘 9 項目を反映
  - 業務請負契約・第97回限定・自動更新なし・損害賠償上限あり
  - 検収条項（10営業日・みなし検収）／報酬支払条件（検収後30日以内一括）／実務者変更時の引渡物オプション
  - 末尾に「指摘9項目→反映条文」対応表、想定反論への応答案を付録

- **[delivery-spec-v97.md](./requires/delivery-spec-v97.md)** - 実行委員会提出用 開発仕様書
  - 参考文書「第97回世田谷祭公式HPの外部委託仕様書」と同フォーマット（宛先・発信者は開発担当→実行委員会に反転）
  - 業務目的・対象範囲・業務内容・成果物・実行委員会での可能な操作・改善目標を実プロジェクト仕様に基づき記載

### 開発関連（dev/）

- **[git.md](./dev/git.md)** - ブランチ運用戦略とGitHub ActionsによるCI/CDワークフローのテンプレート
  - ブランチ命名規則とライフサイクル
  - GitHub Actionsワークフローの設定例
  - コミットメッセージ規約
  - 運用フロー例とトラブルシューティング

- **[ci-env.md](./dev/ci-env.md)** - GitHub Actions 環境変数管理
  - Repository Secrets / Variables の使い分け基準
  - 本プロジェクトの登録一覧（MICROCMS*\*, NEXT_PUBLIC*\*）
  - 企画・お知らせの公開フラグと非公開時の表示範囲
  - ワークフローでの参照方法（`secrets.` vs `vars.`）
  - ローカル開発（.env.local）との対応表

- **[microcms.md](./dev/microcms.md)** - microCMS API 制約と実装パターン
  - limit 上限100件の制約と offset ページネーション実装
  - 適用済み関数（getEventsList）と未適用関数の一覧
  - 使用 API エンドポイント一覧

### フロントエンド関連（frontend/）

- **[design.md](./frontend/design.md)** - デザインシステム（カラー・タイポグラフィトークン）
  - ブランドカラー `#CD79EE` の HLC 定義（H319 / L64 / C70）と oklch CSS 実装
  - Primary スケール・Neutral スケール・Semantic カラートークン
  - アクセシビリティ（コントラスト比）ガイドライン
  - Kaisei Opti ブランドフォント仕様と使用制限
  - フォントスケール（モジュラースケール 1.25）
  - CSS 変数まとめ

- **[agent-browser-workflow.md](./frontend/agent-browser-workflow.md)** - agent-browserを使用したデザイン再現とデバッグの標準フロー
  - デザイン再現3ステップ（分析→実装→検証）
  - 数値測定手法とコマンド集（Header高さ、z-index階層、viewport占有率）
  - レスポンシブテスト標準手順（375px/768px/1920px）
  - デバッグワークフロー（Layout Shift検出、z-index競合確認）

- **[layout-patterns.md](./frontend/layout-patterns.md)** - レイアウトパターンと設計原則
  - Header/Hero統合パターン（calc()による実効100vh、CSS変数化）
  - z-index管理とレイヤー構造（標準スケール: 10/20/30/40/60）
  - absolute/fixed/sticky使い分けガイド
  - レスポンシブ高さ計算（100vh vs 100svh、モバイルSafari対策）

## 更新手順（PDCA）

1. PLAN: 既存の配置と命名を本索引で確認し、追加箇所を決める。
2. DO: 対応するサブディレクトリに Markdown を作成・更新し、本索引へ追記。
3. CHECK: リンク・命名・重複・文責の整合を確認。
4. ACTION: 改善点を洗い出し、必要ならルールやテンプレートを強化する。

---

**最終更新日**: 2026-07-22
