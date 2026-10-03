# GitHub Actions と Vercel の環境変数

CI/CD で使う環境変数の登録先をまとめる。本番反映の手順は [vercel-production-deploy.md](./vercel-production-deploy.md) を参照。

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

**最終更新日**: 2026-10-03（公開フラグ廃止・本番反映手順の分割を反映）
