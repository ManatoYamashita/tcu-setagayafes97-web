# プロジェクト開発タスクリスト - 東京都市大学 第97回 世田谷祭 公式Webサイト

## 概要

本ドキュメントは、東京都市大学 第97回 世田谷祭 公式Webサイトの開発タスクリストです。要件定義書（`require.md`）の内容を基に、開発の進捗を管理しやすい形で細分化しています。

- **開催日程**: 2026年10月31日（土）〜11月1日（日）
- **公開予定**: 2026年2月28日
- **開発期間**: 約3ヶ月（2025年12月〜2026年2月）
- **技術スタック**: Next.js 16.1 (App Router), TypeScript, TailwindCSS, GSAP, Three.js, microCMS, next-intl, Vercel

## 進捗状況

- **全タスク数**: 152
- **完了**: 0
- **進行中**: 0
- **未着手**: 152
- **進捗率**: 0%

最終更新日: 2026-01-18

---

## Phase 1: 基盤構築（12月）

### 1. セットアップ・環境構築

- [ ] Next.js 16.1プロジェクトを初期化（`npx create-next-app@latest`）
- [ ] TypeScript設定を構成（`tsconfig.json`の最適化）
- [ ] TailwindCSSをインストール・設定（`tailwind.config.ts`、`globals.css`）
- [ ] GSAPをインストール（`pnpm add gsap`）
- [ ] package.jsonのscriptsセクションを設定（dev, build, start, lint, format等）
- [ ] ESLintを設定（`.eslintrc.json`の最適化）
- [ ] Prettierを設定（`.prettierrc`、`.prettierignore`）
- [ ] プロジェクトディレクトリ構造を構築（`/src/app`, `/src/components`, `/src/data`, `/src/lib`, `/src/messages`, `/src/assets`）
- [ ] `.gitignore`を設定（node_modules, .next, .env.local等）
- [ ] `.env.local.example`を作成（環境変数のテンプレート）
- [ ] GitHub Actionsワークフローファイルを作成（`.github/workflows/feature-ci.yml`）
- [ ] Git hooksを設定（husky + lint-staged）
- [ ] VSCode設定ファイルを作成（`.vscode/settings.json`, `.vscode/extensions.json`）
- [ ] README.mdを更新（セットアップ手順、開発コマンド等）

### 2. microCMS設定

- [ ] microCMSアカウントを作成
- [ ] 新規サービスを作成（サービス名: `setagayafes97`等）
- [ ] News APIを設計・作成（フィールド: type, title, thumbnail, description, content）
- [ ] Events APIを設計・作成（フィールド: date, type, place, building, title, organizer, thumbnail, description, content, startTime, endTime, sns）
- [ ] Informations APIを設計・作成（フィールド: category, title, sponsorName, sponsorDescription, logo, url, priority）
- [ ] microCMS APIキーを取得（`.env.local`に設定）
- [ ] microCMS SDK（`microcms-js-sdk`）をインストール
- [ ] microCMSクライアントを実装（`/src/lib/microcms.ts`）
- [ ] News API型定義ファイルを作成（`/src/types/news.ts`）
- [ ] Events API型定義ファイルを作成（`/src/types/events.ts`）
- [ ] Informations API型定義ファイルを作成（`/src/types/informations.ts`）
- [ ] microCMS APIテストデータを投稿（各API 3件程度のダミーデータ）

### 3. 基本レイアウト・共通コンポーネント

- [ ] Headerコンポーネントを作成（`/src/components/layout/Header.tsx`）
- [ ] Footerコンポーネントを作成（`/src/components/layout/Footer.tsx`）
- [ ] Navigationコンポーネントを作成（`/src/components/layout/Navigation.tsx`）
- [ ] モバイルメニューコンポーネントを作成（ハンバーガーメニュー）
- [ ] Loadingコンポーネントを作成（`/src/components/ui/Loading.tsx`）
- [ ] Errorコンポーネントを作成（`/src/components/ui/Error.tsx`）
- [ ] Buttonコンポーネントを作成（再利用可能な汎用ボタン）
- [ ] Cardコンポーネントを作成（企画カード等で使用）
- [ ] Modalコンポーネントを作成（汎用モーダル）
- [ ] Badgeコンポーネントを作成（カテゴリバッジ等）
- [ ] SEO用Metadataコンポーネントを作成（`/src/components/seo/Metadata.tsx`）
- [ ] 構造化データ（JSON-LD）コンポーネントを作成（イベント情報マークアップ）
- [ ] 多言語切替UIコンポーネントを作成（`/src/components/ui/LanguageSwitcher.tsx`）
- [ ] Breadcrumbコンポーネントを作成（パンくずリスト）
- [ ] ルートレイアウト（`/src/app/layout.tsx`）を実装（Header, Footer配置）
- [ ] error.tsxを実装（エラーバウンダリ）
- [ ] loading.tsxを実装（ローディング表示）
- [ ] not-found.tsxを実装（404ページ）

