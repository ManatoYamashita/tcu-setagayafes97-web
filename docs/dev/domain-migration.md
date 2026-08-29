# ドメイン移行（setagayafes.org を第97回の正規ドメインにする）

`setagayafes.org` を第97回サイトの正規ドメインとして公開し、第96回サイトはサブドメインへ退避する。本ドキュメントは決定内容・現状・手順・検証方法を記録する。

## 決定

| 項目                 | 内容                                                          |
| -------------------- | ------------------------------------------------------------- |
| 第97回の正規ドメイン | **`setagayafes.org`**（apex）                                 |
| 第96回の退避先       | **`96th.setagayafes.org`**（さくらに残す）                    |
| 旧URLの扱い          | `setagayafes.org/96th/*` → **301** → `96th.setagayafes.org/*` |
| 旧委員会URLの扱い    | `setagayafes.org/sfa` → **301** → `setagayafes.org/about`     |
| `NEXT_PUBLIC_URL`    | `https://setagayafes.org`                                     |

## 現状

> [!WARNING]
> **移行作業は反映済み。** `setagayafes.org` はVercelの第97回サイト、`96th.setagayafes.org` はさくらの第96回WordPressを配信している。

| 項目                            | 状態                                                                |
| ------------------------------- | ------------------------------------------------------------------- |
| Vercel のドメイン割当           | **完了**（`setagayafes.org` / `www.setagayafes.org` の両方）        |
| `NEXT_PUBLIC_URL`               | **完了**（Vercel / GitHub Variables とも `setagayafes.org`）        |
| `/96th/*` の 301                | **実装済み**（`src/proxy.ts` / `next.config.ts`）                   |
| `/sfa` の 301                   | **実装済み**（`next.config.ts`、`/about`へ統合）                    |
| `96th.setagayafes.org` の作成   | **完了**（さくら側、2026-08-24）                                    |
| 第96回ファイルバックアップ      | **完了**（SnapUP、2026-08-24、正常終了）                            |
| 第96回DBバックアップ            | **完了**（phpMyAdmin、2026-08-24、[検証台帳](./96th-db-backup.md)） |
| 第96回サブドメインのSSL         | **完了**（Let's Encrypt、2026-08-24）                               |
| WordPress の `siteurl` / `home` | **完了**（`https://96th.setagayafes.org`）                          |
| `setagayafes.org` の DNS 切替   | **完了**（Vercel）                                                  |

### 2026-08-24 の実施内容

- SnapUPで `/home/setagayafes/www/top/96th` のファイルバックアップを取得（スナップショット #1、正常終了）。ディレクトリ形式のためDBは含まれない。
- さくらに `96th.setagayafes.org` を追加し、公開フォルダーを `~/www/top/96th` に設定。
- さくら側のDNSゾーンに `A 49.212.207.29` が登録されたことを確認。
- DNS名前解決前のため、IP直指定のHTTPリクエストで第96回WordPressが返ることを確認。
- Let's Encryptの申請画面まで確認したが、DNS名前解決が未反映のためSSL発行は保留。

### 2026-08-24 の第97回本番公開前チェック

- `origin/main` は `05220a8`。このブランチの `next.config.ts` には第96回向け301がまだなく、`sitemap.ts` / `robots.ts` は `https://setagayafes97.tcu.ac.jp` を参照している。
- 最新のVercel Productionデプロイは成功済みだが、対象SHAは `d0f5fb5`、対象ブランチは `feature/special-goods-visible-flag`。`main` の公開確認には使用しない。
- GitHub Repository Variableの `NEXT_PUBLIC_URL` は `https://setagayafes.org`。Vercel CLIはローカル未認証・未導入のため、Vercel環境変数の実測確認は未了。
- ローカルの `pnpm lint` はエラーなし（既存警告13件）、`pnpm format:check` は正常、`pnpm build` は終了コード0。ただしローカル `.env.local` のmicroCMSキーが無効で、生成中に401警告が発生した。またNode.jsはv22で、`package.json` の要求（>=24）を満たしていない。
- ローカルProductionサーバーで、`/96th/access?q=1` → 301、末尾スラッシュ付きURLは先に308で正規化されることを確認。`robots.txt` と `sitemap.xml` は現状まだ旧ドメインを出力する。
- 公開DNSは未切替（apexは `49.212.207.29`、wwwは `2s6odn9q.rs.webaccel.jp.`、応答はnginx 302 → `/96th/`）。

