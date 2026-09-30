# INDEX.mdドキュメント索引と運用ルール

## 運用原則

- `docs/` は知見とルールの唯一のソース・オブ・トゥルースです。
- `/docs/` 直下に置けるファイルは本索引 `docs/INDEX.md` のみ。他のドキュメントは必ずサブディレクトリに配置します。
- サブディレクトリは必要最小限に留め、命名は `kebab-case` に統一します。
- 追加・更新時は本索引を必ず更新し、重複やプロジェクトの実情との整合性を定期的にチェックします。
- **相対リンクの切れは `pnpm check:doc-links` が落とします**（`Static Checks` で自動実行）。
  追跡ファイルの `.md` に含まれる相対リンクを Git の追跡対象集合に対して解決するため、
  手元にファイルが在るかどうかは根拠になりません。
- **`#anchor` の存在と外部URLの到達性は検査の射程外です。** 見出しを改名したら、その見出しを
  指すリンクは自分で追ってください。命名と重複も引き続き人が見ます。検査が何を見て何を見ないかの
  一覧は `scripts/assert-doc-links.mjs` の冒頭にあります。
- 機密情報（PII 等）は書き込み禁止。コミット時は `DOC:` プレフィックスを推奨します。
- **`.gitignore` で除外したドキュメントは、本索引でリンクにしません。** 存在しないファイルへのリンクは
  リンク切れ検査に引っかかり、読んだ人に「消えた」と誤解させます。パス名をコード表記で書き、
  除外の理由と入手方法を添えてください。
- **ドキュメントを分割・圧縮したら、元ファイルの行が残っているかを `pnpm docs:split-check` で照合します。**
  分割は「移すだけ」のつもりでも行が落ちます（#311 では設計理由の1行を拾い漏らしていました）。
  列挙された行が**意図した削除と書き換えだけであること**を確かめ、PR の本文に理由付きで載せてください。
  使い方は `scripts/check-doc-split.mjs` の冒頭にあります。
- **文書の中の値や名前を直すときは、同じ値・名前をリポジトリの文書全体で検索し、全ての箇所を直します。**
  同じ事実は1つのファイルの中にも、ファイルをまたいでも何度も書かれています。1箇所だけ直すと残りが嘘になります
  （#354 では `DESIGN.md` のクイックリファレンスに `--font-noto-sans-jp` を残し、#366 で直しました。
  「本文の行間 1.75」は同じファイルの4箇所にありました）。

  ```bash
  git grep -n -e '1\.75' -e 'noto-sans-jp' -- docs DESIGN.md .claude AGENTS.md README.md
  ```

## ドキュメント一覧

各項目は「何が書いてあるか」の1行と、**読まずに作業すると事故になる要点を最大2行**だけ持つ。
詳細と実測は各ドキュメントが正であり、本索引へ転記しない（転記は古くなる。2026-09-30 に
ディレクトリ構成の図から3本が漏れていたのを見つけて図ごと削除した）。

### プロジェクトルール

- **[.claude/CLAUDE.md](../.claude/CLAUDE.md)** - Claude Code 向けプロジェクトガイド（最優先参照）。技術スタック・コマンド・ブランチとコミット規約・設計原則・microCMS API 設計・ページ構成
- **[AGENTS.md](../AGENTS.md)** - エージェント運用ルール。参照優先順位・ドキュメント運用・作業フロー（PDCA）

> [!NOTE]
> リポジトリルートの `DESIGN.md` にも UI 規約がある（`docs/` の外なので本索引の管理対象外）。
> 参照頻度が高いのは §10（GSAP の入場規約と `useScrollReveal`）と §9（淡紫背景専用の
> `bg-white/10` / `border-gray-200/20` は白いシート上で消える）。

### 要件定義・仕様（requires/）

- **[require.md](./requires/require.md)** - 第97回 Webサイト要件定義書。機能要件・microCMS API 設計・多言語・非機能要件・年次更新（第98回以降）の設計
- **[todo.md](./requires/todo.md)** - 開発タスクリスト（Phase 1-4）と年次更新時の作業手順。件数と進捗率は todo.md 冒頭が正
- **[website-content.md](./requires/website-content.md)** - クライアント提供の掲載文（テーマ『カラクリ』・共通テーマ・実行委員長挨拶）と「準備中」表示の指示
- **`docs/requires/contract-individual-v97.md`** - 第97回業務委託 個別契約書ドラフト
  - **このファイルはリポジトリに存在しない。** PII を含むため `.gitignore` で除外している。**リンクにしていないのは意図的**。参照が必要なら管理者へ
