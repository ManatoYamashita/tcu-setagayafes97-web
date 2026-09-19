# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## プロジェクト概要

東京都市大学 第97回 世田谷祭 公式Webサイトの開発プロジェクト。Next.js 16.1 (App Router) + TypeScript + TailwindCSS + microCMS を使用した、学園祭の情報提供と企画検索を目的としたWebサイト。

- **開催日程**: 2026年10月31日（土）〜11月1日（日）
- **公開予定**: 2026年2月28日
- **ホスティング**: Vercel (Free Plan)
- **想定来場者数**: 約3,000名

## 技術スタック

| カテゴリ         | 技術                                                                   |
| ---------------- | ---------------------------------------------------------------------- |
| フレームワーク   | Next.js 16.1 (App Router)                                              |
| 言語             | TypeScript                                                             |
| スタイリング     | TailwindCSS                                                            |
| アニメーション   | GSAP                                                                   |
| 3Dグラフィックス | Three.js / React Three Fiber（3Dマップは見送り。カラクリ演出用に残置） |
| CMS              | microCMS                                                               |
| 多言語対応       | next-intl または next-i18next                                          |
| ホスティング     | Vercel (Free Plan)                                                     |

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

# 型チェック（next typegen で .next/types を作り直してから tsc --noEmit）
pnpm type-check

# ユニットテスト（純粋関数のみ。方針は docs/dev/testing.md）
pnpm test

# ユニットテスト（watch）
pnpm test:watch

# レイアウトの実測（実ブラウザ。初回のみ pnpm exec playwright install --only-shell chromium）
pnpm test:e2e

# フォーマットチェック
pnpm format:check

# フォーマット自動修正
pnpm format

# ドキュメントの相対リンク切れ検査（追跡 .md のみを対象にする。設計は scripts/assert-doc-links.mjs 冒頭）
pnpm check:doc-links

# 禁止色ユーティリティが Tailwind の走査範囲に無いことの検査（コメントも見る。設計は scripts/assert-no-restricted-colors.mjs 冒頭）
pnpm check:colors
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

**CI のカバー範囲:**

`.github/workflows/feature-ci.yml`（Static Checks / Layout E2E / Build Check）は次の場合に走る。**上記5つの命名規則から外れたブランチ名を使うと、push 時のチェックが一切走らない。**

| イベント       | 対象                                                             |
| -------------- | ---------------------------------------------------------------- |
| `push`         | `feature/**`, `bugfix/**`, `hotfix/**`, `docs/**`, `refactor/**` |
| `pull_request` | base が `main` または `dev`                                      |

push 時は head をそのまま、PR 時は head を base へマージした結果を検証する。**両方走る場合、それは重複ではなく別種の検証である。**

`Static Checks` は **`pnpm install` だけで完結する検査**（lint / format / 型 / ユニットテスト /
ドキュメントの相対リンク / 禁止色ユーティリティ）を束ねたジョブである。
**禁止色の検査が `Static Checks` にあるのは、ESLint がコメントを見ないからである**
（Tailwind のソース走査はコメントも読むため、そこが死角になっていた。#230）。
**リンク検査が見るのは相対リンクだけで、`#anchor` の存在と外部URLの到達性は射程外である**
（見るもの・見ないものの一覧は `scripts/assert-doc-links.mjs` の冒頭）。
`Layout E2E` は**実ブラウザでしか捕まえられない事故に対する再発防止装置の置き場**で、
現在2つ載っている。`/timetable` の盤面（#148）と、全ルート＋404画面の
`<main id="content">` の1周検査（#177 A）である。
**後者は生HTMLでは代替できない**（`/events` は生HTML 2個・ライブDOM 1個、
動的404は生HTML 0個・ライブDOM 1個）。
**新しいルートを足したら `e2e/landmarks/route-sweep.spec.ts` の表へ1行足すこと。**
**このジョブは secrets を要求しないため、fork からの PR でも緑赤が出る唯一のジョブである**
（`Build Check` は microCMS の secrets 不達で fork PR では必ず落ちる）。
設計は [`docs/frontend/layout-e2e.md`](../docs/frontend/layout-e2e.md) を参照。
secrets もビルド成果物も要求しないため、**fork からの PR でも結果が出る**（`Build Check` は
microCMS の secrets を要求するので fork PR では必ず落ちる）。ここへ検査を足すときは、
「install 以外に何も要求しないか」を基準に判断すること。要求するなら別ジョブにする。

