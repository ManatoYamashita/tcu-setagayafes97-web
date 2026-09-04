# SEO metadata運用

## 方針

- 正規URLは `https://setagayafes.org` とする。
- ページごとの `title`、`description`、canonical、Open Graph、Twitter Card は `src/lib/metadata.ts` の `createPageMetadata` で生成する。
- canonical は実際に公開するURLへ統一し、末尾スラッシュの有無による重複を作らない。
- 多言語ページは各ロケールURLを canonical とし、`alternates.languages` に `ja`、`en`、`zh`、`ko`、`x-default` を出力する。
- ページ固有のOG画像がない場合は `/ogp.webp`（1200×630）を使用する。microCMS画像を使用する場合は絶対URLへ変換する。
- Google検索結果の正方形サムネイル候補には `/images/brand/search-thumbnail-97.webp`（1200×1200）を使用する。トップページと `/about` の `primaryImageOfPage` および画像サイトマップから同じURLを示す。OGP／Discover向けの `/ogp.webp` とは用途を分け、置き換えない。
- トップページは `WebSite` のJSON-LDで第97回の名称・説明・正規URLを明示する。
- トップページのJSON-LDは `WebSite`、主催 `Organization`、祭全体の `Event` を `@graph` で接続する。サイト名は年次をまたいで一貫する簡潔な「世田谷祭」、第97回の正式名称は `alternateName` とページタイトルで示す。
- faviconはクロール可能な500×500 PNG（`/images/brand/favicon.png`）を安定URLで配信する。
- Googlebotには大きな画像プレビューを許可し、サイトマップの主要ページに代表画像を含める。ただし検索結果画像の採用はGoogle側の判断であり保証されない。

## 年次切替後のGoogle検索更新

1. Productionが最新`main`のSHAで`READY`になったことを確認する。
2. 公開ページのtitle・description・canonical・favicon・JSON-LDと、`sitemap.xml`を実測する。
3. Search ConsoleのURL検査でトップページと主要更新ページを検査し、インデックス登録をリクエストする。
4. Search Consoleの「サイトマップ」で `sitemap.xml` を再送信する。
5. 反映まで数日以上かかる場合があるため、検索結果を継続観測する。

`og:image` や `primaryImageOfPage` はGoogle検索結果のサムネイルを直接固定するものではない。採用画像と反映時期はGoogle側が決定する。

## 過去回サイト群の検索除外

対象は第96回だけではない。`setagayafes.org` 配下には9ホストが実在し、`about.`
`archive.` `blog.` `form.` `link.` は 2026-09-03 時点で index 可能なままだった。
**第96回が消えても第95回以前が代わりに出続ける。**

- 過去回サイトと補助サイトは閲覧用に残すが、全HTMLと画像などの非HTMLリソースへ
  `X-Robots-Tag: noindex` を付与する。
- `robots.txt` で `/` をクロール禁止にしない。Googlebotが既存URLを再クロールして
  `noindex` を確認できないと、検索結果からの恒久的な削除が遅れるため。
- Search Consoleの削除ツールは一時的な非表示（約6ヶ月）を早める補助手段として使い、
  恒久対応はサーバー側の `noindex` とする。**削除ツール単独では6ヶ月後に全復活する。**
- 過去回のサイトマップはSearch Consoleから削除し、新規送信しない。第97回の
  `https://setagayafes.org/sitemap.xml` のみ再送信する。
  **ここでいう「削除」は Search Console の送信一覧から消すことであり、サーバー上の
  ファイルや生成機能は残す**（再クロール導線として有効なため）。
- **`todorokifes.setagayafes.org` は対象外。** 第13回等々力祭の公式サイトである。

対象ホスト一覧・`.htaccess` の記述・Search Console の操作手順・実施順序・
やってはいけないことは [`legacy-site-deindex.md`](./legacy-site-deindex.md) を参照。

## 構造化データ

