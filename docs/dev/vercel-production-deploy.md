# Vercel の本番反映

`main` へのマージが本番（`https://setagayafes.org`）へ出るまでの仕組みと、出なかったときの切り分け・復旧。
[ci-env.md](./ci-env.md) から分割した（2026-10-01）。環境変数の登録先は ci-env.md にある。

> [!IMPORTANT]
> **挙動は 2026-08 の途中で変わりました。手を動かす前に、まず sha 突き合わせで反映済みかどうかを確かめてください。** 手動 `redeploy` が必要なケースと不要なケースの両方があります。

## 現在の挙動（2026-08-27 以降の実測）

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

## 過去の挙動（2026-08-09 以前の実測。歴史的記録）

かつては Production が人手でしか作られず、遅延が push と無相関でした。**同じ症状が再発したときの判別材料として残します。**

| コミット  | Preview          | Production                      | 差       |
| --------- | ---------------- | ------------------------------- | -------- |
| `edcff2c` | 2026-08-02 16:15 | 2026-08-03 07:33                | 15時間後 |
| `f429d0d` | 2026-08-08 09:26 | 2026-08-08 09:44                | 17分後   |
| `c90f980` | 2026-08-09 21:53 | （作られないまま次の merge へ） | —        |
| `3f9f0fb` | 2026-08-09 22:12 | 2026-08-09 22:30                | 18分後   |

`c90f980` のように、**本番反映されないまま次のリリースに追い越される**ことがありました。

## 手順

1. **まず反映済みかを確かめる**（下記「完了判定」）。一致していれば何もしなくてよい
2. マージから数分待っても一致しない場合、**対処は2通りに分かれる**

| 状況                                                                               | 対処                                                                      |
| ---------------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| そのコミットの Production デプロイは**存在する**が内容が古い（環境変数を変えた等） | `vercel redeploy --target production`（`promote` は使わない。理由は後述） |
| そのコミットの Production デプロイが**存在しない**（Vercel の取りこぼし）          | 下記「取りこぼしからの復旧」                                              |
| そのコミットの Vercel ステータスが **`Deployment rate limited`**                   | 下記「デプロイ数の上限で止まったとき」。取りこぼしとは復旧手順が違う      |

> [!CAUTION]
> **`vercel redeploy` は取りこぼしの復旧には使えない。** 既存デプロイの**ソースを焼き直す**だけなので、
> デプロイが存在しないコミットを本番へ持って行けない。「再デプロイ」という語感で選ばないこと。

### 取りこぼしからの復旧

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

## デプロイ数の上限で止まったとき

