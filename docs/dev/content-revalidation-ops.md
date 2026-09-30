# コンテンツ反映の検証と障害切り分け

microCMS Webhook によるオンデマンド再検証（[content-revalidation.md](./content-revalidation.md)）を
導入・変更したときの検証手順と、「更新したのに本番に出ない」ときの切り分けをまとめる。
仕組みと設定手順は content-revalidation.md を先に読むこと。

## 検証

### ローカル（本番ビルドで行うこと）

**`pnpm dev` ではキャッシュ挙動を確認できない。** dev サーバはすべてのエントリを常に stale 扱いにするため、
「新しい内容が出た」ことが再検証の成果なのか dev の仕様なのか区別がつかない。

```bash
pnpm build
MICROCMS_WEBHOOK_SECRET=dev-secret PORT=3210 pnpm start
```

別のシェルで:

```bash
SECRET='dev-secret'
URL='http://localhost:3210/api/revalidate'
sig() { node -e 'process.stdout.write(require("node:crypto").createHmac("sha256",process.argv[1]).update(process.argv[2]).digest("hex"))' "$SECRET" "$1"; }
hdr() { curl -sS -o /dev/null -D - "http://localhost:3210$1" | grep -i '^x-nextjs-cache' | tr -d '\r'; }
BODY='{"service":"setagayafes97","api":"events","id":"abc123","type":"edit"}'

# --- HTTP 契約 ---
curl -sS -w '\n%{http_code}\n' -X POST "$URL" -H 'content-type: application/json' \
  -H "x-microcms-signature: $(sig "$BODY")" --data-raw "$BODY"          # 200
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$URL" --data-raw "$BODY"  # 401（署名なし）
curl -sS -o /dev/null -w '%{http_code}\n' -X POST "$URL" \
  -H 'x-microcms-signature: deadbeef' --data-raw "$BODY"                # 401（署名不正）
curl -sS -o /dev/null -w '%{http_code}\n' "$URL"                        # 405（GET）

# --- キャッシュ破棄 ---
hdr /; hdr /                                                            # MISS → HIT
curl -sS -o /dev/null -X POST "$URL" -H "x-microcms-signature: $(sig "$BODY")" --data-raw "$BODY"
hdr /                                                                   # MISS ← ここが STALE なら失敗
hdr /                                                                   # HIT
```

> `-d` ではなく `--data-raw` を使う。`-d` は先頭の `@` をファイル名として解釈し、改行を除去するため、
> **署名した文字列と送信するバイト列がずれて必ず 401 になる。**

未知の `api` の 400 を試すときは、**変更したボディで署名を計算し直す**こと。
使い回すと 401 で止まり、400 の分岐に到達しない。

### 本番（マージ後）

Production デプロイの完成を待つ（マージから実測45〜85秒）。

1. microCMS で `news` を1件更新する
2. **15秒**待ってから、**1回だけ**叩く

   ```bash
   curl -sS -o /dev/null -D - https://setagayafes.org/ | grep -iE '^(age|x-vercel-cache)'
   ```

   **`age` が 0 近傍なら成功。**

   > [!IMPORTANT]
   > **判定に使うのは `age` であって `x-vercel-cache` のラベルではない。**
   > `REVALIDATED` は「その実体が再検証によって作られた」ことを示すラベルで、
   > **その実体が古くなっても付いたまま**である。下表の「約5秒」がまさにそれで、
   > ラベルだけ見ると合格に見えるが中身は14秒前の実体である。
   >
   > | 発火からの経過 | `x-vercel-cache` / `age`  | 実体           |
   > | -------------- | ------------------------- | -------------- |
   > | 約1秒          | `HIT` / `age: 12`         | 旧コピー       |
   > | 約5秒          | `REVALIDATED` / `age: 14` | 旧コピー       |
   > | 約13秒         | `REVALIDATED` / `age: 0`  | **新しい内容** |
   >
   > 2026-09-19、`/info` に対し署名付き Webhook を2回撃って実測。
   > **5秒では足りず、13秒で確実に入れ替わっていた。** 旧記述の「5〜10秒」で叩くと、
   > 正常なのに障害切り分け表の #5（タグ不一致）へ誤って進む。
   >
   > **遅れの正体は CDN の伝播である。** エッジごとに旧コピーを保持する時間が違うため、
   > 一度 `age: 0` を見た後でも別のエッジが大きな `age` を返すことがある
   > （2026-08-30 実測: `age 0` → `age 2223` → `age 13`）。これは失敗ではない。
   >
   > なおローカルの `pnpm start` は `x-nextjs-cache: MISS` を返す。Vercel は別の値を使うので、
   > `MISS` だけを合格条件にすると成功を見落とす（2026-08-30 実測）。

   > [!NOTE]
   > **何も起きていない平常時は `HIT` + 大きな `age` が正常である。**
   > `revalidate = 600` 配下では、前回の再生成から経過した秒数がそのまま `age` に出る
   > （実測: `HIT` / `age: 302`）。**`age` が大きいこと自体は異常ではない。**
   > 異常判定が成立するのは**入稿直後の1回**に限る。

   > [!CAUTION]
   > **連続ポーリング禁止。** Vercel の bot 対策が発動して `x-vercel-mitigated: challenge` の 403 が
   > 返り続け、サイト障害と見分けがつかなくなる（2026-08-29 に実際に踏んでいる）。
   > 詳細は [vercel-production-deploy.md](./vercel-production-deploy.md)。

3. Vercel の Functions ログに `[revalidate] api=news ... paths=...` が出ていることを確認
4. microCMS の Webhook 実行履歴でステータス 200 を確認

### 本番を汚さない導通確認（推奨）

**表示に出ないテスト項目を使えば、公開サイトへ何も出さずに Webhook の導通を確認できる。**

