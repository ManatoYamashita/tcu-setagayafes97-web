# GitHub Actions 環境変数管理

CI/CD ワークフローで使用する環境変数の管理方法と登録手順をまとめる。

## Secrets と Variables の使い分け

| 種別                     | 用途                   | 参照方法             | マスク            |
| ------------------------ | ---------------------- | -------------------- | ----------------- |
| **Repository Secrets**   | 機密情報（API キー等） | `${{ secrets.XXX }}` | ログに `***` 表示 |
| **Repository Variables** | 公開設定値（URL 等）   | `${{ vars.XXX }}`    | マスクなし        |

### 判断基準

- **Secrets にする**: 漏洩した場合にセキュリティリスクがあるもの
  - API キー、トークン、パスワード、サービスドメイン名
- **Variables にする**: 公開しても問題ないもの
  - サイト URL、GTM ID、フィーチャーフラグ

## 本プロジェクトの登録一覧

### Repository Secrets

| 変数名                    | 内容                      | 備考                      |
| ------------------------- | ------------------------- | ------------------------- |
| `MICROCMS_SERVICE_DOMAIN` | microCMS サービスドメイン | 例: `setagayafes97`       |
| `MICROCMS_API_KEY`        | microCMS API キー         | microCMS 管理画面から取得 |

### Repository Variables

| 変数名                              | 内容                           | 値の例                    | 登録値（2026-09-30 実測。本番と同じ） |
| ----------------------------------- | ------------------------------ | ------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_URL`                   | 本番サイト URL                 | `https://setagayafes.org` | `https://setagayafes.org`             |
| `NEXT_PUBLIC_GTM_ID`                | Google Tag Manager ID          | `GTM-XXXXXXX`             | 未登録（CI では計測タグを出さない）   |
| `NEXT_PUBLIC_EVENTS_VISIBLE`        | 企画情報の公開フラグ           | `false`                   | `true`                                |
| `NEXT_PUBLIC_NEWS_VISIBLE`          | お知らせ情報の公開フラグ       | `false`                   | `true`                                |
| `NEXT_PUBLIC_SPECIAL_VISIBLE`       | 著名人企画の公開フラグ         | `false`                   | `true`                                |
| `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` | 著名人企画の物販欄の公開フラグ | `false`                   | `false`                               |

> [!NOTE]
> **公開フラグは本番（Vercel Production）と同じ値にそろえる。** 違えば CI は本番と別のページを検査する（2026-09-30 まで NEWS / SPECIAL が未登録で、`/info` と `/special` を準備中の画面でビルドしていた）。
> **`Build Check` の先頭ステップは、`GTM_ID` 以外のこの表の変数と `MICROCMS_*` の2本が空なら落ちる**（#352）。フラグの切り替えは値の変更であって、削除ではない。

### Vercel のみに登録する変数（GitHub には登録しない）

| 変数名                    | 内容                                        | 登録先                                         |
| ------------------------- | ------------------------------------------- | ---------------------------------------------- |
| `MICROCMS_WEBHOOK_SECRET` | microCMS Webhook の署名検証用シークレット   | `.env.example` / Vercel（Production・Preview） |
| `MICROCMS_DRAFT_SECRET`   | microCMS 画面プレビューの認証用シークレット | `.env.example` / Vercel（Production・Preview） |

> [!IMPORTANT]
> **上記2つを GitHub Secrets と `feature-ci.yml` に登録してはいけない。**
> `src/app/api/revalidate/route.ts` と `src/app/api/draft/route.ts` が
> リクエスト受信時にしか読まないため、ビルドには一切不要である。
> 未設定でもビルドは通る（実行時に 500 を返す fail closed 設計）。
> **これは登録漏れではなく意図的な除外である。** 後から「他の microCMS 変数と揃っていない」と
> 判断して追加しないこと。CI に秘密情報を増やす理由がない。

> [!WARNING]
> **Vercel への登録は、microCMS 側で Webhook を作成する「前」に済ませること。**
> 順序を逆にすると、シークレット未設定の間の入稿が 500 で拒否される。
> **microCMS の Webhook は失敗しても再送されないため、その入稿の再検証は永久に失われる。**
> 詳細は [content-revalidation.md](./content-revalidation.md)。