`pnpm type-check` が `next typegen` を前置しているのは、**`.next/types/validator.ts` が
`.d.ts` ではなく `.ts` だから**である。`skipLibCheck: true` はこのファイルを守らないため、
ルートを消したり改名したりした後に古い `validator.ts` が残っていると、
`tsc` が生成物の中で `TS2307` を出して落ちる（2026-09-03 実測）。typegen が作り直せば消える。
CI はクリーンチェックアウトなので陳腐化しないが、**ローカルと CI で同じコマンドを使うために
スクリプト側へ入れてある。**

もう1本、`.github/workflows/production-deploy-guard.yml` が `main` への push で走る。
そのコミットの Vercel Production デプロイが作られたかを最大5分間確認し、現れなければ失敗する。

**Vercel の git 連携はマージを取りこぼすことがある。** 2026-08-30 に実際に発生し、
CI 緑・マージ済みのまま本番だけが40分以上古いまま取り残された。Vercel 側にも
「失敗したデプロイ」ではなく記録そのものが無いため、**放置すると誰も気づかない。**
この Guard はその沈黙を破るためだけに存在する。復旧手順は
[`docs/dev/ci-env.md`](../docs/dev/ci-env.md) の「取りこぼしからの復旧」を参照（#152）。

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
│   ├── buildings.ts      # 建物情報（3Dマップ用に作成。見送りにより現在は未使用）
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
- **Events API**: `date` (day1/day2/both/other), `type` (room/stage/special/other), `place`, `building`, `title`, `organizer`, `thumbnail`, `description`, `content`, `startTime`, `endTime`, `sns`, `special`
  - `sns` は**テキストフィールド1つ**（カスタムフィールドではない）。1企画につきSNSリンクは1件のみ
  - `special` は `type = special` のときのみ入力する著名人企画LP用のカスタムフィールド。中身は `logo` / `photos` / `openTime` / `goods` / `tickets` / `notices` ほか。詳細は `microcms/README.md`
  - `select` の値は `day1 : 10月31日（土）` のように **`値 : ラベル`** 形式。コード側は `split(":")` で先頭を取り出す
- **Informations API**: `category` (sponsor/faq/other), `title`, `description`, `image`, `url`, `priority`

### データ反映の仕組み（オンデマンド再検証）

microCMS の入稿は **Webhook 経由で十数秒（実測10〜15秒）**で本番へ反映される。詳細と運用手順は
[`docs/dev/content-revalidation.md`](../docs/dev/content-revalidation.md) を参照。

| 系統 | 手段                                                                  | 反映まで                     |
| ---- | --------------------------------------------------------------------- | ---------------------------- |
| 主系 | microCMS Webhook → `POST /api/revalidate` → `revalidatePath()`        | 十数秒（実測10〜15秒）       |
| 保険 | microCMS を読むページとサイトマップの `export const revalidate = 600` | 10分経過後のアクセスで再生成 |

**microCMS の Webhook は失敗しても再送されない。** 時間ベース ISR はその取りこぼしを拾う保険であり、
`revalidate` 宣言を消してはいけない。

> [!IMPORTANT]
> **microCMS を読むページを増やしたら、[`src/lib/revalidate-targets.ts`](../src/lib/revalidate-targets.ts)
> の対応表も同じコミットで更新すること。** 漏れてもエラーにはならず、そのページだけ静かに古いまま残る。
> ページ本体の import だけでなく、**そのページが描画する Server Component が読むデータも数える**
> （`/` の `SponsorBanner` や `FeaturedEvents` がその例）。

`revalidatePath` はパスの API ではなく**タグの API** である。次の3つはエラーにならず静かに no-op になる。

- `revalidatePath("/about")` — 実体は `/ja/about`。`["/[locale]/about", "page"]` と書く
- `revalidatePath("/events/[id]")` — 動的ルートには `type` が要る
- `revalidatePath("/sitemap.xml", "page")` — メタデータルートの派生タグは `/route`。`type` を付けない

**公開フラグ `NEXT_PUBLIC_*_VISIBLE` はビルド時評価であり、Webhook では切り替わらない。**
解禁作業には従来どおり再デプロイが要る。

### 下書きの確認（画面プレビュー）

microCMS の編集画面にある「画面プレビュー」から、**公開せずに本番と同じ詳細ページで下書きを確認できる**
（受け口は `src/app/api/draft/route.ts`、対象は `events` と `news`）。設計と運用は
[`docs/dev/draft-preview.md`](../docs/dev/draft-preview.md) を参照。

> [!IMPORTANT]
> **詳細ページで `cookies()` を無条件に呼んではいけない。** 呼んだ時点でルートが動的化し、
> `/events/[id]` などの SSG が失われる。`draftMode()` の `isEnabled` が false のときに
> 早期 return する順序（`src/lib/draft-mode.ts`）が静的生成を守っている。
> 同じ理由で **`draftKey` を `searchParams` で受け取ってはいけない。**

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