### 4. 静的データ管理

- [ ] サイト基本情報ファイルを作成（`/src/data/site.ts` - サイト名、開催日、会場、テーマカラー、SNSリンク等）
- [ ] ナビゲーション構成ファイルを作成（`/src/data/navigation.ts` - メニュー項目、パス）
- [ ] 建物情報ファイルを作成（`/src/data/buildings.ts` - 3Dマップ用、建物番号、名称、座標等）
- [ ] 施設情報ファイルを作成（`/src/data/facilities.ts` - トイレ、案内所、休憩所等の位置情報）
- [ ] アクセス情報ファイルを作成（`/src/data/access.ts` - 最寄り駅、ルート、駐車場情報）
- [ ] ご来場の方へファイルを作成（`/src/data/guide.ts` - 注意事項、バリアフリー情報）
- [ ] プライバシーポリシーファイルを作成（`/src/data/privacy.ts`）
- [ ] 各データファイルの型定義を作成（TypeScript interface）

---

## Phase 2: 主要機能実装（1月前半）

### 5. トップページ実装

- [ ] トップページルート（`/src/app/page.tsx`）を作成
- [ ] 起動時アニメーションコンポーネントを実装（WebM動画再生、sessionStorage管理）
- [ ] 起動アニメーションスキップボタンを実装（3秒以上の場合）
- [ ] カウントダウンタイマーコンポーネントを実装（開催日までの日:時:分:秒）
- [ ] カウントダウンロジックを実装（開催前/開催中/終了後の状態管理）
- [ ] メインビジュアルセクションを実装（ヒーローイメージ、キャッチコピー）
- [ ] 開催概要セクションを実装（開催日時、会場、テーマ）
- [ ] Newsセクションを実装（microCMS News APIから最新3件取得）
- [ ] おすすめ企画セクションを実装（Featured企画の表示）
- [ ] 協賛バナーエリアを実装（ロゴスライダー、Informations APIから取得）
- [ ] スクロールアニメーションを実装（GSAP ScrollTrigger使用）
- [ ] トップページのレスポンシブ対応を実装

### 6. 企画機能実装

- [ ] 企画一覧ページルート（`/src/app/events/page.tsx`）を作成
- [ ] 企画詳細ページルート（`/src/app/events/[id]/page.tsx`）を作成（動的ルーティング）
- [ ] microCMS Events APIからデータ取得ロジックを実装
- [ ] 企画一覧カード表示を実装（サムネイル、タイトル、カテゴリバッジ、場所、日程）
- [ ] 検索・絞り込みUIを実装（日程、場所、カテゴリ、キーワード）
- [ ] フィルター機能のロジックを実装（クライアントサイドフィルタリング）
- [ ] ページネーションコンポーネントを実装（または無限スクロール）
- [ ] 企画詳細ページのレイアウトを実装（画像、説明、SNSリンク等）
- [ ] 「マップで見る」ボタンを実装（3Dマップへの遷移）
- [ ] 企画データのISR設定を実装（revalidate設定）
- [ ] 企画一覧のソート機能を実装（日程順、人気順等）
- [ ] 企画検索結果の「該当なし」表示を実装
- [ ] 企画一覧のローディング表示を実装
- [ ] 企画詳細のOGP画像設定を実装（動的メタタグ）
- [ ] 企画一覧・詳細のレスポンシブ対応を実装

### 7. タイムテーブル実装

- [ ] タイムテーブルページルート（`/src/app/timetable/page.tsx`）を作成
- [ ] 縦型ガントチャートUIコンポーネントを作成
- [ ] 日程切替タブを実装（Day1 / Day2）
- [ ] ステージ切替タブを実装（7A, 7B, 体育館, ホール等）
- [ ] イベントデータをmicroCMS Events APIから取得（type: stage のみ）
- [ ] タイムラインのグリッド表示を実装（時間軸、ステージ軸）
- [ ] イベントクリック時のモーダル表示を実装（または詳細ページ遷移）
- [ ] タイムテーブルのレスポンシブ対応を実装（モバイルでは横スクロール）

---

## Phase 3: マップ・その他（1月後半）

### 8. マップ・アクセス実装

#### 3Dマップ実装（優先度: 中）

- [ ] Three.js / React Three Fiberをインストール
- [ ] 3Dマップページルート（`/src/app/map/page.tsx`）を作成
- [ ] Three.jsキャンバスコンポーネントを作成
- [ ] 3DモデルをBlenderで作成（建物10棟程度）
- [ ] 3DモデルをGLTF/GLB形式でエクスポート
- [ ] 3Dモデルをプロジェクトに配置（`/public/models/`）
- [ ] 3Dモデルを読み込み・表示するロジックを実装
- [ ] 建物クリックインタラクションを実装（raycasting使用）
- [ ] 建物クリック時に企画一覧オーバーレイを表示
- [ ] 企画ピンを3Dマップ上に配置（Events APIのbuildingフィールド参照）
- [ ] カメラコントロールを実装（OrbitControls）
- [ ] 3Dマップのパフォーマンス最適化（LOD、テクスチャ圧縮等）