### 2026-08-24 の移行後修正・最終確認

- 第96回の `/home/setagayafes/www/top/96th/.htaccess` に残っていた旧サブディレクトリ用rewrite（`RewriteBase /96th/`、`/96th/index.php`）を、サブドメイン直下用（`RewriteBase /`、`/index.php`）へ修正。
- 修正後、96thトップ、固定ページ、記事、フィード、画像、管理画面ログイン導線が正常応答。主要ページはすべて200、`/wp-admin/` はログイン画面へ302。
- 96thのSSLはLet’s Encryptへ切り替わり、証明書SANに `96th.setagayafes.org` を確認。有効期限は2026-11-22。
- 第97回のrobots、sitemap、OGP URLを `https://setagayafes.org` に統一し、Vercel Productionへ反映。
- Vercel側のapexドメインに残っていた `setagayafes.org → www.setagayafes.org` リダイレクトを解除。`/96th/*` は `96th.setagayafes.org/*` へ301。
- 96th本文には旧 `/96th/` および `/95th/` の画像URLが一部残るため、コンテンツ内リンクの整理は別作業として残す。

### 2026-08-26 の追加SEO対応

- 旧実行委員会トップ `/sfa` を、現行の実行委員会紹介 `/about` へ301で統合。内容が一致しない `/sfa/*` は一括転送せず404を維持する。
- 第97回の名称・開催日をdescriptionと `WebSite` JSON-LDで明示し、500×500のfaviconをmetadataから指定する。
- Googlebotの大きな画像プレビューを許可し、トップと委員会紹介の代表画像をサイトマップへ追加する。
- Production反映後、Search Consoleでトップ・`/about` のインデックス登録をリクエストし、`sitemap.xml` を再送信する。

## なぜ rewrite ではなく redirect なのか

当初は `setagayafes.org/96th/` の URL を保つため Vercel の rewrite でさくらへプロキシする方針だった。**アーカイブの実体が WordPress だと判明した時点で撤回した。**

### 理由1: 無限リダイレクトループになる

Next.js の trailing-slash リダイレクトは **rewrite より先**に走る。

```
/96th/  → Next が 308 → /96th  → rewrite → さくら 301 → /96th/  → …
```

`skipTrailingSlashRedirect: true` を設定し、`src/proxy.ts` で通常の末尾スラッシュ308を再現する。これによりサイト全体の正規化を維持したまま、旧アーカイブURLだけを直接301にできる。

### 理由2: Vercel の帯域を消費する

WordPress の全アセット（画像・CSS・JS）が Vercel を経由する。Free Plan の帯域は 100GB/月で、アーカイブのために払うコストではない。

## 301 の実測挙動

Previewおよび本番デプロイで確認した結果。

| リクエスト      | ホップ | 最終到達先                            |
| --------------- | ------ | ------------------------------------- |
| `/96th`         | 1      | `https://96th.setagayafes.org/`       |
| `/96th/`        | **1**  | `https://96th.setagayafes.org/`       |
| `/96th/access/` | **1**  | `https://96th.setagayafes.org/access` |
| `/96th/?q=1`    | **1**  | `https://96th.setagayafes.org/?q=1`   |

パスもクエリも正しく引き継がれる。

`/96th/` は `src/proxy.ts` で直接301を返す。その他の末尾スラッシュ付きURLは `src/proxy.ts` が従来どおり308で正規化するため、サイト全体の `trailingSlash` 方針は変わらない。

また `/96th/access/` は `/access`（末尾スラッシュなし）へ引き継がれるため、移行先の WordPress が `/access` → `/access/` へ 301 する場合は合計 2 ホップになる。実用上の問題はない。

> [!NOTE]
> `permanent: true` は **308** を返す。本プロジェクトは `statusCode: 301` を明示している。308 の検索エンジンでの扱いは 301 と同等だが、古いクローラやリンクチェッカには 301 のほうが確実に伝わるためである。アーカイブへの GET 導線に method 保持（308 の利点）は不要。

