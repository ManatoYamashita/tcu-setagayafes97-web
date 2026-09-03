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
│   ├── testing.md    # テスト方針（何をテストし、何をしないか）
│   ├── domain-migration.md # setagayafes.org を第97回の正規ドメインにする手順
│   ├── 96th-db-backup.md # 第96回 WordPress DBバックアップの検証情報と取扱い
│   ├── seo-metadata.md # 共通metadata・canonicalとテストページ除外
│   ├── microcms.md   # microCMS API 制約と実装パターン
│   └── content-revalidation.md # microCMS Webhook によるオンデマンド再検証と運用手順
├── frontend/         # フロントエンド関連ドキュメント
│   ├── design.md                  # デザインシステム（カラー・タイポグラフィトークン）
│   ├── access-page-design.md      # Accessページの情報設計・UI実装方針
│   ├── agent-browser-workflow.md      # agent-browserを使用したデザイン再現とデバッグフロー
│   ├── browser-observation-limits.md  # ブラウザ観測の前提と限界（何が測れるか）
│   ├── browser-verification-pitfalls.md # 検証手順そのものが誤る実例
│   ├── layout-patterns.md         # レイアウトパターンと設計原則
│   ├── timetable-gantt.md         # タイムテーブル盤面（ガントチャート）の設計
│   ├── layout-e2e.md              # レイアウトの実測アサーション（Playwright）
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
  - **CI のジョブを分ける基準は「`pnpm install` 以外に何を要求するか」。** install だけで済む検査（lint / format / 型 / テスト）は `Static Checks` に束ねる
  - ブランチ命名規則とライフサイクル
  - GitHub Actionsワークフローの設定例
  - コミットメッセージ規約
  - **`git add -A` / `git add .` は禁止。** 複数エージェントが同じ作業ツリーを触るため、別作業の未コミット変更を無差別に取り込む。巻き込み時の復旧手順あり
  - **マージ前は `merge-tree` で「消えるファイル」を確認する。** GitHub の `CLEAN` は競合が無いことしか意味せず、マージでファイルが消えないことは保証しない。worktree での実動確認手順あり
  - 運用フロー例とトラブルシューティング

- **[testing.md](./dev/testing.md)** - テスト方針（#157）
  - **算術で表せる不変条件はユニットテスト、盤面が 0px でないことなど DOM が要るものは実ブラウザ**という切り分け
  - **jsdom / happy-dom を入れてはいけない。** レイアウトエンジンが無く `getBoundingClientRect()` が常に 0 を返すため #148 を原理的に検出できない
  - `warnOnce` のモジュール状態は `vi.resetModules()` + 動的 import で捨てる。**動的 import で得た値は同一参照の検証に使えない**
  - `process.env.NODE_ENV` への直接代入は `readonly` 宣言により TS2540 になる。`vi.stubEnv()` を使う
  - **テストの価値は「落ちること」でしか測れない。** #157 の退行8種を実際に注入した結果を記録
  - テストは「いまのデータ」ではなく「不変条件」を固定する（第98回の年次更新で無関係な赤を出さないため）

- **[ci-env.md](./dev/ci-env.md)** - GitHub Actions 環境変数管理
  - Repository Secrets / Variables の使い分け基準
  - 本プロジェクトの登録一覧（MICROCMS*\*, NEXT_PUBLIC*\*）
  - 企画・お知らせの公開フラグと非公開時の表示範囲（著名人告知はトップ Hero 直下と /events 最下部の2箇所）
  - ワークフローでの参照方法（`secrets.` vs `vars.`）
  - ローカル開発（.env.local）との対応表
  - 本番反映の完了判定（sha 突き合わせ／公開ドメインをポーリングしない）
  - **Vercel の本番反映は挙動が変わった。** 2026-08-27 以降は main へのマージコミットが約1分で自動 Production 化される（それ以前は人手のみ）。**どちらの前提も思い込まず、毎回 Production デプロイの sha と main 先端の一致で判定する。** 一致していても意図した変更が出ているかは公開ドメインの実応答で確認する
  - **`vercel promote` は使わない。** 再ビルドしないため Preview 環境変数の成果物が本番に出る（`MICROCMS_SERVICE_DOMAIN` は環境別）。`vercel redeploy --target production` を使う
  - **`Aliased:` 表示は DNS を保証しない。** 公開ドメインは `curl -sI` の `server` / `location` ヘッダで実応答を確認する。`NEXT_PUBLIC_URL` のホストが名前解決できるかも確認する
  - **`NEXT_PUBLIC_SPECIAL_VISIBLE` は `EVENTS_VISIBLE` と独立。** 4通りの組み合わせ表あり。著名人ページの先行公開には `getSpecialEvents()` を使う（`getEventsList()` は EVENTS_VISIBLE=false で常に空）
  - **`NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` は物販だけを独立制御。** `SPECIAL_VISIBLE=true` のまま、`/special/[id]` のプロフィール・チケット・注意事項を維持して物販欄だけを非表示にできる
  - **公開フラグの登録先は4箇所**（`.env.example` / GitHub Variables / Vercel / 本ドキュメント）。**未設定はエラーにならず黙って非公開になるため、登録漏れが「仕様どおりの準備中表示」と区別できない。** 突き合わせコマンドと `SPECIAL_VISIBLE` 登録漏れの実例あり
  - **`EVENTS_VISIBLE=false` + `SPECIAL_VISIBLE=true` では `/events/[id]` → `/special/[id]` の誘導が効かない。** `getEventById()` が先に `null` を返し、リダイレクト判定へ到達しない

