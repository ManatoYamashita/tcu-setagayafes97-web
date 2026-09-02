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

| 変数名                              | 内容                           | 値の例                    | 登録状況（2026-08-17 実測） |
| ----------------------------------- | ------------------------------ | ------------------------- | --------------------------- |
| `NEXT_PUBLIC_URL`                   | 本番サイト URL                 | `https://setagayafes.org` | **登録済み**                |
| `NEXT_PUBLIC_GTM_ID`                | Google Tag Manager ID          | `GTM-XXXXXXX`             | 未登録                      |
| `NEXT_PUBLIC_EVENTS_VISIBLE`        | 企画情報の公開フラグ           | `false`                   | 未登録                      |
| `NEXT_PUBLIC_NEWS_VISIBLE`          | お知らせ情報の公開フラグ       | `false`                   | 未登録                      |
| `NEXT_PUBLIC_SPECIAL_VISIBLE`       | 著名人企画の公開フラグ         | `false`                   | 未登録                      |
| `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` | 著名人企画の物販欄の公開フラグ | `false`                   | 未登録                      |

> [!NOTE]
> **この表は「登録すべきもの」であって、現状の登録一覧ではない。** `gh variable list` で確認できるのは `NEXT_PUBLIC_URL` のみ。
> CI（`feature-ci.yml`）は Lint / Format / Build の検証だけなので、公開フラグが未登録でも **`false` としてビルドが通る**。
> **つまり CI が緑でも、公開状態のページがビルドできることは何も検証していない。**

### Vercel のみに登録する変数（GitHub には登録しない）

| 変数名                    | 内容                                      | 登録先                                         |
| ------------------------- | ----------------------------------------- | ---------------------------------------------- |
| `MICROCMS_WEBHOOK_SECRET` | microCMS Webhook の署名検証用シークレット | `.env.example` / Vercel（Production・Preview） |

> [!IMPORTANT]
> **`MICROCMS_WEBHOOK_SECRET` を GitHub Secrets と `feature-ci.yml` に登録してはいけない。**
> `src/app/api/revalidate/route.ts` がリクエスト受信時にしか読まないため、ビルドには一切不要である。
> 未設定でもビルドは通る（実行時に 500 を返す fail closed 設計）。
> **これは登録漏れではなく意図的な除外である。** 後から「他の microCMS 変数と揃っていない」と
> 判断して追加しないこと。CI に秘密情報を増やす理由がない。

> [!WARNING]
> **Vercel への登録は、microCMS 側で Webhook を作成する「前」に済ませること。**
> 順序を逆にすると、シークレット未設定の間の入稿が 500 で拒否される。
> **microCMS の Webhook は失敗しても再送されないため、その入稿の再検証は永久に失われる。**
> 詳細は [content-revalidation.md](./content-revalidation.md)。

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
2. **Repository secrets** タブ → **New repository secret**
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

> [!IMPORTANT]
> **挙動は 2026-08 の途中で変わりました。手を動かす前に、まず sha 突き合わせで反映済みかどうかを確かめてください。** 手動 `redeploy` が必要なケースと不要なケースの両方があります。

### 現在の挙動（2026-08-27 以降の実測）

**`main` へのマージコミットは、約1分以内に自動で Production になります。**

| マージコミット | main への時刻（UTC）    | Production 作成（UTC） | 差    |
| -------------- | ----------------------- | ---------------------- | ----- |
| `d8fb83f`      | 2026-08-27 04:34        | 2026-08-27 04:34:50    | 即時  |
| `db497f6`      | 2026-08-27 04:59        | 2026-08-27 05:00:16    | 約1分 |
| `70db2dd`      | 2026-08-29 05:27:37     | 2026-08-29 05:28:23    | 46秒  |
| `b95ef11`      | 2026-08-29 05:32:49     | 2026-08-29 05:33:42    | 53秒  |
| `a950d40`      | 2026-08-29 09:35:14     | 2026-08-29 09:36:39    | 85秒  |
| `5318b52`      | 2026-08-29 09:54:15     | 2026-08-29 09:55:00    | 45秒  |
| `f37e27e`      | 2026-08-30 09:48        | 2026-08-30 09:48:52    | 即時  |
| **`ee1c9fb`**  | **2026-08-30 10:01:30** | **作られなかった**     | **—** |
| `938db52`      | 2026-09-02 08:59        | 2026-09-02 08:59:43    | 約1分 |
| `03d987a`      | 2026-09-02 10:07:56     | 2026-09-02 10:08:47    | 51秒  |