> [!WARNING]
> **`MICROCMS_DRAFT_SECRET` も、microCMS 側で「画面プレビュー」を設定する「前」に登録すること。**
> 順序を逆にすると最初のプレビューが 500（`Draft preview is not configured.`）になる。
> こちらは Webhook と違って押し直せば済むが、原因が分からないまま設定を疑うことになる。
> 詳細は [draft-preview.md](./draft-preview.md)。

### フラグ以外の変数を追加したときの判断基準

| 読むタイミング                   | 登録先                                                             |
| -------------------------------- | ------------------------------------------------------------------ |
| ビルド時（`NEXT_PUBLIC_*` 等）   | `.env.example` / GitHub Variables or Secrets / Vercel / 本ファイル |
| リクエスト時（Route Handler 内） | `.env.example` / Vercel / 本ファイル（GitHub は不要）              |

## ワークフローでの参照例

```yaml
- name: Build project
  run: pnpm run build
  env:
    MICROCMS_SERVICE_DOMAIN: ${{ secrets.MICROCMS_SERVICE_DOMAIN }}
    MICROCMS_API_KEY: ${{ secrets.MICROCMS_API_KEY }}
    NEXT_PUBLIC_URL: ${{ vars.NEXT_PUBLIC_URL }}
    NEXT_PUBLIC_GTM_ID: ${{ vars.NEXT_PUBLIC_GTM_ID }}
    NEXT_PUBLIC_EVENTS_VISIBLE: ${{ vars.NEXT_PUBLIC_EVENTS_VISIBLE }}
    NEXT_PUBLIC_NEWS_VISIBLE: ${{ vars.NEXT_PUBLIC_NEWS_VISIBLE }}
    NEXT_PUBLIC_SPECIAL_VISIBLE: ${{ vars.NEXT_PUBLIC_SPECIAL_VISIBLE }}
    NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE: ${{ vars.NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE }}
```

## 登録手順

### Secrets の登録

1. GitHub リポジトリ → **Settings** → **Secrets and variables** → **Actions**
2. **Repository secrets** タブ → **New repository secret**（**Environment secrets に置かないこと。** `environment:` を宣言しないジョブからは空文字に見え、`Build Check` の先頭ステップで落ちる。#352）
3. Name と Value を入力して **Add secret**

### Variables の登録

1. GitHub リポジトリ → **Settings** → **Secrets and variables** → **Actions**
2. **Repository variables** タブ → **New repository variable**
3. Name と Value を入力して **Add variable**

## ローカル開発との対応

| CI 環境変数                              | ローカル (.env.local)                     |
| ---------------------------------------- | ----------------------------------------- |
| `secrets.MICROCMS_SERVICE_DOMAIN`        | `MICROCMS_SERVICE_DOMAIN=setagayafes97`   |
| `secrets.MICROCMS_API_KEY`               | `MICROCMS_API_KEY=xxxxx`                  |
| `vars.NEXT_PUBLIC_URL`                   | `NEXT_PUBLIC_URL=http://localhost:3000`   |
| `vars.NEXT_PUBLIC_GTM_ID`                | `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`          |
| `vars.NEXT_PUBLIC_EVENTS_VISIBLE`        | `NEXT_PUBLIC_EVENTS_VISIBLE=false`        |
| `vars.NEXT_PUBLIC_NEWS_VISIBLE`          | `NEXT_PUBLIC_NEWS_VISIBLE=false`          |
| `vars.NEXT_PUBLIC_SPECIAL_VISIBLE`       | `NEXT_PUBLIC_SPECIAL_VISIBLE=false`       |
| `vars.NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` | `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE=false` |

## コンテンツ公開フラグ

