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

| 変数名                        | 内容                     | 値の例                          |
| ----------------------------- | ------------------------ | ------------------------------- |
| `NEXT_PUBLIC_URL`             | 本番サイト URL           | `https://setagayafes.tcu.ac.jp` |
| `NEXT_PUBLIC_GTM_ID`          | Google Tag Manager ID    | `GTM-XXXXXXX`                   |
| `NEXT_PUBLIC_EVENTS_VISIBLE`  | 企画情報の公開フラグ     | `false`                         |
| `NEXT_PUBLIC_NEWS_VISIBLE`    | お知らせ情報の公開フラグ | `false`                         |
| `NEXT_PUBLIC_SPECIAL_VISIBLE` | 著名人企画の公開フラグ   | `false`                         |

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

| CI 環境変数                       | ローカル (.env.local)                   |
| --------------------------------- | --------------------------------------- |
| `secrets.MICROCMS_SERVICE_DOMAIN` | `MICROCMS_SERVICE_DOMAIN=setagayafes97` |
| `secrets.MICROCMS_API_KEY`        | `MICROCMS_API_KEY=xxxxx`                |
| `vars.NEXT_PUBLIC_URL`            | `NEXT_PUBLIC_URL=http://localhost:3000` |
| `vars.NEXT_PUBLIC_GTM_ID`         | `NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX`        |
| `vars.NEXT_PUBLIC_EVENTS_VISIBLE` | `NEXT_PUBLIC_EVENTS_VISIBLE=false`      |
| `vars.NEXT_PUBLIC_NEWS_VISIBLE`   | `NEXT_PUBLIC_NEWS_VISIBLE=false`        |

## コンテンツ公開フラグ

- `NEXT_PUBLIC_EVENTS_VISIBLE=false`: 企画一覧・タイムテーブルは準備中表示にし、トップのおすすめ企画・企画詳細URL・サイトマップの企画詳細URLを非公開にする。microCMS の企画データは取得しない。
- `NEXT_PUBLIC_NEWS_VISIBLE=false`: お知らせ一覧とトップの NEWS セクションは準備中表示にし、トップの最新ニュース・お知らせ詳細URL・サイトマップのお知らせ詳細URLを非公開にする。microCMS のお知らせデータは取得しない。
- `NEXT_PUBLIC_SPECIAL_VISIBLE=false`: 著名人企画（`type = special`）を全面的に非公開にする。`/special` は準備中表示になり、`/special/[id]` は生成されず 404。企画一覧・タイムテーブル・おすすめ企画・サイトマップからも `type = special` を除外する。
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

## Vercel の本番反映は手動 Promote

> [!IMPORTANT]
> **`main` へ merge しても Production デプロイは作られません。** 作られるのは Preview だけで、Production は人手で Promote する運用です。**「merge したから本番に出ている」と思い込まないでください。**

実測した挙動です。

| コミット  | Preview          | Production                      | 差       |
| --------- | ---------------- | ------------------------------- | -------- |
| `edcff2c` | 2026-08-02 16:15 | 2026-08-03 07:33                | 15時間後 |
| `f429d0d` | 2026-08-08 09:26 | 2026-08-08 09:44                | 17分後   |
| `c90f980` | 2026-08-09 21:53 | （作られないまま次の merge へ） | —        |
| `3f9f0fb` | 2026-08-09 22:12 | 2026-08-09 22:30                | 18分後   |

**すべてのコミットがまず Preview になり、Production は後から別途作られています。** 遅延が push と無相関で、`c90f980` のように Promote されないまま次のリリースに追い越される場合もあります。

### 完了判定

CI の緑は Preview ビルドの成功を意味するだけです。**本番反映は sha の一致で判定してください。**

```bash
# この2つが一致していれば本番反映済み
gh api "repos/ManatoYamashita/tcu-setagayafes97-web/deployments?environment=Production&per_page=1" --jq '.[0].sha'
git ls-remote origin refs/heads/main | cut -f1
```

`vercel ls <project> --prod` でも Production デプロイの履歴を確認できます。`vercel inspect <url>` の `target` が `production` かどうかが正準です。

### RELEASE PR のチェックリスト

`dev` → `main` の PR には次を含めてください。

1. merge 後に Promote が必要である旨（**変動する sha は書かない。すぐ陳腐化する**）
2. 上記の完了判定コマンド

## 注意事項

- Secrets は一度登録すると値の確認ができない（再設定は可能）
- Variables はいつでも値の確認・編集が可能
- `NEXT_PUBLIC_` プレフィックスの変数はクライアントサイドに公開される（Next.js の仕様）
- Vercel デプロイ時は Vercel の Environment Variables で別途管理（Settings → Environment Variables）

## 関連ドキュメント

- [docs/dev/git.md](./git.md) — ブランチ戦略と CI/CD ワークフロー
- `.github/workflows/feature-ci.yml` — 実際のワークフロー定義

---

**最終更新日**: 2026-08-12