## 実測した現状（2026-08-15 時点）

```
setagayafes.org        → 49.212.207.29（さくら）  302 → /96th/
www.setagayafes.org    → 133.167.31.34（さくら）  302 → /96th/
setagayafes.org/96th   → 301 → /96th/
setagayafes.org/96th/  → 200（WordPress）
setagayafes.org/95th/  → 404
NS                     → ns1.dns.ne.jp / ns2.dns.ne.jp
```

第96回サイトは WordPress（`wp-json` / `xmlrpc.php` / `feed/` を確認）。内部リンクはすべて `https://setagayafes.org/96th/...` の絶対URL。

## 手順

**順序を守ること。** 逆順で実施すると第96回サイトが一時的に到達不能になる。

### ステップ1: 第96回を新ホストへ（さくら側）

1. `96th.setagayafes.org` の DNS レコードを作成し、現在の第96回サーバへ向ける
2. さくら側でこのホストのドキュメントルートを **WordPress のディレクトリ**へ向ける
   - `96th.setagayafes.org/` で WordPress のトップが出る状態にする
   - `96th.setagayafes.org/96th/` ではない
3. WordPress の `siteurl` / `home` を `https://96th.setagayafes.org` へ変更する
   - **これを怠ると WordPress が絶対URLで `setagayafes.org/96th/` を出し続け、ステップ3 の 301 へ戻ってループする**

検証:

```bash
curl -s -o /dev/null -L -w "%{http_code} %{url_effective}\n" https://96th.setagayafes.org/
curl -s https://96th.setagayafes.org/ | grep -o 'href="https://[^"]*"' | head -5
# href が 96th.setagayafes.org を指していること
```

### ステップ2: 301 を本番へ反映

`next.config.ts` の `redirects()` は実装済み。dev → main の RELEASE を通して本番反映する（手順は [ci-env.md](./ci-env.md) の「Vercel の本番反映は手動」）。

DNS 切替前なので、この時点では `setagayafes.org` はさくらを向いたままであり、この 301 は経路に入らない。**先に入れておいて問題ない。**

### ステップ3: DNS を Vercel へ切り替え

Vercel が要求するレコードは次のとおり。

```
A      setagayafes.org       76.76.21.21
CNAME  www.setagayafes.org   cname.vercel-dns.com
```

`vercel domains inspect setagayafes.org` で `Intended Nameservers` と検証状況を確認できる。ネームサーバごと Vercel へ移す方法もあるが、`96th.setagayafes.org` を含む他のレコードをさくらで管理し続けるなら A / CNAME 追加のほうが影響が小さい。

### ステップ4: 検証

```bash
# 第97回が出ること
curl -s -o /dev/null -L -w "%{http_code} %{url_effective}\n" https://setagayafes.org/
curl -sI https://setagayafes.org/ | grep -i '^server:'   # Vercel であること

# 旧URLが 301 で引き継がれること
curl -s -o /dev/null -L -w "%{http_code} %{url_effective}\n" https://setagayafes.org/96th/

# canonical / sitemap が正規ドメインを指すこと
curl -s https://setagayafes.org/robots.txt | grep Sitemap
```

## 注意

- **`NEXT_PUBLIC_URL` はビルド時にバンドルへ埋め込まれる。** 値を変えたら、変更後に作られた deployment を本番へ反映すること（[ci-env.md](./ci-env.md) の「`redeploy` は環境変数を『元デプロイの値』で再現する」）
- `setagayafes.org` と `www.setagayafes.org` は両方 Vercel プロジェクトへ割当済み。どちらを正規にするかは Vercel の Domains 設定で決まる。**apex を正規とし、www は apex へリダイレクトする**方針
- 第95回は既に 404。過去回のアーカイブ運用は第96回のみ

## 関連ドキュメント

- [ci-env.md](./ci-env.md) — 環境変数と本番反映の手順
- [git.md](./git.md) — ブランチ戦略と CI/CD ワークフロー

---

**最終更新日**: 2026-08-15