### キャンパスマップ（3Dは見送り）

**第97回では 3D マップを実装しません（2026-08-09 決定）。** フォールバックとして用意していた 2D マップを本採用しました。

- 実装箇所: アクセスページ `src/components/access/AccessPageContent.tsx`
- 内容: キャンパスマップ画像 + Google Maps 埋め込み + 最寄り駅からのルート案内
- 判断の詳細: `docs/requires/todo.md` の Phase 3「3Dマップ実装 — 見送り」

**新規に 3D 関連のコードを追加しないでください。** 第98回以降で再検討する場合は、`docs/requires/todo.md` の Phase 3「3Dマップ実装 — 見送り」節に打ち消し線で残してあるチェックリストを復活させたうえで判断してください。

`three` / `@react-three/fiber` はカラクリのギア演出（`src/components/three/`）用です。3Dマップとは無関係で、おすすめ企画セクションの背景装飾として稼働しています（2026-08-10 復活）。

- 読み込みは `next/dynamic` の `ssr: false`。クライアントチャンクは 860K（brotli 185K）で全チャンク中最大
- `EVENTS_VISIBLE=false` の間はセクションごと非表示のため、チャンクも読み込まれない
- モーション軽減設定時は `frameloop="demand"` でレンダーループごと停止する
- `@react-three/drei` は依存にあるが未使用

## ページ構成

```
/                           # トップページ (HOME)
├── /events                 # 企画を探す
│   ├── /                   # 企画検索・一覧
│   └── /[id]               # 企画詳細 [動的生成] ※type=special は /special/[id] へ誘導（下記の注意）
├── /special                # 著名人企画
│   ├── /                   # 一覧（現在は /special/[id] へ 302。下記の注意）
│   └── /[id]               # 著名人企画LP [動的生成]
├── /timetable              # タイムテーブル
├── /access                 # キャンパスマップ（2D）+ 交通アクセス
├── /info                   # インフォメーション
│   ├── /                   # お知らせ一覧
│   ├── /[id]               # お知らせ詳細 [動的生成]
│   ├── /guide              # ご来場の方へ
│   ├── /faq                # よくある質問
│   ├── /pamphlet           # パンフレットDL
│   └── /contact            # お問い合わせ
├── /about                  # 委員会・その他
│   ├── /                   # 委員長挨拶・理念
│   ├── /sponsors           # 協賛企業一覧
│   └── /privacy            # プライバシーポリシー
└── /[locale]               # 多言語ページ (en, zh, ko)
```

### リダイレクトと 404 — ルート直下に `loading.tsx` を置かないこと（重要）

**ページ内の `redirect()` / `notFound()` は現在ちゃんと HTTP ステータスに反映される。**
2026-09-19 の本番実測:

| URL                           | 返る値                                             |
| ----------------------------- | -------------------------------------------------- |
| `/events/special-event-mon7a` | **307** + `Location: /special/special-event-mon7a` |
| `/events/存在しないID`        | **404**                                            |
| `/special/存在しないID`       | **404**                                            |
| `/info/存在しないID`          | **404**                                            |

> [!WARNING]
> **かつてはそうではなかった。この性質はルート直下に `loading.tsx` を置いた瞬間に壊れる。**
> `src/app/loading.tsx` が存在した間、ストリーミングのシェルが先に送出されるため、
> ページのレンダリング中に投げた `redirect()` はステータスへ反映されず
> `<meta http-equiv="refresh" content="1;url=...">` へ格下げされていた（HTTP 200 + 1秒待ち）。
> `notFound()` も同様にソフト404になっていた。`export const dynamic = "force-dynamic"` を
> 足しても変わらなかった（2026-08-29 実測）。
>
> このファイルは **#217（`417e3a9`）が `/info/[id]` のソフト404 を直すために削除**した。
> **`/events/[id]` の 307 も、その巻き添えで一緒に直っている**（#127。当時は別件として
> 未解消のまま残されていた）。**ルート直下へ `loading.tsx` を戻すと、両方まとめて再発する。**

静的に決まる転送は、いまも `next.config.ts` の `redirects()` に置くのが正しい。
**動的ルートの照合より先に走る**ためで、`/97th/about` のような「`[locale]` に
飲み込まれて 200 で重複配信される」URL はこの層でしか塞げない。
リクエスト内容を見て決める転送は `src/proxy.ts`。
現在の転送一覧と設計判断は [`docs/dev/domain-migration.md`](../docs/dev/domain-migration.md) を参照。