> [!WARNING]
> **`ee1c9fb`（PR #147）は Production デプロイが一度も作られなかった。**
> 40分待っても現れず、`git-main` エイリアスも古いビルドを配信し続けていた。
>
> **GitHub 上は CI 緑・マージ済みで、異常を示すものが何も無い。** Vercel 側にも
> 「失敗したデプロイ」ではなく**記録そのものが無い**ため、デプロイ一覧を見ても気づけない。
> 発覚したのは、たまたま本番の応答を `curl` で確かめたからである。
>
> 前後7件のマージを突き合わせた結果、落ちたのはこの1件だけだった。設定不良ではなく
> **webhook 配信の単発失敗**と見られる。原因はリポジトリ側から手の届かない領域にある（#152）。

**この取りこぼしは `.github/workflows/production-deploy-guard.yml` が自動で検知する。**
`main` への push ごとに、そのコミットの Production デプロイが作られたかを最大5分間確認し、
現れなければ CI を失敗させる。**沈黙したまま進む状態は解消されている**ので、
以下の手動確認は Guard が落ちたとき、あるいは Guard 導入前のコミットを追うときに使う。

Production が作られるのは**マージコミットに対してだけ**です。そのマージに含まれる個々のコミット（`3530cd4` など）には Production デプロイは作られません。Vercel はブランチ先端をデプロイするためで、正常な挙動です。

### 過去の挙動（2026-08-09 以前の実測。歴史的記録）

かつては Production が人手でしか作られず、遅延が push と無相関でした。**同じ症状が再発したときの判別材料として残します。**

| コミット  | Preview          | Production                      | 差       |
| --------- | ---------------- | ------------------------------- | -------- |
| `edcff2c` | 2026-08-02 16:15 | 2026-08-03 07:33                | 15時間後 |
| `f429d0d` | 2026-08-08 09:26 | 2026-08-08 09:44                | 17分後   |
| `c90f980` | 2026-08-09 21:53 | （作られないまま次の merge へ） | —        |
| `3f9f0fb` | 2026-08-09 22:12 | 2026-08-09 22:30                | 18分後   |

`c90f980` のように、**本番反映されないまま次のリリースに追い越される**ことがありました。

### 手順

1. **まず反映済みかを確かめる**（下記「完了判定」）。一致していれば何もしなくてよい
2. マージから数分待っても一致しない場合、**対処は2通りに分かれる**

| 状況                                                                               | 対処                                                                      |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| そのコミットの Production デプロイは**存在する**が内容が古い（環境変数を変えた等） | `vercel redeploy --target production`（`promote` は使わない。理由は後述） |
| そのコミットの Production デプロイが**存在しない**（Vercel の取りこぼし）          | 下記「取りこぼしからの復旧」                                              |

> [!CAUTION]
> **`vercel redeploy` は取りこぼしの復旧には使えない。** 既存デプロイの**ソースを焼き直す**だけなので、
> デプロイが存在しないコミットを本番へ持って行けない。「再デプロイ」という語感で選ばないこと。

#### 取りこぼしからの復旧

`origin/main` をクリーンなワークツリーへ取り出し、CLI からビルドする。
**手元の作業ツリーを使ってはいけない**（未コミットの変更が本番へ出る）。

```bash
TMP=$(mktemp -d)
git fetch origin main
git worktree add --detach "$TMP" origin/main
cp -R .vercel "$TMP/.vercel"          # プロジェクトのリンク情報を引き継ぐ
vercel deploy --prod --yes --cwd "$TMP"
git worktree remove --force "$TMP"
```

`--prod` を付ければ production alias（`setagayafes.org`）まで張られる。
確認として `vercel promote <url>` を叩くと `already the current production deployment (409)` が返る。
**この 409 は失敗ではなく、既に本番になっていることの証拠である。**

> [!NOTE]
> CLI デプロイは production alias を取るが、**`git-main` エイリアスは古いまま残る。**
> 次に git 経由の Production デプロイが走れば自然に解消する。公開ドメインの配信には影響しない。
>
> **`main` へ空コミットを push して再発火させる方法は使えない。** ブランチ戦略で
> `main` への直接 push を禁止している（`.claude/CLAUDE.md`）。

