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

| 変数名                              | 内容                               | 値の例                    | 登録状況（2026-08-17 実測） |
| ----------------------------------- | ---------------------------------- | ------------------------- | --------------------------- |
| `NEXT_PUBLIC_URL`                   | 本番サイト URL                     | `https://setagayafes.org` | **登録済み**                |
| `NEXT_PUBLIC_GTM_ID`                | Google Tag Manager ID              | `GTM-XXXXXXX`             | 未登録                      |
| `NEXT_PUBLIC_EVENTS_VISIBLE`        | 企画情報の公開フラグ               | `false`                   | 未登録                      |
| `NEXT_PUBLIC_NEWS_VISIBLE`          | お知らせ情報の公開フラグ           | `false`                   | 未登録                      |
| `NEXT_PUBLIC_SPECIAL_VISIBLE`       | 著名人企画の公開フラグ             | `false`                   | 未登録                      |
| `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` | 著名人企画LPの物販明細の公開フラグ | `false`                   | **登録済み**（2026-08-23）  |

> [!NOTE]
> **この表は「登録すべきもの」であって、現状の登録一覧ではない。** `gh variable list` で確認できるのは `NEXT_PUBLIC_URL` と `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` のみ（2026-08-23 実測）。**`EVENTS` / `NEWS` / `SPECIAL` の3フラグは GitHub 側が未登録のまま。**
> CI（`feature-ci.yml`）は Lint / Format / Build の検証だけなので、公開フラグが未登録でも **`false` としてビルドが通る**。
> **つまり CI が緑でも、公開状態のページがビルドできることは何も検証していない。**

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
- `NEXT_PUBLIC_SPECIAL_VISIBLE=false`: 著名人企画（`type = special`）を全面的に非公開にする。`/special` は準備中表示になり、`/special/[id]` は生成されず 404。企画一覧・タイムテーブル・おすすめ企画・サイトマップからも `type = special` を除外する。
- `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE=false`: 著名人企画LPの物販セクションを「グッズ販売予定」のプレースホルダー表示にする。商品テーブルと物販の補足（`goodsNote`）は **HTML に一切出力されない**ため、解禁前に商品名・価格が漏れることはない。ページ自体は公開されたまま。
- いずれも `true` の場合のみ公開する。未設定または `true` 以外は安全側として非公開になる。
- ビルド時に評価されるため、値を変更した後は再ビルド・再デプロイが必要。

### EVENTS_VISIBLE と SPECIAL_VISIBLE の組み合わせ

**この2つは独立している。** 著名人の発表はチケット販売と紐づき、一般企画一覧の公開より先行することがあるため、別のフラグに分けている。

| `EVENTS_VISIBLE` | `SPECIAL_VISIBLE` | 挙動                                                              |
| ---------------- | ----------------- | ----------------------------------------------------------------- |
| `false`          | `false`           | すべて準備中                                                      |
| `false`          | **`true`**        | **`/special` のみ公開。`/events` `/timetable` は準備中**          |
| `true`           | `false`           | `/events` `/timetable` は公開。**ただし `type = special` は除外** |
| `true`           | `true`            | すべて公開                                                        |

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

### SPECIAL_VISIBLE と SPECIAL_GOODS_VISIBLE の従属関係

**この2つは独立ではない。`SPECIAL_GOODS_VISIBLE` は `SPECIAL_VISIBLE` に従属する。** LP そのものが 404 なら物販フラグは評価される機会がない。

| `SPECIAL_VISIBLE` | `SPECIAL_GOODS_VISIBLE` | 挙動                                                   |
| ----------------- | ----------------------- | ------------------------------------------------------ |
| `false`           | 任意                    | `/special/[id]` は 404。**物販フラグは無効**           |
| `true`            | `false`                 | LP は公開。物販セクションは「グッズ販売予定」のみ表示  |
| `true`            | `true`                  | 物販セクションは商品テーブル＋補足を表示（従来どおり） |

分けている理由は、著名人の出演自体の解禁とグッズ詳細の確定が別のタイミングで来るため。第97回では「出演は発表できるが、グッズの商品名・価格はまだ出せない」という状態が実際に発生した（2026-08-23 クライアント依頼）。

> [!NOTE]
> **`goods` を microCMS に入稿しても、このフラグが `false` の間は表示されない。**
> 逆に、フラグが `true` でも `goods` が空なら物販セクションごと出力されない（物販を行わない企画のため）。
> 「入稿したのに出ない」ときは、まずこのフラグを疑うこと。`microcms/README.md` にも同じ注意書きがある。

### フラグを追加したら登録先は7箇所

> [!IMPORTANT]
> **公開フラグの未設定はエラーにならず、黙って `false`（非公開）になる。** 安全側デフォルトである代わりに、**登録漏れが「仕様どおりの準備中表示」と見分けられない。** 追加時は下記7箇所すべてを埋めること。

> [!CAUTION]
> **この一覧はかつて「4箇所」だったが、実際には足りていなかった。** 外部サービス側（GitHub / Vercel）とドキュメントだけを数えており、**フラグを機能させるコード本体（`src/data/site.ts`）と CI のワークフロー定義が抜けていた。** `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` の追加時（2026-08-23）に発覚し、7箇所へ改めた。

