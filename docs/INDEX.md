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
│   ├── domain-migration.md # setagayafes.org を第97回の正規ドメインにする手順
│   ├── 96th-db-backup.md # 第96回 WordPress DBバックアップの検証情報と取扱い
│   ├── seo-metadata.md # 共通metadata・canonicalとテストページ除外
│   └── microcms.md   # microCMS API 制約と実装パターン
├── frontend/         # フロントエンド関連ドキュメント
│   ├── design.md                  # デザインシステム（カラー・タイポグラフィトークン）
│   ├── access-page-design.md      # Accessページの情報設計・UI実装方針
│   ├── agent-browser-workflow.md      # agent-browserを使用したデザイン再現とデバッグフロー
│   ├── browser-observation-limits.md  # ブラウザ観測の前提と限界（何が測れるか）
│   ├── browser-verification-pitfalls.md # 検証手順そのものが誤る実例
│   ├── layout-patterns.md         # レイアウトパターンと設計原則
│   ├── i18n-page-structure.md     # 多言語ページの構成パターン（next-intl）
│   ├── performance.md             # Lighthouse基準値とフロントエンド性能ルール
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
  - **`NEXT_PUBLIC_SPECIAL_VISIBLE` は `EVENTS_VISIBLE` と独立。** 4通りの組み合わせ表あり。著名人ページの先行公開には `getSpecialEvents()` を使う（`getEventsList()` は EVENTS_VISIBLE=false で常に空）
  - **`NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` は物販だけを独立制御。** `SPECIAL_VISIBLE=true` のまま、`/special/[id]` のプロフィール・チケット・注意事項を維持して物販欄だけを非表示にできる
  - **公開フラグの登録先は4箇所**（`.env.example` / GitHub Variables / Vercel / 本ドキュメント）。**未設定はエラーにならず黙って非公開になるため、登録漏れが「仕様どおりの準備中表示」と区別できない。** 突き合わせコマンドと `SPECIAL_VISIBLE` 登録漏れの実例あり
  - **`EVENTS_VISIBLE=false` + `SPECIAL_VISIBLE=true` では `/events/[id]` → `/special/[id]` の誘導が効かない。** `getEventById()` が先に `null` を返し、リダイレクト判定へ到達しない

- **[domain-migration.md](./dev/domain-migration.md)** - `setagayafes.org` を第97回の正規ドメインにする手順
  - 第96回（WordPress）は `96th.setagayafes.org` へ退避し、`/96th/*` は 301 で引き継ぐ
  - **rewrite プロキシは採らない。** trailing-slash リダイレクトが rewrite より先に走るため無限ループになり、`skipTrailingSlashRedirect` で止めると canonical 未実装の現状で重複URLを生む
  - 手順の順序（WordPress の `siteurl` 変更 → 301 の本番反映 → DNS 切替）と各段階の検証コマンド
  - Vercel が要求する DNS レコード（`A 76.76.21.21` / `CNAME cname.vercel-dns.com`）

- **[96th-db-backup.md](./dev/96th-db-backup.md)** - 第96回 WordPress DBバックアップの検証情報と安全な取扱い
  - 取得日・サイズ・SHA-256による原本照合
  - 機密な生ダンプをリポジトリ外で保管する理由と復元前チェック

- **[seo-metadata.md](./dev/seo-metadata.md)** - 共通metadata・canonicalとテストページ除外
  - ページごとのmetadata、canonical、Open Graph、Twitter Cardの生成方針
  - 多言語ページのcanonicalとhreflang相当のalternate設定
  - `/api-test` と `/test-ui` を本番404にする運用

- **[microcms.md](./dev/microcms.md)** - microCMS API 制約と実装パターン
  - limit 上限100件の制約と offset ページネーション実装
  - 適用済み関数（getEventsList）と未適用関数の一覧
  - 使用 API エンドポイント一覧
  - **select の選択肢を増やしたら正規化関数も直す。** ホワイトリスト方式のため、直さないと新しい値が黙って `other` に落ちる（エラーは出ない）
  - カスタムフィールドのネスト制約と作成順序（子から親へ）。API をまたいだ参照は不可
  - **管理画面はブラウザ自動操作で編集できない。** 種類選択が実マウスイベントに依存し、スクリプトでは別の行へ適用される
  - **下書きコンテンツで動作確認はできない。** `draftKey` は保存のたびに変わり失効する。表示確認はダミーを直接渡す一時ページで行う

