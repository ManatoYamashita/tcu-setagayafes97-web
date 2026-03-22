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

| 変数名               | 内容                  | 値の例                          |
| -------------------- | --------------------- | ------------------------------- |
| `NEXT_PUBLIC_URL`    | 本番サイト URL        | `https://setagayafes.tcu.ac.jp` |
| `NEXT_PUBLIC_GTM_ID` | Google Tag Manager ID | `GTM-XXXXXXX`                   |

## ワークフローでの参照例

```yaml
- name: Build project
  run: pnpm run build
  env:
    MICROCMS_SERVICE_DOMAIN: ${{ secrets.MICROCMS_SERVICE_DOMAIN }}
    MICROCMS_API_KEY: ${{ secrets.MICROCMS_API_KEY }}
    NEXT_PUBLIC_URL: ${{ vars.NEXT_PUBLIC_URL }}
    NEXT_PUBLIC_GTM_ID: ${{ vars.NEXT_PUBLIC_GTM_ID }}
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

## 注意事項

- Secrets は一度登録すると値の確認ができない（再設定は可能）
- Variables はいつでも値の確認・編集が可能
- `NEXT_PUBLIC_` プレフィックスの変数はクライアントサイドに公開される（Next.js の仕様）
- Vercel デプロイ時は Vercel の Environment Variables で別途管理（Settings → Environment Variables）

## 関連ドキュメント

- [docs/dev/git.md](./git.md) — ブランチ戦略と CI/CD ワークフロー
- `.github/workflows/feature-ci.yml` — 実際のワークフロー定義

---

**最終更新日**: 2026-03-22
