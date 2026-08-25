# SEO metadata運用

## 方針

- 正規URLは `https://setagayafes.org` とする。
- ページごとの `title`、`description`、canonical、Open Graph、Twitter Card は `src/lib/metadata.ts` の `createPageMetadata` で生成する。
- canonical は実際に公開するURLへ統一し、末尾スラッシュの有無による重複を作らない。
- 多言語ページは各ロケールURLを canonical とし、`alternates.languages` に `ja`、`en`、`zh`、`ko`、`x-default` を出力する。
- ページ固有のOG画像がない場合は `/ogp.webp`（1200×630）を使用する。microCMS画像を使用する場合は絶対URLへ変換する。

## テストページ

本番サイトへテスト用UIを公開しないため、次のルートはページファイルを置かず404とする。

- `/api-test`
- `/test-ui`

`src/app/robots.ts` の `Disallow` は補助的なクロール制御であり、ページの公開除外そのものではない。テストページを追加する場合は、ページファイルを作成する前に本番公開の要否を確認する。

## 確認コマンド

```bash
pnpm lint
pnpm exec prettier --check src/lib/metadata.ts src/app/layout.tsx
pnpm build
curl -sS -o /dev/null -w '%{http_code} %{url_effective}\n' https://setagayafes.org/api-test
curl -sS -o /dev/null -w '%{http_code} %{url_effective}\n' https://setagayafes.org/test-ui
```

期待値はテスト用2ルートが `404`、主要公開ページの `canonical` が各ページ自身を指すこと。