### フロントエンド関連（frontend/）

- **[access-page-design.md](./frontend/access-page-design.md)** - Accessページの情報設計・UI実装方針
  - 会場所在地・推奨経路・注意事項の情報優先順位
  - 地図iframe、外部リンク、経路リストのアクセシビリティ要件
  - 初期表示・スクロール連動アニメーションとモーション軽減時の表示方針
  - 交通情報の管理場所と公式情報の参照基準

- **[design.md](./frontend/design.md)** - デザインシステム（カラー・タイポグラフィトークン）
  - ブランドカラー `#CD79EE` の HLC 定義（H319 / L64 / C70）と oklch CSS 実装
  - Primary スケール・Neutral スケール・Semantic カラートークン
  - アクセシビリティ（コントラスト比）ガイドライン
  - Kaisei Opti ブランドフォント仕様と使用制限
  - フォントスケール（モジュラースケール 1.25）
  - Aboutページ開催概要のシンプルな2列情報リスト
  - CSS 変数まとめ

- **[performance.md](./frontend/performance.md)** - Lighthouse基準値とフロントエンド性能ルール
  - トップページ desktop の基準値と LCP 内訳
  - LCP、動画、レスポンシブ画像、無限ロゴ列、Webフォントの実装ルール
  - `content-visibility` による初期描画遅延、フォントCSSの遅延配信、ScrollTriggerの遅延初期化
  - LogoLoop の強制リフロー回避
  - 静的検査、ローカル本番ビルド、ブラウザ、Lighthouse の検証手順

> [!NOTE]
> ブラウザ自動化の知見は3ファイルに分かれています。**手順は `agent-browser-workflow.md`、判断基準は `browser-observation-limits.md`、失敗例は `browser-verification-pitfalls.md`。**

- **[agent-browser-workflow.md](./frontend/agent-browser-workflow.md)** - agent-browserを使用したデザイン再現とデバッグの標準フロー
  - デザイン再現3ステップ（分析→実装→検証）
  - 数値測定手法とコマンド集（Header高さ、z-index階層、viewport占有率）
  - レスポンシブテスト標準手順（375px/768px/1920px）
  - デバッグワークフロー（Layout Shift検出、z-index競合確認）

- **[browser-observation-limits.md](./frontend/browser-observation-limits.md)** - ブラウザ観測の前提と限界（**測る前に読むこと**）
  - **観測の前提を測る** — 実行環境は一定でない。`framesIn1s` を測ってから検証可否を分岐する
  - 検証できるもの / できないものの切り分け表
  - **`hidden` なタブで rAF を await するとレンダラが凍結してタブが落ちる**（agent-browser / Claude in Chrome 共通。`visibilityState` を同期評価で先に読む）
  - **`ssr: false` の描画検証の症状はツールで異なる。** agent-browser は canvas がマウントせず、実 Chrome の `hidden` タブは**マウントするが `300×150` のまま未描画**（要素の存在だけで合格判定すると誤判定する）
  - **Claude in Chrome の `hidden` タブでは `vh` / `svh` / `dvh` が 0 になる。** レイアウトが潰れ「画像が表示されない」と誤診する
  - **BFCache の観測** — Vercel preview は `vercel.live` の iframe が阻害するため測れない。ローカル本番ビルドで、プローブ生存 / `pageshow.persisted` / DOM ノード同一性の3点で判定する
  - `navigation.type` は BFCache 復帰でも `"navigate"` のまま。`"back_forward"` はドキュメント再作成のサイン（逆に読むと判定が反転する）

- **[browser-verification-pitfalls.md](./frontend/browser-verification-pitfalls.md)** - 検証手順そのものが誤る実例
  - **Tailwind の任意値を `grep` するときは `-F`。** `[...]` が文字クラスになり、存在するのに0件と出る
  - **CSS のカスタムクラスが効かないときは `.next` を丸ごと削除する。** HMR でも `.next/cache` 削除でも復旧しないことがある
  - **`resize_window` は viewport を変えない。** レスポンシブ検証は agent-browser の `--viewport` かコンテナ幅を直接絞る方法で行う（メディアクエリの切り替わりは実機確認）
  - **外部SPAの管理画面は「操作」に使わない。** 観測用であり、設定投入の自動化は失敗が本番に残る（[dev/microcms.md](./dev/microcms.md) に実例）
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

**最終更新日**: 2026-08-17