- `NEXT_PUBLIC_EVENTS_VISIBLE=false`: 企画一覧・タイムテーブルは準備中表示にし、トップのおすすめ企画・企画詳細URL・サイトマップの企画詳細URLを非公開にする。microCMS の企画データは取得しない。
- `NEXT_PUBLIC_NEWS_VISIBLE=false`: お知らせ一覧とトップの NEWS セクションは準備中表示にし、トップの最新ニュース・お知らせ詳細URL・サイトマップのお知らせ詳細URLを非公開にする。microCMS のお知らせデータは取得しない。
- `NEXT_PUBLIC_SPECIAL_VISIBLE=false`: 著名人企画（`type = special`）を全面的に非公開にする。`/special` は準備中表示になり、`/special/[id]` は生成されず 404。企画一覧・タイムテーブル・おすすめ企画・サイトマップからも `type = special` を除外し、著名人告知セクション（トップページの Hero 直下と `/events` の最下部の2箇所）も表示しない。
- `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE=false`: 著名人企画のプロフィール・出演情報・チケット等は維持したまま、`/special/[id]` の物販欄だけを非表示にする。
- いずれも `true` の場合のみ公開する。未設定または `true` 以外は安全側として非公開になる。
- ビルド時に評価されるため、値を変更した後は再ビルド・再デプロイが必要。

> [!IMPORTANT]
> **`NEXT_PUBLIC_EVENTS_VISIBLE` を `true` にすると、`/events` の静的HTML検査が自動で有効になる。**
> `scripts/assert-events-static-html.mjs`（`pnpm build` の末尾に連結）がフラグを見て分岐しており、
> `false` の間はスキップ、`true` になった瞬間から `pnpm build` の合否条件になる。
> **解禁作業のときに検査を足す必要は無い。**
>
> 逆に言えば、**解禁後は `/events` のページ本体が静的HTMLから消えるとデプロイが落ちる。**
> 落ちたときの原因と手順は
> [`../frontend/static-html-and-search-params.md`](../frontend/static-html-and-search-params.md)
> 「再発防止装置 その2」を参照（#156）。
>
> **このスクリプトは `@next/env` でフラグを解決する。** `next build` と同じ順序で
> `.env.production.local` → `.env.local` → `.env.production` → `.env` を読むため、
> 下表の「ローカル (.env.local)」でフラグを `true` にしても、ページとアサーションが
> 食い違うことはない。**素の `process.env` へ戻してはいけない。**

### EVENTS_VISIBLE と SPECIAL_VISIBLE の組み合わせ

**この2つは独立している。** 著名人の発表はチケット販売と紐づき、一般企画一覧の公開より先行することがあるため、別のフラグに分けている。

| `EVENTS_VISIBLE` | `SPECIAL_VISIBLE` | 挙動                                                                                           |
| ---------------- | ----------------- | ---------------------------------------------------------------------------------------------- |
| `false`          | `false`           | すべて準備中                                                                                   |
| `false`          | **`true`**        | **`/special` と `/events` の著名人セクションを公開。`/events` の一覧と `/timetable` は準備中** |
| `true`           | `false`           | `/events` `/timetable` は公開。**ただし `type = special` は除外**                              |
| `true`           | `true`            | すべて公開                                                                                     |

> [!WARNING]
> **著名人ページを先行公開するときは `getSpecialEvents()` / `getSpecialEventById()` を使うこと。**
> `getEventsList()` は `EVENTS_VISIBLE` が false の間 microCMS へ問い合わせず常に空を返すため、
> これを流用すると先行公開が成立しない。

> [!CAUTION]
> **著名人は解禁日が契約で決まっていることが多く、URL の先行露出が事故になる。**
> microCMS 側を下書きにするだけで済ませず、必ず `NEXT_PUBLIC_SPECIAL_VISIBLE` でも塞ぐこと。

> [!WARNING]
> **`EVENTS_VISIBLE=false` / `SPECIAL_VISIBLE=true` の組み合わせでは、`/events/[id]` → `/special/[id]` の誘導が働かない。**
> `src/app/events/[id]/page.tsx` は `getEventById()` の結果を見てから `type === "special"` を判定するが、
> `getEventById()` は `EVENTS_VISIBLE=false` の間 microCMS へ問い合わせず `null` を返すため、
> **リダイレクト判定に到達する前に `notFound()` へ落ちる。**
> 既に配布済みの `/events/{id}` URL がある場合、この組み合わせの間は誘導されず「企画が見つかりません」になる。
> 2026-08-17 に本番で実測（`/events/special-event-test` が `/special/...` へ転送されないことを確認）。

### フラグを追加したら登録先は4箇所