#### 2Dマップフォールバック

- [ ] 2Dマップ画像を準備（キャンパスマップ）
- [ ] 2Dマップ表示コンポーネントを作成（画像 + クリッカブルエリア）
- [ ] 2Dマップの建物クリックインタラクションを実装（image mapまたはSVG）

#### 交通アクセスページ

- [ ] 交通アクセスページルート（`/src/app/map/access/page.tsx`）を作成
- [ ] Google Maps埋め込みを実装（または静的マップ画像）
- [ ] 最寄り駅からのルート案内を実装（`/src/data/access.ts`のデータ使用）
- [ ] 駐車場・駐輪場情報を表示

### 9. インフォメーション実装

- [ ] お知らせ一覧ページルート（`/src/app/info/page.tsx`）を作成
- [ ] お知らせ詳細ページルート（`/src/app/info/[id]/page.tsx`）を作成
- [ ] microCMS News APIからデータ取得ロジックを実装
- [ ] お知らせ一覧カード表示を実装（type: urgentのハイライト表示）
- [ ] お知らせ詳細ページのレイアウトを実装（タイトル、サムネイル、本文）
- [ ] ご来場の方へページルート（`/src/app/info/guide/page.tsx`）を作成
- [ ] ご来場の方へコンテンツを実装（`/src/data/guide.ts`のデータ使用）
- [ ] FAQページルート（`/src/app/info/faq/page.tsx`）を作成
- [ ] FAQアコーディオンコンポーネントを実装
- [ ] FAQデータをmicroCMS Informations APIから取得（category: faq）
- [ ] パンフレットページルート（`/src/app/info/pamphlet/page.tsx`）を作成
- [ ] パンフレットPDFダウンロードリンクを実装（ページ内プレビューは任意）

---

## Phase 4: 仕上げ・テスト（2月）

### 10. About実装

- [ ] 委員長挨拶・理念ページルート（`/src/app/about/page.tsx`）を作成
- [ ] 委員長挨拶コンテンツを実装（静的データまたはmicroCMS）
- [ ] 協賛企業一覧ページルート（`/src/app/about/sponsors/page.tsx`）を作成
- [ ] 協賛企業データをmicroCMS Informations APIから取得（category: sponsor）
- [ ] 協賛企業ロゴ表示を実装（グリッドレイアウト、リンク付き）
- [ ] お問い合わせページルート（`/src/app/about/contact/page.tsx`）を作成
- [ ] お問い合わせフォームを実装（3種別: 一般、取材、落とし物）
- [ ] フォーム送信ロジックを実装（Nodemailer + Vercel Serverless Functions）
- [ ] フォームバリデーションを実装（zod等）
- [ ] プライバシーポリシーページルート（`/src/app/about/privacy/page.tsx`）を作成
- [ ] プライバシーポリシーコンテンツを実装（`/src/data/privacy.ts`のデータ使用）

### 11. 多言語対応

- [ ] next-intl（またはnext-i18next）をインストール
- [ ] i18n設定ファイルを作成（サポート言語: ja, en, zh, ko）
- [ ] 翻訳ファイルを作成（`/src/messages/ja.json`, `en.json`, `zh.json`, `ko.json`）
- [ ] 固定ページの翻訳キーを定義（Header, Footer, Navigation等）
- [ ] 多言語ルーティングを設定（`/[locale]`）
- [ ] 言語切替UIを実装（LanguageSwitcherコンポーネント）
- [ ] 翻訳内容を入力（英語、中国語、韓国語）
- [ ] 多言語対応のテストを実施（各言語での表示確認）

### 12. パフォーマンス最適化

- [ ] 画像最適化を実装（Next.js Imageコンポーネント使用、WebP変換）
- [ ] コード分割を実装（Dynamic Import、React.lazy）
- [ ] ISR/SSG設定を最適化（各ページのrevalidate設定）
- [ ] フォント最適化を実装（next/font使用、FOUT防止）
- [ ] Lighthouse監査を実施（Performance, Accessibility, Best Practices, SEO）
- [ ] Lighthouseスコア改善（Core Web Vitals改善）
- [ ] バンドルサイズ分析・最適化（next-bundle-analyzer使用）

### 13. テスト・デプロイ