- **[delivery-spec-v97.md](./requires/delivery-spec-v97.md)** - 実行委員会提出用の開発仕様書（外部委託仕様書と同フォーマット）

### 開発関連（dev/）

- **[git.md](./dev/git.md)** - ブランチ運用・CI・コミット規約・Hotfix・トラブルシューティング
  - **命名規則から外れたブランチでは push 時の CI が走らない。** CI は PR を自動作成しない
  - **CI のジョブを分ける基準は「`pnpm install` 以外に何を要求するか」**
- **[staging-and-merge.md](./dev/staging-and-merge.md)** - ステージングの規約とマージ前チェックリスト（実在するファイルを使ったステージング例を含む）
  - **`git add -A` / `git add .` は禁止。** 複数エージェントが同じ作業ツリーを触るため、別作業を無差別に取り込む
  - **`CLEAN` はマージでファイルが消えないことを保証しない。** `merge-tree` で消えるファイルを見る
- **[testing.md](./dev/testing.md)** - テスト方針（何をユニットテストにし、何を実ブラウザに回すか。#157）
  - **jsdom / happy-dom を入れてはいけない。** `getBoundingClientRect()` が常に 0 で #148 を原理的に検出できない
  - **テストの価値は「落ちること」でしか測れない。** 退行を注入して赤になるのを確かめる
- **[ci-env.md](./dev/ci-env.md)** - GitHub Actions / Vercel の環境変数、シークレット登録順と本番反映の判定
  - **表示制御の環境変数は廃止済み。** 公開状態は microCMS で管理する
  - **`vercel promote` は使わない。** Preview の環境変数の成果物が本番に出る
- **[domain-migration.md](./dev/domain-migration.md)** - `setagayafes.org` を第97回の正規ドメインにした手順と転送一覧
  - **rewrite プロキシは採らない。** trailing-slash リダイレクトと衝突して無限ループになる
- **[96th-db-backup.md](./dev/96th-db-backup.md)** - 第96回 WordPress DB バックアップの照合情報と安全な取扱い
- **[seo-metadata.md](./dev/seo-metadata.md)** - metadata・canonical・OGP・構造化データ・sitemap の方針
  - **JSON-LD は必ず `serializeJsonLd()` を通す。** CMS 文字列の `</script>` で script 要素が閉じる
  - **sitemap の `lastModified` に `new Date()` を使わない。** 全件同一値だと Google は lastmod を無視する
- **[legacy-site-deindex.md](./dev/legacy-site-deindex.md)** - 過去回サイト群を検索結果から恒久除外する運用（さくら + Search Console）
  - **`robots.txt` でブロックしてはいけない。** `noindex` が読まれず URL だけが恒久的に残る。`todorokifes` は対象外
  - **削除リクエストの失効は 2027-03-05 前後。** その1ヶ月前に `noindex` の生存を再確認する
- **[microcms.md](./dev/microcms.md)** - microCMS API の制約と実装パターン（limit・select・カスタムフィールド・画像）
  - **select の選択肢を増やしたら正規化関数も直す。** 直さないと新しい値が黙って `other` に落ちる
  - **スキーマ操作は記事本文の編集と異なる。** 作成・変更は実マウスイベントで操作を確認する
- **[microcms-rich-tables.md](./dev/microcms-rich-tables.md)** - リッチテキストの表の入稿・表示と Aside での記事編集（#300）
  - **表は HTML のまま描画し、外枠とセル罫線を指定する。** 画像への置き換えは不要
- **[microcms-fetch-failures.md](./dev/microcms-fetch-failures.md)** - 取得に失敗したときの扱いと本番での確認（#287）
  - **`null` / `[]` に潰してよいのは 400 / 404 だけ。** 429 / 5xx を潰すと実在ページが 404 で生成されてもビルドが通る
  - **SDK の `retry: true` は Next.js の中で効かない。** 再試行は `microcmsGet()` が持つ