> [!CAUTION]
> **「merge したから本番に出ている」とも「merge しても本番には出ない」とも思い込まないでください。** どちらの前提も過去に外れています。毎回 sha で確かめるのが唯一の正解です。

### 完了判定

CI の緑は Preview ビルドの成功を意味するだけです。**本番反映は sha の一致で判定してください。**

```bash
# この2つが一致していれば本番反映済み
gh api "repos/ManatoYamashita/tcu-setagayafes97-web/deployments?environment=Production&per_page=1" --jq '.[0].sha'
git ls-remote origin refs/heads/main | cut -f1
```

`vercel ls <project> --prod` でも Production デプロイの履歴を確認できます。`vercel inspect <url>` の `target` が `production` かどうかが正準です。

**sha が一致していても、それは「そのコミットのデプロイが存在する」ことしか示しません。** 意図した変更が実際に出ているかは、公開ドメインの実応答で確かめてください。

```bash
# 変更したマークアップが本番に出ているか
curl -sL https://setagayafes.org/ | grep -o 'class="[^"]*sponsors[^"]*"'

# CSS の変更は配信チャンクの実体で見る（複数チャンクに分割されるため全件を走査する）
curl -sL https://setagayafes.org/ | grep -oE '/_next/static/[^"]+\.css' | sort -u | while read -r c; do
  curl -s "https://setagayafes.org$c" | grep -o '<探している規則>'
done
```

CSS チャンクは複数に分割され、**探している規則は1本にしか入っていません。** 1ファイルだけ見て「無い」と判断すると誤検証になります。

#### 公開ドメインをポーリングしない

> [!CAUTION]
> **反映を待つつもりで `curl` を連続して叩かないでください。** Vercel の bot 対策が発動し、
> `x-vercel-mitigated: challenge`（Vercel Security Checkpoint）が **403** で返るようになります。
> **ヘッドレスブラウザでも JS challenge は通過できません**（`agent-browser` でもページタイトルが
> `Vercel Security Checkpoint` のまま止まります）。**サイト障害と見分けがつかず、確認手段を失います。**

2026-08-29、40 回ループで `curl https://setagayafes.org/` を叩いて実際に踏みました。
上表のとおり Production 作成までは **45〜85 秒**です。**1〜2 分待って 1 回だけ**確認してください。

踏んでしまった場合は、Production デプロイの直接 URL を使えば確認できます。
challenge が掛かるのは独自ドメイン側だけです。

```bash
DEP=$(gh api "repos/ManatoYamashita/tcu-setagayafes97-web/deployments?environment=Production&per_page=1" --jq '.[0].id')
URL=$(gh api "repos/ManatoYamashita/tcu-setagayafes97-web/deployments/$DEP/statuses" --jq '.[0].environment_url')
curl -sL "$URL" | grep -o '<探しているマークアップ>'
```

独自ドメイン側の challenge も数分で自然に解除されます。

> [!WARNING]
> **本ファイルの登録状況の表と実例は、いずれも記載時点のスナップショットです。**
> 「2026-08-17 実測」「実例：…の登録漏れ（2026-08-17）」を**現在の状態と読まないでください。**
> フラグが今どうなっているかは、公開ドメインの実応答でしか確定しません。
>
> ```bash
> curl -sL https://setagayafes.org/special | grep -c 準備中   # 0 なら公開済み
> ```

### `vercel promote` は使わない

> [!CAUTION]
> **`vercel promote` を本番反映に使ってはいけません。** `promote` は**再ビルドせず**エイリアスを張り替えるだけなので、**Preview 環境変数でビルドされた成果物が本番に出ます。**

本プロジェクトは同名の環境変数を環境ごとに別値で登録しています。`vercel env ls` の `environments` 列で確認できます。

| 変数                          | 登録状況                                     |
| ----------------------------- | -------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN`     | **Production と Preview で別行＝別値**       |
| `MICROCMS_API_KEY`            | Production, Preview で共有／Development は別 |
| `NEXT_PUBLIC_EVENTS_VISIBLE`  | Production, Preview で共有                   |
| `NEXT_PUBLIC_NEWS_VISIBLE`    | Production, Preview で共有                   |
| `NEXT_PUBLIC_SPECIAL_VISIBLE` | Production, Preview で共有                   |

`MICROCMS_SERVICE_DOMAIN` が環境別なので、`promote` すると **Preview の microCMS サービスから取得したコンテンツが本番に出ます。** 正しい操作は Production 環境変数での再ビルドです。

```bash
# main のマージコミットに対応する deployment URL を GitHub Deployments API から引く
DID=$(gh api "repos/<owner>/<repo>/deployments?per_page=5" --jq '.[] | select(.sha=="<main の sha>") | .id' | head -1)
gh api "repos/<owner>/<repo>/deployments/$DID/statuses" --jq '.[0].target_url'

