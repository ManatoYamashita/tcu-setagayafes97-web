# ドメイン移行（setagayafes.org を第97回の正規ドメインにする）

`setagayafes.org` を第97回サイトの正規ドメインとして公開し、第96回サイトはサブドメインへ退避する。本ドキュメントは決定内容・現状・手順・検証方法を記録する。

## 決定

| 項目                 | 内容                                                          |
| -------------------- | ------------------------------------------------------------- |
| 第97回の正規ドメイン | **`setagayafes.org`**（apex）                                 |
| 第96回の退避先       | **`96th.setagayafes.org`**（さくらに残す）                    |
| 旧URLの扱い          | `setagayafes.org/96th/*` → **301** → `96th.setagayafes.org/*` |
| `NEXT_PUBLIC_URL`    | `https://setagayafes.org`                                     |

## 現状（未了）

> [!WARNING]
> **DNS のカットオーバーは未実施。** `setagayafes.org` はさくらを向いており、第96回サイトを配信している。第97回サイトはVercelのデプロイURLでのみ到達できる。第96回のサブドメインはさくら側に登録済みだが、公開DNSへの反映とSSL発行は未完了。

| 項目                            | 状態                                                         |
| ------------------------------- | ------------------------------------------------------------ |
| Vercel のドメイン割当           | **完了**（`setagayafes.org` / `www.setagayafes.org` の両方） |
| `NEXT_PUBLIC_URL`               | **完了**（Vercel / GitHub Variables とも `setagayafes.org`） |
| `/96th/*` の 301                | **実装済み**（`next.config.ts`）                             |
| `96th.setagayafes.org` の作成   | **完了**（さくら側、2026-08-24）                             |
| 第96回ファイルバックアップ      | **完了**（SnapUP、2026-08-24、正常終了）                     |
| 第96回DBバックアップ            | **未了**（phpMyAdmin認証情報待ち）                           |
| 第96回サブドメインのSSL         | **未了**（DNS名前解決の反映待ち）                            |
| WordPress の `siteurl` / `home` | **未了**（さくら側の作業）                                   |
| `setagayafes.org` の DNS 切替   | **未了**（さくら側の作業）                                   |

### 2026-08-24 の実施内容

- さくらに `96th.setagayafes.org` を追加し、公開フォルダーを `~/www/top/96th` に設定。
- SnapUPで `/home/setagayafes/www/top/96th` のファイルバックアップを取得（スナップショット #1、正常終了）。
- 旧ドメイン参照を `https://setagayafes.org` に統一し、`sitemap.xml` / `robots.txt` は `siteConfig.metadata.siteUrl` から生成するよう修正。
- `next.config.ts` の `setagayafes.org/96th/*` → `96th.setagayafes.org/*` の301設定が `main` に存在することを確認。
- DNS名前解決前のため、Let's EncryptのSSL発行は保留。

## なぜ rewrite ではなく redirect なのか

当初は `setagayafes.org/96th/` の URL を保つため Vercel の rewrite でさくらへプロキシする方針だった。**アーカイブの実体が WordPress だと判明した時点で撤回した。**

### 理由1: 無限リダイレクトループになる

Next.js の trailing-slash リダイレクトは **rewrite より先**に走る。

```
/96th/  → Next が 308 → /96th  → rewrite → さくら 301 → /96th/  → …
```

`skipTrailingSlashRedirect: true` で止められるが、サイト全体の trailing-slash 正規化が効かなくなる。本プロジェクトは `alternates.canonical` を実装していないため、`/events` と `/events/` の両方が 200 を返す重複URLが生まれる。

### 理由2: Vercel の帯域を消費する

WordPress の全アセット（画像・CSS・JS）が Vercel を経由する。Free Plan の帯域は 100GB/月で、アーカイブのために払うコストではない。

## 301 の実測挙動

Preview デプロイで確認した結果（`96th.setagayafes.org` はまだ存在しないため、最終ホップは名前解決に失敗する）。

| リクエスト      | ホップ | 最終到達先                            |
| --------------- | ------ | ------------------------------------- |
| `/96th`         | 1      | `https://96th.setagayafes.org/`       |
| `/96th/`        | **2**  | `https://96th.setagayafes.org/`       |
| `/96th/access/` | **2**  | `https://96th.setagayafes.org/access` |
| `/96th/?q=1`    | **2**  | `https://96th.setagayafes.org/?q=1`   |

パスもクエリも正しく引き継がれる。

**末尾スラッシュつきのURLは 2 ホップになる。** `trailingSlash: false`（既定）のため Next.js がまず `/96th/` → `/96th` へ正規化し、そのあと 301 が走るためである。1 ホップにするにはサイト全体の `trailingSlash` 方針を変える必要があり、割に合わない。

また `/96th/access/` は `/access`（末尾スラッシュなし）へ引き継がれるため、移行先の WordPress が `/access` → `/access/` へ 301 する場合は合計 3 ホップになる。実用上の問題はない。

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

**最終更新日**: 2026-08-24
