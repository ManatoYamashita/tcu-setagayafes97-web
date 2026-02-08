# デプロイ手順書（カウントダウンページ運用）

**最終更新日:** 2026-02-08
**ステータス:** 運用中

## 目次

1. [2/28公開手順（カウントダウンページ）](#228公開手順カウントダウンページ)
2. [11/1公開手順（本番ページ）](#111公開手順本番ページ)
3. [ロールバック手順（緊急時）](#ロールバック手順緊急時)
4. [Vercel設定確認](#vercel設定確認)
5. [問い合わせ先](#問い合わせ先)

---

## 2/28公開手順（カウントダウンページ）

### 事前確認（2/27）

#### 1. ローカル環境でビルドテスト

```bash
# プロジェクトルートで実行
pnpm build

# エラーがないことを確認
# ビルド時間: 約30秒〜1分
```

#### 2. カウントダウンタイマーの動作確認

```bash
# 開発サーバー起動
pnpm dev

# ブラウザで http://localhost:3000 にアクセス
# カウントダウンタイマーが動作することを確認
```

**確認ポイント:**

- [ ] カウントダウンタイマーが表示される
- [ ] 開催日（2026/10/31 00:00:00）までの残り時間が正確
- [ ] 数字が1秒ごとに更新される
- [ ] レスポンシブ対応（モバイル/タブレット/デスクトップ）
- [ ] DevTools Consoleにエラーがない

#### 3. Vercel Production Preview確認

1. GitHub PR #2（カウントダウンページ）をmainにマージ前の状態で確認
2. Vercel Dashboard → Deployments → `feature/countdown-page` のPreview URLにアクセス
3. 本番環境と同様の動作を確認

**確認ポイント:**

- [ ] カウントダウンタイマーが正しく動作
- [ ] OGP画像が表示される（Twitter Card Validator等で確認）
- [ ] メタタグが正しく設定されている（View Source確認）
- [ ] Lighthouse スコア: Performance 90以上
- [ ] モバイル/タブレット/デスクトップで表示確認

#### 4. SEO・OGP確認

**Twitter Card Validator:**

- https://cards-dev.twitter.com/validator
- Preview URLを入力して確認

**Facebook Sharing Debugger:**

- https://developers.facebook.com/tools/debug/
- Preview URLを入力して確認

**Google Search Console:**

- URL検査ツールでインデックス状態を確認

---

### 公開当日（2/28 00:00）

#### 方法1: 自動デプロイ（推奨）

**手順:**

1. GitHub PR #2（カウントダウンページ）をmainにマージ
2. Vercel が自動的にProduction環境にデプロイ（約1〜2分）
3. Vercel Dashboard → Deployments で状態確認

**マージコマンド（GitHub CLI）:**

```bash
# ローカルのmainを最新化
git checkout main
git pull origin main

# PRをマージ（--mergeオプションでマージコミット作成）
gh pr merge 2 --merge

# 念のためローカルも更新
git pull origin main
```

**マージコマンド（GitHub Web UI）:**

1. https://github.com/ManatoYamashita/tcu-setagayafes97-web/pull/2 にアクセス
2. 「Merge pull request」ボタンをクリック
3. 「Confirm merge」をクリック

#### 方法2: 手動デプロイ（Vercel自動デプロイ失敗時）

```bash
# Vercel CLIでデプロイ
vercel --prod

# デプロイ完了後、Production URLを確認
```

---

### 公開後確認（2/28 00:10）

**Production URL:** https://setagayafes.tcu.ac.jp（または Vercel 提供 URL）

#### 1. 基本動作確認

- [ ] Production URLでカウントダウンページが表示される
- [ ] カウントダウンタイマーが正確に動作
- [ ] 開催概要（日程、会場）が表示される
- [ ] SNSリンク（Twitter, Instagram, Facebook）が動作
- [ ] レスポンシブ対応（モバイル/タブレット/デスクトップ）

#### 2. パフォーマンス確認

**Lighthouse スコア:**

```bash
# Chrome DevTools → Lighthouse で計測
# 目標値: Performance 90以上
```

**Core Web Vitals:**

- **LCP (Largest Contentful Paint):** 2.5秒以内
- **FID (First Input Delay):** 100ms以内
- **CLS (Cumulative Layout Shift):** 0.1以内

#### 3. SEO・OGP確認

- [ ] Twitter Card が正しく表示される
- [ ] Facebook シェア時にOGP画像が表示される
- [ ] Google検索結果にメタ情報が反映される（数日後）

#### 4. エラー監視

**Vercel Dashboard:**

- Deployments → Production → Logs でエラーがないか確認

**ブラウザ Console:**

- Chrome DevTools → Console でJavaScriptエラーがないか確認

---

## 11/1公開手順（本番ページ）

### 事前準備（10/30）

#### 1. devブランチを最新化

```bash
# devブランチを最新化
git checkout dev
git pull origin dev

# mainをdevにマージ（コンフリクト解消のため）
git merge main --no-ff
# コンフリクトがあれば解消
git add .
git commit -m "MERGE: mainをdevにマージ"
git push origin dev
```

#### 2. devブランチのPreview環境で最終確認

**Preview URL:** `https://dev-<project-name>.vercel.app`

**確認ページ一覧:**

- [ ] トップページ（HeroSection）
- [ ] 企画一覧・詳細ページ（`/events`, `/events/[id]`）
- [ ] タイムテーブル（`/timetable`）
- [ ] マップ・アクセス（`/map`, `/map/access`）
- [ ] お知らせ一覧・詳細ページ（`/info`, `/info/[id]`）
- [ ] 委員会・協賛企業（`/about`, `/about/sponsors`）
- [ ] お問い合わせ（`/about/contact`）
- [ ] プライバシーポリシー（`/about/privacy`）
- [ ] 多言語ページ（`/ja/*`, `/en/*`, `/zh/*`, `/ko/*`）

#### 3. microCMS APIの接続確認

```bash
# 開発サーバーで確認
pnpm dev

# ブラウザで以下を確認
# - お知らせが表示される
# - 企画一覧が表示される
# - 協賛企業が表示される
```

**確認ポイント:**

- [ ] microCMS APIからデータが取得できる
- [ ] 画像が正しく表示される
- [ ] エラーがない

---

### 最終確認（10/31 23:00）

#### 1. ビルドテスト

```bash
git checkout dev
git pull origin dev
pnpm build

# ビルド成功を確認
# エラーがあれば修正
```

#### 2. Lighthouse スコア確認

- **Performance:** 90以上
- **Accessibility:** 90以上
- **Best Practices:** 90以上
- **SEO:** 90以上

#### 3. クロスブラウザテスト

- [ ] Chrome（最新版）
- [ ] Safari（最新版）
- [ ] Firefox（最新版）
- [ ] Edge（最新版）
- [ ] iOS Safari（iOS 15以上）
- [ ] Android Chrome（最新版）

---

### 公開当日（11/1 00:00）

#### devをmainにマージ

**手順:**

```bash
# mainブランチに切り替え
git checkout main
git pull origin main

# devをマージ（コミット履歴を保持）
git merge dev --no-ff -m "$(cat <<'EOF'
RELEASE: 本番ページ公開（第97回世田谷祭）

- カウントダウンページから本番ページに切り替え
- 全機能実装完了（企画検索、タイムテーブル、3Dマップ等）
- microCMS連携確認済み
- Lighthouse スコア: Performance 90+
- クロスブラウザテスト完了

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

# mainにpush（Vercel Production自動デプロイ）
git push origin main
```

#### デプロイ確認

**Vercel Dashboard:**

- Deployments → Production で状態確認
- デプロイ時間: 約2〜3分

**Production URL:**

- https://setagayafes.tcu.ac.jp（または Vercel 提供 URL）

---

### 公開後確認（11/1 00:10）

#### 1. 基本動作確認

- [ ] Production URLで本番ページが表示される
- [ ] トップページが正しく表示（HeroSection、カウントダウンなし）
- [ ] 企画一覧・詳細ページが動作
- [ ] タイムテーブルが表示
- [ ] マップ・アクセスページが表示
- [ ] お知らせが最新3件表示
- [ ] 協賛企業一覧が表示
- [ ] お問い合わせフォームが動作
- [ ] 多言語ページが動作（ja/en/zh/ko）

#### 2. microCMS連携確認

- [ ] お知らせが取得できる
- [ ] 企画情報が取得できる
- [ ] 協賛企業情報が取得できる
- [ ] 画像が正しく表示される

#### 3. パフォーマンス確認

- [ ] Lighthouse スコア: Performance 90以上
- [ ] Core Web Vitals が基準内
- [ ] 画像の遅延読み込みが動作

#### 4. レスポンシブ確認

- [ ] モバイル（375px〜）
- [ ] タブレット（768px〜）
- [ ] デスクトップ（1024px〜）

#### 5. エラー監視

**Vercel Dashboard:**

- Deployments → Production → Logs でエラーがないか確認
- Function Logs でサーバーレス関数のエラーを確認

**ブラウザ Console:**

- Chrome DevTools → Console でJavaScriptエラーがないか確認

---

## ロールバック手順（緊急時）

### カウントダウンページのロールバック

**シナリオ:** 2/28公開後、カウントダウンページに重大なバグが発見された

#### 方法1: revertコミット（推奨）

```bash
git checkout main
git pull origin main

# 直前のコミットを打ち消し
git revert HEAD
git push origin main

# Vercelが自動的に再デプロイ
```

#### 方法2: 特定のコミットに戻す

```bash
git checkout main
git pull origin main

# ロールバック先のコミットを確認
git log --oneline -10

# 特定のコミットに戻す（例: abc1234）
git revert <commit-hash>
git push origin main
```

---

### 本番ページのロールバック

**シナリオ:** 11/1公開後、本番ページに重大なバグが発見された

#### 方法1: カウントダウンページに戻す（一時的）

```bash
git checkout main
git pull origin main

# devマージコミットを打ち消し
git revert HEAD
git push origin main

# カウントダウンページに戻る
```

#### 方法2: タグからロールバック

```bash
# タグを確認
git tag -l

# カウントダウンページのタグに戻す
git checkout main
git reset --hard v0.1.0-countdown-release
git push origin main --force

# ⚠️ 注意: --force は最終手段。可能な限り revert を使用
```

#### 方法3: Vercel Dashboard から手動ロールバック

1. Vercel Dashboard → Deployments
2. ロールバックしたいデプロイを選択
3. 「Promote to Production」ボタンをクリック

---

## Vercel設定確認

### Production Branch設定

**確認手順:**

1. Vercel Dashboard → Settings → Git
2. Production Branch: `main`
3. Ignored Build Step: なし（すべてビルド）

### 環境変数設定

**必須環境変数:**

- `NEXT_PUBLIC_MICROCMS_SERVICE_DOMAIN`
- `NEXT_PUBLIC_MICROCMS_API_KEY`

**確認手順:**

1. Vercel Dashboard → Settings → Environment Variables
2. Production / Preview 両方で同じ値が設定されているか確認

### ビルド設定

**確認手順:**

1. Vercel Dashboard → Settings → General
2. 以下の設定を確認:
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Output Directory: `.next`
   - Install Command: `pnpm install`
   - Node Version: 20.x

### デプロイフック（オプション）

**手動デプロイ用のWebhook URL作成:**

1. Vercel Dashboard → Settings → Deploy Hooks
2. 「Create Hook」をクリック
3. Hook Name: `Manual Deploy`
4. Branch: `main`
5. 生成されたURLを安全な場所に保存

**使用方法:**

```bash
curl -X POST <webhook-url>
```

---

## 問い合わせ先

### Vercelサポート

- **ドキュメント:** https://vercel.com/docs
- **サポート:** https://vercel.com/support
- **コミュニティ:** https://github.com/vercel/vercel/discussions

### microCMSサポート

- **ドキュメント:** https://document.microcms.io/
- **サポート:** https://microcms.io/support
- **お問い合わせ:** https://microcms.io/contact

### プロジェクトリード

- **担当者:** （担当者名を記載）
- **連絡先:** （メールアドレス等を記載）

---

## チェックリスト（印刷用）

### 2/28公開チェックリスト

**事前確認（2/27）:**

- [ ] ローカルビルド成功
- [ ] カウントダウンタイマー動作確認
- [ ] Vercel Preview確認
- [ ] OGP・SEO確認
- [ ] Lighthouse スコア確認

**公開当日（2/28）:**

- [ ] PR #2 をmainにマージ
- [ ] Vercel自動デプロイ確認
- [ ] Production URL動作確認
- [ ] パフォーマンス確認
- [ ] エラー監視

### 11/1公開チェックリスト

**事前準備（10/30）:**

- [ ] devブランチ最新化
- [ ] mainをdevにマージ
- [ ] Preview環境で全ページ確認
- [ ] microCMS API接続確認
- [ ] ビルドテスト

**最終確認（10/31 23:00）:**

- [ ] Lighthouse スコア確認
- [ ] クロスブラウザテスト
- [ ] レスポンシブ確認

**公開当日（11/1 00:00）:**

- [ ] devをmainにマージ
- [ ] Vercel自動デプロイ確認
- [ ] Production URL動作確認
- [ ] 全ページ動作確認
- [ ] microCMS連携確認
- [ ] パフォーマンス確認
- [ ] エラー監視

---

## 変更履歴

| 日付       | 変更内容 | 担当者           |
| ---------- | -------- | ---------------- |
| 2026-02-08 | 初版作成 | フリーザ様（AI） |
