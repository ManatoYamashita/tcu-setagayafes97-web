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
│   ├── access-page-design.md      # Accessページの情報設計・UI実装方針
│   ├── agent-browser-workflow.md  # agent-browserを使用したデザイン再現とデバッグフロー
│   ├── layout-patterns.md         # レイアウトパターンと設計原則
│   ├── i18n-page-structure.md     # 多言語ページの構成パターン（next-intl）
│   └── page-transition.md         # ページ遷移アニメーションとView Transitions API
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
  - Phase 1-4 の全タスク（件数と進捗率は todo.md 冒頭の進捗状況が正。本索引では持たない）
  - セットアップから本番デプロイまでの詳細ステップ
  - 進捗状況の可視化
  - リスク管理とフォールバック戦略
  - チェックボックス形式でのタスク管理
  - 年次更新時の作業手順（第98回以降、推定6時間）

- **[website-content.md](./requires/website-content.md)** - クライアント提供のWebサイト掲載文
  - 第97回 キャンパステーマ『カラクリ』本文
  - 2026年度 学園祭共通テーマ『期待を超える瞬間へ、ともに進もう』本文
  - 第97回 実行委員長 髙野雄司 挨拶文
  - 仮画像 `pastel-castle.webp` から実画像 `setagayafe97-image.webp` への置換指示
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
  - **Vercel の本番反映は手動。** main へ merge しても Production は作られない（Preview のみ）。完了は Production デプロイの sha と main 先端の一致で判定する
  - **`vercel promote` は使わない。** 再ビルドしないため Preview 環境変数の成果物が本番に出る（`MICROCMS_SERVICE_DOMAIN` は環境別）。`vercel redeploy --target production` を使う
  - **`Aliased:` 表示は DNS を保証しない。** 公開ドメインは `curl -sI` の `server` / `location` ヘッダで実応答を確認する。`NEXT_PUBLIC_URL` のホストが名前解決できるかも確認する

- **[microcms.md](./dev/microcms.md)** - microCMS API 制約と実装パターン
  - limit 上限100件の制約と offset ページネーション実装
  - 適用済み関数（getEventsList）と未適用関数の一覧
  - 使用 API エンドポイント一覧

### フロントエンド関連（frontend/）

- **[access-page-design.md](./frontend/access-page-design.md)** - Accessページの情報設計・UI実装方針
  - 会場所在地・推奨経路・注意事項の情報優先順位
  - 地図iframe、外部リンク、経路リストのアクセシビリティ要件
  - 交通情報の管理場所と公式情報の参照基準

- **[design.md](./frontend/design.md)** - デザインシステム（カラー・タイポグラフィトークン）
  - ブランドカラー `#CD79EE` の HLC 定義（H319 / L64 / C70）と oklch CSS 実装
  - Primary スケール・Neutral スケール・Semantic カラートークン
  - アクセシビリティ（コントラスト比）ガイドライン
  - Kaisei Opti ブランドフォント仕様と使用制限
  - フォントスケール（モジュラースケール 1.25）
  - CSS 変数まとめ

- **[agent-browser-workflow.md](./frontend/agent-browser-workflow.md)** - agent-browserを使用したデザイン再現とデバッグの標準フロー
  - **観測の前提を測る（先に読むこと）** — 実行環境は一定でない。`framesIn1s` を測ってから検証可否を分岐する
  - デザイン再現3ステップ（分析→実装→検証）
  - 数値測定手法とコマンド集（Header高さ、z-index階層、viewport占有率）
  - レスポンシブテスト標準手順（375px/768px/1920px）
  - デバッグワークフロー（Layout Shift検出、z-index競合確認）
  - **BFCache の観測** — Vercel preview は `vercel.live` の iframe が阻害するため測れない。ローカル本番ビルドで、プローブ生存 / `pageshow.persisted` / DOM ノード同一性の3点で判定する
  - `navigation.type` は BFCache 復帰でも `"navigate"` のまま。`"back_forward"` はドキュメント再作成のサイン（逆に読むと判定が反転する）
  - **`hidden` なタブで rAF を await するとレンダラが凍結してタブが落ちる**（agent-browser / Claude in Chrome 共通。`visibilityState` を同期評価で先に読む）
  - **`ssr: false` の描画検証の症状はツールで異なる。** agent-browser は canvas がマウントせず、実 Chrome の `hidden` タブは**マウントするが `300×150` のまま未描画**（要素の存在だけで合格判定すると誤判定する）
  - 誤診の実例は [page-transition.md](./frontend/page-transition.md) も参照

