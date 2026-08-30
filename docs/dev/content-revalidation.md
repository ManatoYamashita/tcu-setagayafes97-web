# コンテンツ反映の仕組み（オンデマンド再検証）

microCMS の入稿を本番へ反映させる経路と、その運用・障害切り分けをまとめる。

- 実装: [`src/app/api/revalidate/route.ts`](../../src/app/api/revalidate/route.ts)
- 対応表: [`src/lib/revalidate-targets.ts`](../../src/lib/revalidate-targets.ts)
- 経緯: [Issue #141](https://github.com/ManatoYamashita/tcu-setagayafes97-web/issues/141)

## 二段構え

| 系統     | 手段                                                                  | 反映までの時間         |
| -------- | --------------------------------------------------------------------- | ---------------------- |
| **主系** | microCMS Webhook → `POST /api/revalidate` → `revalidatePath()`        | 数秒                   |
| **保険** | 各ページの `export const revalidate`（3600 / `/special/[id]` は 600） | 最大1時間＋1リクエスト |

**microCMS の Webhook は失敗しても再送されない。** 通知が届かなかった場合に永久に古いままにならないよう、
時間ベース ISR は削除せず残してある。Webhook を入れたからといって `revalidate` 宣言を消してはいけない。

### 導入前の状態（2026-08-30 実測）

```
$ curl -sI https://setagayafes.org/ | grep -iE '^(age|x-vercel-cache)'
age: 4104
x-vercel-cache: STALE
```

時間ベース ISR は stale-while-revalidate なので、実効遅延は
「`revalidate` の経過 **＋ 誰かが1回アクセスすること**」だった。期限切れ後の最初の訪問者は必ず古い画面を受け取る。

Webhook 経由の再検証はこれと挙動が違う。**プロファイル無しの `revalidatePath()` は即時失効**であり、
キャッシュ読み取りは SWR ではなくハードミスになる。**発火後の最初の訪問者から新しい内容が出る。**
ローカルの本番ビルドで実測済み（下記「検証」参照）。

> `revalidateTag(tag, "max")` のようにプロファイルを渡すと SWR 挙動に戻る。
> 将来タグ方式へ移行する場合はここを取り違えないこと。

## 再検証の仕組み — `revalidatePath` はパスの API ではない

Next.js は各キャッシュエントリに `_N_T_` 接頭辞の暗黙タグを付けて保存し、
`revalidatePath(path, type)` はそこから組み立てたタグ1つを失効させる。
実際の値はビルド成果物 `.next/server/app/**/*.meta` の `x-next-cache-tags` に入っている。

この性質から、次の3つが**エラーにならず静かに何もしない**。

| 書き方                                   | 生成されるタグ           | 結果                                                       |
| ---------------------------------------- | ------------------------ | ---------------------------------------------------------- |
| `revalidatePath("/about")`               | `_N_T_/about`            | **no-op。** 実体は `/ja/about` で、タグも `_N_T_/ja/about` |
| `revalidatePath("/events/[id]")`         | （警告のみ）             | **no-op。** 動的ルートには `type` が要る                   |
| `revalidatePath("/sitemap.xml", "page")` | `_N_T_/sitemap.xml/page` | **no-op。** メタデータルートの派生タグは `/route`          |

正しい書き方は `src/lib/revalidate-targets.ts` の表にある。**この表を更新したら必ず実測で裏を取ること。**

```bash
pnpm build
# 対応表の全パスを、実際に記録されたタグと突き合わせる
grep -rho '"x-next-cache-tags":"[^"]*"' .next/server/app --include=*.meta | tr ',' '\n' | sort -u
```

> 公開フラグが `false` の間は `generateStaticParams()` が空を返し、
> `/events/[id]` `/info/[id]` のページが1枚も生成されない＝タグも記録されない。
> 動的ルートを検証するときは `NEXT_PUBLIC_EVENTS_VISIBLE=true NEXT_PUBLIC_NEWS_VISIBLE=true pnpm build` で確認する。

## microCMS 側の設定手順

> [!IMPORTANT]
> **Vercel への環境変数登録を先に済ませること。** 順序を逆にすると、シークレット未設定の間の入稿が
> 500 で拒否され、再送もされないまま静かに失われる。

1. シークレットを生成する

   ```bash
   openssl rand -hex 32
   ```

2. Vercel の `Settings > Environment Variables` に `MICROCMS_WEBHOOK_SECRET` を登録する
   （**Production と Preview の両方**）

3. microCMS 管理画面で `news` / `events` / `informations` の **3 API それぞれに**
   Webhook を追加する（Webhook は API ごとの設定で、1つで3 API を賄うことはできない）

   `https://setagayafes97.microcms.io/apis/{endpoint}/settings/webhook` → 「追加」→「カスタム通知」

   | 項目                       | 値                                       |
   | -------------------------- | ---------------------------------------- |
   | Webhook の名前             | `Vercel 再検証` など任意                 |
   | URL                        | `https://setagayafes.org/api/revalidate` |
   | シークレット               | 手順1で生成した値                        |
   | カスタムリクエストヘッダー | 不要（署名検証を採用しているため）       |

4. **通知タイミングを設定する。既定のままでは不十分。**

   | カテゴリ                                | 設定    | 理由                                               |
   | --------------------------------------- | ------- | -------------------------------------------------- |
   | コンテンツの公開時・更新時（7項目）     | ✅ ON   | 既定で ON                                          |
   | コンテンツの公開終了時（5項目）         | ✅ ON   | **既定 OFF。** 非公開化の反映に必須                |
   | 公開中コンテンツの削除時（2項目）       | ✅ ON   | **既定 OFF。**「消したのに本番に残る」の解消に必須 |
   | 公開終了コンテンツの削除時（2項目）     | ✅ ON   | **既定 OFF**                                       |
   | コンテンツの下書き保存時                | ❌ OFF  | 下書きは本番に出ない。執筆中に無駄な発火をする     |
   | 下書きコンテンツの削除時 / 下書き破棄時 | ❌ OFF  | 同上                                               |
   | APIの設定変更時 / APIの削除時           | ⚠️ 任意 | 運用上ほぼ発生しない                               |

   「並び替え」「コンテンツIDの変更」「公開日時の変更」は一覧の並び順や URL に直結するため**すべて ON**。

> [!WARNING]
> **削除系の3カテゴリを ON にし忘れると、Webhook を入れても「削除したのに本番に残る」は直らない。**
> 導入後の検証で必ず削除を試すこと（下記）。

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
2. 5〜10秒待ってから、**1回だけ**叩く

   ```bash
   curl -sS -o /dev/null -D - https://setagayafes.org/ | grep -iE '^(age|x-vercel-cache)'
   ```

   `x-vercel-cache: MISS` / `age: 0` かつ更新内容が出ていれば成功。`STALE` なら失敗。

   > [!CAUTION]
   > **連続ポーリング禁止。** Vercel の bot 対策が発動して `x-vercel-mitigated: challenge` の 403 が
   > 返り続け、サイト障害と見分けがつかなくなる（2026-08-29 に実際に踏んでいる）。
   > 詳細は [ci-env.md の「Vercel の本番反映」](./ci-env.md)。

3. Vercel の Functions ログに `[revalidate] api=news ... paths=...` が出ていることを確認
4. microCMS の Webhook 実行履歴でステータス 200 を確認
5. **削除の検証（本丸）**: テスト用の企画を1件削除し、`/events` から消えることを確認。
   ここが通らなければ通知タイミングの「公開中コンテンツの削除時」が OFF のまま

## 障害切り分け

「microCMS を更新したのに本番に出ない」と報告されたとき、上から順に見る。

| #   | 確認する場所                       | 症状と対処                                                                                                                                            |
| --- | ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | microCMS の Webhook 実行履歴       | **記録が無い** → 通知タイミングが OFF。削除・公開終了は既定 OFF                                                                                       |
| 2   | 同上のステータス                   | **401** → Vercel と microCMS のシークレット不一致。**500** → `MICROCMS_WEBHOOK_SECRET` が Vercel に未登録。**400** → 未知の `api`（対応表の更新漏れ） |
| 3   | Vercel の Functions ログ           | `[revalidate]` の行が無い → Webhook の URL が誤っている                                                                                               |
| 4   | 同上の `paths=`                    | **そのページが並んでいない** → `src/lib/revalidate-targets.ts` の対応表に漏れがある                                                                   |
| 5   | `curl -sS -o /dev/null -D - <URL>` | `x-vercel-cache: HIT` のまま変わらない → タグが一致していない。`.meta` の実測タグと突き合わせる                                                       |

## Webhook では解決しないこと

- **公開フラグ `NEXT_PUBLIC_*_VISIBLE` はビルド時に評価される。**
  Webhook では切り替わらない。解禁作業には従来どおり再デプロイが要る（[ci-env.md](./ci-env.md)）。
- `EVENTS_VISIBLE=false` の間は `getEventsList()` が microCMS へ問い合わせず `[]` を返すため、
  再検証しても表示は「準備中」のまま。これは正常な挙動。
- **トップの「おすすめ企画」は再検証のたびに並びが変わる。**
  `getFeaturedEvents()` が毎レンダーでシャッフルする仕様のため（`src/lib/events.ts`）。

## microCMS を読むページを増やすとき

`src/lib/revalidate-targets.ts` の対応表を**同じコミットで**更新すること。
漏れてもエラーにはならず、そのページだけ静かに古いまま残る。

ページ本体だけでなく、**そのページが描画する Server Component が読むデータも数える。**
`/` の `SponsorBanner`（`informations`）や `FeaturedEvents`（`events`）がその例で、
ページファイルの import だけを見ていると取りこぼす。

```bash
# microCMS を読むコンポーネントの洗い出し
grep -rn 'from "@/lib/\(events\|news\|informations\)"' src/
```

## 関連ドキュメント

- [docs/dev/microcms.md](./microcms.md) — microCMS API の制約と実装パターン
- [docs/dev/ci-env.md](./ci-env.md) — 環境変数の登録先と Vercel の本番反映
- [.claude/CLAUDE.md](../../.claude/CLAUDE.md) — プロジェクト全体のガイド

---

**最終更新日**: 2026-08-30
