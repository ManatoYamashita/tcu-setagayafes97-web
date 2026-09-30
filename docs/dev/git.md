# Branch Strategy & CI/CD Workflow

本リポジトリのブランチ運用・CI・コミット規約。
**ステージングとマージ前の検証は [staging-and-merge.md](./staging-and-merge.md)** にある（複数のエージェントが同じ作業ツリーを触るため、事故の実例が多い）。

## ブランチ戦略

### 基本方針

- **main ブランチへの直接 push は禁止**
- すべての作業は専用のフィーチャーブランチで実施
- PR は `gh pr create` などで手で作る（CI は PR を自動作成しない）
- **PR の base は `main`。`dev` ブランチは存在しない**（2026-09-23 に削除）
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
   git add <パスを明示>            # git add . / git add -A は禁止（staging-and-merge.md）
   git commit -m "PREFIX: Commit message"
   git push origin feature/your-feature
   ```

3. **PR 作成**: `gh pr create --base main`。CI（後述）が push 時と PR 時に走る

4. **レビュー & マージ**: PR を確認後、main へマージ

   **マージの前に [staging-and-merge.md](./staging-and-merge.md) の「マージ前チェックリスト」を通す**
   （消えるファイル・既に main へ入っていないか・閉じる Issue の認識）。

5. **削除**: マージ後は不要なブランチを削除
   ```bash
   git branch -d feature/your-feature
   git push origin --delete feature/your-feature
   ```

## CI（GitHub Actions）

ワークフローは2本。定義の一次情報は `.github/workflows/` で、カバー範囲の表は
[.claude/CLAUDE.md](../../.claude/CLAUDE.md) の「CI のカバー範囲」にある。

| ワークフロー                  | いつ走るか                                       | 何をするか                                                       |
| ----------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `feature-ci.yml`              | 上記5種のブランチへの push、base が `main` の PR | `Static Checks` / `Layout E2E` / `Build Check` の3ジョブ         |
| `production-deploy-guard.yml` | `main` への push                                 | そのコミットの Vercel Production デプロイが5分以内に現れるか見る |

**命名規則から外れたブランチ名では、push 時のチェックが一切走らない。**

**ジョブを分ける基準は「`pnpm install` 以外に何を要求するか」である。** install だけで済む検査
（lint / format / 型 / ユニットテスト / ドキュメントの相対リンク / 禁止色 / 静的画像）は
`Static Checks` に束ね、ブラウザを要求する検査は `Layout E2E`、microCMS の secrets を要求する
検査は `Build Check` に置く。`Build Check` は secrets が届かない fork の PR では必ず落ちる。
型チェックは `Build Check` と重複するが、secrets を要求せず短時間で落ちる検査として
`Static Checks` にも置いてある。共通のセットアップは `.github/actions/setup` にある。

> [!NOTE]
> 以前ここに載っていた「品質チェック成功時に PR を自動作成するジョブ」は汎用テンプレートの名残で、
> 本リポジトリには存在しない（2026-09-30 に削除）。

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

## 緊急修正（Hotfix）フロー

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
   git status --short
   git add <パスを明示>
   git commit -m "FIX: 本番環境でのクリティカルなバグを緊急修正"
   git push origin hotfix/critical-bug
   ```

3. **PR 作成**

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

- [docs/dev/staging-and-merge.md](./staging-and-merge.md) - ステージングの規約とマージ前の検証
- [docs/dev/ci-env.md](./ci-env.md) - CI とデプロイの環境変数
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
- 2026-09-30: 「ステージングの規約」「マージ前の検証」を staging-and-merge.md へ分割。存在しない「PR 自動作成ジョブ」の説明と、`git add .` を使っていた手順例を削除し、CI の節を実際のワークフローに合わせて書き直した