- **[domain-migration.md](./dev/domain-migration.md)** - `setagayafes.org` を第97回の正規ドメインにする手順
  - 第96回（WordPress）は `96th.setagayafes.org` へ退避し、`/96th/*` は 301 で引き継ぐ
  - 旧実行委員会トップ `/sfa` は現行の `/about` へ301で統合し、内容が一致しないサブページは404を維持する
  - **rewrite プロキシは採らない。** trailing-slash リダイレクトが rewrite より先に走るため無限ループになり、`skipTrailingSlashRedirect` で止めると canonical 未実装の現状で重複URLを生む
  - 手順の順序（WordPress の `siteurl` 変更 → 301 の本番反映 → DNS 切替）と各段階の検証コマンド
  - Vercel が要求する DNS レコード（`A 76.76.21.21` / `CNAME cname.vercel-dns.com`）

- **[96th-db-backup.md](./dev/96th-db-backup.md)** - 第96回 WordPress DBバックアップの検証情報と安全な取扱い
  - 取得日・サイズ・SHA-256による原本照合
  - 機密な生ダンプをリポジトリ外で保管する理由と復元前チェック

- **[seo-metadata.md](./dev/seo-metadata.md)** - 共通metadata・canonicalとテストページ除外
  - ページごとのmetadata、canonical、Open Graph、Twitter Cardの生成方針
  - 多言語ページのcanonicalとhreflang相当のalternate設定
  - 年次切替後のfavicon・サイト主体/開催イベント構造化データ・画像サイトマップとSearch Console再送信の運用
  - 第96回アーカイブをクロール可能なままnoindex化し、検索結果から恒久除外する運用
  - `/api-test` と `/test-ui` を本番404にする運用

- **[microcms.md](./dev/microcms.md)** - microCMS API 制約と実装パターン
  - limit 上限100件の制約と offset ページネーション実装
  - 適用済み関数（getEventsList）と未適用関数の一覧
  - 使用 API エンドポイント一覧
  - **select の選択肢を増やしたら正規化関数も直す。** ホワイトリスト方式のため、直さないと新しい値が黙って `other` に落ちる（エラーは出ない）
  - カスタムフィールドのネスト制約と作成順序（子から親へ）。API をまたいだ参照は不可
  - **管理画面はブラウザ自動操作で編集できない。** 種類選択が実マウスイベントに依存し、スクリプトでは別の行へ適用される
  - **下書きコンテンツで動作確認はできない。** `draftKey` は保存のたびに変わり失効する。表示確認はダミーを直接渡す一時ページで行う

- **[content-revalidation.md](./dev/content-revalidation.md)** - コンテンツ反映の仕組み（オンデマンド再検証）
  - microCMS Webhook（`POST /api/revalidate`）を主系、時間ベース ISR を保険とする二段構え
  - **`revalidatePath` はパスの API ではなくタグの API。** `/about` や `type` 無しの動的ルートは、エラーにならず静かに何もしない
  - microCMS 側の設定手順。**削除・公開終了の通知タイミングは既定 OFF** で、ONにしないと「消したのに残る」が直らない
  - **`pnpm dev` ではキャッシュ挙動を検証できない。** dev は全エントリを常に stale 扱いにする
  - **Vercel の成功値は `MISS` ではなく `REVALIDATED`。** 直後の `STALE` は CDN 伝播であって失敗ではない
  - **本番を汚さない導通確認**: `informations` に `category = other` のテスト項目を作れば、どのページにも sitemap にも出ないまま Webhook を試せる
  - **API キーでは削除できない**（`DELETE is forbidden.`）。削除タイミングの検証は管理画面が要る
  - シークレットは Vercel も microCMS も読み返せない。一致確認は「手元の値で署名を作って本番へ POST し 200 か」で行う
  - 障害切り分け表（Webhook 実行履歴 → Vercel ログ → `x-vercel-cache`）
  - microCMS を読むページを増やしたときの対応表更新手順

