# Branch Strategy & CI/CD Workflow

ブランチ運用戦略とGitHub Actionsによる自動化ワークフローのテンプレートです。プロジェクトに適用する際は、実際のプロジェクト構成に合わせてカスタマイズしてください。

## ブランチ戦略

### 基本方針

- **main ブランチへの直接 push は禁止**
- すべての作業は専用のフィーチャーブランチで実施
- GitHub Actions による自動 PR 作成を活用
- PR マージ後に main ブランチを更新

### ブランチ命名規則

#### Feature ブランチ

```
feature/<feature-name>
```

**例:**

- `feature/user-authentication` - ユーザー認証機能追加
- `feature/api-integration` - API統合機能追加
- `feature/ui-improvements` - UI改善

**命名ルール:**

- すべて小文字
- 複数単語はハイフン区切り（kebab-case）
- 簡潔で目的が明確な名前
- 英語推奨（日本語ローマ字可）

#### その他のブランチ（必要に応じて）

```
bugfix/<bug-description>    # バグ修正
hotfix/<urgent-fix>          # 緊急修正
docs/<doc-update>            # ドキュメント更新のみ
refactor/<refactor-target>   # リファクタリング
```

### ブランチのライフサイクル

1. **作成**: main から最新の状態で派生

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature
   ```

2. **作業**: コミットを積み重ねる

   ```bash
   git status --short              # 意図しないファイルが無いか確認
   git add <パスを明示>            # git add . / git add -A は禁止（後述）
   git commit -m "PREFIX: Commit message"
   git push origin feature/your-feature
   ```

3. **PR 作成**: GitHub Actions が自動実行（後述）

4. **レビュー & マージ**: PR を確認後、main へマージ

5. **削除**: マージ後は不要なブランチを削除
   ```bash
   git branch -d feature/your-feature
   git push origin --delete feature/your-feature
   ```

## GitHub Actions ワークフロー

### Feature Branch CI/CD

GitHub Actionsを使用した自動化ワークフローのテンプレートです。プロジェクトの構成に合わせてカスタマイズしてください。

**ファイル:** `.github/workflows/feature-ci.yml`（プロジェクトに応じて作成）

**トリガー条件例:**

```yaml
on:
  push:
    branches:
      - "feature/**"
```

**ワークフロー概要:**

#### 1. Quality Check Job

feature ブランチへの push 時に自動実行される品質チェック：

プロジェクトの構成に応じて、以下のようなチェックを実装します：

- **Lint チェック**
  - コード品質の検証
  - プロジェクトで使用しているLinterに応じて設定

- **フォーマットチェック**
  - コードフォーマット規約準拠確認
  - インデント、改行、引用符などの統一性検証

- **型チェック**
  - 型定義の整合性検証
  - ビルドと重複しても、secrets を要求せず短時間で落ちる検査として価値がある

- **ビルドチェック**
  - ビルド成功確認
  - ビルドサイズ計測（必要に応じて）

**実装例（Node.jsプロジェクトの場合）:**

```yaml
- name: Run lint check
  run: npm run lint:check

- name: Run format check
  run: npm run format:check

- name: Run type check
  run: npm run type-check

- name: Run build
  run: npm run build
