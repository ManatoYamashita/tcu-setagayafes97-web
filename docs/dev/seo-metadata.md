# SEO metadata運用

## 方針

- 正規URLは `https://setagayafes.org` とする。
- ページごとの `title`、`description`、canonical、Open Graph、Twitter Card は `src/lib/metadata.ts` の `createPageMetadata` で生成する。
- canonical は実際に公開するURLへ統一し、末尾スラッシュの有無による重複を作らない。
- 多言語ページは各ロケールURLを canonical とし、`alternates.languages` に `ja`、`en`、`zh`、`ko`、`x-default` を出力する。
- ページ固有のOG画像がない場合は `/ogp.webp`（1200×630）を使用する。microCMS画像を使用する場合は絶対URLへ変換する。
- トップページは `WebSite` のJSON-LDで第97回の名称・説明・正規URLを明示する。
- faviconはクロール可能な500×500 PNG（`/images/brand/favicon.png`）を安定URLで配信する。
- Googlebotには大きな画像プレビューを許可し、サイトマップの主要ページに代表画像を含める。ただし検索結果画像の採用はGoogle側の判断であり保証されない。

## 年次切替後のGoogle検索更新

1. Productionが最新`main`のSHAで`READY`になったことを確認する。
2. 公開ページのtitle・description・canonical・favicon・JSON-LDと、`sitemap.xml`を実測する。
3. Search ConsoleのURL検査でトップページと主要更新ページを検査し、インデックス登録をリクエストする。
4. Search Consoleの「サイトマップ」で `sitemap.xml` を再送信する。
5. 反映まで数日以上かかる場合があるため、検索結果を継続観測する。

`og:image` はSNS共有向けの指定であり、Google検索結果のサムネイルを直接固定するものではない。

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
curl -sSI https://setagayafes.org/sfa | head
```

期待値はテスト用2ルートが `404`、`/sfa` が `/about` へ `301`、主要公開ページの `canonical` が各ページ自身を指すこと。