# その deployment を Production ターゲットで再ビルドする
vercel redeploy <上で得た URL> --target production
```

過去の Production デプロイが「Preview の十数分後に別レコードとして現れる」のは、この再ビルドが行われているためです。

#### `redeploy` は環境変数を「元デプロイの値」で再現する

> [!CAUTION]
> **`vercel redeploy` は元デプロイの環境変数スナップショットを再利用します。** 再ビルドはしますが、**再ビルド後に変更した環境変数は反映されません。** `redeploy` は「過去のデプロイを再現する」ためのコマンドだからです。

実測です。`NEXT_PUBLIC_URL` を Production で更新したあと、更新前に作られた deployment を `redeploy --target production` したところ、ビルドは走ったのに `robots.txt` の `Sitemap:` 行は**古い値のまま**でした。`vercel env pull --environment=production` で確認すると、変数自体は新しい値になっていました。

`NEXT_PUBLIC_*` はビルド時にバンドルへ埋め込まれるため、この差は静的な出力にそのまま残ります。

**環境変数を変えたときは、変更後に作られた deployment を対象にしてください。**

| 状況                       | 正しい手順                                                           |
| -------------------------- | -------------------------------------------------------------------- |
| コードだけ変わった         | main のマージコミットの deployment を `redeploy --target production` |
| **環境変数を変えた**       | **変更後に新しい commit を push し、その deployment を redeploy**    |
| 変更を反映したか確かめたい | `curl -s <deployment url>/robots.txt \| grep Sitemap` で実出力を見る |

### 公開ドメインの確認

> [!IMPORTANT]
> **`vercel redeploy` の出力に出る `Aliased: https://...` は、そのドメインが実際にこのデプロイを指していることを保証しません。** DNS が Vercel を向いていなければエイリアスは実効しません。

Vercel の表示を信じず、実際の応答で確認してください。

```bash
# リダイレクトを追跡して最終的な到達先を見る
curl -s -o /dev/null -L -w "%{http_code} %{url_effective} (ip=%{remote_ip})\n" https://<公開ドメイン>

# server ヘッダが Vercel でなければ、DNS は別のホストを向いている
curl -sI https://<公開ドメイン> | grep -iE "^(server|location):"
```

`NEXT_PUBLIC_URL` に設定したホストが**そもそも名前解決できるか**も確認します。解決できないと `robots.txt` の `Sitemap:` 行、`sitemap.xml`、OGP・canonical のすべてが存在しないホストを指します。

```bash
# 環境が dig / host を禁止している場合は公開 DoH で引く（Status=3 は NXDOMAIN）
curl -s "https://dns.google/resolve?name=<host>&type=A" | python3 -m json.tool
```

`NEXT_PUBLIC_URL` の値そのものは、本番デプロイの `robots.txt` から読み取れます。

```bash
curl -s https://<production deployment url>/robots.txt | grep Sitemap
```

### RELEASE PR のチェックリスト

`dev` → `main` の PR には次を含めてください。

1. merge 後に本番反映（`vercel redeploy --target production`）が必要である旨（**変動する sha は書かない。すぐ陳腐化する**）
2. 上記の完了判定コマンド
3. 公開ドメインが当該デプロイを指しているかの確認

## 注意事項

- Secrets は一度登録すると値の確認ができない（再設定は可能）
- Variables はいつでも値の確認・編集が可能
- `NEXT_PUBLIC_` プレフィックスの変数はクライアントサイドに公開される（Next.js の仕様）
- Vercel デプロイ時は Vercel の Environment Variables で別途管理（Settings → Environment Variables）

## 関連ドキュメント

- [docs/dev/git.md](./git.md) — ブランチ戦略と CI/CD ワークフロー
- `.github/workflows/feature-ci.yml` — Lint / Format / Build の検証
- `.github/workflows/production-deploy-guard.yml` — `main` への push で Production デプロイの作成を確認

---

**最終更新日**: 2026-09-02