```

> [!NOTE]
> **本リポジトリの実装は上記テンプレートとは異なる。** `feature-ci.yml` は
> `Static Checks`（lint / format / 型 / ユニットテスト / ドキュメントの相対リンク）、
> `Layout E2E`（実ブラウザ）、
> `Build Check` の3ジョブで、PR の自動作成は行わない。
> ジョブを分ける基準は「`pnpm install` 以外に何を要求するか」である。
> install だけで済む検査は `Static Checks` に束ね、secrets やビルド成果物、
> ブラウザを要求する検査は別ジョブにする。

#### 2. Create Pull Request Job

品質チェック成功時に自動実行される PR 作成：

**実行条件:**

```yaml
needs: quality-check
if: success()
```

**PR 作成内容:**

- **タイトル:** `🚀 [<feature-name>] Auto-generated PR`
- **本文:**
  - 品質チェック結果サマリー
  - 最近のコミットリスト（最大10件）
  - CI/CD 実行情報
- **ベースブランチ:** main
- **ヘッドブランチ:** feature/<feature-name>

**重複 PR 防止:**

- 既存 PR の存在確認
- 同一ブランチの PR が存在する場合はスキップ

### 必要な Repository 設定

GitHub Actions が PR を作成するには、以下の設定が必要：

1. リポジトリ設定ページへアクセス:

   ```
   https://github.com/<owner>/<repo>/settings/actions
   ```

2. 「Workflow permissions」セクションで以下を有効化:
   - [x] **Allow GitHub Actions to create and approve pull requests**

3. Permissions 設定:
   ```yaml
   permissions:
     contents: write
     pull-requests: write
   ```

### ワークフロー実行環境

プロジェクトの構成に応じて、適切な実行環境を設定してください：

- **OS:** ubuntu-latest（推奨）
- **ランタイム:** プロジェクトに応じて設定（Node.js、Python、Goなど）
- **パッケージマネージャー:** プロジェクトに応じて設定（npm、yarn、pipなど）
- **キャッシュ戦略:** 使用するパッケージマネージャーに応じて設定

## Commit Message 規約

### 基本フォーマット

```
<PREFIX>: <commit message>
```

**重要:** PREFIX の後には必ずコロンとスペースを入れる

### PREFIX 一覧

| PREFIX     | 用途                   | 例                                        |
| ---------- | ---------------------- | ----------------------------------------- |
| `FEATURE`  | 新機能追加             | `FEATURE: ユーザー認証機能を追加`         |
| `FIX`      | バグ修正               | `FIX: 画像の読み込みエラーを修正`         |
| `REFACTOR` | リファクタリング       | `REFACTOR: コンポーネントの最適化`        |
| `STYLE`    | スタイル変更（CSS/UI） | `STYLE: モバイル表示のメニュー位置を調整` |
| `DOC`      | ドキュメント更新       | `DOC: README にセットアップ手順を追記`    |
| `TEST`     | テスト追加・修正       | `TEST: ユニットテストを追加`              |
| `CHORE`    | ビルド・設定変更       | `CHORE: ビルド設定を更新`                 |
| `PERF`     | パフォーマンス改善     | `PERF: 画像の遅延読み込みを実装`          |
| `CI`       | CI/CD 設定変更         | `CI: GitHub Actions のワークフローを追加` |

### 英語コミットメッセージ（推奨）

プロジェクトの国際性を考慮し、英語でのコミットメッセージも推奨：

```
FEATURE: Add user authentication
FIX: Resolve image loading error
STYLE: Adjust mobile menu positioning
DOC: Update README with setup instructions
```

### コミットメッセージのベストプラクティス

1. **簡潔で明確に**: 50文字以内が理想
2. **動詞から始める**: 「追加」「修正」「更新」など
3. **現在形を使用**: 「追加した」ではなく「追加」
4. **具体的に**: 「バグ修正」ではなく「ロゴ読み込みエラーを修正」
5. **1コミット1機能**: 複数の変更は分割する

**良い例:**

```
FEATURE: ユーザー認証機能を追加
DOC: README にセットアップ手順を追記
STYLE: デスクトップナビゲーションのレイアウトを調整
```

**悪い例:**

```
update  # PREFIX なし、内容不明
FIX:バグ修正  # スペースなし、具体性なし
いろいろ変更  # PREFIX なし、曖昧
```

### マルチライン コミットメッセージ

複雑な変更の場合、本文を追加可能：

```bash
git commit -m "FEATURE: 新機能を追加" -m "
- ユーザー認証機能の実装
- API統合の追加
- UIコンポーネントの更新
"
```

## ステージングの規約

### `git add -A` / `git add .` は使わない

> [!CAUTION]
> **必ずパスを明示してステージングしてください。** ワイルドカードのステージングは、作業ツリーに残っている**別作業の未コミット変更や生成物を無差別に取り込みます。**

```bash
# NG
git add -A
git add .

# OK
git status --short                     # まず全体を見る
git add src/app/globals.css src/components/home/SponsorBanner.tsx
git diff --cached --name-only          # ステージした内容を確認してからコミット
```

**Why:** 2026-08-29、UIフィードバック対応の PR で `git add -A` を使ったところ、次の3つを巻き込んだ。

| 巻き込んだもの                                          | 実害                                         |
| ------------------------------------------------------- | -------------------------------------------- |
| `home-dev.html`（dev サーバのHTMLダンプ 100KB）         | Prettier の `format:check` が落ち、CI が失敗 |
| Kaisei Opti サブセットの自前配信（`@font-face`＋woff2） | 未レビューの別作業が PR に混入               |
| `--font-serif` 等の `var()` フォールバック追加          | 同上（2回目は検知して回避）                  |

**このリポジトリでは複数のエージェント・セッションが同じ作業ツリーを触ることがある。** 自分が編集していないファイルが `git status` に現れるのは異常ではなく通常であり、**ワイルドカードのステージングはそれを黙って取り込む。**

### コミット前のチェックリスト

1. `git status --short` — 身に覚えのないファイルが無いか
2. `git diff --cached --stat` — ステージした差分が意図どおりか
3. `git diff origin/main...HEAD --stat` — PR 全体のスコープが説明と一致しているか

3 は特に重要で、**PR の説明と実体が食い違っていないか**を最後に必ず見る。

### 巻き込んでしまった場合の復旧

**他人の作業を消してはいけない。** まず別ブランチへ退避して git 履歴に残し、そのうえで自分の PR から取り除く。

```bash
# 1. 現在の HEAD から退避ブランチを作り、未コミット分も含めて保全
git switch -c feature/<退避先>
git add <該当パス> && git commit -m "..."
git push -u origin feature/<退避先>