**Hobby プランのデプロイは、アカウント全体で 24時間あたり 100 件まで。** 超えると Vercel はデプロイを作らず、
コミットの Vercel ステータスに `Deployment rate limited — retry in 24 hours.` を返す
（[Vercel の Limits](https://vercel.com/docs/limits) の「Deployments per day (Hobby)」。数えるのは Preview も Production も同じ）。

**2026-09-30 に実際に止まった。** 複数のセッションが PR を立て続けに出し、直近24時間のデプロイが
114 件（Preview 68 + Production 46）になった。23:22 JST のマージ（#367）以降、本番は直前の #364 のまま止まり、
Production Deploy Guard は2本続けて failure になった。

**Guard が落ちたら、まずコミットの Vercel ステータスの説明を読む。** 取りこぼしと上限は、GitHub 上では同じ
「Production デプロイが無い」に見えるが、復旧手順が違う。

```bash
gh api "repos/ManatoYamashita/tcu-setagayafes97-web/commits/<sha>/statuses" \
  --jq '[.[] | select(.context | test("Vercel"; "i")) | .description][0]'
# "Deployment rate limited — retry in 24 hours." なら上限。何も無ければ取りこぼし
```

**上限のときは待つ。ただし、いつ空くかは読めない。** 窓は 24時間のローリングだが、Vercel が実際に通すかどうかは
GitHub に残るデプロイの記録を数えても予測できなかった。2026-09-30〜10-01 の実例:

| コミット時刻（JST） | 出来事                                                                                              |
| ------------------- | --------------------------------------------------------------------------------------------------- |
| 09-30 23:22         | #367 のマージから `rate limited`。本番は #364 で止まる                                              |
| 09-30 23:24         | `docs/events-schema-open-time` の push が `rate limited`                                            |
| **09-30 23:38**     | **`feature/sponsors-logo-panel` の Preview は完了した**（上限の最中に通った）                       |
| 09-30 23:45         | `refactor/remove-visible-flags` の push が `rate limited`                                           |
| **10-01 00:27**     | **#373 のマージの Production が完了**（作成 00:27:56）。止まっていた #367 / #369 もこれで本番に出た |

GitHub の記録（直近24時間で 114 件）から見積もった「空く時刻」は 10-01 15:49 で、**実際より約15時間遅かった。**

**待ち方: 次のマージ（または push）の Vercel ステータスが通るかを見る。** 通れば `main` の先端が本番になり、
止まっていたマージもまとめて出る（Vercel はブランチの先端をデプロイするため）。

- **待っている間は push を控える。** push のたびに Preview が作られる
- 次のマージを待たずに本番を最新にしたいときだけ、「取りこぼしからの復旧」の手順（CLI）を試す。**その間にマージされた他の PR も一緒に出る**
- 上限に近いかは直近24時間の件数で分かる（空く時刻の予測には使えない）:
  `gh api --paginate "repos/ManatoYamashita/tcu-setagayafes97-web/deployments?per_page=100" --jq ".[] | select(.created_at >= \"$(date -u -v-24H +%FT%TZ)\") | .id" | wc -l`
- CLI の `vercel deploy --prod` がこの上限を受けるかは確認していない（2026-06-17 に
  [CLI 固有の上限は撤廃された](https://vercel.com/changelog/cli-deployment-limits-removed) が、1日100件の枠との関係は書かれていない）

**予防として、`docs/**` のブランチでは Vercel のデプロイを作らない**（`vercel.json`の`git.deploymentEnabled`）。
ドキュメントだけの PR は見た目の確認が要らず、ビルドは CI の `Build Check`が担う。`ignoreCommand`（Ignored Build Step）では節約にならない。**Vercel はビルドを始めてから中止するため、
中止したデプロイも1件として数える**（[Project settings](https://vercel.com/docs/project-configuration/project-settings) の
Ignored Build Step の注記）。`docs/` のブランチにコードの変更を混ぜると Preview が出ないので、コードは別のブランチにする。

## 完了判定

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

### 公開ドメインをポーリングしない

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

## `vercel promote` は使わない

> [!CAUTION]
> **`vercel promote` を本番反映に使ってはいけません。** `promote` は**再ビルドせず**エイリアスを張り替えるだけなので、**Preview 環境変数でビルドされた成果物が本番に出ます。**

本プロジェクトは同名の環境変数を環境ごとに別値で登録しています。`vercel env ls` の `environments` 列で確認できます。

| 変数                          | 登録状況                                           |
| ----------------------------- | -------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN`     | **Production と Preview で別行＝別値**             |
| `MICROCMS_API_KEY`            | Production, Preview で共有／Development は別       |
| `NEXT_PUBLIC_EVENTS_VISIBLE`  | **Preview のみ登録**（Production は未登録＝false） |
| `NEXT_PUBLIC_NEWS_VISIBLE`    | Production, Preview で共有                         |
| `NEXT_PUBLIC_SPECIAL_VISIBLE` | Production, Preview で共有                         |

`MICROCMS_SERVICE_DOMAIN` が環境別なので、`promote` すると **Preview の microCMS サービスから取得したコンテンツが本番に出ます。** 正しい操作は Production 環境変数での再ビルドです。

```bash
# main のマージコミットに対応する deployment URL を GitHub Deployments API から引く
DID=$(gh api "repos/<owner>/<repo>/deployments?per_page=5" --jq '.[] | select(.sha=="<main の sha>") | .id' | head -1)
gh api "repos/<owner>/<repo>/deployments/$DID/statuses" --jq '.[0].target_url'

# その deployment を Production ターゲットで再ビルドする
vercel redeploy <上で得た URL> --target production
```

過去の Production デプロイが「Preview の十数分後に別レコードとして現れる」のは、この再ビルドが行われているためです。

### `redeploy` は環境変数を「元デプロイの値」で再現する

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

## 公開ドメインの確認

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

## RELEASE PR のチェックリスト

`dev` → `main` の PR には次を含めてください。

1. merge 後に本番反映（`vercel redeploy --target production`）が必要である旨（**変動する sha は書かない。すぐ陳腐化する**）
2. 上記の完了判定コマンド
3. 公開ドメインが当該デプロイを指しているかの確認

## 関連ドキュメント

- [ci-env.md](./ci-env.md) - GitHub Actions / Vercel の環境変数と公開フラグ
- [staging-and-merge.md](./staging-and-merge.md) - マージ前チェックリスト
- `.github/workflows/production-deploy-guard.yml` - Production デプロイが作られたかを確かめる Guard

---

**最終更新日**: 2026-10-01（ci-env.md から分割し、デプロイ数の上限で止まったときの手順を追加。空く時刻は読めないことを実例で追記）