### フロントエンド関連（frontend/）

- **[access-page-design.md](./frontend/access-page-design.md)** - Accessページの情報設計・UI実装方針
  - 会場所在地・推奨経路・注意事項の情報優先順位
  - 地図iframe、外部リンク、経路リストのアクセシビリティ要件
  - 初期表示・スクロール連動アニメーションとモーション軽減時の表示方針
  - 交通情報の管理場所と公式情報の参照基準

> [!NOTE]
> リポジトリルートの `DESIGN.md` と `.claude/CLAUDE.md` にも UI 規約がある。
> `docs/` の外にあるため本索引の管理対象ではないが、次の2件は参照頻度が高い。
>
> - `DESIGN.md` §10 — GSAP の入場規約（`gsap.from()` / `{ start: "top 80%", once: true }`）、
>   Server Component へ演出だけ足すマーカー + `data-*` 方式（実装は
>   `src/lib/use-scroll-reveal.ts` の `useScrollReveal` に集約）、ScrollTrigger を
>   IntersectionObserver で遅延取得する際の `rootMargin` の向き
> - `.claude/CLAUDE.md` デザイン仕様 — トップの `.hero-about-bg` グラデーションの
>   停止位置を `%` へ戻してはいけない理由（実測値つき）
> - `DESIGN.md` §9 — `bg-white/10` と `border-gray-200/20` は淡紫背景専用で、
>   `PageSheetLayout` の白いシート上では消える（1.08:1）。白いシート上のカード枠と
>   ホバー時の `hover:border-l-*` 明示ルール

- **[design.md](./frontend/design.md)** - デザインシステム（カラー・タイポグラフィトークン）
  - ブランドカラーの HLC 定義（H319 / L64 / C70）と oklch CSS 実装。**配信されるのは
    `#bf73e3`** で、仕様 HEX `#CD79EE` はその由来（コントラスト検証は必ず実配信値で行う）
  - 一次定義は `globals.css` の `@theme` 1箇所。CSS が効かない3箇所（メールHTML・
    WebGL シェーダ・メタデータ）だけ実配信 HEX を直書きしており、手で追従させる必要がある
  - Primary スケール・Neutral スケール・Semantic カラートークン
  - アクセシビリティ（コントラスト比）ガイドライン
  - Kaisei Opti ブランドフォント仕様と使用制限
  - フォントスケール（モジュラースケール 1.25）
  - Aboutページ開催概要のシンプルな2列情報リスト（**この節の「角丸・影・横罫線を足さない」は
    開催概要リスト限定の規約であり、白いシート全体の規約ではない**）
  - CSS 変数まとめ
  - リッチテキスト（`prose`）の扱い — typography プラグイン未導入と `@layer` の選び方

- **[performance.md](./frontend/performance.md)** - Lighthouse基準値とフロントエンド性能ルール
  - 初期表示モーションの尺は `src/lib/motion.ts` に集約（2026-08-29）
  - トップページ desktop の基準値と LCP 内訳
  - LCP、動画、レスポンシブ画像、無限ロゴ列、Webフォントの実装ルール
  - `content-visibility` による初期描画遅延、フォントCSSの遅延配信、ScrollTriggerの遅延初期化
  - LogoLoop の強制リフロー回避
  - 未使用CSS/JS、render-blocking CSS、AVIF画像配信の残存候補と次回対応方針
  - 初期ビューポート外の演出チャンクとNext.js route prefetchの遅延方針
  - Tailwind のソース走査を `src/` へ限定（docs由来の未使用CSSは brotli 280 B で性能要因ではない）
  - CSSチャンク3本の役割（本体85 KBのみ初期ブロック、フォント187 KBとLogoLoopは遅延）
  - 文字数固定の見出しはサブセットを自前配信する（ヒーロー8文字 = 2,832バイト）
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
  - **`resize_window` は viewport を変えない。** レスポンシブ検証は `agent-browser set viewport <w> <h>` で行う（`open --viewport` は効かない実測あり。メディアクエリの切り替わりはコンテナ幅を絞る方法では再現できない）
  - **外部SPAの管理画面は「操作」に使わない。** 観測用であり、設定投入の自動化は失敗が本番に残る（[dev/microcms.md](./dev/microcms.md) に実例）
  - 誤診の実例は [page-transition.md](./frontend/page-transition.md) も参照