# 2. 元のブランチへ戻り、対象ファイルを main の状態に戻してから自分の変更だけ再適用
git switch <元のブランチ>
git rm --cached <巻き込んだ資産>
git checkout origin/main -- <巻き込まれたファイル>
# → エディタで自分の変更だけを入れ直す
```

## マージ前の検証

### diff ではなく「実マージ結果」を見る

> [!CAUTION]
> **GitHub の `mergeStateStatus=CLEAN` は「競合が無い」ことしか意味しません。マージによってファイルが消えないことは保証しません。**

`git diff` は two-dot でも three-dot でもこれを検知できません。**実際にマージした結果のツリーを作って確認します。**

```bash
git fetch origin

# 結果ツリーを作る（作業ツリーは変更されない）
git merge-tree --write-tree origin/main origin/<ブランチ> > /tmp/mt.txt \
  && echo "クリーンにマージ可能" || { echo "競合あり"; head /tmp/mt.txt; }

TREE=$(head -1 /tmp/mt.txt)

# 消えるファイルが無いか（ここが本題）
git diff --diff-filter=D --name-only origin/main "$TREE"

# 変わるファイル全体
git diff --stat origin/main "$TREE"
```

**Why:** 2026-08-29、退避ブランチ（PR #116）は GitHub 上で `CLEAN` だったが、実際にマージすると
`public/fonts/kaisei-opti-hero-700.woff2` と `@font-face` 宣言の**両方が無言で消えた。**
残るのは存在しないフォントを参照する `.font-hero-display` だけで、エラーも警告も出ず静かに
フォールバックする状態になっていた。

原因は git の3-wayマージの正常な挙動である。**マージベースに存在し、片方で削除され、
もう片方で未変更なら、削除が採用される。** この PR ではマージベースにファイルがあり、
`main` 側で削除されていた（別 PR のスコープ整理）ため、こうなった。

### アセットを含む PR は worktree で実際に動かす

結果ツリーの検査で足りない場合（本当に動くかを見たい場合）は、**worktree を切る。**
本体の作業ツリーを汚さず、他のセッションの未コミット作業とも衝突しない。

```bash
W=/tmp/wt-review
git worktree add "$W" <ブランチ>
cd "$W" && git merge origin/main        # ここで削除・競合が可視化される
pnpm install --frozen-lockfile --prefer-offline
PORT=3456 pnpm dev                       # 使用中のポートを避ける
# 確認後
git worktree remove --force "$W"
```

> [!WARNING]
> **`node_modules` をシンボリックリンクで済ませない。** Turbopack が
> `Symlink node_modules is invalid, it points out of the filesystem root` で panic する。
> worktree 内で `pnpm install` すること（pnpm のストアが効くので数秒で終わる）。

### 検証で分かることと分からないこと

**アニメーションに依存する描画は自動操作では判定できない。** オープナー演出は自動操作下で
t=0 のまま固まり、ヒーロー SVG が 0×0 のまま発火しないことがある。
`document.fonts.load()` のような**明示的な API で「素材が正しいこと」までは確認できる**が、
「実際に描画されるか」は実ブラウザでの目視が要る。詳細は
[browser-verification-pitfalls.md](../frontend/browser-verification-pitfalls.md)。

### マージ前チェックリスト

1. `git merge-tree --write-tree` の結果ツリーで `--diff-filter=D` を確認 — **消えるファイルは無いか**
2. `git diff --stat origin/main "$TREE"` — 変更範囲が PR の説明と一致しているか
3. **その作業が既に `main` へ別経路で入っていないか** — 入っていればマージは巻き戻しになる

3 も実際に起きた。PR #116 の内容は別コミット（`bf56d1a`）で `main` へ入っており、
しかも `main` 側の実装のほうが後発で改善を含んでいた。**マージしていれば改善を打ち消していた。**

## 運用フロー例

### 典型的な開発フロー

1. **新機能開発の開始**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/new-animation
   ```

2. **実装とコミット**

   ```bash
   # ファイル編集...
   git status --short                    # 意図しないファイルが無いか確認
   git add src/components/Foo.tsx        # パスを明示（git add . は禁止）
   git commit -m "FEATURE: 新機能を追加"
   git push origin feature/new-feature
   ```

3. **GitHub Actions 自動実行**（設定済みの場合）
   - 品質チェック実行（Lint、Format、Buildなど）
   - 成功時に自動 PR 作成

4. **PR レビュー & マージ**
   - GitHub UI で PR を確認
   - 必要に応じてコードレビュー
   - Merge pull request ボタンをクリック