- [ ] クロスブラウザテスト（Chrome, Safari, Firefox, Edge）
- [ ] レスポンシブ調整（モバイル、タブレット、デスクトップ）
- [ ] メタタグ設定（title, description, OGP）を全ページに実装
- [ ] 構造化データ（JSON-LD）を実装（イベント情報、組織情報）
- [ ] sitemap.xmlを自動生成（next-sitemap使用）
- [ ] robots.txtを設置
- [ ] Vercel本番環境へデプロイ
- [ ] 本番環境での動作確認・最終調整

---

## リスク管理

### 3Dマップ実装の難易度

- **リスク**: Three.js/React Three Fiberの学習コスト、3Dモデル作成の工数が想定以上
- **対策**:
  - 3Dマップの優先度を「中」に設定
  - 2Dマップをフォールバックとして準備
  - Phase 3で2Dマップを先に実装し、3Dマップは余裕があれば追加

### Vercel Free Plan制約

- **リスク**: 帯域幅100GB/月、Serverless Function実行時間10秒の制約
- **対策**:
  - ISR/SSGを積極的に活用し、サーバーレス関数の使用を最小化
  - 画像最適化（WebP、適切なサイズ）でバンドルサイズを削減
  - CDN配信を活用

### コンテンツ入稿遅延

- **リスク**: 各企画の情報入稿が遅延し、開発スケジュールに影響
- **対策**:
  - ダミーデータで開発を進行
  - コンテンツ分離原則を徹底（`/src/data`での管理）
  - microCMSのAPI設計を早期に完了し、入稿体制を整備

---

## 備考

### コンテンツ分離原則

すべての画像パス、テキストコンテンツはUIコンポーネントと分離し、`/src/data`配下のJSON/TSファイルで管理する。これにより、運用フェーズでの更新を容易にする。

### 依存関係

- **microCMS設定 → APIクライアント実装 → 各ページ実装**
- **基本レイアウト → 個別ページ実装**
- **静的データ管理 → UIコンポーネント実装**

### 開発優先度

1. **Phase 1（基盤構築）**: 最優先。すべての開発の前提条件
2. **Phase 2（主要機能実装）**: 高優先度。サイトのコア機能
3. **Phase 3（マップ・その他）**: 中優先度。3Dマップはフォールバック準備
4. **Phase 4（仕上げ・テスト）**: 最終調整とリリース準備

### 進捗管理

- タスク完了時に `- [x]` にチェック
- 週次で進捗状況セクションを更新
- Phase終了時に振り返りを実施

### 年次更新時の作業手順（第98回以降）

本プロジェクトは、来年（第98回）以降も**ロジックとレイアウトを使い回す**前提で設計されています。年次更新時は以下の手順で作業してください。

#### ステップ1: 年度情報の更新

1. `/src/data/site.ts` を開く
2. `edition` フィールドを次年度に更新（例: 97 → 98）
3. `dates` フィールドを次年度の開催日に更新

#### ステップ2: 静的コンテンツの確認・更新

1. `/src/data/navigation.ts` - メニュー項目の追加・削除が必要か確認
2. `/src/data/buildings.ts` - 建物情報の変更がないか確認
3. `/src/data/facilities.ts` - 施設情報の変更がないか確認
4. `/src/data/access.ts` - アクセス情報の変更がないか確認
5. `/src/data/guide.ts` - 注意事項等の変更がないか確認
6. `/src/data/privacy.ts` - プライバシーポリシーの変更がないか確認

#### ステップ3: アセット（画像・動画）の差し替え

1. `/src/assets/images/` 配下の画像を次年度のものに差し替え
2. `/src/assets/videos/` 配下の動画を次年度のものに差し替え
3. 画像パスは `/src/data/` 配下のファイルで管理されているため、パスが変わる場合は該当ファイルを更新

#### ステップ4: microCMS コンテンツの更新

1. microCMS 管理画面にログイン
2. News API の過去データを削除（または非公開化）
3. Events API の過去データを削除（または非公開化）
4. Informations API の協賛企業情報を更新
5. 新年度のデータを投稿

#### ステップ5: 動作確認・デプロイ

1. ローカル環境で `pnpm dev` を実行
2. トップページ、企画一覧、タイムテーブル等の主要ページを確認
3. 年度情報が正しく反映されているか確認
4. ビルド（`pnpm build`）を実行してエラーがないか確認
5. Vercel にデプロイ
6. 本番環境で最終確認

#### 推定作業時間

- ステップ1-2: 1時間
- ステップ3: 2時間（画像・動画の準備を含む）
- ステップ4: 2時間（コンテンツ投稿を含む）
- ステップ5: 1時間
- **合計**: 約6時間

#### 注意事項

- UIコンポーネントやページ構成は**原則として変更しない**
- 新しい機能追加が必要な場合は、別途開発タスクとして計画する
- 年度情報は `/src/data/site.ts` で一元管理し、ハードコードしない

---

**最終更新日**: 2026-01-18