> [!IMPORTANT]
> **`loading.tsx` の境界は `useSearchParams()` の bailout も飲み込む。** 境界を書き忘れた
> Client Component があると、エラーにならないまま**ページ本体が静的HTMLから丸ごと消える**
> （`/timetable` は #154、`/events` は #156）。**#148 は同じ `/timetable` でも別件**で、
> `height: 100%` が `0px` に解決される CSS の不具合であり bailout とは無関係である。
>
> **現存する `loading.tsx` は `src/app/events/(list)/loading.tsx` の1枚だけなので、
> この危険が残るのは `/events` である。** ルート直下の1枚が消えた後も、`/timetable` と
> `/events` はどちらも静的HTMLに本体が入っていることを実測で確認済み（2026-09-19）。
> **再発防止装置は3つある。** `eslint.config.mjs` の `no-restricted-imports`（fallback ツリーの
> 5ファイルが `useSearchParams` を import できない）、同じく `eslint.config.mjs` の
> `react-hooks/exhaustive-deps: "error"` と `no-restricted-syntax` の2本組
> （`EventInfiniteList.tsx` に限る。#239 で observer が張り直されず一覧が12件で止まった。
> **格上げだけでは足りない** — 打ち切り条件も依存配列も `hasMore` へ**揃えて**戻すと依存は
> 過不足なく揃うため `exhaustive-deps` は何も言わない。後者で効果と `useCallback` の中から
> `hasMore` を読むこと自体を禁じて塞いだ）、そして `pnpm build` の末尾へ連結した
> `scripts/assert-events-static-html.mjs`（`<Suspense>` 境界の消失と fallback の格下げを落とす。
> **`EVENTS_VISIBLE` が false の間はスキップし、true になると自動で有効化する**）。
> 判定方法・fallback の設計・実測値は
> [`docs/frontend/static-html-and-search-params.md`](../docs/frontend/static-html-and-search-params.md) を参照。

### 未知のロケールセグメントの扱い

`src/app/[locale]/` の `[locale]` は任意の文字列にマッチするため、放置すると
`/foo/about` や `/hoge/access` が 404 ではなく `/about`・`/access` と同じ内容を
200 で返す。

`src/app/[locale]/layout.tsx` の `export const dynamicParams = false;` で解決済み
（#128。`/foo/about`・`/hoge/access` がともに 404 を返すことを 2026-09-19 に実測）。
**レンダリングより前のルート照合で弾く**のが要点で、`notFound()` に頼るより確実である。`generateStaticParams` が返す4ロケール以外は、レンダリングより前の
ルート照合で 404 になる。**この宣言を外すと重複配信が再発する。**

なお `/en` `/zh` `/ko` 単体のURLは別問題（多言語トップページが無い）で、
引き続き 404 のまま。#35 で追跡。

## 主要機能

### トップページ (HOME)

- **起動時アニメーション**: GSAPタイムライン（`src/components/layout/Opener.tsx`）。
  デスクトップ（≥768px）かつ `prefers-reduced-motion` 未指定のときのみ、毎回表示。
  2フェーズ（濃紫背景＋白ロゴを見せる → レイヤーが下へ開く）、合計約1.6秒。
  完了を待たず 0.8秒地点で `opener-done` を発火して各ページの入場を始める。
  尺は `src/lib/motion.ts` に集約（WebM動画・sessionStorage を使う旧実装は 2026-02-19 に削除済み）
- **カウントダウン**: 開催日までのカウントダウン（日:時:分:秒）、開催中は「開催中！」バナー、終了後はお礼メッセージ
- **主要セクション**: メインビジュアル、著名人企画の告知、開催概要、News（最新3件）、おすすめ企画、協賛バナーエリア
- **著名人企画の告知**: `SpecialGuestSection`（`src/components/special/`）を Hero の直下に置く。
  `/events` の最下部でも `variant="sheet"` で同じコンポーネントを使う。
  背景は `.hero-about-bg` のグラデーションに任せるため持たせない（「デザイン仕様 > 背景グラデーション」を参照）

### 企画検索・一覧 (/events)

- **フィルター**: 日程（Day1/Day2/両日）、場所（建物番号）、カテゴリ（教室/ステージ/スペシャル）、キーワード
- **表示形式**: カード形式、サムネイル・タイトル・カテゴリバッジ・場所・日程
- **一覧は無限スクロール**（#239。ページ分割は撤去済み）。12件ずつ継ぎ足し、
  「もっと見る」ボタンを併設する。絞り込みは `position: sticky` で画面内に留める。
  `?page=N` は「N ページ目」ではなく**「N ページ分を展開して着地」**の意味になった。
  設計と実測は [`docs/frontend/events-infinite-scroll.md`](../docs/frontend/events-infinite-scroll.md) を参照