5. **ローカル更新**
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/new-feature
   ```

### 緊急修正（Hotfix）フロー

本番環境の緊急バグ修正時：

1. **Hotfix ブランチ作成**

   ```bash
   git checkout main
   git pull origin main
   git checkout -b hotfix/critical-bug
   ```

2. **修正とテスト**

   ```bash
   # バグ修正...
   git add .
   git commit -m "FIX: 本番環境でのクリティカルなバグを緊急修正"
   git push origin hotfix/critical-bug
   ```

3. **手動 PR 作成（緊急時）**

   ```bash
   gh pr create --base main --head hotfix/critical-bug \
     --title "🚨 [HOTFIX] Critical bug fix" \
     --body "緊急修正: 本番環境でのクリティカルなバグ"
   ```

4. **即座にマージ & デプロイ**

## トラブルシューティング

### `.github/workflows/` を含む push が拒否される

```
! [remote rejected] refusing to allow an OAuth App to create or update workflow
  `.github/workflows/feature-ci.yml` without `workflow` scope
```

**原因:** `git push` が使う OAuth トークンに `workflow` スコープが無い。エージェント経由の作業で発生する。

**解決策: `gh` の Contents API を使う。** `gh` の認証は別トークンで、`workflow` スコープを持っていることが多い（2026-08-16 に実際に通った）。

```bash
BRANCH=$(git branch --show-current)
FILE=.github/workflows/feature-ci.yml
SHA=$(gh api "repos/<owner>/<repo>/contents/$FILE?ref=$BRANCH" --jq '.sha')

gh api -X PUT "repos/<owner>/<repo>/contents/$FILE" \
  -f message="CI: ..." \
  -f content="$(base64 -i "$FILE" | tr -d '\n')" \
  -f sha="$SHA" \
  -f branch="$BRANCH"

# リモートに直接コミットされるので、ローカルを同期する
git restore "$FILE" && git pull --ff-only
```

**注意:** リモート側に単独のコミットが積まれる。ローカルに同じ変更を残したまま `pull` すると衝突するため、`git restore` で先に捨てること。

> [!TIP]
> ワークフローの変更だけを切り離したい場合は `git reset --soft HEAD~1` でコミットを解き、
> `git restore --staged --worktree .github/workflows/<file>` で該当ファイルだけ戻してから
> 残りをコミットする。

### PR が自動作成されない

**原因 1:** Repository 設定で GitHub Actions の PR 作成が許可されていない

**解決策:**

```
Settings > Actions > General > Workflow permissions
→ "Allow GitHub Actions to create and approve pull requests" を有効化
```

**原因 2:** 既に同じブランチの PR が存在する

**解決策:**

- GitHub UI で既存 PR を確認
- 必要に応じて既存 PR を使用

**原因 3:** 品質チェックが失敗している

**解決策:**

```bash
# ローカルで品質チェック実行（プロジェクトの構成に応じて）
# 例: npm run lint:check
# 例: npm run format:check
# 例: npm run build

# エラーを修正後、再度 push
git add .
git commit -m "FIX: 品質チェックエラーを修正"
git push origin feature/your-feature
```

### ブランチ名の競合

**エラー例:**

```
'refs/heads/feature' exists; cannot create 'refs/heads/feature/add-gtm'
```

**原因:** Git のブランチ名前空間の競合（`feature` と `feature/xxx` は共存不可）

**解決策:**

```bash
# リモートの競合ブランチを削除
git push origin --delete feature

# または、ローカルブランチ名を変更
git branch -m feature/add-gtm feature-add-gtm
git push origin feature-add-gtm
```

## 関連ドキュメント

- [docs/INDEX.md](../INDEX.md) - ドキュメント索引
- [AGENTS.md](../../AGENTS.md) - エージェント運用ルール

## 更新履歴

- 2025-12-05: 初版作成（テンプレートプロジェクト用に汎用化）
- 2026-08-16: `.github/workflows/` の push が拒否される場合の回避手順を追加
- 2026-08-29: 「ステージングの規約」を追加（`git add -A` / `git add .` の禁止、コミット前チェックリスト、巻き込み時の復旧手順）
- 2026-08-29: 「マージ前の検証」を追加（`merge-tree` で消えるファイルを確認、worktree での実動確認、マージ前チェックリスト）
- 2026-09-03: `feature-ci.yml` に型チェックを追加し、`lint-and-format` を `static-checks` へ改名（#157 段階1）
- 2026-09-03: ユニットテストと実ブラウザのレイアウト実測を CI へ追加。共通のセットアップ4ステップを `.github/actions/setup` へ切り出した（#157 段階2・3）
- 2026-09-06: ドキュメントの相対リンク検査（`pnpm check:doc-links`）を `Static Checks` へ追加（#211）。**見るのは相対リンクだけで、`#anchor` の存在は射程外**