- **[event-sessions.md](./dev/event-sessions.md)** - 企画の開催枠（`sessions`、2部制）の入稿と正規化の契約（#281 / #305）
  - **`sessions` は任意のまま運用する。** 必須にすると既存の企画が保存できない
  - **時刻欄は `HH:mm` だけ。** 開場時刻などを書き添えると、タイムテーブルと構造化データから黙って消える。開場時刻の置き場は `special.openTime`
- **[draft-preview.md](./dev/draft-preview.md)** - microCMS の画面プレビューで下書きを本番と同じ詳細ページに出す仕組み
  - **`draftKey` を `searchParams` で受け取らない。`cookies()` を無条件に呼ばない。** どちらもルートが動的化して ISR が失われる
- **[content-revalidation.md](./dev/content-revalidation.md)** - Webhook によるオンデマンド再検証の仕組みと microCMS 側の設定。共通 Footer の協賛バナーは `sponsors` タグで全ルートへ反映
  - **`revalidatePath` はパスではなくタグの API。** 書き方を誤るとエラーにならず何もしない
  - **削除・公開終了の通知タイミングは既定 OFF。** ON にしないと「消したのに残る」
- **[content-revalidation-ops.md](./dev/content-revalidation-ops.md)** - 再検証の検証手順と障害切り分け
  - **合格判定は `age` であってラベルではない。** 発火から15秒待って1回だけ叩く（連続ポーリング禁止）

### フロントエンド関連（frontend/）

- **[design.md](./frontend/design.md)** - デザインシステム（カラートークン、コントラスト、CSS 変数）
  - **配信される紫は `#bf73e3`**（仕様 HEX `#CD79EE` ではない）。コントラストは実配信値で測る
  - **Tailwind 既定パレットを直接使わない。** `@theme` に無い色名はエラーも警告も出ずに既定値へ落ちる
- **[typography.md](./frontend/typography.md)** - Kaisei Opti の読み込みと使い分け、文字サイズと行送り（Tailwind の既定値）
  - **Kaisei Opti は要素で決まる（`h1`〜`h3` はサイズを問わず）。** sans にしたい見出しは `font-sans` を明示する（2026-09-30 に規約を実装へ揃えた）
- **[access-page-design.md](./frontend/access-page-design.md)** - Access ページの情報設計・地図・経路・フォーカス表示・モーション方針
- **[special-ticket-cta.md](./frontend/special-ticket-cta.md)** - 著名人企画 LP のモバイルチケット導線（固定 CTA・退避条件・320px の検証契約）
- **[image-delivery.md](./frontend/image-delivery.md)** - 画像配信の経路（microCMS は imgix、`public/` は事前 AVIF）
  - **Vercel の変換枠は総量で枯れる。** 消費が少なくても、枯れた枠の上では 402 になる
  - **`curl` で検証するときは `Accept` を付ける。** 付けないとキャッシュ済みでも 402 に見える
- **[performance.md](./frontend/performance.md)** - Lighthouse 基準値とフロントエンド性能ルール（LCP・フォント・CSS チャンク・検証手順）
- **[browser-observation-limits.md](./frontend/browser-observation-limits.md)** - ブラウザ観測の前提と限界（**測る前に読むこと**）
  - **`hidden` なタブでは rAF・`vh`・canvas が止まる。** `visibilityState` を先に読む
- **[browser-verification-pitfalls.md](./frontend/browser-verification-pitfalls.md)** - 検証手順そのものが誤る実例
  - **ハイドレーション完了前に読むと結論が反転する。** `resize_window` は viewport を変えない
- **[agent-browser-workflow.md](./frontend/agent-browser-workflow.md)** - agent-browser によるデザイン再現とデバッグの標準フロー
- **[layout-patterns.md](./frontend/layout-patterns.md)** - Header / Hero の寸法、z-index のレイヤー、position、寸法を1か所で持つ原則
  - **Hero の高さは「viewport − Header の実高」ではない。** `--header-height`（88px）は2状態ヘッダー（107 / 77px）の近似値
  - **z-index が効くのは同じ積み重ね文脈の中だけ。** Header 内のドロップダウンの z-60 は、ページ全体では Header と同じ 40
- **[layout-responsive.md](./frontend/layout-responsive.md)** - タブレット帯（640〜1023px）の取りこぼし、DOM 2枚持ち、部分幅ヒーロー画像の境界処理
  - **`lg:` の1段階だけで切り替えると 640〜1023px が全てモバイル扱いになる**