> [!IMPORTANT]
> **公開フラグの未設定はエラーにならず、黙って `false`（非公開）になる。** 安全側デフォルトである代わりに、**登録漏れが「仕様どおりの準備中表示」と見分けられない。** 追加時は下記4箇所すべてを埋めること。

| #   | 登録先                                       | 目的                                     |
| --- | -------------------------------------------- | ---------------------------------------- |
| 1   | `.env.example`                               | 新規参加者が `.env.local` を作れるように |
| 2   | GitHub Repository Variables                  | CI のビルドチェック                      |
| 3   | Vercel Environment Variables（Prod/Preview） | 実際のデプロイ                           |
| 4   | 本ファイルの登録一覧・対応表                 | 追跡可能性                               |

#### 実例：`NEXT_PUBLIC_SPECIAL_VISIBLE` の登録漏れ（2026-08-17）

`SPECIAL_VISIBLE` はコードにも本ファイルにも記載済みだったが、**`.env.example` と Vercel の双方から欠落していた。** ローカル `.env.local` にだけ `true` が入っていたため、次の状態になっていた。

| 環境                     | `SPECIAL_VISIBLE` | `/special` の実際の表示  |
| ------------------------ | ----------------- | ------------------------ |
| ローカル（`.env.local`） | `true`            | 著名人企画が見える       |
| Vercel Production        | **未登録＝false** | **準備中 / Coming Soon** |

**「手元で見えている」を本番の状態だと思い込んだのが原因。** 実行委員へ本番URLを共有する直前に発覚した。

登録状況とビルド成果物は必ず実測で確認する。

```bash
# 3箇所の登録を突き合わせる
grep -n VISIBLE .env.example
gh variable list                       # GitHub Repository Variables
vercel env ls | grep VISIBLE           # environments 列に Production があるか

# ビルド成果物で最終確認（環境変数はビルド時に埋め込まれるため、再デプロイ後に見る）
curl -s <deployment url>/special | grep -o '準備中'   # 何も出なければ公開されている
```

#### 実例：`.env.local` 内の二重定義（2026-08-30）

同じ `.env.local` に `NEXT_PUBLIC_SPECIAL_VISIBLE` が2回書かれていた。

```
NEXT_PUBLIC_SPECIAL_VISIBLE=false      # フラグをまとめたブロック内
...
# 著名人企画LPのローカル確認用（#70 / #71）
NEXT_PUBLIC_SPECIAL_VISIBLE=true       # ファイル末尾に後から追記
```

**dotenv も Next.js の env ローダーも後勝ちなので、実効値は `true`。前の行は黙って死ぬ。** 警告もエラーも出ない。
上のブロックだけを見た人は「非公開のはず」と読み、実際には公開されている状態を見落とす。前節の登録漏れと逆向きの、同じ種類の事故である。

一時的にフラグを切り替えたいときは、**既存の行の値を書き換える**こと。末尾に追記して上書きしない。

```bash
# 二重定義の検出（同じキーが2回以上出たら重複）
grep -oE "^[A-Z0-9_]+" .env.local | sort | uniq -d
```

## Vercel の本番反映

**[vercel-production-deploy.md](./vercel-production-deploy.md) に分割した**（2026-10-01）。
本番反映の判定、取りこぼしからの復旧、デプロイ数の上限で止まったときの手順はそちらにある。

## 注意事項

- Secrets は一度登録すると値の確認ができない（再設定は可能）。Vercel の Sensitive 変数も `vercel env pull` では空で返るため、本番の値と照合できない
- Variables はいつでも値の確認・編集が可能
- `NEXT_PUBLIC_` プレフィックスの変数はクライアントサイドに公開される（Next.js の仕様）
- Vercel デプロイ時は Vercel の Environment Variables で別途管理（Settings → Environment Variables）

## 関連ドキュメント

- [docs/dev/git.md](./git.md) — ブランチ戦略と CI/CD ワークフロー
- `.github/workflows/feature-ci.yml` — Static Checks（Lint / Format / 型 / ユニットテスト /
  ドキュメントの相対リンク）、Layout E2E、Build Check
- `.github/workflows/production-deploy-guard.yml` — `main` への push で Production デプロイの作成を確認

---

**最終更新日**: 2026-09-30