- **[layout-patterns.md](./frontend/layout-patterns.md)** - レイアウトパターンと設計原則
  - Header/Hero統合パターン（calc()による実効100vh、CSS変数化）
  - z-index管理とレイヤー構造（標準スケール: 10/20/30/40/60）
  - absolute/fixed/sticky使い分けガイド
  - レスポンシブ高さ計算（100vh vs 100svh、モバイルSafari対策）
  - 部分幅ヒーロー画像の境界処理（mask-image とオーバーレイの分担）

- **[i18n-page-structure.md](./frontend/i18n-page-structure.md)** - 多言語ページの構成パターン
  - メッセージの二分割（ページ本文 `messages/` と ヘッダー・フッター `messages/chrome/`）
  - ページビューの置き場所（同名ルートの二重実装がデッドコード化する罠）
  - `pageHeroes` のロケール上書き（日本語ハードコードの共有データ）
  - リンクの扱い（Provider の内は `@/i18n/navigation`、外は `localizeNavHref()`）
  - 翻訳しないもの（コンテンツに対する照合ロジック）
  - 言語宣言（`lang` 属性の二段構え、`headers()` を使えない理由）
  - 多言語ページを追加する手順と `proxy.ts` 編集時の禁止事項

- **[page-transition.md](./frontend/page-transition.md)** - ページ遷移アニメーションと View Transitions API
  - `template.tsx` に `<ViewTransition>` を 1 箇所置けば全ページに効く（`page.tsx` 個別対応は不要）
  - View Transition が走るのは `<Link>` / `router.push()` のみ。戻る・進む（popstate）は React が仕様上必ずスキップする
  - 履歴遷移は `.page-enter-history` の CSS アニメーションで enter だけ再現。**popstate リスナはモジュール評価時登録が必須**（`useEffect` だと2回目以降動かない）
  - **`next` のアップグレード時は履歴遷移の再検証が必須。** 登録順は Next.js 内部の挙動依存で、崩れると無演出に戻るだけなので CI では検出できない（`next` は `16.1.0` 固定）
  - **リスナの多重登録を `window` フラグで抑止してはいけない。** ハンドラは冪等で重複は無害。抑止すると HMR 後に新インスタンスの `record` が孤立し、開発時だけ無演出になる（静的解析ツールが繰り返し指摘してくる）
  - **発火範囲はルート直下セグメントの stateKey 単位。** `/about` ↔ `/access` はリンクでも無演出（検証で踏むと誤判定する）
  - **BFCache 復帰は実機 Chrome で検証済み（2026-08-10）。** `pageshow.persisted: true` / 同一 DOM ノード / `.page-enter-history` なしを実測
  - **View Transition 中（合計 0.3 秒）はページ全体がクリックを受け付けない** — `pointer-events` では回避できない仕様
  - `::view-transition-*` は React の `<ViewTransition>` が無いと発火しない
  - CSS の落とし穴（root 停止時の `mix-blend-mode`、ワイルドカードセレクタ）
  - `@supports not (view-transition-name: a)` はモダンブラウザで逆効果になるアンチパターン
  - `experimental.viewTransition` は next@16.1.0 では読まれていない死に設定（警告も出ない）
  - **Issue #39 の誤診** — `<div hidden id="S:0">` は rAF 停止時の Suspense 差し込み待ち
  - 可視性の計測は要素単体ではなく祖先すべてを見る（`display: none` は子孫の computed 値を変えない）
  - 自動化環境での view transition は `visibilityState` で挙動が割れる（`hidden` のみスキップされ `ready` が reject）

## 更新手順（PDCA）

1. PLAN: 既存の配置と命名を本索引で確認し、追加箇所を決める。
2. DO: 対応するサブディレクトリに Markdown を作成・更新し、本索引へ追記。
3. CHECK: リンク・命名・重複・文責の整合を確認。
4. ACTION: 改善点を洗い出し、必要ならルールやテンプレートを強化する。

---

**最終更新日**: 2026-08-10