- **[layout-width-and-alignment.md](./frontend/layout-width-and-alignment.md)** - 幅の梯子、左端の揃え方、負のマージン、Tailwind v4 の出力順
  - **1ページに `max-w-*` を何種類も同居させない。** ハウス標準は `PageSheetLayout` の1本
  - **確認は `max-w-*` が効かない幅（1344px 未満）を含める。** 広い画面ではずれが消えて見える
- **[landmarks-and-skip-link.md](./frontend/landmarks-and-skip-link.md)** - `<main id="content">` とスキップリンクの契約（#177 A）
- **[timetable-gantt.md](./frontend/timetable-gantt.md)** - タイムテーブル盤面（ガントチャート）とモバイル縦スタックの設計
- **[timetable-event-panel.md](./frontend/timetable-event-panel.md)** - タイムテーブルの企画詳細パネル（右パネル／ボトムシート、`?event=` による状態、前後移動）の設計
  - **縦方向の寸法は必ず px で持つ。** `height: %` は `min-height` しか持たない親の下で 0px に潰れる（#148）
  - **絞り込みとグループ化は必ず同じ `resolveStageId()` を通す**
- **[events-search.md](./frontend/events-search.md)** - `/events` の検索と絞り込み（正規化・建物導出・3段カスケード）
  - **正規化は `normalizeText()` の1本に集約する。** 別々に正規化すると「検索では出るのにフィルタでは落ちる」
- **[events-semantic-search.md](./frontend/events-semantic-search.md)** - `/events` の意味検索（第4段・TypeSafe Jev。#253）
  - **足切りは `has_match`。`confidence` を使ってはいけない**
  - **来場者の検索語は米国の TypeSafe へ送られる。** 費用の歯止めはプリペイド $5（カード登録で外れる）
- **[events-infinite-scroll.md](./frontend/events-infinite-scroll.md)** - `/events` の無限スクロールと絞り込みの追従（#239）
  - **`<aside>` の `self-start` を外すと sticky が一度も貼り付かない。** lint / 型 / テスト / build はすべて通る
- **[static-html-and-search-params.md](./frontend/static-html-and-search-params.md)** - `useSearchParams()` と静的 HTML（#156）
  - **境界を書かないとエラーにならず、いちばん近い `loading.tsx` が代役になって本体が静的 HTML から消える**
- **[contact-form.md](./frontend/contact-form.md)** - お問い合わせフォームの送信可否と防御（#260 / #261）
  - **設定が欠けていたら成功を返さない。** 2026-09-21 まで本番は1通も送らず「送信完了」と表示していた
- **[layout-e2e.md](./frontend/layout-e2e.md)** - 実ブラウザの再発防止装置（Playwright。盤面 / ランドマーク / 404）
- **[layout-e2e-waiting.md](./frontend/layout-e2e-waiting.md)** - E2E の待ち方（不確定要素ごとの決定的な待ち方）
  - **測ろうとしている値そのものを待たない。** 待つと #148 は「検出できない」に化ける
  - **dev では Suspense の中身がまず `div[hidden][id^="S:"]` に届く。** `toBeAttached()` は通るが幾何は 0（#309）
- **[i18n-page-structure.md](./frontend/i18n-page-structure.md)** - 多言語ページの構成パターン（next-intl・メッセージ分割・リンク・`lang`）
- **[page-transition.md](./frontend/page-transition.md)** - ページ遷移アニメーションと View Transitions API
  - **popstate リスナはモジュール評価時に登録する**（`useEffect` だと2回目以降動かない）。`next` を上げたら履歴遷移を再検証する

## 更新手順（PDCA）

1. PLAN: 既存の配置と命名を本索引で確認し、追加箇所を決める。
2. DO: 対応するサブディレクトリに Markdown を作成・更新し、本索引へ1行（＋要点最大2行）を追記。
3. CHECK: `pnpm check:doc-links` で相対リンクの切れを落とし、`#anchor`・命名・重複・文責の整合を目で確認。
4. ACTION: 改善点を洗い出し、必要ならルールやテンプレートを強化する。

---

**最終更新日**: 2026-09-30（各項目を要点最大2行へ圧縮し、ディレクトリ構成の図を削除）
