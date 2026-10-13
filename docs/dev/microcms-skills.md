# microCMS Skills の導入・更新

Codex が microCMS の公式資料を確認し、設計・実装を進めるために、
[microcmsio/skills](https://github.com/microcmsio/skills) の3つのスキルを
このリポジトリのプロジェクトスコープへ導入している。

| スキル            | 用途                                         | 配置                                                                                     |
| ----------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| `microcms-docs`   | 公式ドキュメントの取得・仕様確認             | [.agents/skills/microcms-docs/SKILL.md](../../.agents/skills/microcms-docs/SKILL.md)     |
| `microcms-guide`  | コンテンツ設計・SDK・画像・Webhook           | [.agents/skills/microcms-guide/SKILL.md](../../.agents/skills/microcms-guide/SKILL.md)   |
| `microcms-nextjs` | Next.js のデータ取得・キャッシュ・プレビュー | [.agents/skills/microcms-nextjs/SKILL.md](../../.agents/skills/microcms-nextjs/SKILL.md) |

スキル本体と参照資料は `.agents/skills/`、導入元と取得時のハッシュは
[`skills-lock.json`](../../skills-lock.json) で共有する。
アプリの依存パッケージや実行時バンドルには追加されない。

## 導入

リポジトリルートで実行する。`--global` を付けなければプロジェクトスコープになる。

```bash
npx --yes skills add microcmsio/skills \
  --skill microcms-docs microcms-guide microcms-nextjs \
  --agent codex --yes
```

通常のクローンでは、追跡済みの `.agents/skills/` も取得できる。
導入先の確認は次のコマンドで行う。

```bash
npx --yes skills list --agent codex
```

## 更新とローカル調整

microCMS の3スキルだけをプロジェクトスコープで更新する。

```bash
npx --yes skills update microcms-docs microcms-guide microcms-nextjs --project --yes
```

このリポジトリでは新規 Markdown を300行以下にするため、上流の参照資料を次のように分割している。
本文と公式出典は保持し、目次とスキルの参照先を更新している。

| 元ファイル                                      | 分割先                                                 |
| ----------------------------------------------- | ------------------------------------------------------ |
| `microcms-docs/references/urls.md`              | `urls-integrations.md`（チュートリアル・MCP・SDK）     |
| `microcms-guide/references/content-modeling.md` | `content-modeling-patterns.md`（スキーマ変更・設計例） |
| `microcms-guide/references/js-sdk.md`           | `js-sdk-operations.md`（書き込み・認証・エラー処理）   |
| `microcms-nextjs/references/caching.md`         | `caching-revalidation.md`（Webhook・再検証・更新反映） |

`skills-lock.json` のハッシュは上流の取得内容を表し、分割・整形後のローカル内容のハッシュではない。
再導入・更新では上流ファイルが復元されるため、変更内容を確認して必要な分割と参照先の調整を再適用する。
更新前のコミットを `BASE=<コミット>` で指定し、
`pnpm docs:split-check <元ファイル> <分割後のファイル...>` で意図しない削除がないか確認する。
初回導入時は取得直後の上流資料とも比較する。対象パスを明示してステージングした後、次の検査を行う。

```bash
pnpm exec prettier --check .agents/skills/microcms-docs .agents/skills/microcms-guide .agents/skills/microcms-nextjs skills-lock.json docs/dev/microcms-skills.md docs/INDEX.md
pnpm check:doc-links
pnpm check:doc-lines
```

## このプロジェクトでの使い方

スキルの一般例を適用する前に `AGENTS.md`、`.claude/CLAUDE.md` と既存の実装を確認する。
取得・再試行は `microcmsGet()`、画像配信は `AppImage`、再検証対象は `revalidate-targets.ts` の
既存契約に従う。詳細は [microCMS の取得失敗](./microcms-fetch-failures.md)、
[画像配信](../frontend/image-delivery.md)、[コンテンツ再検証](./content-revalidation.md) を参照する。

導入日: 2026-10-13