> [!IMPORTANT]
> **`EventsView` へページ分割済みの配列を渡してはいけない。** 表示範囲は
> `EventInfiniteList` が決める。呼び出し側で切ると、その先が永久に読めなくなる。
> **`<aside>` の `self-start` を外すと sticky が一度も貼り付かない**（grid の既定は
> `stretch` で高さが行全体まで伸びるため）。どちらも lint / 型 / テスト / build を
> すべて通過する。

### タイムテーブル (/timetable)

- **形式**: 縦型ガントチャート（縦軸: 時間、横軸: ステージ）
- **日程切替**: Day1 / Day2 タブ
- **ステージ切替**: ステージごとのタブ（7A, 7B, 体育館, ホール等）

### お問い合わせフォーム (/info/contact)

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
- カラーコントラスト比の確保（テーマカラー実配信値 `#bf73e3`。検証は必ず実配信値で行う）

### ブラウザ対応

- Chrome / Safari / Firefox / Edge（最新2バージョン）
- iOS Safari（**iOS 16.4 以上**）
- Android Chrome（最新）

下限を決めているのは自前のCSSではなく **TailwindCSS v4 自体**である。v4 は
`@property` と `color-mix()` に依存し、公式に Safari 16.4 / Chrome 111 /
Firefox 128 を要求する。本番CSSにも `@property` と `color-mix()` が実際に
出力されているため、これより古い環境ではレイアウトが崩れる。
下限を引き下げたい場合は TailwindCSS v3.4 へ戻す以外に方法はない。

View Transitions（Safari 18）、`text-wrap: balance`（Safari 17.5）、
`content-visibility`（Safari 18）は、非対応環境で演出や微調整が効かないだけの
プログレッシブエンハンスメントであり、下限には含めない。

## デザイン仕様

- **テーマカラー**: 実配信 `#bf73e3`（紫）。デザイン仕様値は HLC H319 / L64 / C70 = `#CD79EE` だが、
  `@theme` の oklch から Lightning CSS が出力するのは `#bf73e3` であり、**画面に出るのはこちら**。
  一次定義は `src/app/globals.css` の1箇所のみ。CSS が効かない3箇所（メールHTML・WebGL シェーダ・
  メタデータ文字列）だけ実配信 HEX を直書きしており、`@theme` を変更したら手で追従させること（#143）
- **レスポンシブ対応**: モバイルファースト設計
- **参考サイト**: https://sumitomoexpo.com/

### 背景グラデーション（`.hero-about-bg`）

トップページの Hero・著名人企画・ABOUT は、`src/app/page.tsx` の
`<div className="hero-about-bg">` が1枚のグラデーションでまとめて塗る。

**停止位置は `%` ではなく `svh` で持つこと。** `%` はこの要素の全高が基準になるため、
中のセクションが増減するたびに Hero 内の色が動く。実測（2026-08-29）では著名人企画を
Hero の直下へ入れた時点で要素高が 2004px → 3105px（390px 幅）へ伸び、Hero 下端の色が
primary-50 → primary-100 間の 64.9% から 26.7% まで後退した。

Hero は `h-[calc(100svh-var(--header-height))]` なので、`svh` で持てば
後続コンテンツの量から完全に独立する。`SPECIAL_VISIBLE=false` で著名人企画が
消えても Hero の見た目が変わらないのはこのため（実測の画素差: Hero 0/255、ABOUT 最大 3/255）。

このブロックへセクションを足し引きする場合は、`%` へ戻さずに
Hero 下端（`100svh - 5.5rem`）へ来る色で停止位置を判断すること。

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

| リスク               | 対策                                                      |
| -------------------- | --------------------------------------------------------- |
| 3Dマップの実装難易度 | **顕在化。2026-08-09 に見送りを決定し、2Dマップを本採用** |
| コンテンツ入稿の遅延 | ダミーデータで開発を進行、入稿スケジュールを明確化        |
| Vercel Free Plan制約 | ISR/SSGを活用し、サーバーレス関数の使用を最小化           |

## 参考リンク

- [Next.js 16 Documentation](https://nextjs.org/docs)
- [microCMS Documentation](https://document.microcms.io/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [GSAP Documentation](https://greensock.com/docs/)
- [React Three Fiber Documentation](https://docs.pmnd.rs/react-three-fiber)

---

**最終更新日**: 2026-09-06