| #   | 登録先                                       | 種別       | 目的                                                                                              |
| --- | -------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------- |
| 1   | `src/data/site.ts`                           | コード     | `=== "true"` で評価する `const` を export する                                                    |
| 2   | 参照する側のコンポーネント／ページ           | コード     | フラグを実際に分岐へ繋ぐ（**ここまでやって初めて動く**）                                          |
| 3   | `.env.example`                               | リポジトリ | 新規参加者が `.env.local` を作れるように                                                          |
| 4   | `.github/workflows/feature-ci.yml`           | CI         | `Build project` ステップの `env` へ追加。**書かないと `vars` に登録しても CI のビルドへ渡らない** |
| 5   | `README.md` の「コンテンツ公開フラグ」表     | リポジトリ | 一覧性                                                                                            |
| 6   | GitHub Repository Variables                  | 外部       | CI のビルドチェック                                                                               |
| 7   | Vercel Environment Variables（Prod/Preview） | 外部       | 実際のデプロイ                                                                                    |

本ファイルの登録一覧・対応表（Repository Variables / ワークフロー参照例 / ローカル対応表 / Vercel 環境変数）も併せて更新すること。

#### 実例：`NEXT_PUBLIC_SPECIAL_VISIBLE` の登録漏れ（2026-08-17）

`SPECIAL_VISIBLE` はコードにも本ファイルにも記載済みだったが、**`.env.example` と Vercel の双方から欠落していた。** ローカル `.env.local` にだけ `true` が入っていたため、次の状態になっていた。

| 環境                     | `SPECIAL_VISIBLE` | `/special` の実際の表示  |
| ------------------------ | ----------------- | ------------------------ |
| ローカル（`.env.local`） | `true`            | 著名人企画が見える       |
| Vercel Production        | **未登録＝false** | **準備中 / Coming Soon** |

**「手元で見えている」を本番の状態だと思い込んだのが原因。** 実行委員へ本番URLを共有する直前に発覚した。

登録状況とビルド成果物は必ず実測で確認する。

```bash
# リポジトリ内の4箇所を突き合わせる（行数が揃わなければどこかが漏れている）
grep -c VISIBLE .env.example
grep -c 'VISIBLE: boolean' src/data/site.ts
grep -c VISIBLE .github/workflows/feature-ci.yml
grep -c NEXT_PUBLIC_.*_VISIBLE README.md

# 外部2箇所
gh variable list                       # GitHub Repository Variables
vercel env ls | grep VISIBLE           # environments 列に Production があるか

# ビルド成果物で最終確認（環境変数はビルド時に埋め込まれるため、再デプロイ後に見る）
curl -s <deployment url>/special | grep -o '準備中'   # 何も出なければ公開されている
```

## Vercel の本番反映は手動

> [!IMPORTANT]
> **`main` へ merge しても Production デプロイは作られません。** 作られるのは Preview だけで、Production は人手で作る運用です。**「merge したから本番に出ている」と思い込まないでください。**
>
> 操作は `vercel promote` **ではなく** `vercel redeploy --target production` です（理由は後述）。

実測した挙動です。

| コミット  | Preview          | Production                      | 差       |
| --------- | ---------------- | ------------------------------- | -------- |
| `edcff2c` | 2026-08-02 16:15 | 2026-08-03 07:33                | 15時間後 |
| `f429d0d` | 2026-08-08 09:26 | 2026-08-08 09:44                | 17分後   |
| `c90f980` | 2026-08-09 21:53 | （作られないまま次の merge へ） | —        |
| `3f9f0fb` | 2026-08-09 22:12 | 2026-08-09 22:30                | 18分後   |

**すべてのコミットがまず Preview になり、Production は後から別途作られています。** 遅延が push と無相関で、`c90f980` のように本番反映されないまま次のリリースに追い越される場合もあります。

### 完了判定

CI の緑は Preview ビルドの成功を意味するだけです。**本番反映は sha の一致で判定してください。**

```bash
# この2つが一致していれば本番反映済み
gh api "repos/ManatoYamashita/tcu-setagayafes97-web/deployments?environment=Production&per_page=1" --jq '.[0].sha'
git ls-remote origin refs/heads/main | cut -f1
```

`vercel ls <project> --prod` でも Production デプロイの履歴を確認できます。`vercel inspect <url>` の `target` が `production` かどうかが正準です。

### `vercel promote` は使わない

> [!CAUTION]
> **`vercel promote` を本番反映に使ってはいけません。** `promote` は**再ビルドせず**エイリアスを張り替えるだけなので、**Preview 環境変数でビルドされた成果物が本番に出ます。**

本プロジェクトは同名の環境変数を環境ごとに別値で登録しています。`vercel env ls` の `environments` 列で確認できます。

| 変数                                | 登録状況                                             |
| ----------------------------------- | ---------------------------------------------------- |
| `MICROCMS_SERVICE_DOMAIN`           | **Production と Preview で別行＝別値**               |
| `MICROCMS_API_KEY`                  | Production, Preview で共有／Development は別         |
| `NEXT_PUBLIC_EVENTS_VISIBLE`        | Production, Preview で共有                           |
| `NEXT_PUBLIC_NEWS_VISIBLE`          | Production, Preview で共有                           |
| `NEXT_PUBLIC_SPECIAL_VISIBLE`       | Production, Preview で共有                           |
| `NEXT_PUBLIC_SPECIAL_GOODS_VISIBLE` | Production と Preview で**別行**（値は同じ `false`） |

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
- `.github/workflows/feature-ci.yml` — 実際のワークフロー定義

---

**最終更新日**: 2026-08-23
