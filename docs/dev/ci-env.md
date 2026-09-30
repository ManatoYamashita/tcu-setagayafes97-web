# GitHub Actions と Vercel の環境変数

CI/CD で使う環境変数の登録先と本番反映の確認方法をまとめる。

## Secrets と Variables

- Repository Secrets: `MICROCMS_SERVICE_DOMAIN`、`MICROCMS_API_KEY`。ビルドで microCMS を読むために必要。CI の `Build Check` が空データのまま成功していないかも確認する（#352）。
- Repository Variables: `NEXT_PUBLIC_URL`、必要に応じて `NEXT_PUBLIC_GTM_ID`。
- Vercel のみ: `MICROCMS_WEBHOOK_SECRET`、`MICROCMS_DRAFT_SECRET`。Route Handler がリクエスト時に読むため、GitHub Actions には渡さない。先に Vercel の Production・Preview に登録してから microCMS 側で Webhook と画面プレビューを設定する。

Secrets はログでマスクされる機密値、Variables は公開可能な値に使う。`MICROCMS_SERVICE_DOMAIN` と `MICROCMS_API_KEY` は **Repository secrets** に置く。`environment:` を宣言しない `Build Check` からは Environment secrets が空に見える（#352）。

| 変数                      | CI での参照                       | ローカルの例                            |
| ------------------------- | --------------------------------- | --------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN` | `secrets.MICROCMS_SERVICE_DOMAIN` | `MICROCMS_SERVICE_DOMAIN=setagayafes97` |
| `MICROCMS_API_KEY`        | `secrets.MICROCMS_API_KEY`        | `MICROCMS_API_KEY=xxxxx`                |
| `NEXT_PUBLIC_URL`         | `vars.NEXT_PUBLIC_URL`            | `NEXT_PUBLIC_URL=http://localhost:3000` |
| `NEXT_PUBLIC_GTM_ID`      | `vars.NEXT_PUBLIC_GTM_ID`（任意） | `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`        |

> [!IMPORTANT]
> `MICROCMS_WEBHOOK_SECRET` と `MICROCMS_DRAFT_SECRET` を GitHub Secrets や `feature-ci.yml` に追加しない。`src/app/api/revalidate/route.ts` と `src/app/api/draft/route.ts` がリクエスト時にだけ読み、ビルドには不要である。未設定でもビルドは通り、該当APIは実行時に500を返す。

> [!WARNING]
> `MICROCMS_WEBHOOK_SECRET` は microCMS の Webhook 作成前に Vercel へ登録する。未設定時の入稿は500で拒否され、microCMS は失敗した Webhook を再送しない。[再検証の手順](./content-revalidation.md)を参照。
> `MICROCMS_DRAFT_SECRET` も画面プレビュー設定前に登録する。未設定なら初回プレビューは500になり、再操作が必要になる。[プレビューの手順](./draft-preview.md)を参照。

企画・お知らせ・著名人企画・物販は、環境変数による表示の切り替えを廃止した。表示されるのは microCMS で公開済みのコンテンツである。公開前の内容は microCMS の下書きとして保存し、`/api/draft` で確認する。
著名人企画は契約上の解禁日より前に公開URLが露出しないよう、入稿時の公開状態を確認する。

廃止の理由は、環境間の登録漏れと `.env.local` の重複定義が、ビルド成功のまま公開状態を食い違わせたためである（#210 / #360）。今後もコンテンツの表示可否を `NEXT_PUBLIC_*` のスイッチで管理しない。
環境変数を追加・変更するときは、`.env.local` に同じキーを重複定義しない。`grep -oE "^[A-Z0-9_]+" .env.local | sort | uniq -d` で検出できる。

CI の `Build Check` は `.github/workflows/feature-ci.yml` から、microCMS の資格情報と `NEXT_PUBLIC_URL`・`NEXT_PUBLIC_GTM_ID` を渡す。同じリポジトリの push / PR では、先頭ステップが資格情報2本と `NEXT_PUBLIC_URL` の未登録を検出する。fork の PR では secrets が渡らないため、このステップを飛ばす（#352）。ローカルでは `.env.example` をもとに `.env.local` を用意する。新しい変数を追加するときは、読むタイミングを確認する。

| 読むタイミング | 登録先                                                                 |
| -------------- | ---------------------------------------------------------------------- |
| ビルド時       | `.env.example` / GitHub Variables または Secrets / Vercel / 本ファイル |
| リクエスト時   | `.env.example` / Vercel / 本ファイル                                   |

## 登録手順

GitHub: リポジトリの **Settings → Secrets and variables → Actions**。機密値は **Repository secrets**、公開設定値は **Repository variables** に登録する。

Vercel: **Settings → Environment Variables**。Production と Preview の値が異なる場合は、対象環境を確かめて登録する。`MICROCMS_WEBHOOK_SECRET` と `MICROCMS_DRAFT_SECRET` は microCMS 側の設定より先に登録する。

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

| 状況                                                                      | 対処                                                                      |
| ------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| そのコミットの Production デプロイは**存在する**が内容が古い              | `vercel redeploy --target production`（`promote` は使わない。理由は後述） |
| そのコミットの Production デプロイが**存在しない**（Vercel の取りこぼし） | 下記「取りこぼしからの復旧」                                              |

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

### `vercel promote` は使わない

> [!CAUTION]
> **`vercel promote` を本番反映に使ってはいけません。** `promote` は**再ビルドせず**エイリアスを張り替えるだけなので、**Preview 環境変数でビルドされた成果物が本番に出ます。**

本プロジェクトは microCMS の接続先を環境ごとに分けている。

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

**最終更新日**: 2026-09-30（公開フラグ廃止）