- ノードは `src/lib/structured-data.ts` の `create*Node()` が単位で持ち、ページ側は
  それを `@graph` に並べる。`Organization` と `Event` の `@id` は全ページで同一にし、
  Google にノードを結合させる。
- **`@id` で参照したノードの実体を同じ `@graph` に必ず含める。** 含めないと参照が
  宙に浮き、結合が起きない。`src/lib/structured-data.test.ts` が検出する。
- **JSON-LD は必ず `serializeJsonLd()` を通す。** CMS 由来の文字列に `</script>` 相当が
  入ると script 要素が閉じ、任意 HTML を注入できる。
- **`BreadcrumbList` は視覚的なパンくずが実在するページにだけ出す。** 画面に無い階層を
  宣言するとガイドライン違反になる。中間項目は必ず `item`（URL）を持たせる。Google が
  省略を許すのは末尾の項目だけである。

### 入れないもの

| 型                                       | 理由                                                                                                                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `WebSite.potentialAction` / SearchAction | サイトリンク検索ボックスのリッチリザルトは廃止済み。加えて `/events` の絞り込みはクライアント側処理で、`urlTemplate` に書ける検索結果URLが存在しない    |
| `FAQPage`                                | Google は2023年8月に FAQ リッチリザルトを政府・医療系の権威サイトへ限定した。表示上の見返りが無く、microCMS を読む2つ目の経路という保守対象だけが増える |
| `keywords` メタタグ                      | Google は2009年から無視している                                                                                                                         |

## sitemap

- 静的ページの `lastModified` に **`new Date()`（ビルド時刻）を使わない。** 全件が同一値だと
  Google は lastmod をまるごと無視する。リポジトリで文面を持つページは
  `src/lib/sitemap-entries.ts` の `STATIC_PAGE_LAST_MODIFIED` に日付を明示し、文面を
  意味のある形で更新したら手で上げる。CMS を読む一覧ページは記事の `updatedAt` の
  最大値から導く。どちらでもないページは lastmod を省略する（誤った値より無いほうがよい）。
- 多言語ページは `LOCALIZED_PATHNAMES` を唯一の出典として全ロケール分のURLを出し、
  各件に **自分自身を含む** 全言語の `alternates.languages` を持たせる。Next.js の
  直列化は自己参照を補完しない。
- `priority` と `changeFrequency` は Google が無視する。チューニングしない。
- 302転送元（`SPECIAL_VISIBLE` が真のときの `/special`）は載せない。Search Console が
  「リダイレクトあり」として除外するため。

## 404 と不在ページ

このアプリはルート直下の `src/app/loading.tsx` によりストリーミングのシェルが先に
送出されるため、**ページ本体で投げた `notFound()` が HTTP ステータスへ反映されない。**
2026-09-03 の実測では `/events/__no_such_id__` が 200 を返し、自分自身を canonical に
指定していた。任意の文字列で薄いURLを無限に生成できる状態だった。

`createPageMetadata` の `noindex: true` を使う。**`robots` を noindex にするだけでなく
canonical も出さない。** 存在しないURLへ自己参照 canonical を与えるのは、Google に
そのURLを正規版だと宣言する行為である。

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
curl -sS -o /dev/null -w '%{http_code}\n' https://setagayafes.org/events/__no_such_id__
curl -sSI https://setagayafes.org/ | grep -i x-robots-tag && echo '!! 第97回に noindex が付いている。事故'
curl -sS https://setagayafes.org/sitemap.xml | grep -o '<lastmod>[^<]*' | sort -u | wc -l
```

期待値はテスト用2ルートが `404`、`/sfa` が `/about` へ `301`、主要公開ページの `canonical` が
各ページ自身を指すこと。不在IDの詳細ページは 200 を返すが `noindex` で canonical を持たないこと。
第97回サイトに `X-Robots-Tag` が付いていないこと。`sitemap.xml` の `lastmod` が2種類以上あること。