`informations` の `category` を `other : その他` にすると、`getSponsorsList()`（`sponsor` 抽出）にも
`getFAQList()`（`faq` 抽出）にも掛からないため、**どのページにも sitemap にも現れない。**
それでも Webhook は発火するので、キャッシュ破棄だけを観測できる。

```bash
set -a; . ./.env.local; set +a
B="https://$MICROCMS_SERVICE_DOMAIN.microcms.io/api/v1"
H="X-MICROCMS-API-KEY: $MICROCMS_API_KEY"
U=https://setagayafes.org/about/sponsors

# 1. 基準をつくる（HIT になるまで数回叩く）
curl -sS -o /dev/null -D - "$U" | grep -iE '^(age|x-vercel-cache)'

# 2. 不可視のテスト項目を作る（「公開（APIによる操作）」が発火する）
curl -sS -X PUT "$B/informations/zz-revalidate-test" -H "$H" -H 'Content-Type: application/json' \
  -d '{"category":["other : その他"],"title":"[導通確認] 表示されません"}'

# 3. REVALIDATED になっていれば発火している
curl -sS -o /dev/null -D - "$U" | grep -iE '^(age|x-vercel-cache)'

# 4. 露出していないことの確認（すべて 0 になる）
for path in /about/sponsors / /info/faq /about /sitemap.xml; do
  printf '%s: ' "$path"; curl -sSL "https://setagayafes.org$path" | grep -c 導通確認
done
```

> [!WARNING]
> **API キーでは削除できない。** POST / PUT は通るが、`DELETE` と `PATCH` は
> `400 {"message":"DELETE is forbidden."}` を返す。
> **削除タイミングの検証と後片付けには管理画面が要る。** 作ったテスト項目を消し忘れないこと。

### 削除タイミングの検証結果（2026-09-02 実施済み）

Issue #141 の実害1「削除したのに本番に残る」が塞がったことを、上記の手順で確認した。

| 段階                         | `/about/sponsors`            | CMS                                 |
| ---------------------------- | ---------------------------- | ----------------------------------- |
| 削除前                       | `HIT` / `age: 597`           | `totalCount: 4`                     |
| **管理画面から削除した直後** | **`REVALIDATED` / `age: 0`** | 直接 GET が `404` / `totalCount: 3` |
| 数秒後                       | `HIT` / `age: 13`            | —                                   |

**「公開中コンテンツの削除時」は正しく配線されている。** 既定 OFF の項目なので、
Webhook を作り直すときは必ずこの検証まで通すこと。

## 障害切り分け

「microCMS を更新したのに本番に出ない」と報告されたとき、上から順に見る。

| #   | 確認する場所                       | 症状と対処                                                                                                                                            |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | microCMS の Webhook 実行履歴       | **記録が無い** → 通知タイミングが OFF。削除・公開終了は既定 OFF                                                                                       |
| 2   | 同上のステータス                   | **401** → Vercel と microCMS のシークレット不一致。**500** → `MICROCMS_WEBHOOK_SECRET` が Vercel に未登録。**400** → 未知の `api`（対応表の更新漏れ） |
| 3   | Vercel の Functions ログ           | `[revalidate]` の行が無い → Webhook の URL が誤っている                                                                                               |
| 4   | 同上の `paths=`                    | **そのページが並んでいない** → `src/lib/revalidate-targets.ts` の対応表に漏れがある                                                                   |
| 5   | `curl -sS -o /dev/null -D - <URL>` | **15秒待っても `age` が大きいまま** → タグが一致していない。`.meta` の実測タグと突き合わせる（**5秒では判定しない。**正常でも旧コピーが返る）         |

### シークレットの一致を確かめる

**Vercel も microCMS も、登録済みの値を読み返せない。**

- `vercel env pull` は Production / Preview の暗号化済みの値を返さない（`KEY=""` になる）。
  読めるのは Development だけである
- microCMS は保存後の読み戻しで**マスク値**を返す。入力欄は64文字のままだが中身は別物で、
  sha256 指紋が変わる（実測: `b4967030` → `4ac5b103`）

したがって**「両者の値を見比べる」検証は成立しない。** 手元の値で署名を作り、本番が受け取るかで判定する。

```bash
BODY='{"service":"setagayafes97","api":"informations","id":"probe","type":"edit"}'
SIG=$(pbpaste | node -e '
  const c = require("node:crypto");
  let s = "";
  process.stdin.on("data", d => s += d).on("end", () => {
    process.stdout.write(c.createHmac("sha256", s.trim()).update(process.argv[1]).digest("hex"));
  });' "$BODY")

curl -sS -w '\n%{http_code}\n' -X POST https://setagayafes.org/api/revalidate \
  -H 'content-type: application/json' -H "x-microcms-signature: $SIG" --data-raw "$BODY"
# 200 = 一致 / 401 = 不一致
```

署名は導出値なので、**シークレットそのものを画面にもログにも出さずに済む。**

> [!WARNING]
> **クリップボードは他の作業で上書きされる。** 使う直前に `pbpaste | wc -c` で長さを確かめること。
> 2026-08-30、64バイトのつもりが50バイトへ変わっており、**誤って「シークレット不一致」と
> 判定しかけた。** 検証が失敗したときは、まず検証手順そのものを疑う。

## 関連ドキュメント

- [docs/dev/content-revalidation.md](./content-revalidation.md) — 仕組みと microCMS 側の設定手順
- [docs/dev/microcms-fetch-failures.md](./microcms-fetch-failures.md) — 取得に失敗したときの扱いと本番での確認
- [docs/dev/ci-env.md](./ci-env.md) — 環境変数の登録先と Vercel の本番反映

---

**最終更新日**: 2026-09-30（content-revalidation.md から分割）