- **[layout-patterns.md](./frontend/layout-patterns.md)** - レイアウトパターンと設計原則
  - Header/Hero統合パターン（calc()による実効100vh、CSS変数化）
  - z-index管理とレイヤー構造（標準スケール: 10/20/30/40/60）
  - absolute/fixed/sticky使い分けガイド
  - レスポンシブ高さ計算（100vh vs 100svh、モバイルSafari対策）
  - `--header-height` は2状態ヘッダー（上部107px / スクロール後77px）の近似値である
  - **同じ寸法を CSS と JS が別々に持たない。** 片方だけ変えられる構造は必ず食い違う（#148 の親高さ / #154 のカード余白）
  - 全画面ヒーローの実装は3箇所で統一する（sticky ヘッダーがフロー上に高さを占有するため素の `100svh` は使わない）
  - 部分幅ヒーロー画像の境界処理（mask-image とオーバーレイの分担）

- **[timetable-gantt.md](./frontend/timetable-gantt.md)** - タイムテーブル盤面（ガントチャート）の設計
  - **縦方向の寸法は必ず px で持つ。** `height: %` は親の高さが確定しているときしか解決されず、`min-height` しか持たない親の下では 0px に潰れる（#148 の事故そのもの）
  - `overflow-x: auto` は `overflow-y` の使用値も `auto` にする。中の要素をページに対して `sticky top-0` にはできず、はみ出しは縦スクロールバーを生む
  - `sticky left-0` はスクローラの `padding-left` を無視する。余白は外側の要素が持つ
  - **絞り込みとグループ化は必ず同じ `resolveStageId()` を通す。** 片方だけ `extractStageId()`（null を返す）に戻すと「その他」タブが常に空になる
  - 時間レンジは企画から算出し、全ステージ列で共有する（ステージ絞り込み後から作るとタブ切替でスケールが動く）
  - **カードの密度判定は「枠」ではなく「カード実寸」（枠 − `CARD_GAP_PX`）で行う。** 枠のまま比べると収まらない密度が選ばれる
  - 選択中のステージは当日0件でもタブに残す（残さないとどのタブも `aria-pressed` にならず、絞り込みが画面から読めない）
  - 盤面と縦スタックの DOM 2枚持ちは、インラインスタイルにレスポンシブバリアントが無いことによる意図的な例外
  - **検証は2層。** 算術で表せる不変条件は `pnpm test` が固定し、盤面が実際に 0px でないことは実ブラウザでしか測れない（[dev/testing.md](./dev/testing.md)）

- **[layout-e2e.md](./frontend/layout-e2e.md)** - レイアウトの実測アサーション（Playwright / #157）
  - **jsdom も Vitest Browser Mode も #148 を検出できない。** 前者はレイアウトエンジンが無く、後者は祖先の連鎖が本物と別物になる
  - **`pnpm build && pnpm start` は原理的に使えない。** フィクスチャ分岐が `NODE_ENV !== "production"` に閉じており、本番ビルドではチャンクごと落ちる
  - **secrets を要求しない唯一のジョブ。** フィクスチャ経路は `getEventsList()` を呼ばないため fork PR でも走る
  - **測ろうとしている値そのものを待たない。** 盤面の高さを `waitForFunction` で待つと #148 は「検出できない」に化ける
  - **列の `height` を `minHeight` へ変えるだけでは落ちない。** #148 の再現には `h-full` の中間ラッパが要る（実測記録あり）
  - 1024px 未満は盤面が `display:none` になり全アサーションが偽陰性。共通フィクスチャが測定条件を先に検査する

- **[static-html-and-search-params.md](./frontend/static-html-and-search-params.md)** - `useSearchParams()` と静的HTML（#156）
  - **境界を書かないとエラーにならず、いちばん近い `loading.tsx` が代役になる。** `/events` を捕まえていたのはルートではなく `src/app/events/loading.tsx`
  - **境界を足すだけでは中身は静的HTMLに戻らない。** bailout は境界の内側を落とすものであり、戻すものではない
  - **fallback はサーバーで描かれてHTMLに出る。** そこへ既定状態の完成形を置くと企画カードのリンクが載る
  - **fallback の中で `useSearchParams()` を呼んではいけない**（それ以上落ちる先が無い）。下位からは props へ引き上げる
  - 判定は `data-page-hero="true"` の綴りで行う。`grep -c` と属性名だけの grep はどちらも誤読する（flight ペイロードに別綴りで入っている）
  - 実測: 静的HTMLの企画リンク 0 → 11本。転送量は brotli で +4.2KB。差し替えは約390ms、CLS 0

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

**最終更新日**: 2026-09-03
